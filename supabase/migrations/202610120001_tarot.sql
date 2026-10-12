-- Only the Edge Function's service role can access these tables/functions.
-- Access-code uses are reserved in one short database transaction.
create table if not exists public.arcana_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (length(code_hash) = 64),
  label text not null default '',
  max_uses integer not null default 3 check (max_uses = 3),
  used integer not null default 0 check (used >= 0 and used <= max_uses),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.arcana_sessions (
  token_hash text primary key check (length(token_hash) = 64),
  code_id uuid not null references public.arcana_codes(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now()
);
create index if not exists arcana_sessions_code_idx on public.arcana_sessions(code_id);
create index if not exists arcana_sessions_expiry_idx on public.arcana_sessions(expires_at);

create table if not exists public.arcana_attempts (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.arcana_codes(id),
  request_id uuid not null,
  answers jsonb not null default '[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]',
  current_question integer not null default 0 check (current_question between 0 and 23),
  revision integer not null default 0,
  status text not null default 'active' check (status in ('active','completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(code_id, request_id)
);
create unique index if not exists arcana_one_active_attempt on public.arcana_attempts(code_id) where status = 'active';
create index if not exists arcana_attempts_code_created_idx on public.arcana_attempts(code_id, created_at desc);

create table if not exists public.arcana_results (
  id text primary key,
  attempt_id uuid not null unique references public.arcana_attempts(id),
  report jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.arcana_rate_limits (
  key_hash text primary key,
  window_start timestamptz not null,
  hits integer not null
);

alter table public.arcana_codes enable row level security;
alter table public.arcana_sessions enable row level security;
alter table public.arcana_attempts enable row level security;
alter table public.arcana_results enable row level security;
alter table public.arcana_rate_limits enable row level security;
revoke all on public.arcana_codes, public.arcana_sessions, public.arcana_attempts, public.arcana_results, public.arcana_rate_limits from public, anon, authenticated;
grant all on public.arcana_codes, public.arcana_sessions, public.arcana_attempts, public.arcana_results, public.arcana_rate_limits to service_role;

create or replace function public.arcana_take_rate_limit(p_key_hash text, p_limit integer, p_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_hits integer;
begin
  insert into public.arcana_rate_limits as r(key_hash,window_start,hits)
  values(p_key_hash,now(),1)
  on conflict(key_hash) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_seconds) then 1 else r.hits+1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_seconds) then now() else r.window_start end
  returning hits into v_hits;
  if random() < 0.02 then
    delete from public.arcana_rate_limits where window_start < now() - interval '1 day';
    delete from public.arcana_sessions where expires_at < now();
  end if;
  return v_hits <= p_limit;
end $$;

create or replace function public.arcana_auth_code(p_session_hash text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_code uuid;
begin
  select c.id into v_code from public.arcana_sessions s
  join public.arcana_codes c on c.id = s.code_id
  where s.token_hash = p_session_hash and s.expires_at > now() and c.enabled;
  if v_code is null then raise exception 'SESSION_EXPIRED'; end if;
  return v_code;
end $$;

create or replace function public.arcana_attempt_json(p_attempt_id uuid)
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('id',a.id,'answers',a.answers,'currentQuestion',a.current_question,
    'revision',a.revision,'status',a.status,'createdAt',a.created_at,'resultId',r.id)
  from public.arcana_attempts a left join public.arcana_results r on r.attempt_id=a.id where a.id=p_attempt_id;
$$;

create or replace function public.arcana_session(p_session_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code_id uuid; v_code public.arcana_codes; v_active uuid; v_history jsonb;
begin
  v_code_id := public.arcana_auth_code(p_session_hash);
  select * into v_code from public.arcana_codes where id=v_code_id;
  select id into v_active from public.arcana_attempts where code_id=v_code_id and status='active';
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.report->'card'->>'name','createdAt',r.created_at) order by r.created_at desc),'[]'::jsonb)
  into v_history from public.arcana_results r join public.arcana_attempts a on a.id=r.attempt_id where a.code_id=v_code_id;
  return jsonb_build_object('remaining',v_code.max_uses-v_code.used,'total',v_code.max_uses,
    'activeAttempt',public.arcana_attempt_json(v_active),'history',v_history);
end $$;

create or replace function public.arcana_login(p_code_hash text, p_token_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code uuid;
begin
  select id into v_code from public.arcana_codes where code_hash=p_code_hash and enabled;
  if v_code is null then raise exception 'INVALID_CODE'; end if;
  insert into public.arcana_sessions(token_hash,code_id) values(p_token_hash,v_code);
  return public.arcana_session(p_token_hash);
end $$;

create or replace function public.arcana_logout(p_session_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  delete from public.arcana_sessions where token_hash=p_session_hash;
  return true;
end $$;

create or replace function public.arcana_start(p_session_hash text, p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code_id uuid; v_code public.arcana_codes; v_attempt uuid;
begin
  v_code_id := public.arcana_auth_code(p_session_hash);
  select * into v_code from public.arcana_codes where id=v_code_id for update;
  select id into v_attempt from public.arcana_attempts where code_id=v_code_id and request_id=p_request_id;
  if v_attempt is null then
    select id into v_attempt from public.arcana_attempts where code_id=v_code_id and status='active';
  end if;
  if v_attempt is not null then
    return jsonb_build_object('attempt',public.arcana_attempt_json(v_attempt),'remaining',v_code.max_uses-v_code.used,'resumed',true);
  end if;
  if v_code.used >= v_code.max_uses then raise exception 'QUOTA_EXHAUSTED'; end if;
  update public.arcana_codes set used=used+1 where id=v_code_id;
  insert into public.arcana_attempts(code_id,request_id) values(v_code_id,p_request_id) returning id into v_attempt;
  return jsonb_build_object('attempt',public.arcana_attempt_json(v_attempt),'remaining',v_code.max_uses-v_code.used-1,'resumed',false);
end $$;

create or replace function public.arcana_save(p_session_hash text, p_attempt_id uuid, p_answers jsonb, p_current_question integer, p_revision integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code uuid; v_attempt public.arcana_attempts;
begin
  v_code := public.arcana_auth_code(p_session_hash);
  select * into v_attempt from public.arcana_attempts where id=p_attempt_id and code_id=v_code for update;
  if v_attempt.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.status <> 'active' then raise exception 'ATTEMPT_COMPLETED'; end if;
  if v_attempt.revision <> p_revision then raise exception 'REVISION_CONFLICT'; end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 24 or
    exists(select 1 from jsonb_array_elements(p_answers) v where v not in ('-1'::jsonb,'0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb)) then
    raise exception 'INVALID_ANSWERS';
  end if;
  update public.arcana_attempts set answers=p_answers,current_question=p_current_question,revision=revision+1 where id=p_attempt_id;
  return public.arcana_attempt_json(p_attempt_id);
end $$;

create or replace function public.arcana_complete(p_session_hash text, p_attempt_id uuid, p_answers jsonb, p_report jsonb, p_result_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code uuid; v_attempt public.arcana_attempts; v_result text;
begin
  v_code := public.arcana_auth_code(p_session_hash);
  select * into v_attempt from public.arcana_attempts where id=p_attempt_id and code_id=v_code for update;
  if v_attempt.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  select id into v_result from public.arcana_results where attempt_id=p_attempt_id;
  if v_result is not null then return jsonb_build_object('resultId',v_result); end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 24 or
    exists(select 1 from jsonb_array_elements(p_answers) v where v not in ('0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb)) then
    raise exception 'INVALID_ANSWERS';
  end if;
  insert into public.arcana_results(id,attempt_id,report) values(p_result_id,p_attempt_id,p_report);
  update public.arcana_attempts set answers=p_answers,status='completed',completed_at=now(),revision=revision+1 where id=p_attempt_id;
  return jsonb_build_object('resultId',p_result_id);
end $$;

create or replace function public.arcana_result(p_result_id text, p_session_hash text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_result public.arcana_results; v_owner boolean;
begin
  select * into v_result from public.arcana_results where id=p_result_id;
  if v_result.id is null then raise exception 'RESULT_NOT_FOUND'; end if;
  select exists(select 1 from public.arcana_sessions s join public.arcana_codes c on c.id=s.code_id
    join public.arcana_attempts a on a.code_id=c.id where s.token_hash=p_session_hash and s.expires_at>now()
    and c.enabled and a.id=v_result.attempt_id) into v_owner;
  return v_result.report || jsonb_build_object('id',v_result.id,'createdAt',v_result.created_at,'isOwner',v_owner);
end $$;

create or replace function public.arcana_create_code(p_code_hash text, p_label text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  insert into public.arcana_codes(code_hash,label) values(p_code_hash,left(p_label,80)) returning id into v_id;
  return v_id;
end $$;

-- Supabase grants EXECUTE to public by default. Revoke it explicitly for our functions.
do $$ declare fn record;
begin
  for fn in select p.proname,pg_get_function_identity_arguments(p.oid) args from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'arcana_%'
  loop
    execute format('revoke all on function public.%I(%s) from public, anon, authenticated',fn.proname,fn.args);
    execute format('grant execute on function public.%I(%s) to service_role',fn.proname,fn.args);
  end loop;
end $$;
