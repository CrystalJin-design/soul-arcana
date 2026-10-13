import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  LockKeyhole,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  Link2,
  RotateCcw,
  Gift,
  X,
  CircleHelp,
  Copy,
  LoaderCircle,
  CheckCircle2,
  CloudCheck,
  BookOpen,
  ChevronRight,
  Share2,
  ShieldCheck,
} from "lucide-react";
import defaultConfig from "../site.config.json";
import { api, getToken, setToken, resultUrl, artUrl } from "./api.js";
import { createAttemptSaver } from "./attempt-saver.js";

const readRoute = () => {
  const result = location.hash.match(/^#\/result\/([a-f0-9]{48})$/i);
  return result
    ? { type: "result", id: result[1] }
    : { type: location.hash === "#/quiz" ? "quiz" : "home" };
};
const dateText = (date) =>
  new Date(date).toLocaleDateString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
function Sigil({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="26" cy="26" r="23" stroke="currentColor" strokeWidth=".7" />
      <path d="M8 26Q26 5 44 26Q26 47 8 26Z" stroke="currentColor" />
      <circle cx="26" cy="26" r="7" stroke="currentColor" />
      <path
        d="M26 9V17M26 35V43M9 26H16M36 26H43M26 21L27.5 24.5L31 26L27.5 27.5L26 31L24.5 27.5L21 26L24.5 24.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
function Brand({ name, onClick, light = false }) {
  return (
    <button
      className={`brand ${light ? "brand-ink" : ""}`}
      onClick={onClick}
      aria-label="返回首页"
    >
      <Sigil />
      <span>
        {name}
        <small>SOUL ARCANA</small>
      </span>
    </button>
  );
}
function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    element.showModal();
    return () => {
      if (element.open) element.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
    >
      <button
        className="modal-close icon-button"
        onClick={onClose}
        aria-label="关闭"
      >
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}
function Footer({ config, onHelp }) {
  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} {config.brand} · {config.footer}
      </span>
      <button onClick={onHelp}>关于测评</button>
      <p>塔罗象征 × 自我探索 · 结果供娱乐与自我观察参考</p>
    </footer>
  );
}
function Orbit({ small = false }) {
  return (
    <svg
      className={`orbit ${small ? "orbit-small" : ""}`}
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="300" cy="300" r="257" />
      <circle cx="300" cy="300" r="218" />
      <circle cx="300" cy="300" r="170" />
      <path d="M300 29V83M300 517V571M29 300H83M517 300H571M109 109L147 147M453 453L491 491M109 491L147 453M453 147L491 109" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * Math.PI) / 12;
        return (
          <path
            key={i}
            d={`M${300 + Math.cos(a) * 247} ${300 + Math.sin(a) * 247}L${300 + Math.cos(a) * 257} ${300 + Math.sin(a) * 257}`}
          />
        );
      })}
      <path d="M300 40L306 55L321 61L306 67L300 82L294 67L279 61L294 55ZM300 518L306 533L321 539L306 545L300 560L294 545L279 539L294 533Z" />
    </svg>
  );
}

