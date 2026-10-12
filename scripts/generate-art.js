import { mkdir, writeFile } from "node:fs/promises";
import { cards } from "../shared/cards.js";

const star = (x, y, r = 5) =>
  `<path d="M${x} ${y - r}L${x + 1.4} ${y - 1.4}L${x + r} ${y}L${x + 1.4} ${y + 1.4}L${x} ${y + r}L${x - 1.4} ${y + 1.4}L${x - r} ${y}L${x - 1.4} ${y - 1.4}Z" fill="#d9c48f" stroke="none"/>`;
const moon = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#d6c18d" stroke="none"/><circle cx="${x + 9}" cy="${y - 6}" r="${r - 1}" fill="#142329" stroke="none"/>`;
const figure = (x, y, scale = 1, robe = "#83958e") =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><circle cy="-36" r="8" fill="#c9b28b"/><path d="M-6-27Q-18-5-20 30Q0 39 20 30L7-27Z" fill="${robe}"/><path d="M-5-23L-22-4M5-23L23-7M-8 32L-10 43M8 32L11 43"/><path d="M-8-18Q0 0-11 27M4-18Q10 10 9 29" opacity=".55"/></g>`;
const mountain = `<path d="M19 210L67 121L91 161L119 112L179 210" fill="#344646" stroke="#8f9c8d"/><path d="M67 121L55 158L68 149L80 162M119 112L104 145L117 137L130 148" fill="#98a194" opacity=".6"/>`;
const temple = `<path d="M38 203V87H55V203M145 203V87H162V203" fill="#394b49"/><path d="M29 87L100 46L171 87ZM32 88H168M28 204H172M24 211H176" fill="#32413e"/><path d="M68 202V115Q100 88 132 115V202" fill="#142329"/>`;
const sun = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#c7ad74"/>${Array.from(
    { length: 12 },
    (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<path d="M${x + Math.cos(a) * (r + 5)} ${y + Math.sin(a) * (r + 5)}L${x + Math.cos(a) * (r + 13)} ${y + Math.sin(a) * (r + 13)}"/>`;
    },
  ).join("")}`;
const wreath = `<path d="M79 47C19 65 20 174 73 201M121 47C181 65 180 174 127 201" stroke-width="7" stroke="#738e7d"/><path d="M78 47C22 67 23 171 74 201M122 47C178 67 177 171 126 201" stroke="#c5b58d"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${47 - (i % 3) * 5} ${69 + i * 18}q-17-9-14-18q17 0 14 18M${153 + (i % 3) * 5} ${69 + i * 18}q17-9 14-18q-17 0-14 18" fill="#708b76"/>`).join("")}`;
const scenes = [
  `${sun(145, 68, 15)}<path d="M18 221L103 203L118 231H18Z" fill="#596c60"/><path d="M102 203L117 190L127 213L119 230"/>${figure(91, 158, 1, "#a89a77")}<path d="M99 127L143 98M127 107Q153 99 149 121Q132 125 127 107"/><path d="M54 198q10-18 18 0l8 9-14-3-10 9M53 196l-8-5" fill="#b8bba9"/>`,
  `${figure(101, 139, 1.1, "#a78b79")}<path d="M87 113L65 77M112 113L137 142M65 77L63 57M94 66c-15-17-23 12-5 8c8-2 13-16 23-7c10 11-5 19-11 5"/><path d="M49 165H152V176H49ZM58 176V210M143 176V210" fill="#718078"/><circle cx="76" cy="159" r="7"/><path d="M100 148L96 163H104ZM122 148V162M116 151H128"/>`,
  `${temple}${moon(100, 68, 17)}<path d="M66 107Q100 83 134 107V192H66Z" fill="#637780" opacity=".55"/>${figure(100, 161, 1, "#7f91a0")}<path d="M79 181H120V196H79ZM88 189H112" fill="#b8b69a"/>${moon(100, 210, 11)}`,
  `${sun(148, 66, 13)}<path d="M35 211Q52 194 84 211Q126 181 170 211" fill="#627d63"/>${figure(100, 154, 1.25, "#9caa88")}<path d="M88 101L92 88L100 96L108 88L113 102Z" fill="#c8ae73"/><path d="M42 212V160M42 179l-9-10M42 188l10-10M153 211V164M153 184l10-12M153 194l-9-10"/><circle cx="52" cy="145" r="9" fill="#a78675"/><circle cx="149" cy="145" r="8" fill="#a78675"/>`,
  `${mountain}<path d="M58 192V95H142V192M54 98L59 86L67 95M135 94L143 84L149 98" fill="#5f6862"/>${figure(100, 152, 1.15, "#a98c79")}<path d="M88 101L89 87L99 94L108 85L113 102Z" fill="#c7ad74"/><path d="M127 121V182M121 123H133" stroke-width="3"/>`,
  `${temple}${figure(100, 158, 1.2, "#9c9b83")}<path d="M88 98L93 80L100 88L108 80L113 99Z" fill="#c9b98f"/><path d="M132 111V175M123 119H142M127 111H138M82 207l36-17M82 190l36 17"/><circle cx="83" cy="207" r="5"/><circle cx="118" cy="207" r="5"/>`,
  `${sun(100, 66, 17)}<path d="M45 204V106q-15-25 6-40q17 20-2 37M155 204V106q-15-25 6-40q17 20-2 37" stroke="#a6ad8a"/>${figure(75, 165, 0.9, "#9ba999")}${figure(126, 165, 0.9, "#b5988f")}<path d="M88 151Q100 140 114 151"/><path d="M60 88Q100 102 140 88" stroke="#c7ae7e"/>`,
  `${mountain}<path d="M51 175V110Q100 79 149 110V175Z" fill="#596f76"/><path d="M51 110L100 86L149 110M50 177H151"/>${star(100, 100, 7)}${figure(100, 140, 0.75, "#acb6b4")}<circle cx="62" cy="185" r="13"/><circle cx="138" cy="185" r="13"/><path d="M49 207L63 174L79 208ZM121 208L136 174L153 208Z" fill="#a6b1a5"/>`,
  `${sun(143, 70, 13)}${figure(80, 139, 1.05, "#b4baa0")}<path d="M105 180q-5-34 20-35q30 0 25 33l-11 25h-33Z" fill="#a58e60"/><circle cx="126" cy="150" r="16" fill="#a8946b"/><path d="M118 150l7 3l8-3M125 153v7M96 155l-14-8M150 185q18-26 10-38"/><path d="M72 84c-13-13-18 11-5 8c10-2 13-15 22-6c8 9-7 15-13 6"/>`,
  `${mountain}${figure(109, 143, 1.25, "#71877d")}<path d="M132 117L155 98M155 98V69M148 72H162V94H148Z" fill="#c5b47d"/>${star(155, 83, 6)}<path d="M83 128L75 211" stroke-width="3"/>`,
  `<circle cx="100" cy="134" r="62" fill="#3c5152"/><circle cx="100" cy="134" r="48"/><circle cx="100" cy="134" r="22" fill="#142329"/>${Array.from(
    { length: 8 },
    (_, i) => {
      const a = (i * Math.PI) / 4;
      return `<path d="M${100 + Math.cos(a) * 22} ${134 + Math.sin(a) * 22}L${100 + Math.cos(a) * 61} ${134 + Math.sin(a) * 61}"/>`;
    },
  ).join(
    "",
  )}${star(100, 134, 14)}<path d="M30 78q-18 5-13 21M170 78q18 5 13 21M30 196q-18-5-13-21M170 196q18-5 13-21"/>`,
  `${temple}${figure(100, 160, 1.2, "#9a9c8c")}<path d="M68 118V169M63 117L68 91L73 117ZM57 120H79M136 109V163M119 122H153M123 122l-9 25h19ZM149 122l-9 25h19Z" fill="#b8b292"/><path d="M89 102L92 91H108L111 102Z" fill="#b8a675"/>`,
  `<path d="M45 218V63M38 73Q100 52 161 73M153 63V218" stroke-width="9" stroke="#647b65"/><path d="M47 85l-14-13M155 85l15-14M100 70V104M100 104L82 124L106 137"/>${figure(100, 172, -0.9, "#9bafaa")}<circle cx="100" cy="205" r="17" stroke="#cebb83" opacity=".7"/>`,
  `${sun(149, 170, 17)}<path d="M20 210L69 194L116 207L181 190"/><path d="M51 172q14-35 48-23l40-11l14 16-30 13-18 33M63 174l-6 32M101 175l-9 30M139 159l15 44" fill="#8b9990"/>${figure(89, 121, 0.85, "#a6aa9e")}<path d="M115 98V165M115 101H146V125H115Z" fill="#263b3a"/><path d="M128 106l6 7-6 7-6-7Z" fill="#c7b687"/>`,
  `<path d="M95 95Q41 57 35 104Q41 142 88 137M105 95Q159 57 165 104Q159 142 112 137" fill="#86988e"/>${figure(100, 153, 1.1, "#acb7a1")}<circle cx="100" cy="103" r="12"/><path d="M72 144L91 153M110 137L127 126M85 148Q99 165 115 138" stroke="#b8c5bb" stroke-width="3"/><path d="M66 141l16 5-5 14-15-5ZM120 119l15 5-5 14-15-5Z" fill="#b9a578"/><path d="M46 211Q100 186 154 211" fill="#5c7c79"/>`,
  `<path d="M60 100Q24 60 32 130L70 154M140 100Q176 60 168 130L130 154" fill="#6d686d"/><path d="M74 104L68 67L90 88L110 88L132 67L126 104L135 149H65Z" fill="#93817c"/><path d="M83 112l9 3M109 115l9-3M91 135l9 6 9-6"/><path d="M100 142V186M60 181H140V199H60Z" fill="#3c4342"/><path d="M61 197q-20 0-15 17t24-2M139 197q20 0 15 17t-24-2"/>${star(100, 94, 6)}`,
  `<path d="M70 215L77 99H125L135 215Z" fill="#66736c"/><path d="M74 99V86H86V95H98V82H110V95H126V99"/><path d="M97 117L106 138L90 156L112 177L99 214" stroke="#142329" stroke-width="6"/><path d="M146 47L107 91H128L88 136L105 103H87Z" fill="#d8bc7b" stroke="none"/><path d="M46 149l-12 20 22 11M151 170l17 16-12 18"/><path d="M80 214H132M89 120H101V135H89M110 178H121V193H110"/>`,
  `${star(100, 81, 21)}${star(52, 90, 7)}${star(147, 85, 7)}${star(70, 58, 5)}${star(130, 50, 5)}${star(42, 128, 5)}${star(158, 128, 5)}<path d="M20 211Q65 184 107 211Q142 190 180 211" fill="#5b7a78"/>${figure(101, 163, 0.9, "#9eb6ad")}<path d="M82 153L64 173M120 153L138 177M60 174l9-4 7 12-10 6ZM132 175l11-3 5 13-13 4Z" fill="#c2b186"/><path d="M69 189l-8 14M141 191l10 15" stroke="#bacac2"/>`,
  `${moon(100, 79, 27)}<path d="M30 212V116H52V212M149 212V116H171V212" fill="#5f7477"/><path d="M80 216Q130 187 100 169Q82 158 103 138" stroke="#a9beb6" stroke-width="8"/><path d="M54 193l9-30 12 8 10 25ZM124 196l10-28 10-7 9 32Z" fill="#8d9b94"/><path d="M86 226l7-14 9 3 9-6 7 17" fill="#9b9577"/>`,
  `${sun(100, 86, 29)}<path d="M24 177H176V209H24" fill="#72866c"/>${figure(102, 162, 0.65, "#c8b995")}<path d="M57 187q18-24 46-10l30-6 15 15-27 10-24 10-29-5ZM64 192l-7 21M117 192l8 20" fill="#b7b9a4"/><path d="M137 156V101L160 114L137 123Z" fill="#b59a78"/><path d="M40 177v-25M160 177v-25"/>${star(40, 145, 9)}${star(160, 145, 9)}`,
  `<path d="M92 95Q43 63 28 105Q51 130 85 125M108 95Q157 63 172 105Q149 130 115 125" fill="#879c95"/>${figure(100, 116, 0.85, "#b7b7a0")}<path d="M115 98L144 112L147 101L120 94Z" fill="#c6b17f"/><path d="M144 119l-12 31M157 117l4 27"/>${figure(57, 195, 0.65, "#9aa99e")}${figure(101, 198, 0.65, "#a9aca0")}${figure(145, 195, 0.65, "#9aa99e")}<path d="M30 219H170"/>`,
  `${wreath}${figure(100, 145, 1.1, "#a6b8a0")}<path d="M78 120L59 137M120 120L142 105M58 128V148M143 95V115"/><path d="M78 39Q100 25 122 39M78 209Q100 224 122 209"/>${star(34, 55, 9)}${star(165, 55, 9)}${star(34, 212, 9)}${star(165, 212, 9)}`,
];