function Home({
  config,
  session,
  onLogin,
  onStart,
  onLogout,
  onHelp,
  onResult,
  busy,
  error,
  questionReady,
}) {
  const [code, setCode] = useState("");
  const [visible, setVisible] = useState(false);
  return (
    <main className="home-page">
      <div className="hero-layout">
        <section className="hero-copy">
          <div className="eyebrow">
            <span />
            THE CARD WITHIN YOU
            <span />
          </div>
          <h1>
            你的灵魂底牌
            <br />是<span className="gold-text">哪张塔罗</span>？
          </h1>
          <p className="hero-description">
            穿过日常的选择，遇见你内心的原型。
            <br />
            让一张牌，说出你尚未命名的自己。
          </p>
          <div className="hero-facts">
            <span>24 道情境题</span>
            <i />
            <span>约 5–8 分钟</span>
            <i />
            <span>22 种灵魂原型</span>
          </div>
        </section>
        <div className="hero-stage" aria-label="原创塔罗牌插画">
          <Orbit />
          <span className="stage-star star-one">✦</span>
          <span className="stage-star star-two">✧</span>
          <img
            className="fan-card fan-left"
            src={artUrl(18)}
            alt="月亮塔罗牌"
            width="200"
            height="300"
          />
          <img
            className="fan-card fan-right"
            src={artUrl(17)}
            alt="星星塔罗牌"
            width="200"
            height="300"
          />
          <img
            className="fan-card fan-center"
            src={artUrl("back")}
            alt="等待揭晓的灵魂底牌"
            width="200"
            height="300"
          />
          <span className="stage-caption">EVERY SOUL HAS A STORY</span>
        </div>
        <section className="access-panel" aria-label="验证测评密码">
          {session ? (
            <>
              <div className="access-heading">
                <span>
                  <CheckCircle2 size={18} />
                  密码已验证
                </span>
                <button className="text-button" onClick={onLogout}>
                  更换密码
                </button>
              </div>
              <p className="remaining-copy">
                {session.activeAttempt ? (
                  "你有一段尚未完成的旅程，可以接着答题。"
                ) : session.remaining > 0 ? (
                  <>
                    还可以开启 <strong>{session.remaining}</strong>{" "}
                    次测评，选择此刻最真实的自己。
                  </>
                ) : (
                  "3次测评已完成。已有结果仍可随时查看、保存和分享。"
                )}
              </p>
              <button
                className="primary-button"
                onClick={onStart}
                disabled={
                  busy ||
                  !questionReady ||
                  (!session.activeAttempt && session.remaining <= 0)
                }
              >
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
                <span>
                  {session.activeAttempt
                    ? "继续上次测评"
                    : session.remaining > 0
                      ? "开始测评"
                      : "测评次数已用完"}
                </span>
                <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onLogin(code);
              }}
            >
              <label className="access-heading" htmlFor="access-code">
                <span>
                  <LockKeyhole size={16} />
                  输入你的测评密码
                </span>
                <button type="button" className="text-button" onClick={onHelp}>
                  在哪里获取？
                </button>
              </label>
              <div className="password-field">
                <input
                  id="access-code"
                  type={visible ? "text" : "password"}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="请输入店铺发给你的密码"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  maxLength={80}
                  required
                  aria-describedby={error ? "access-error" : undefined}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "隐藏密码" : "显示密码"}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                className="primary-button"
                disabled={busy || !code.trim() || !questionReady}
              >
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <LockKeyhole size={16} />
                )}
                <span>{busy ? "正在验证密码" : "验证密码，开启旅程"}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
          {error && (
            <p className="form-error" id="access-error" role="alert">
              {error}
            </p>
          )}
          <p className="access-note">
            <ShieldCheck size={13} />
            每码可测3次 · 刷新可继续 · 无需注册
          </p>
          {session?.history?.length > 0 && (
            <div className="history">
              <span>我的灵魂档案</span>
              {session.history.map((item) => (
                <button key={item.id} onClick={() => onResult(item.id)}>
                  <BookOpen size={14} />
                  {item.name}
                  <small>{dateText(item.createdAt)}</small>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
      <section className="home-story">
        <div className="story-heading">
          <span className="tiny-label">A MOMENT FOR YOURSELF</span>
          <h2>
            有些答案，
            <br />
            一直藏在你的选择里。
          </h2>
        </div>
        <div className="story-items">
          <div>
            <span>01</span>
            <p>
              <strong>从真实生活出发</strong>
              24个日常情境，不用懂塔罗，凭直觉选择即可。
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <strong>看见完整的自己</strong>
              读懂你的光，也温柔地看见那些容易忽略的阴影。
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <strong>收藏这一次相遇</strong>
              生成专属结果长图，把你的灵魂底牌分享给重要的人。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Quiz({
  questions,
  attempt,
  remaining,
  saving,
  submitting,
  error,
  onChoose,
  onNavigate,
  onSubmit,
  onRetrySave,
}) {
  const index = attempt.currentQuestion;
  const question = questions[index];
  if (!question) return null;
  const selected = attempt.answers[index];
  const answered = attempt.answers.filter((answer) => answer >= 0).length;
  const chapter = Math.floor(index / 4) + 1;
  return (
    <main className="quiz-page">
      <div className="quiz-meta">
        <span className="tiny-label">YOUR INNER JOURNEY</span>
        <span className={`save-state ${error ? "unsaved" : ""}`}>
          {saving ? (
            <>
              <LoaderCircle size={14} className="spin" />
              保存中
            </>
          ) : error ? (
            "暂未保存"
          ) : (
            <>
              <CloudCheck size={14} />
              进度已保存
            </>
          )}
        </span>
      </div>
      <div
        className="question-progress"
        aria-label={`已答${answered}题，共24题`}
      >
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`${attempt.answers[i] >= 0 ? "done" : ""} ${i === index ? "current" : ""}`}
          />
        ))}
      </div>
      <div className="chapter-row">
        <span>
          第{["一", "二", "三", "四", "五", "六"][chapter - 1]}章 ·{" "}
          {question.chapter}
        </span>
        <span className="question-count">
          <b>{String(index + 1).padStart(2, "0")}</b> / 24
        </span>
      </div>
      <section className="question-body" key={question.id}>
        <h1>{question.text}</h1>
        <p className="question-context">{question.context}</p>
        <div className="choices" role="group" aria-label="选择最符合你的答案">
          {question.options.map((option, choice) => (
            <button
              key={choice}
              className={`choice ${selected === choice ? "selected" : ""}`}
              aria-pressed={selected === choice}
              onClick={() => onChoose(choice)}
              disabled={submitting}
            >
              <span className="choice-letter">{"ABCD"[choice]}</span>
              <span>{option.text}</span>
              <span className="choice-indicator">
                {selected === choice && <Check size={16} />}
              </span>
            </button>
          ))}
        </div>
      </section>
      {error && (
        <div className="quiz-error" role="alert">
          <p>{error}</p>
          <button
            className="text-button"
            onClick={onRetrySave}
            disabled={saving}
          >
            重新保存
          </button>
        </div>
      )}
      <div className="quiz-navigation">
        <button
          className="secondary-button"
          onClick={() => onNavigate(index - 1)}
          disabled={index === 0 || submitting}
        >
          <ArrowLeft size={17} />
          上一题
        </button>
        <button
          className="primary-button"
          disabled={selected < 0 || submitting}
          onClick={() => (index === 23 ? onSubmit() : onNavigate(index + 1))}
        >
          {submitting && index === 23 ? (
            <LoaderCircle size={17} className="spin" />
          ) : null}
          {index === 23 ? "揭晓我的灵魂底牌" : "下一题"}
          <ArrowRight size={17} />
        </button>
      </div>
      <p className="quiz-bottom-note">
        没有标准答案，只有此刻的你。
        <span>本次已开启 · 剩余可开启 {remaining} 次</span>
      </p>
    </main>
  );
}

function SectionTitle({ number, english, children }) {
  return (
    <div className="report-section-title">
      <span>{number}</span>
      <h2>
        {children}
        <small>{english}</small>
      </h2>
    </div>
  );
}
function Report({ result, config, reportRef }) {
  const card = result.card;
  return (
    <article className="report" ref={reportRef} id="result-report">
      <header className="report-masthead">
        <div>
          <Sigil />
          <span>
            {config.brand}
            <small>SOUL ARCANA</small>
          </span>
        </div>
        <span>
          私人灵魂档案
          <br />
          <small>{dateText(result.createdAt)}</small>
        </span>
      </header>
      <div className="report-hero">
        <div className="report-card-wrap">
          <img
            src={artUrl(card.id)}
            alt={`${card.name}原创塔罗牌插画`}
            className="result-card"
            width="200"
            height="300"
          />
          <span>ARCANA {card.number}</span>
        </div>
        <div className="report-intro">
          <span className="tiny-label">你的灵魂底牌</span>
          <h1>{card.name}</h1>
          <span className="card-english">{card.english}</span>
          <h3>{card.epithet}</h3>
          <div className="keyword-list">
            {card.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
      </div>
      <blockquote className="soul-quote">
        <span>“</span>
        {card.quote}
      </blockquote>
      <section className="report-section">
        <SectionTitle number="01" english="THE SOUL PORTRAIT">
          你的灵魂画像
        </SectionTitle>
        <p>{card.summary}</p>
        <div className="whisper">
          <Sparkles size={17} />
          <span>{card.whisper}</span>
        </div>
      </section>
      <section className="report-section">
        <SectionTitle number="02" english="LIGHT & SHADOW">
          你的光，也有它的影
        </SectionTitle>
        <div className="light-shadow">
          <div>
            <span className="mini-label">光面 · 自然流露的力量</span>
            <p>{card.light}</p>
          </div>
          <div>
            <span className="mini-label">阴影 · 值得温柔看见的部分</span>
            <p>{card.shadow}</p>
          </div>
        </div>
      </section>
      <section className="report-section">
        <SectionTitle number="03" english="THE WAY YOU CONNECT">
          关系中的你
        </SectionTitle>
        <p>{card.relationship}</p>
      </section>
      <section className="report-section">
        <SectionTitle number="04" english="ECHOES OF YOUR CHOICES">
          选择留下的回声
        </SectionTitle>
        <p className="section-caption">
          这些选择，让我们看见这张牌与你的连接。
        </p>
        <div className="reflections">
          {result.reflections.map((reflection, i) => (
            <div key={i}>
              <span>{reflection.chapter}</span>
              <p>“{reflection.text}”</p>
            </div>
          ))}
        </div>
      </section>
      <section className="report-section">
        <SectionTitle number="05" english="YOUR INNER CONSTELLATION">
          你的内在星图
        </SectionTitle>
        <div className="tendency-grid">
          {result.tendencies.map((item) => (
            <div className="tendency" key={item.key}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.value}</span>
              </div>
              <div className="tendency-track">
                <i style={{ width: `${item.value}%` }} />
              </div>
              <div className="tendency-ends">
                <span>{item.left}</span>
                <span>{item.right}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="scale-note">
          刻度反映本次作答倾向，不代表能力高低；两端都拥有各自的价值。
        </p>
      </section>
      <section className="report-section">
        <SectionTitle number="06" english="SMALL STEPS, REAL GROWTH">
          给此刻的三个小启示
        </SectionTitle>
        <div className="advice-list">
          {card.advice.map((advice, i) => (
            <div key={advice}>
              <span>0{i + 1}</span>
              <p>{advice}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="companion-section">
        <img
          src={artUrl(result.companion.id)}
          alt={`${result.companion.name}塔罗牌`}
          width="56"
          height="84"
        />
        <div>
          <span className="tiny-label">给你另一种视角的牌</span>
          <h3>
            {result.companion.name}
            <small>{result.companion.english}</small>
          </h3>
          <p>{result.companion.quote}</p>
        </div>
      </section>
      <footer className="report-footer">
        <div>
          <Sigil />
          <p>
            每张牌都没有好坏。
            <br />
            愿你带着理解，继续成为自己。
            <small>
              {config.brand} · 档案 {result.id.slice(-8).toUpperCase()}
            </small>
          </p>
        </div>
        <div className="report-contact">
          <span>{config.storeName} · 联系我们</span>
          {config.supportWeChat ? (
            <>
              <small>客服微信</small>
              <strong>{config.supportWeChat}</strong>
            </>
          ) : (
            <strong>{config.supportContact}</strong>
          )}
        </div>
      </footer>
      <p className="report-disclaimer">
        塔罗象征的现代原创解读，供娱乐与自我观察参考。结果不作命运预测或心理诊断。
      </p>
    </article>
  );
}

export default function App() {
  const [config, setConfig] = useState(defaultConfig);
  const [route, setRoute] = useState(readRoute);
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [resultError, setResultError] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [exportData, setExportData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);
  const startId = useRef(null);
  const saverRef = useRef(null);
  const submittingRef = useRef(false);
  const toastTimer = useRef(null);
  const exportUrlRef = useRef(null);
  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  const go = useCallback((type, id) => {
    location.hash =
      type === "home" ? "/" : type === "quiz" ? "/quiz" : `/result/${id}`;
    setRoute({ type, id });
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const change = () => {
      setRoute(readRoute());
      setError("");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const calls = await Promise.allSettled([
        api("/config"),
        api("/questions"),
        getToken() ? api("/session") : Promise.resolve(null),
      ]);
      if (cancelled) return;
      if (calls[0].status === "fulfilled") setConfig(calls[0].value);
      if (calls[1].status === "fulfilled")
        setQuestions(calls[1].value.questions);
      else setError(calls[1].reason.message);
      if (calls[2].status === "fulfilled") {
        setSession(calls[2].value);
        setAttempt(calls[2].value?.activeAttempt || null);
      } else if (calls[2].reason.status === 401) setToken("");
      else setError(calls[2].reason.message);
      setReady(true);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!ready || route.type !== "quiz" || attempt) return;
    if (session?.history?.[0]) go("result", session.history[0].id);
    else go("home");
  }, [ready, route.type, attempt, session, go]);
  useEffect(() => {
    if (route.type !== "result") return;
    let cancelled = false;
    setResult(null);
    setResultError("");
    api(`/results/${route.id}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((e) => {
        if (!cancelled) setResultError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [route.type, route.id]);
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      saverRef.current?.dispose();
      if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
    },
    [],
  );
  useEffect(() => {
    if (ready && attempt) getSaver();
  }, [ready, attempt?.id]);

  async function login(code) {
    setBusy(true);
    setError("");
    try {
      const data = await api("/session", { method: "POST", body: { code } });
      setToken(data.token);
      setSession(data);
      setAttempt(data.activeAttempt);
      notify("密码验证成功，准备好与自己相遇。");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await api("/session", { method: "DELETE" });
      setToken("");
      saverRef.current?.dispose({ discard: true });
      saverRef.current = null;
      setSession(null);
      setAttempt(null);
      startId.current = null;
      setModal(null);
      go("home");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function start() {
    if (busy) return;
    if (!session) {
      go("home");
      return;
    }
    if (!session.activeAttempt && session.remaining <= 0) {
      setModal("exhausted");
      return;
    }
    setBusy(true);
    setError("");
    setSaveError("");
    if (!startId.current) startId.current = crypto.randomUUID();
    try {
      const data = await api("/attempts/start", {
        method: "POST",
        body: { requestId: startId.current },
      });
      setSession((old) => ({
        ...old,
        remaining: data.remaining,
        activeAttempt: data.attempt,
      }));
      if (data.attempt.status === "completed") {
        go("result", data.attempt.resultId);
        startId.current = null;
      } else {
        setAttempt(data.attempt);
        go("quiz");
      }
    } catch (e) {
      setError(e.message);
      notify(e.message);
      if (e.status === 401) {
        setToken("");
        setSession(null);
        go("home");
      }
    } finally {
      setBusy(false);
    }
  }
  function getSaver() {
    if (!attempt) return null;
    if (
      saverRef.current?.get().id === attempt.id &&
      !saverRef.current.isDisposed()
    ) return saverRef.current;
    saverRef.current?.dispose();
    const saver = createAttemptSaver(attempt, {
      request: (next) => api(`/attempts/${next.id}/answers`, {
        method: "PUT",
        body: {
          answers: next.answers,
          currentQuestion: next.currentQuestion,
          revision: next.revision,
        },
      }),
      onChange: (next) => {
        if (saverRef.current !== saver) return;
        setAttempt(next);
        setSession((old) => ({ ...old, activeAttempt: next }));
      },
      onSaving: (value) => {
        if (saverRef.current === saver) setSaving(value);
      },
      onError: async (e) => {
        if (saverRef.current !== saver) return;
        setSaveError(e?.message || "");
        if (e?.code === "REVISION_CONFLICT") {
          const latest = await api("/session").catch(() => null);
          if (saverRef.current === saver && latest?.activeAttempt) {
            saver.dispose({ discard: true });
            saverRef.current = null;
            setAttempt(latest.activeAttempt);
            setSession(latest);
            setSaving(false);
            setSaveError("");
            notify("已载入另一页面保存的最新进度。");
          }
        }
      },
    });
    saverRef.current = saver;
    saver.resume();
    return saver;
  }
  function choose(choice) {
    if (submittingRef.current) return;
    const saver = getSaver();
    const current = saver.get();
    const answers = [...current.answers];
    answers[current.currentQuestion] = choice;
    saver.update({ answers });
  }
  function navigate(index) {
    if (!submittingRef.current) getSaver()?.update({ currentQuestion: index });
  }
  async function submit() {
    if (busy || submittingRef.current) return;
    const saver = getSaver();
    const missing = saver.get().answers.findIndex((answer) => answer < 0);
    if (missing >= 0) {
      navigate(missing);
      notify("还有一道题等待你的选择。");
      return;
    }
    submittingRef.current = true;
    setBusy(true);
    setSaveError("");
    try {
      if (!(await saver.flush())) return;
      const current = saver.get();
      const data = await api(`/attempts/${current.id}/submit`, {
        method: "POST",
        body: { answers: current.answers },
      });
      saver.dispose({ discard: true });
      saverRef.current = null;
      startId.current = null;
      go("result", data.resultId);
      setAttempt(null);
      const latest = await api("/session").catch(() => null);
      if (latest) setSession(latest);
      else setSession((old) => ({ ...old, activeAttempt: null }));
      go("result", data.resultId);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      submittingRef.current = false;
      setBusy(false);
      setSaving(false);
    }
  }
  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;top:-200px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (copied) notify(message);
      else setModal({ type: "copy", text });
    }
  }
  function download(data) {
    const anchor = document.createElement("a");
    anchor.href = data.url;
    anchor.download = data.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  async function exportImage() {
    if (exporting || !reportRef.current) return;
    setExporting(true);
    setExportData(null);
    setModal("export");
    let stage;
    try {
      await document.fonts.ready;
      const { default: html2canvas } = await import("html2canvas");
      stage = document.createElement("div");
      stage.className = "export-stage";
      stage.style.cssText =
        "position:fixed;left:-12000px;top:0;width:720px;pointer-events:none;";
      const clone = reportRef.current.cloneNode(true);
      clone.removeAttribute("id");
      clone.classList.add("export-copy");
      stage.appendChild(clone);
      document.body.appendChild(stage);
      await Promise.all(
        Array.from(clone.querySelectorAll("img")).map((img) =>
          img.decode().catch(() => {}),
        ),
      );
      // Rasterize local vector art first: html2canvas can misread SVG intrinsic sizes.
      for (const img of clone.querySelectorAll("img")) {
        if (!/\.svg(?:\?|$)/i.test(img.src)) continue;
        const rect = img.getBoundingClientRect();
        const bitmap = document.createElement("canvas");
        bitmap.width = Math.round(rect.width * 3);
        bitmap.height = Math.round(rect.height * 3);
        bitmap
          .getContext("2d")
          .drawImage(img, 0, 0, bitmap.width, bitmap.height);
        img.src = bitmap.toDataURL("image/png");
        await img.decode();
      }
      // Keep the same responsive rules used to measure the offscreen report.
      // A wider capture viewport can reflow the footer beyond that height.
      const reportHeight = Math.ceil(Math.max(
        clone.scrollHeight,
        clone.getBoundingClientRect().height,
      ));
      const scale = Math.min(
        2,
        8192 / reportHeight,
        Math.sqrt(8000000 / (720 * reportHeight)),
      );
      const canvas = await html2canvas(clone, {
        backgroundColor: "#f0eadb",
        scale,
        width: 720,
        height: reportHeight,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: reportHeight,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error("长图生成失败，请重试。")),
          "image/png",
        ),
      );
      if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
      const url = URL.createObjectURL(blob);
      exportUrlRef.current = url;
      const data = {
        blob,
        url,
        previewUrl: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
        filename: `${config.brand}-${result.card.name}-${result.id.slice(-6)}.png`,
      };
      setExportData(data);
      const mobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      if (!mobile) {
        download(data);
        notify("完整结果长图已生成并开始下载。");
      }
    } catch (e) {
      setModal(null);
      notify(e.message || "暂时无法生成图片，请稍后重试。");
    } finally {
      stage?.remove();
      setExporting(false);
    }
  }
  async function saveOrShare() {
    if (!exportData) return;
    const file = new File([exportData.blob], exportData.filename, {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `我的灵魂底牌：${result.card.name}`,
        });
      } catch (e) {
        if (e.name !== "AbortError") download(exportData);
      }
    } else download(exportData);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand name={config.brand} onClick={() => go("home")} />
        <nav>
          {route.type === "quiz" ? (
            <span className="header-quiet">一次与自己的温柔相遇</span>
          ) : (
            <>
              <button onClick={() => setModal("help")}>测评说明</button>
              <button
                className="header-help"
                aria-label="遇到问题"
                onClick={() => setModal("contact")}
              >
                <CircleHelp size={16} />
                <span>遇到问题</span>
              </button>
            </>
          )}
        </nav>
      </header>
      {route.type === "home" && (
        <Home
          config={config}
          session={session}
          onLogin={login}
          onStart={start}
          onLogout={logout}
          onHelp={() => setModal("help")}
          onResult={(id) => go("result", id)}
          busy={busy}
          error={error}
          questionReady={questions.length > 0}
        />
      )}
      {route.type === "quiz" && ready && attempt && questions.length > 0 && (
        <Quiz
          questions={questions}
          attempt={attempt}
          remaining={session?.remaining || 0}
          saving={saving}
          submitting={busy}
          error={saveError}
          onChoose={choose}
          onNavigate={navigate}
          onSubmit={submit}
          onRetrySave={() => getSaver()?.flush()}
        />
      )}
      {route.type === "quiz" && (!ready || !questions.length) && (
        <div className="page-loading">
          <Sigil />
          <p>正在接回你的旅程…</p>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
      {route.type === "result" && (
        <main className="result-page">
          {resultError ? (
            <div className="empty-state">
              <Sigil />
              <h1>这份档案暂时没有出现</h1>
              <p role="alert">{resultError}</p>
              <button className="primary-button" onClick={() => go("home")}>
                返回首页
                <ArrowRight size={17} />
              </button>
            </div>
          ) : !result ? (
            <div className="page-loading">
              <Sigil />
              <p>正在展开你的灵魂档案…</p>
            </div>
          ) : (
            <>
              <div className="result-page-heading">
                <span className="tiny-label">YOUR SOUL, REVEALED</span>
                <p>
                  {result.isOwner
                    ? "这一次，请温柔地认识自己。"
                    : "一位朋友与你分享了TA的灵魂底牌。"}
                </p>
              </div>
              <Report
                result={result}
                config={config}
                reportRef={reportRef}
              />
              <div className="result-actions">
                <button
                  className="primary-button"
                  onClick={exportImage}
                  disabled={exporting}
                >
                  <Download size={18} />
                  保存结果长图
                </button>
                <button
                  className="secondary-button"
                  onClick={() =>
                    copy(
                      resultUrl(result.id),
                      "结果链接已复制，朋友打开即可查看。",
                    )
                  }
                >
                  <Link2 size={18} />
                  复制结果链接
                </button>
                <button
                  className="subtle-button"
                  onClick={() => (result.isOwner ? start() : go("home"))}
                  disabled={busy}
                >
                  <RotateCcw size={17} />
                  {result.isOwner ? "再测一次" : "测测我的底牌"}
                  {result.isOwner && (
                    <small>剩余{session?.remaining ?? "—"}次</small>
                  )}
                </button>
                <button
                  className="subtle-button reward-button"
                  onClick={() => setModal("reward")}
                >
                  <Gift size={17} />
                  好评有礼
                </button>
              </div>
            </>
          )}
        </main>
      )}
      <Footer config={config} onHelp={() => setModal("help")} />
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {modal === "help" && (
        <Modal title="测评说明" onClose={() => setModal(null)}>
          <Sigil className="modal-sigil" />
          <span className="tiny-label">BEFORE YOUR JOURNEY</span>
          <h2>给这段旅程一点时间</h2>
          <div className="help-list">
            <p>
              <strong>如何开始</strong>在{config.storeName || "购买测评的店铺"}
              获取密码，验证后点击“开始测评”。无需注册账号。
            </p>
            <p>
              <strong>关于3次机会</strong>
              每次开启新测评使用1次机会。继续未完成的测评、刷新页面或返回修改答案，都不会重复扣次。
            </p>
            <p>
              <strong>如何作答</strong>
              24道生活情境题，选择此刻更像自己的答案。可以返回上一题重新选择，进度会自动保存。
            </p>
            <p>
              <strong>如何收藏与分享</strong>
              完成后可保存完整长图，或复制结果链接。朋友打开链接即可阅读，无需你的测评密码。
            </p>
          </div>
          <button className="primary-button" onClick={() => setModal(null)}>
            我准备好了
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {(modal === "contact" || modal === "reward") && (
        <Modal
          title={modal === "reward" ? "好评有礼" : "联系客服"}
          onClose={() => setModal(null)}
        >
          <div className="modal-icon">
            {modal === "reward" ? <Gift size={29} /> : <CircleHelp size={29} />}
          </div>
          <span className="tiny-label">
            {modal === "reward" ? "A LITTLE THANK YOU" : "WE ARE HERE FOR YOU"}
          </span>
          <h2>
            {modal === "reward" ? "谢谢你，留下一点喜欢" : "我们在这里，听你说"}
          </h2>
          {modal === "reward" ? (
            <>
              <div className="reward-amount">
                <b>{config.rewardAmount}</b>
                <span>元返现</span>
              </div>
              <p className="modal-description">{config.rewardMessage}</p>
              <div className="reward-steps">
                <span>店铺好评</span>
                <ChevronRight size={14} />
                <span>截图发客服</span>
                <ChevronRight size={14} />
                <span>领取返现</span>
              </div>
            </>
          ) : (
            <p className="modal-description">
              密码、答题或保存结果遇到问题，都可以联系我们。
            </p>
          )}
          <div className="contact-card">
            {config.storeName && (
              <div>
                <span>店铺名称</span>
                <strong>{config.storeName}</strong>
              </div>
            )}
            {config.supportWeChat ? (
              <div>
                <span>客服微信</span>
                <strong>{config.supportWeChat}</strong>
                <button
                  className="icon-button"
                  onClick={() => copy(config.supportWeChat, "客服微信已复制。")}
                  aria-label="复制客服微信"
                >
                  <Copy size={17} />
                </button>
              </div>
            ) : (
              <p>{config.supportContact}</p>
            )}
            {config.supportQrImage && (
              <img
                className="support-qr"
                src={config.supportQrImage}
                alt="客服二维码"
              />
            )}
          </div>
          <button
            className="primary-button"
            onClick={() =>
              config.supportWeChat
                ? copy(config.supportWeChat, "客服微信已复制。")
                : setModal(null)
            }
          >
            {config.supportWeChat ? "复制客服微信" : "知道了"}
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {modal === "exhausted" && (
        <Modal title="测评次数已用完" onClose={() => setModal(null)}>
          <Sigil className="modal-sigil" />
          <h2>三次相遇，都值得收藏</h2>
          <p className="modal-description">
            这个密码的3次机会已经用完。你仍可查看、保存和分享已有结果，也可以更换新的测评密码。
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setModal(null);
              go("home");
            }}
          >
            查看我的档案
            <ArrowRight size={17} />
          </button>
          <button className="text-button modal-text-button" onClick={logout}>
            更换测评密码
          </button>
        </Modal>
      )}
      {modal === "export" && (
        <Modal
          title="保存结果长图"
          onClose={() => {
            if (!exporting) setModal(null);
          }}
          className="export-modal"
        >
          <span className="tiny-label">KEEP THIS MOMENT</span>
          <h2>
            {exporting ? "正在装裱你的灵魂档案" : "把这一次相遇，留在身边"}
          </h2>
          {exporting ? (
            <div className="export-loading">
              <LoaderCircle size={30} className="spin" />
              <p>正在生成完整长图，请稍候…</p>
            </div>
          ) : (
            exportData && (
              <>
                <p className="export-tip">
                  下方是一张完整的报告长图，可向下滑动查看全部分析和联系方式。
                  手机请长按图片保存，也可使用保存或下载按钮。
                </p>
                <div className="export-actions">
                  <button className="primary-button" onClick={saveOrShare}>
                    <Share2 size={17} />
                    保存 / 分享图片
                  </button>
                  <button
                    className="text-button"
                    onClick={() => download(exportData)}
                  >
                    下载图片
                  </button>
                </div>
                <div className="export-preview">
                  <img
                    src={exportData.previewUrl}
                    width={exportData.width}
                    height={exportData.height}
                    alt="长按保存完整测评报告，含全部分析和店铺联系方式"
                  />
                </div>
              </>
            )
          )}
        </Modal>
      )}
      {modal?.type === "copy" && (
        <Modal title="复制内容" onClose={() => setModal(null)}>
          <h2>长按或选中复制</h2>
          <input
            className="manual-copy"
            value={modal.text}
            readOnly
            onFocus={(event) => event.target.select()}
            aria-label="待复制的内容"
          />
          <button className="primary-button" onClick={() => setModal(null)}>
            完成
            <Check size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}