await mkdir("public/cards", { recursive: true });
for (const card of cards) {
  const stars = Array.from({ length: 14 }, (_, i) =>
    star(26 + ((i * 43) % 148), 43 + ((i * 31) % 165), i % 3 === 0 ? 2.5 : 1.3),
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><defs><radialGradient id="sky"><stop stop-color="#263d40"/><stop offset="1" stop-color="#101f26"/></radialGradient><pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".4" fill="#d8c594" opacity=".12"/></pattern></defs><rect x="1" y="1" width="198" height="298" rx="9" fill="#102027" stroke="#b9a36f" stroke-width="1.5"/><rect x="8" y="8" width="184" height="284" rx="5" fill="none" stroke="#ac9a6d" stroke-width=".6"/><path d="M16 49Q100 5 184 49V244H16Z" fill="url(#sky)" stroke="#b7a475" stroke-width=".6"/>${stars}<g stroke="#c7b88f" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" fill="none">${scenes[card.id]}</g><path d="M16 244H184" stroke="#aa9565" stroke-width=".7"/><text x="100" y="31" text-anchor="middle" fill="#d3bf8b" font-family="Georgia,serif" font-size="12" letter-spacing="3">${card.number}</text><text x="100" y="268" text-anchor="middle" fill="#dfd1ad" font-family="Georgia,serif" font-size="${card.english.length > 16 ? 9 : 11}" letter-spacing="1.4">${card.english}</text>${star(100, 282, 3)}<rect x="10" y="10" width="180" height="280" rx="4" fill="url(#grain)" pointer-events="none"/></svg>`;
  await writeFile(`public/cards/${card.id}.svg`, svg);
}
const back = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="#bca774" stroke-width=".35" opacity=".35"/></pattern></defs><rect x="1" y="1" width="198" height="298" rx="9" fill="#172b30" stroke="#bca774"/><rect x="9" y="9" width="182" height="282" rx="5" fill="url(#p)" stroke="#bca774" stroke-width=".6"/><g fill="none" stroke="#c4b17f"><ellipse cx="100" cy="150" rx="64" ry="91"/><ellipse cx="100" cy="150" rx="49" ry="73"/><circle cx="100" cy="150" r="34"/><path d="M66 150Q100 111 134 150Q100 189 66 150Z"/><circle cx="100" cy="150" r="11"/><path d="M100 42V90M100 210V258M24 150H52M148 150H176"/></g>${star(100, 65, 10)}${star(100, 235, 10)}${star(100, 150, 5)}</svg>`;
await writeFile("public/cards/back.svg", back);
await writeFile(
  "public/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#102027"/>${moon(32, 31, 21)}${star(46, 42, 7)}</svg>`,
);
console.log("Created 22 original tarot illustrations and card back.");
