// Answer checker: parses a quizbowl answer line and judges a player's response.
//
// Built to taxonomy_work/answerline/answerline_spec.md (the build document): the parse half is a faithful
// port of the reference parser scripts/spec_parse.py (P1–P25; lexicon.py + segment.py), verified identical on
// 594 answer lines; the judge follows the spec's order J1–J14 (§8) with the rules of judging_rules.md.
// Tested against the spec suite taxonomy_work/answerline/tests.jsonl (see tests/answerChecker*.test.js).
//
// Public API (unchanged shapes; additions are optional):
//   evaluateAnswer(response, answerHtml, answerText, strictness = 10, opts = {})
//     -> { status: "accept" | "prompt" | "reject", matchedAnswer, prompt: { target, ask } | null,
//          antiprompt?: true, unsure?: true, rule?: "J5"…, via?: "line" | "hidden", note?: string }
//     opts: readText / fullText / readLen   read position (no position = end of the question, J3)
//           jointPieces  [[pieceA, pieceB], …] from the JOINTLY_REQUIRED_PIECES flag (one required portion)
//           hidden       { accept: [], prompt: [], antiprompt: [], reject: [] } (hidden_answers_spec.md)
//           previous     earlier response(s) on this question (prompt follow-up: reply, first+reply, reply+first)
//           isKnownAnswer(normalisedText) -> bool   optional corpus lexicon for the J10 collision guard
//   parseDirectives(answerHtml, answerText)  legacy summary { accept, prompt, reject, antiprompt, qualifiers,
//           wordForms, mainAnswer } plus { forms, rules }
//   checkAnswer / checkBonusPart / checkBonus, primaryAnswer, healAnswerline, normalizeText, frequencyKey, …

export function stripTags(text) {
  return text.replace(/<[^>]+>/g, "").trim();
}

// Umlaut folding mode: the standard pass keeps the German transliteration
// (ö→oe, ü→ue — "goering" for Göring). evaluateAnswer's second pass flips
// this to the plain English-keyboard form (ö→o — "mjolnir" for Mjölnir).
let _plainUmlauts = false;

export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/ö/g, _plainUmlauts ? "o" : "oe")
    .replace(/ü/g, _plainUmlauts ? "u" : "ue")
    .replace(/[áàâäãå]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôõø]/g, "o")
    .replace(/[úùû]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[ýÿ]/g, "y")
    .replace(/[š]/g, "s")
    .replace(/[ž]/g, "z")
    .replace(/[œ]/g, "oe")
    .replace(/[æ]/g, "ae")
    .replace(/[ł]/g, "l")
    .replace(/[ß]/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/(^|[\s([{"“”'‘’])[-−–](?=\d)/g, "$1minus ")
    .replace(/(^|[\s([{"“”'‘’])\+(?=\d)/g, "$1plus ")
    .replace(/[-–—‐]/g, " ")
    .replace(/[^\p{L}\p{N}\s+#]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripLeadingArticle(text) {
  return text
    .toLowerCase()
    .replace(/^(a|an|the|el|la|los|las|le|les|il|lo|l'|un|une|der|die|das)\s+/i, "")
    .trim();
}

export function parseAnswerline(answerline) {
  const raw = answerline || "";
  const stripped = stripTags(raw).trim();
  const results = { answers: [], required: [] };

  const requiredRegex = /<b>\s*<u>([^<]+)<\/u>\s*<\/b>/gi;
  let match;
  const requiredParts = new Set();
  while ((match = requiredRegex.exec(raw)) !== null) {
    requiredParts.add(match[1].trim());
  }
  const fullRequired = [...requiredParts].join(" ");

  if (fullRequired) {
    results.required.push(fullRequired.trim());
  }

  const orRegex = /\[or\s+([^\]]+)\]/gi;
  while ((match = orRegex.exec(raw)) !== null) {
    const alts = match[1].trim().split(/\s+or\s+|\s*,\s*/);
    for (const alt of alts) {
      const cleaned = stripTags(alt).trim();
      if (cleaned && !results.answers.includes(cleaned)) {
        results.answers.push(cleaned);
      }
    }
  }

  for (const req of results.required) {
    if (!results.answers.includes(req)) results.answers.push(req);
  }

  if (results.answers.length === 0) {
    results.answers.push(stripped);
    if (stripped) results.required.push(stripped);
  }

  return results;
}

export function parseSanitizedAnswerline(sanitized) {
  const text = sanitized || "";
  const results = { answers: [], required: [] };

  const bracketRegex = /\[(or|accept|prompt on|do not accept|do not prompt on)\s+([^\]]+)\]/gi;
  let match;
  const bracketAlternatives = [];
  while ((match = bracketRegex.exec(text)) !== null) {
    const directive = match[1].toLowerCase();
    const content = match[2].trim();
    if (directive === "or" || directive === "accept") {
      for (const a of content.split(/\s+or\s+|\s*,\s*/)) {
        const alt = a.trim();
        if (alt) bracketAlternatives.push(alt);
      }
    }
  }

  const firstBracket = text.search(/\[(?:or|accept|prompt|do not)/i);
  const mainAnswer = firstBracket > 0 ? text.substring(0, firstBracket).trim() : text.trim();

  if (mainAnswer) {
    results.required.push(mainAnswer);
    results.answers.push(mainAnswer);
  }
  for (const alt of bracketAlternatives) {
    if (!results.answers.includes(alt)) results.answers.push(alt);
  }

  if (results.answers.length === 0 && text.trim()) {
    results.answers.push(text.trim());
    results.required.push(text.trim());
  }

  return results;
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (a === b) return 0;
  let prev = new Uint8Array(b.length + 1);
  let curr = new Uint8Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function stripQuotes(s) {
  return (s || "").replace(/^["“”'']+|["“”'']+$/g, "").trim();
}

function underlineSpans(html) {
  let vis = "";
  const spans = [];
  let depth = 0, spanStart = -1;
  const re = /<[^>]+>|[^<]+/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tok = m[0];
    if (tok[0] === "<") {
      if (/^<u(\s|>)/i.test(tok)) { if (depth === 0) spanStart = vis.length; depth++; }
      else if (/^<\/u\s*>/i.test(tok)) {
        depth = Math.max(0, depth - 1);
        if (depth === 0 && spanStart >= 0) { spans.push([spanStart, vis.length]); spanStart = -1; }
      }
    } else {
      vis += tok;
    }
  }
  if (depth > 0 && spanStart >= 0) spans.push([spanStart, vis.length]);
  const merged = [];
  for (const sp of spans) {
    const prev = merged[merged.length - 1];
    if (prev && sp[0] - prev[1] <= 1 && /^['’\u2019-]?$/.test(vis.slice(prev[1], sp[0]))) prev[1] = sp[1];
    else merged.push([sp[0], sp[1]]);
  }
  return { vis, spans: merged };
}

const WORD_CHAR = /[A-Za-z0-9'’]/;

// ── Tag-split word repair ────────────────────────────────────────────────
// Packet markup routinely ends an underline mid-word ("<b><u>pulsar</u></b>s"),
// which phraseTerms already handles by expanding to the word boundary. But part
// of the upstream dump strands the inflection behind a SPACE the markup
// introduced: "<b><u>pulsar</u> </b>s", "<u>neutron star</u> s" — the DB row
// literally reads "pulsar s [prompt on neutron star s until read]". Heal it at
// the source so terms, mainAnswer, primaryAnswer and the displayed answerline
// all see one word.
//
// Three guards keep this off genuine multi-word answers:
//   1. a formatting-tag run must sit between the word and the space, so plain
//      prose is never glued;
//   2. the tail must be a bound morpheme from a closed list, AND must be
//      plausible for the STEM it would attach to (this is what keeps
//      "<u>Dar</u> es Salaam", "log n" and "2 to the n" intact);
//   3. nothing word-like may follow the tail, looking THROUGH tags, so
//      "is<u> n</u>ot" stays split.
const SPLIT_SUFFIX = /^(?:['’]?s|es|n|ns|ic|ics|ism|isms|ian|ians|ata|ae|ing|er|ers|ly|ness)$/;
const SPLIT_STEM_RE = /[\p{L}\p{N}'’]+$/u;
const TAG_SPLIT_RE = /(?<=[\p{L}\p{N}'’])((?:<\/?[A-Za-z][^>]*>)+)[ \t]+((?:<\/?[A-Za-z][^>]*>)*)(['’]?[a-z]{1,4})(?!(?:<\/?[A-Za-z][^>]*>)*[\p{L}\p{N}'’-])/gu;
const TEXT_SPLIT_RE = /(?<=[\p{L}\p{N}'’])[ \t]+(['’]?[a-z]{1,4})(?![\p{L}\p{N}'’-])/gu;
// "-es" only attaches to a sibilant or -o stem ("gases", "churches", "potatoes"),
// so "Dar es Salaam" / "La vida es sueno" stay split. "-n"/"-ns" is the demonym
// split ("Persia n", "Maya ns") and needs a vowel-final stem of >= 4 chars,
// which keeps "log n", "2 to the n", "ln n", "mod n" and "escalier n" intact.
function splitSuffixOk(stem, suf) {
  if (!SPLIT_SUFFIX.test(suf)) return false;
  if (suf === "es") return /(?:s|x|z|ch|sh|o)$/i.test(stem);
  if (suf === "n" || suf === "ns") return stem.length >= 4 && /[aeiou]$/i.test(stem) && !/^(?:the|una|une|ide|ode|are)$/i.test(stem);
  return true;
}
export function healAnswerline(answerline, sanitizedAnswerline) {
  const src = String(answerline || "");
  const healed = new Set();
  const stemBefore = (str, off) => ((stripTags(str.slice(0, off)).match(SPLIT_STEM_RE) || [""])[0]);
  const html = src.includes("<")
    ? src.replace(TAG_SPLIT_RE, (m, t1, t2, suf, off, str) => {
        const lo = suf.toLowerCase();
        if (!splitSuffixOk(stemBefore(str, off), lo)) return m;
        healed.add(lo);
        return t1 + t2 + suf;
      })
    : src;
  let text = String(sanitizedAnswerline || "");
  // The sanitized line has no tags to anchor on, so only repair the exact
  // suffixes the tagged line proved were split — never guess from text alone.
  if (healed.size && text) {
    text = text.replace(TEXT_SPLIT_RE, (m, suf, off, str) => {
      const lo = suf.toLowerCase();
      return healed.has(lo) && splitSuffixOk(stemBefore(str, off), lo) ? suf : m;
    });
  }
  return { answerline: html, sanitized: text };
}

function isDirectiveInner(inner) {
  return /\b(accept|prompt|reject|do not|anti-?prompt)\b/i.test(inner) || /^\s*or\b/i.test(inner);
}

function findContainers(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "[" && c !== "(") continue;
    const close = c === "[" ? "]" : ")";
    let depth = 1, j = i + 1;
    while (j < s.length && depth > 0) {
      if (s[j] === c) depth++;
      else if (s[j] === close) depth--;
      j++;
    }
    out.push({ start: i, text: s.slice(i, j) });
    i = j - 1;
  }
  return out;
}

const STOPWORDS = new Set(["the", "a", "an", "of", "and", "or", "de", "la", "le", "el", "il"]);
function singularize(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 2 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}
function contentWords(norm) {
  return norm.split(/\s+/).filter((w) => w && !STOPWORDS.has(w)).map(singularize);
}

export function primaryAnswer(raw, sanitized) {
  ({ answerline: raw, sanitized } = healAnswerline(raw, sanitized));
  const src = (raw && raw.trim()) ? raw : (sanitized || "");
  const containers = findContainers(src);
  const firstDir = containers.find((c) => isDirectiveInner(c.text.slice(1, -1)));
  const mainRaw = firstDir ? src.slice(0, firstDir.start) : src;
  const { vis, spans } = underlineSpans(mainRaw);
  if (spans.length) {
    const fulls = [];
    for (const [s0, e0] of spans) {
      let a = s0, b = e0;
      while (a > 0 && WORD_CHAR.test(vis[a - 1])) a--;
      while (b < vis.length && WORD_CHAR.test(vis[b])) b++;
      const w = vis.slice(a, b).trim();
      if (w) fulls.push(w);
    }
    const joined = fulls.join(" ").trim();
    if (joined) return joined;
  }
  return stripQuotes(stripTags(mainRaw).trim());
}

export function frequencyKey(answer) {
  return normalizeText(answer || "").split(/\s+/).filter(Boolean).map(singularize).join(" ");
}

function stemKey(answer) {
  return normalizeText(answer || "")
    .split(/\s+/).filter(Boolean).map(singularize)
    .map((w) => (w.length > 5 ? w.replace(/(ing|ed|ment|ness|tion)$/, "") : w))
    .join("");
}

export function answersSimilar(a, b) {
  return similarKeysMatch(similarityKeys(a), similarityKeys(b));
}
// The two normalized forms answersSimilar compares, computed once per answer
// so a frequency merge over thousands of answers doesn't redo them per pair.
export function similarityKeys(answer) {
  return { k: frequencyKey(answer).replace(/\s+/g, ""), stem: stemKey(answer) };
}
export function similarKeysMatch(x, y) {
  const ka = x.k, kb = y.k;
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (x.stem === y.stem) return true;
  const min = Math.min(ka.length, kb.length);
  if (min < 5) return false;
  // A shared stem only counts on longer words: at five letters it was three
  // characters, which folded Chile, Chicago and Chinook into "China".
  if (min >= 8 && ka.slice(0, min - 2) === kb.slice(0, min - 2) && Math.abs(ka.length - kb.length) <= 3) return true;
  const max = Math.max(1, Math.floor(min / 5));
  if (Math.abs(ka.length - kb.length) > max) return false;   // the distance is at least the length gap
  return levenshtein(ka, kb) <= max;
}
// ======================================================================
// Parser: JS port of answerline/scripts/{lexicon,segment,spec_parse}.py (parse half of answerline_spec.md).
const R = String.raw;

// EXT: this module's extensions beyond the reference parser (multi-answer "AND", conditions, mid-list timing,
// several "in place of" slots, glued-damage repairs, ...). Off = byte-for-byte reference behaviour (parity tests).
let EXT = true;
function setParserExt(v) { EXT = !!v; }

// ---------------------------------------------------------------- lexicon
const B = R`(?<![a-z0-9])`;
const E = R`(?![a-z0-9])`;
const DONT = R`(?:under\s+no\s+circumstances(?:\s+(?:should\s+you|should\s+one|may\s+you))?|be\s+careful\s+(?:not\s+to|to\s+not)|do(?:es)?\s+not|do\s*n't|dont|do\s+no|never|should\s+not|shouldn't|must\s+not|may\s+not|cannot|can't|will\s+not|won't|please\s+do\s+not)`;
const ACC = R`(?:accept|acept|accep|acccept|accpet|aceept|accet|accecpt|acceept|accefpt|acceot|accepte|acceptt)`;
const PRO = R`(?:prompt|promt|prmpt|promptt)`;
const ON = R`(?:\s+on)?`;

// [id, type, role, regex]
const KW_DEFS = [
  ["neg_accept_or_prompt", "REJECT_NOPROMPT", "opener", B + DONT + R`\s+(?:ever\s+|otherwise\s+)?(?:` + ACC + R`|take|allow)\s+(?:,\s*)?(?:or|nor|and)\s+(?:anti-?\s?)?` + PRO + R`(?:\s+on)?` + E],
  ["neg_prompt_or_accept", "REJECT_NOPROMPT", "opener", B + DONT + R`\s+` + PRO + R`(?:\s+on)?\s+(?:or|nor)\s+` + ACC + R`(?:\s+on)?` + E],
  ["neg_neither_nor", "REJECT_NOPROMPT", "opener", B + R`neither\s+` + ACC + R`\s+nor\s+` + PRO + ON + E],
  ["neg_no_credit_or_prompt", "REJECT_NOPROMPT", "opener", B + R`no\s+(?:credit|points)\s+(?:or|nor)\s+prompt(?:\s+(?:on|for))?` + E],
  ["neg_do_not_accept", "REJECT", "opener", B + DONT + R`\s+(?:ever\s+|otherwise\s+|yet\s+|actually\s+)?(?:` + ACC + R`|take|allow|award|count|credit|reward)` + E],
  ["neg_do_not_prompt", "NOPROMPT", "opener", B + DONT + R`\s+(?:ever\s+|otherwise\s+)?` + PRO + R`(?:\s+(?:the\s+)?(?:player|team)s?)?` + ON + E],
  ["neg_no_prompt", "NOPROMPT", "opener", B + R`no\s+prompt(?:ing)?(?:\s+(?:on|for))?` + E],
  ["neg_no_need_to_prompt", "NOPROMPT", "opener", B + R`no\s+need\s+to\s+prompt` + ON + E],
  ["neg_reject", "REJECT", "opener", B + R`(?:reject|rejct|rejects|rejected)` + E],
  ["neg_no_credit", "REJECT", "opener", B + R`no\s+(?:credit|points)\s+(?:for|on)` + E],
  ["neg_not_acceptable", "REJECT", "postfix", B + R`(?:(?:is|are)\s+)?(?:not\s+(?:acceptable|accepted|allowed|correct|sufficient|enough|good\s+enough)|unacceptable|insufficient|incorrect)` + E],
  ["neg_but_not", "REJECT", "connector", B + R`but\s+not` + E + R`(?!\s+(?:before|until|after|once|if|when|just|only|necessarily|limited|always))`],
  ["neg_no_other", "REJECT", "postfix", B + R`no\s+other\s+(?:answers?|words?|names?)\s+(?:is\s+|are\s+)?(?:acceptable|accepted|allowed)` + E],
  ["neutral_do_not_reveal", "NEUTRAL", "opener", B + DONT + R`\s+(?:otherwise\s+)?(?:reveal|read(?:\s+out)?|say|mention|tell|announce|repeat|give\s+away|volunteer)` + E + R`(?!\s+(?:accept|prompt))`],
  ["anti_prompt", "ANTIPROMPT", "opener", B + R`anti\s*-?\s*p?` + PRO + R`(?:s|ed|ing)?` + ON + E],
  ["reverse_prompt", "ANTIPROMPT", "opener", B + R`reverse\s*-?\s*prompt` + ON + E],
  ["ask_less_specific", "ANTIPROMPT", "opener", B + R`(?:ask(?:\s+(?:them|the\s+player|the\s+team))?|` + PRO + R`(?:\s+(?:them|the\s+player))?)\s+(?:for|to\s+be)\s+(?:a\s+)?(?:less\s+specific(?:ity)?|more\s+general)(?:\s+answer)?` + ON + E],
  ["prompt_partial", "PROMPT_PARTIAL", "opener", B + PRO + R`\s+on\s+(?:any\s+|a\s+)?(?:partial|incomplete)(?:\s+answers?)?` + E],
  ["prompt_less_specific", "PROMPT_PARTIAL", "opener", B + PRO + R`\s+on\s+(?:any\s+)?(?:less\s+specific|more\s+general|vaguer|general)(?:\s+answers?)?` + E],
  ["directed_prompt", "PROMPT", "opener", B + R`directed\s+prompt` + ON + E],
  ["prompt_with", "PROMPT", "opener", B + PRO + R`\s+with` + E],
  ["prompt_on", "PROMPT", "opener", B + PRO + R`(?:s|ed|ing)?(?:\s+(?:the\s+)?(?:player|team|reader)s?)?\s*on` + E],
  ["prompt_bare", "PROMPT", "opener", B + PRO + R`(?:s|ed)?` + E],
  ["ask_more_specific", "PROMPT", "opener", B + R`ask(?:\s+(?:them|the\s+player|the\s+team|for))?\s+(?:for\s+|to\s+be\s+)?(?:a\s+)?more\s+(?:specific|information|detail)` + E],
  ["ask_for", "PROMPT", "opener", B + R`ask\s+(?:them\s+)?for` + E],
  ["ask_spell", "PROMPT", "opener", B + R`(?:ask|have)\s+(?:the\s+)?(?:players?|them|teams?|the\s+team)?\s*(?:to\s+)?(?:spell|for\s+(?:a\s+|the\s+)?spelling)` + E],
  ["cond_if", "CONDITIONAL", "opener", B + R`if\s+(?:they|someone|somebody|anyone|a\s+player|the\s+player|players|a\s+team|the\s+team|the\s+answerer)\s+(?:\w+\s+){0,2}?(?:answers?|says?|gives?|buzz(?:es)?|responds?|offers?|provides?|mentions?)` + E],
  ["portion_either", "PORTION", "opener", B + R`(?:(?:also|and)\s+)?` + ACC + R`\s+(?:either|any|each)\s+(?:one\s+)?(?:of\s+the\s+)?(?:underlined|bolded|bold(?:ed)?\s*(?:and|/)?\s*underlined|capitali[sz]ed)\s+(?:portions?|parts?|names?|answers?|words?|terms?|sections?|pieces?|halves|half|items?|options?|segments?|components?|elements?|ones?)?`],
  ["portion_either_part", "PORTION", "opener", B + ACC + R`\s+(?:either|any)\s+(?:one\s+)?(?:of\s+the\s+)?(?:portions?|parts?|names?|halves|half|words?|surnames?)(?:\s+alone)?` + E + R`(?=\s*(?:$|[,;.)\]]|or\s+both|(?:is|are)\s|alone|by\s+itself|(?:but|and)\s))`],
  ["portion_postfix", "PORTION", "postfix", B + R`(?:either|any|each)\s+(?:one\s+)?(?:of\s+the\s+)?(?:underlined\s+)?(?:portions?|parts?|names?|answers?|words?|one|is)\s+(?:(?:is|are|alone\s+is)\s+)?(?:acceptable|fine|ok|okay|sufficient|enough|accepted|good|correct)` + E],
  ["portion_both_required", "PORTION", "requirement", B + R`(?:both|all|all\s+(?:two|three|four|five))\s+(?:of\s+the\s+)?(?:underlined\s+|bolded\s+)?(?:portions?|parts?|names?|answers?|words?|terms?|pieces?|halves|items?|people|persons|countries|elements|components)?\s*(?:are\s+|is\s+)?(?:required|needed|necessary|must\s+be\s+(?:given|said|mentioned))` + E],
  ["portion_ref", "PORTION", "scope", B + R`(?:non-?\s?)?underlin(?:ed|e|ing)` + E],
  ["req_accept_either_order", "REQUIREMENT", "opener", B + ACC + R`\s+(?:(?:the\s+)?(?:names?|answers?|parts?|terms?|words?|items?|them)\s+)?(?:(?:given|said)\s+)?(?:in\s+)?(?:either|any|reverse(?:d)?)\s+order` + E],
  ["req_both", "REQUIREMENT", "requirement", B + R`(?:(?:both|all\s+(?:two|three|four|five|of\s+them)|each)\s+(?:\w+\s+){0,2}(?:are\s+|is\s+)?(?:required|needed|necessary)|(?:need|needs|require|requires|must\s+(?:give|name|say|get|include|have|mention))\s+(?:both|all|each)|both\s+must\s+be)` + E],
  ["req_either_order", "REQUIREMENT", "requirement", B + R`(?:(?:in|at)\s+)?(?:either|any)\s+order|order\s+(?:does\s+not|doesn't|is\s+not|isn't)\s+(?:matter|important|required)|(?:may|can)\s+be\s+(?:given\s+)?(?:reversed|in\s+(?:either|any)\s+order)|(?:order|number)\s+(?:is\s+)?not\s+important|(?:order|number)\s+(?:does\s+not|doesn't)\s+matter|reversed` + E],
  ["req_fixed_order", "REQUIREMENT", "requirement", B + R`(?:must|should)\s+be\s+(?:given\s+)?in\s+(?:that|this|the\s+correct|the\s+right|order)|order\s+(?:must|should)\s+be\s+correct|in\s+(?:that|this)\s+order` + E],
  ["req_any_n", "REQUIREMENT", "requirement", B + R`(?:any|name|give)\s+(?:one|two|three|four|five|2|3|4|5)\s+(?:of|from)` + E],
  ["req_exact", "REQUIREMENT", "requirement", B + R`(?:exact|full|complete|specific)\s+(?:answer|phrase|wording|title|name|term|words?)\s+(?:is\s+|are\s+)?(?:required|needed|necessary)|(?:answer|response)\s+must\s+(?:be|contain|include)|the\s+words?\s+"[^"]+"\s+(?:is|are)\s+(?:required|needed)` + E],
  ["req_do_not_need", "REQUIREMENT", "opener", B + R`(?:(?:do|does)\s*(?:not|n't)\s+(?:need|require)|no\s+need\s+for|need\s+not\s+(?:say|give|include)|only\s+need(?:s)?)` + E],
  ["req_not_needed", "REQUIREMENT", "postfix", B + R`(?:is|are|isn't|aren't)?\s*(?:not\s+)?(?:needed|required|necessary)\s+(?:after|once|if|when)` + E],
  ["acc_word_forms", "ACCEPT_CLASS", "scope", B + R`word[- ]?forms?` + E],
  ["acc_equivalents", "ACCEPT_CLASS", "scope", B + R`(?:(?:obvious|reasonable|clear|clear-knowledge|close|logical|descriptive|equivalent|other|similar|exact|direct|phonetic|translated|foreign(?:-language)?|english|any|technical|near|synonymous)\s+)*(?:equivalents?|equivalences?|equivalent\s+(?:answers?|descriptions?|terms?|phrases?|names?))` + E],
  ["acc_synonyms", "ACCEPT_CLASS", "scope", B + R`synonyms?` + E],
  ["acc_descriptions", "ACCEPT_CLASS", "scope", B + R`(?:descriptions?|descriptive\s+answers?|descriptive\s+equivalents?|description\s+(?:is\s+)?(?:acceptable|accepted|ok|okay|fine))` + E],
  ["acc_answers_mentioning", "ACCEPT_CLASS", "scope", B + R`(?:answers?|anything|responses?|things?|descriptions?)\s+(?:that\s+(?:mention|involve|include|indicate|imply|describe|refer|contain|reference|explain|convey|suggest|show|specify|capture|say|identify|name)s?|(?:mentioning|involving|including|indicating|implying|describing|referring\s+to|containing|referencing|explaining|conveying|suggesting|specifying|about|regarding|related\s+to|relating\s+to|to\s+the\s+effect|along\s+the\s+lines|with)|like|such\s+as)` + E],
  ["acc_similar", "ACCEPT_CLASS", "scope", B + R`(?:similar(?:\s+answers?)?|anything\s+similar|the\s+like|etc\.?|and\s+so\s+on|so\s+forth)` + E],
  ["acc_specific", "ACCEPT_CLASS", "scope", B + R`(?:more\s+specific|specific\s+(?:types?|kinds?|examples?|answers?|instances?|forms?|varieties|names?))` + E],
  ["acc_translation", "ACCEPT_CLASS", "scope", B + R`(?:translations?|translated|transliterations?|(?:original[- ]language|foreign[- ]language|native[- ]language)\s+(?:titles?|names?|forms?|equivalents?))` + E],
  ["acc_spellings", "ACCEPT_CLASS", "scope", B + R`(?:alternate\s+|alternative\s+|variant\s+|other\s+)?(?:spellings?|misspellings?|transliterations?)` + E],
  ["acc_abbrev", "ACCEPT_CLASS", "scope", B + R`(?:abbreviations?|acronyms?|initialisms?|symbols?)` + E],
  ["acc_also", "ACCEPT", "opener", B + R`(?:also|likewise|additionally|further|similarly)\s+` + ACC + E + "|" + B + ACC + R`\s+also` + E],
  ["acc_accept", "ACCEPT", "opener", B + ACC + R`(?:s|ed|ing)?` + E],
  ["acc_or", "ACCEPT", "opener", B + R`or(?=[\s:,"']|$)`],
  ["acc_accept_glued", "ACCEPT", "opener", B + R`accept(?!(?:able|ably|ance|ances|ed|ing|s|or|ors|ation|ations|ability)(?![a-z]))(?=[a-z])`],
  ["prompt_on_glued", "PROMPT", "opener", B + R`prompt\s?on(?!(?:ly|e|es|ce)(?![a-z]))(?=[a-z])`],
  ["acc_take", "ACCEPT", "opener", B + R`take` + E],
  ["acc_allow", "ACCEPT", "opener", B + R`allow` + E],
  ["acc_count", "ACCEPT", "opener", B + R`(?:give\s+(?:credit|points)\s+(?:for|to)|award\s+(?:points|credit)\s+(?:for|to)|count\s+as\s+correct)` + E],
  ["acc_postfix", "ACCEPT", "postfix", B + R`(?:(?:is|are)\s+(?:also\s+)?(?:acceptable|fine|ok|okay|allowed|good(?:\s+enough)?|sufficient|correct|accepted)|acceptable|(?:ok|okay|fine)(?=\s*(?:$|[,;.)\]])))` + E],
  ["acc_acceptable_lead", "ACCEPT", "opener", B + R`(?:other\s+)?acceptable\s+(?:\w+\s+)?(?:include|are)` + E],
  ["len_be_lenient", "LENIENCY", "opener", B + R`be\s+(?:very\s+)?(?:lenient|generous|liberal|forgiving|flexible)(?:\s+(?:with|on|about|in|regarding|toward|towards|for))?` + E],
  ["len_pronunciation", "LENIENCY", "scope", B + R`(?:pronunciations?|phonetic(?:ally)?|mispronunciations?|pronounced)` + E],
  ["note_moderator", "NOTE", "note", B + R`(?:\*?\s*note\s+(?:to|for)\s+(?:the\s+)?(?:moderators?|readers?|scorekeepers?|mods?)|(?:moderator|reader)(?:'s|s')?\s*note|moderator\s*:|reader\s*:)` + E],
  ["note_players", "NOTE", "note", B + R`note\s+(?:to|for)\s+(?:the\s+)?(?:players?|teams?|contestants?)` + E],
  ["note_editor", "NOTE", "note", B + R`(?:(?:ed|eds|editor|editors|writer|writers|author|authors|setter|packet)(?:'s|s'|s)?\s*\.?\s*note|ed\.\s*note)` + E],
  ["note_generic", "NOTE", "note", B + R`(?:\*?note\*?\s*[:\-]|n\.\s?b\.?|nb\s*:)`],
  ["pron_pronounced", "PRONUNCIATION", "pron", B + R`(?:pronounced|pronunciation|pron\.|rhymes\s+with|sounds\s+like|say\s+it\s+as)` + E],
  ["expl_clue_ref", "EXPLANATION", "explanation", B + R`(?:the\s+)?(?:first|second|third|fourth|fifth|sixth|last|final|early|earlier|opening|previous|other|unnamed|unmentioned|described|mentioned|referenced|quoted|former|latter|lead-?in)\s+(?:\w+\s+){0,2}(?:clues?|lines?|sentences?|parts?|works?|novel|poem|play|story|book|film|painting|piece|essay|song|character|author|artist|composer|quote|quotation|passage|excerpt|person|figure|one|is|was|are|refers?|describes?)` + E],
  ["acc_range", "ACCEPT_CLASS", "scope", B + R`(?:(?:any\s+)?(?:single\s+)?(?:numbers?|values?|answers?|years?|dates?|times?|time\s+periods?|figures?)\s+(?:between|from)\s+[\d.,]+\s*(?:and|to|-)\s*[\d.,]+|between\s+[\d.,]+\s+and\s+[\d.,]+|within\s+[\d.,]+\s*%?\s+of)` + E + R`|(?:±|\+/-)\s*[\d.]+`],
];
KW_DEFS.push(["acc_acceptable_lead_ext", "ACCEPT", "opener", B + R`(?:other\s+)?acceptable\s+(?:\w+\s+){1,2}(?:include|are)` + E]);
const KW = {};
const OPENERS = [];
for (const [id, type, role, rx] of KW_DEFS) {
  const e = { id, type, role, rx, y: new RegExp(rx, "iy"), g: new RegExp(rx, "ig") };
  KW[id] = e;
  if (role === "opener") OPENERS.push(e);
}
const WEAK_START_ONLY = new Set(["acc_accept_glued", "prompt_on_glued", "acc_or", "acc_take", "acc_allow", "prompt_bare", "ask_for", "cond_if", "len_be_lenient", "neutral_do_not_reveal", "req_do_not_need"]);

// regex helpers mirroring Python's re.match(s, pos, end) / re.search(s, a, b)
function sub(s, end) { return end != null && end < s.length ? s.slice(0, end) : s; }
function matchAt(re, s, pos, end) { // re: sticky
  re.lastIndex = pos;
  const m = re.exec(sub(s, end));
  return m;
}
function searchIn(re, s, a, b) { // re: global
  re.lastIndex = a || 0;
  return re.exec(sub(s, b));
}
function* findIter(re, s, a, b) {
  const str = sub(s, b);
  re.lastIndex = a || 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    yield m;
    if (m[0].length === 0) re.lastIndex++;
  }
}
const mEnd = (m) => m.index + m[0].length;
const isSpace = (c) => c != null && /\s/.test(c);
const isAlnum = (c) => c != null && /[\p{L}\p{N}]/u.test(c);
const strip = (s) => s.replace(/^\s+|\s+$/g, "");
const words = (s) => strip(s).split(/\s+/).filter(Boolean);

// norm(): curly quotes -> straight, NBSP -> space, dashes -> "-", lower-case one char at a time (length preserving)
const NORM_MAP = { "“": '"', "”": '"', "„": '"', "″": '"', "‘": "'", "’": "'", "`": "'", " ": " ", " ": " ", "–": "-", "—": "-" };
function normKw(s) {
  let out = "";
  for (const ch of s) {
    const m = NORM_MAP[ch];
    if (m !== undefined) { out += m; continue; }
    const l = ch.toLowerCase();
    out += l.length === ch.length ? l : ch;
  }
  return out;
}

// ---------------------------------------------------------------- styles (fmt/markup.py)
const TAG_RE = /<(\/?)([buiBUI])>/g;
function styleMap(html) {
  html = html || "";
  let text = "";
  const b = [], u = [], it = [], tb = [];
  const stack = [];
  let pos = 0, m, pend = false;
  TAG_RE.lastIndex = 0;
  const push = (seg) => {
    const fb = stack.includes("b"), fu = stack.includes("u"), fi = stack.includes("i");
    for (let k = 0; k < seg.length; k++) { b.push(fb); u.push(fu); it.push(fi); tb.push(k === 0 && pend); }
    pend = false;
    text += seg;
  };
  while ((m = TAG_RE.exec(html)) !== null) {
    if (m.index > pos) push(html.slice(pos, m.index));
    pos = m.index + m[0].length;
    if (/[bu]/i.test(m[2])) pend = true;
    const name = m[2].toLowerCase();
    if (m[1]) {
      const i = stack.lastIndexOf(name);
      if (i >= 0) stack.splice(i, 1);
    } else stack.push(name);
  }
  if (pos < html.length) push(html.slice(pos));
  return { text, b, u, it, tb };
}

// ---------------------------------------------------------------- segment.py
const LEADIN_RX = new RegExp(R`\s*(?:(?:but|and|also|however,?|otherwise,?|then,?|so,?|thus,?|still,?|even|just|only|additionally,?|finally,?|further(?:more)?,?|` +
  R`(?:very,?\s+)*(?:generously|grudgingly|begrudgingly|grudingly|reluctantly|leniently|liberally|happily|enthusiastically|cheerfully|gladly|charitably|kindly)|` +
  R`i\s+guess|i\s+suppose|i\s+think|(?:you|we|moderators?|readers?)\s+(?:can|could|may|might|should)(?:\s+also)?|we'll|go\s+ahead\s+and|feel\s+free\s+to|please|sure,?|ok,?|` +
  R`let's\s+be\s+(?:generous|nice|lenient)\s+and|be\s+careful\s+and|roll\s+your\s+eyes\s+(?:and|as\s+you)|might\s+as\s+well|to\s+be\s+(?:nice|safe|fair|generous),?|apparently(?:\s+you\s+can(?:\s+also)?)?|basically,?|generally,?|specifically,?|definitely|obviously,?|` +
  R`as\s+always,?|as\s+usual,?|of\s+course,?|be\s+(?:very\s+)?(?:lenient|generous|liberal|nice|kind),?\s+and|` +
  R`\*+|-+|:|,|\.)(?![a-z0-9]))+`, "iy");
const FRONT_TIMING_RX = new RegExp(R`\s*(?:(?:before|until|till|after|once|prior\s+to|on|in|during|for|in\s+place\s+of|instead\s+of|if)\s+[^,;]{1,80}?,)\s*(?=(?:also\s+|generously\s+|just\s+|only\s+)?(?:accept|prompt|reject|do\s+not|don't|anti|or\b|take\b|allow\b))`, "iy");
const NOTE_START = new RegExp(R`\s*(?:\*+\s*)?(?:` + KW.note_moderator.rx + "|" + KW.note_players.rx + "|" + KW.note_editor.rx + "|" + KW.note_generic.rx + ")", "iy");
const PRON_START = /\s*(?:it'?s\s+|often\s+|roughly\s+|usually\s+)?(?:pronounced|pronunciation|pron\.|rhymes\s+with|sounds\s+like)/iy;
const EXPL_START = new RegExp(R`\s*` + KW.expl_clue_ref.rx, "iy");
const PROSE_VERB = /\b(?:is|are|was|were|refers?|referred|refer|mean(?:s|t)?|denotes?|comes?|came|played|appears?|occurs?|happened|wrote|written|contains?|includes?|depicts?|describes?|described|has|have|had|represents?|stands?|stars?|features?|took|made|lived|called|named|known|by)\b/i;
const ANY_KW = new RegExp(B + R`(?:acc?c?e?c?pt\w*|prompt\w*|promt|reject\w*|anti-?\s?prompt\w*|do\s+not|don't|dont|never|underlined|equivalents?|word\s+forms?|required|either\s+order)` + E, "i");
const PRON_GUIDE = /^\s*"?[a-z'\- ]{1,40}"?\s*$/i;

function findGroups(s) {
  const pairs = { "]": "[", ")": "(", "}": "{" };
  const st = [], out = [];
  let stray = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "[" || ch === "(" || ch === "{") st.push([ch, i]);
    else if (ch === ")" || ch === "]" || ch === "}") {
      if (st.length && st[st.length - 1][0] === pairs[ch]) {
        const [o, j] = st.pop();
        if (!st.length) out.push({ open: o, start: j, end: i + 1, istart: j + 1, iend: i, closed: true });
      } else if (st.length && st.some((x) => x[0] === pairs[ch])) {
        while (st.length && st[st.length - 1][0] !== pairs[ch]) st.pop();
        const [o, j] = st.pop();
        if (!st.length) out.push({ open: o, start: j, end: i + 1, istart: j + 1, iend: i, closed: true });
      } else stray++;
    }
  }
  if (st.length) {
    const [o, j] = st[0];
    out.push({ open: o, start: j, end: s.length, istart: j + 1, iend: s.length, closed: false });
  }
  out.sort((x, y) => x.start - y.start);
  return [out, stray];
}

function splitTop(s, a, b, seps = ";") {
  const out = [];
  let d = 0, cs = a;
  for (let i = a; i < b; i++) {
    const ch = s[i];
    if (ch === "[" || ch === "(" || ch === "{") d++;
    else if (ch === "]" || ch === ")" || ch === "}") d = Math.max(0, d - 1);
    else if (seps.includes(ch) && d === 0) { out.push([cs, i]); cs = i + 1; }
  }
  out.push([cs, b]);
  return out;
}

function matchOpener(s, pos, end, atStart = true) {
  let best = null;
  for (const e of OPENERS) {
    if (!atStart && WEAK_START_ONLY.has(e.id)) continue;
    if (!EXT && e.id === "acc_acceptable_lead_ext") continue;
    const m = matchAt(e.y, s, pos, end);
    if (m && (best === null || mEnd(m) > mEnd(best[1]))) best = [e, m];
  }
  return best || [null, null];
}

function stripLeadins(s, pos, end) {
  const leadins = [];
  for (;;) {
    let m = matchAt(FRONT_TIMING_RX, s, pos, end);
    if (m && mEnd(m) > pos) {
      const txt = strip(s.slice(pos, mEnd(m)));
      const kind = txt.startsWith("if ") ? "conditional" : (/^(?:in\s+place\s+of|instead\s+of|for)\s/.test(txt) ? "substitution" : "front_timing");
      leadins.push([kind, txt]);
      pos = mEnd(m);
      continue;
    }
    m = matchAt(LEADIN_RX, s, pos, end);
    if (m && mEnd(m) > pos && strip(s.slice(pos, mEnd(m)))) {
      leadins.push(["leadin", strip(s.slice(pos, mEnd(m)))]);
      pos = mEnd(m);
      continue;
    }
    break;
  }
  while (pos < end && ' \t"*'.includes(s[pos])) {
    if (s[pos] === '"' && !/^"\s*(?:accept|prompt|reject|do\s+not|or\b|anti)/.test(s.slice(pos, pos + 12))) break;
    pos++;
  }
  return [pos, leadins];
}

const SWITCH_SCAN = new RegExp(B + R`(?:acc?c?e?c?pt|prompt|promt|reject|anti|reverse|directed|do|don't|dont|never|neither|no|also|ask)`, "ig");
function findSwitches(s, pos, end) {
  const out = [];
  let i = pos;
  // EXT: a keyword inside quotes is part of the quoted answer (reject “willingness to accept” or “WTA”)
  const qr = EXT ? maskQuotes(s, pos, end) : null;
  while (i < end) {
    const m = searchIn(SWITCH_SCAN, s, i, end);
    if (!m) break;
    if (qr && inRuns(qr, m.index + (m[0].length - m[0].trimStart().length))) { i = mEnd(m); continue; }
    const [e, mm] = matchOpener(s, m.index, end, false);
    if (e !== null && e.type !== "ACCEPT_CLASS") { out.push([e, mm]); i = mEnd(mm); }
    else i = mEnd(m);
  }
  return out;
}

function classifyGroup(s, g) {
  const a = g.istart, b = g.iend;
  const inner = s.slice(a, b);
  if (g.open === "[" && inner.startsWith("[") && inner.endsWith("]")) return "pron";
  if (g.open === "{") return "tag";
  if (!strip(inner)) return "empty";
  for (const [cs, ce] of splitTop(s, a, b)) {
    const [p] = stripLeadins(s, cs, ce);
    const [e] = matchOpener(s, p, ce);
    if (e !== null) return "directive";
  }
  if (EXT && ["portion_postfix", "acc_postfix", "neg_not_acceptable", "req_both", "req_either_order", "portion_both_required", "req_exact", "neg_no_other"].some((id) => { const re = KW[id].g; re.lastIndex = 0; return re.test(inner); })) return "directive";
  if (matchAt(NOTE_START, inner, 0)) return "note";
  if (matchAt(PRON_START, inner, 0)) return "pron";
  if (ANY_KW.test(inner)) return "directive";
  const ws = words(inner);
  const before = g.start > 0 ? s[g.start - 1] : " ";
  const after = g.end < s.length ? s[g.end] : " ";
  if ((isAlnum(before) || isAlnum(after)) && ws.length <= 4) return "optional";
  if (PRON_GUIDE.test(inner) && (inner.includes('"') || /[a-z]-[a-z]/.test(inner)) && ws.length <= 4) return "pron";
  if (matchAt(EXPL_START, inner, 0) || (ws.length >= 4 && PROSE_VERB.test(inner))) return "explanation";
  const rest = s.slice(g.end);
  if (ws.length <= 3 && g.end < s.length && strip(rest) && !/^\s*[\[(]/.test(rest)) return "optional";
  if (ws.length > 6) return "explanation";
  return "bare_alt";
}

const POSTFIX_IDS = ["portion_postfix", "acc_postfix", "neg_not_acceptable", "req_both", "req_either_order", "portion_both_required", "req_exact", "req_not_needed", "neg_no_other"];
function segParse(s) {
  const out = { label: "", head: null, groups: [], clauses: [], stray_closers: 0 };
  const m = /^\s*(?:answers?|ans\.?)\s*:\s*/i.exec(s);
  const start = m ? m[0].length : 0;
  if (m) out.label = strip(s.slice(0, m[0].length));
  let [groups, stray] = findGroups(s);
  groups = groups.filter((g) => g.start >= start);
  out.stray_closers = stray;
  let firstDir = null;
  for (const g of groups) {
    g.kind = classifyGroup(s, g);
    if (g.kind === "directive" && firstDir === null) firstDir = g.start;
  }
  out.groups = groups;
  out.head = [start, firstDir !== null ? firstDir : s.length];
  groups.forEach((g, gi) => {
    if (!["directive", "note", "bare_alt", "explanation"].includes(g.kind)) return;
    for (const [cs, ce] of splitTop(s, g.istart, g.iend)) {
      if (!strip(s.slice(cs, ce))) continue;
      const [p, leadins] = stripLeadins(s, cs, ce);
      const [e, mm] = matchOpener(s, p, ce);
      const cl = { g: gi, gkind: g.kind, start: cs, end: ce, text: s.slice(cs, ce), leadins, opener: null, type: null, body_start: p, switches: [], postfix: [] };
      if (e !== null) {
        let oid = e.id;
        if (oid === "acc_accept" && leadins.length && leadins[leadins.length - 1][1].replace(/,+$/, "").endsWith("also")) oid = "acc_also";
        cl.opener = oid; cl.type = e.type; cl.body_start = mEnd(mm);
      } else if (matchAt(NOTE_START, s, cs, ce)) cl.type = "NOTE";
      else if (matchAt(PRON_START, s, cs, ce)) cl.type = "PRONUNCIATION";
      else if (g.kind === "explanation" || matchAt(EXPL_START, s, cs, ce)) cl.type = "EXPLANATION";
      cl.switches = findSwitches(s, cl.body_start, ce);
      for (const pid of POSTFIX_IDS) {
        const pm = searchIn(KW[pid].g, s, cl.body_start, ce);
        if (pm) cl.postfix.push([pid, pm.index, mEnd(pm)]);
      }
      if (cl.type === null) {
        if (EXT && cl.postfix.length) {
          const neg = cl.postfix.find(([pid]) => pid === "neg_not_acceptable" || pid === "neg_no_other");
          if (neg) cl.postfix = [neg].concat(cl.postfix.filter((x) => x !== neg));
          if (/^\s*no\s+other\b/.test(s.slice(cs, ce))) cl.postfix = [["neg_no_other", cl.body_start, cl.body_start]].concat(cl.postfix);
        }
        if (cl.postfix.length) cl.type = KW[cl.postfix[0][0]].type;
        else if (g.kind === "bare_alt") cl.type = words(s.slice(cs, ce)).length <= 6 ? "BARE_ALTERNATE" : "EXPLANATION";
        else if (g.kind === "note") cl.type = "NOTE";
        else cl.type = "UNTYPED";
      }
      out.clauses.push(cl);
    }
  });
  return out;
}

// ---------------------------------------------------------------- spec_parse.py
const KIND_OF_TYPE = {
  ACCEPT: "accept", BARE_ALTERNATE: "accept", PORTION: "portion", PROMPT: "prompt", PROMPT_PARTIAL: "prompt_partial",
  ANTIPROMPT: "antiprompt", REJECT: "reject", REJECT_NOPROMPT: "reject_noprompt", NOPROMPT: "noprompt", REQUIREMENT: "requirement",
  LENIENCY: "lenient", CONDITIONAL: "conditional", NEUTRAL: null, NOTE: "note", EXPLANATION: null, PRONUNCIATION: null, UNTYPED: null,
};
const NEG = new Set(["reject", "reject_noprompt", "noprompt"]);

const W = R`[\p{L}\p{N}_]`;
const TIMING_KW = new RegExp(B + R`(?:before|until|till|'til|til|up\s+(?:to|until)|prior\s+to|after|once|as\s+soon\s+as)` + E, "ig");
const SELF_MARK = new RegExp(R`\s*(?:(?:it|they|each|both|either|these|those|this|that|the\s+(?:name|word|term|answer)s?|its|their|his|her)\s+)?` +
  R`(?:(?:is|are|'s|'re|has\s+been|have\s+been|being|gets|get|was|were)\s+)?` +
  R`(?:read|mentioned|mention|said|given|stated|named|revealed|clued|spoken|heard|uttered|metioned)` + E +
  R`|\s*(?:its|their|his|her|respective)\s+(?:mention|name|reading)s?` + E +
  R`|\s*(?:mention|reading)` + E, "iy");
const QUOTED_MARK = /\s*(?:the\s+words?\s+|(?:the\s+)?(?:first\s+)?(?:mention|reading)\s+of\s+(?:the\s+words?\s+)?)?(?:"[^"]{1,80}"|'[^']{1,60}')(?:\s*(?:is|are|has\s+been|have\s+been)?\s*(?:read|mentioned|said|given|stated|named|revealed))?/iy;
const CLUE_MARK = new RegExp(R`\s*(?:the\s+)?(?:end(?:\s+of\s+(?:the\s+)?(?:question|tossup|bonus|clue|part|(?:first|second|third|last|final|opening)\s+(?:line|sentence|clue)))?|giveaway|ftp|for\s+(?:10|ten)\s+points|\(\*\)|\*|power(?:\s*mark)?|` +
  R`(?:first|second|third|fourth|last|final|opening)\s+(?:line|sentence|clue)s?|lead-?in)` + E + R`(?:\s+(?:is|are|has\s+been)\s+(?:read|reached|said))?|\s*"for\s+(?:10|ten)\s+points,?"`, "iy");
const BARE_MARK = new RegExp(R`\s*(?:(?:the\s+)?(?:first\s+)?mention\s+of\s+[\p{L}\p{N}_'\-.]+(?:\s+[\p{L}\p{N}_'\-.]+){0,3}(?=\s*$|\s*[,;)\]]|\s+(?:and|but|or|by|with)\b)|[\p{L}\p{N}_'\-.]+(?:\s+[\p{L}\p{N}_'\-.]+){0,4}?\s+(?:is|are|has\s+been|have\s+been)\s+(?:read|mentioned|said|given|stated|named)` + E + ")", "iuy");
const BARE_WORDS = /\s*[\p{L}\p{N}_'\-.]+(?:\s+[\p{L}\p{N}_'\-.]+){0,3}\s*(?=$|[,;)\]]|\s+(?:and|but|or|by|with|then)\b)/iuy;
const NOMARK_TIMING = new RegExp(B + R`(?:afterwards?|thereafter|after\s+that|after\s+this|from\s+then\s+on|subsequently|at\s+any\s+(?:point|time|stage)|at\s+all\s+times|` +
  R`(?:(?:during|in|on)\s+the\s+(?:first|second|third|opening|last|final)\s+(?:line|sentence|clue)s?)|even\s+at\s+the\s+end|early(?:\s+buzz(?:es|ing)?)?(?=\s*(?:$|[,;.)\]]|\s(?:on|in\s+the|before|if|but|and)\b)))` + E, "ig");
const DIRECTED = new RegExp(B + R`(?:by\s+(?:asking|saying|requesting)|asking|and\s+ask|ask|with(?:\s+the\s+(?:question|prompt))?)\s*[:,]?\s*(?=["']|(?:what|which|who|whom|whose|where|when|how|why|for)\b)`, "ig");
const SCOPE_PRE = /^\s*(?:just|only|merely|solely|simply)\s+/i;
const SCOPE_POST = /\s+(?:alone|by\s+itself|by\s+themselves|on\s+its\s+own|on\s+their\s+own)\s*$/i;
const SUBST = new RegExp(B + R`(?:in\s+place\s+of|instead\s+of|in\s+lieu\s+of|for)\s+("[^"]+"|'[^']+'|[\p{L}\p{N}_\-]+(?:\s+[\p{L}\p{N}_\-]+){0,2})`, "igud");
const COMMENTARY_CUT = new RegExp(B + R`(?:unless|since|because|as\s+long\s+as|so\s+long\s+as|provided|even\s+though|although)` + E, "ig");
const TRAIL_HEDGE = /\s+(?:i\s+guess|i\s+suppose|grudgingly|begrudgingly|reluctantly|if\s+you\s+must|i\s+think)\s*[.!]?\s*$/i;
const CONTAIN = new RegExp(R`^\s*(?:[\p{L}\p{N}_-]+\s+){0,3}?(?:answers?|anything|responses?|descriptions?|things?|equivalents?|terms?|phrases?)\s+` +
  R`(?:that\s+(?:[\p{L}\p{N}_]+\s+)?(?:mention|involve|include|indicate|imply|describe|refer|contain|reference|explain|convey|suggest|show|specify|capture|say|identify|name)s?(?:\s+to)?|` +
  R`(?:which|who)\s+(?:mention|indicate|describe|refer)s?(?:\s+to)?|` +
  R`mentioning|involving|including|indicating|implying|describing|referring\s+to|containing|referencing|explaining|conveying|suggesting|specifying|` +
  R`about|regarding|related\s+to|relating\s+to|to\s+the\s+effect\s+(?:of|that)|along\s+the\s+lines\s+of|with|of)` + E, "iu");
const EXAMPLES = new RegExp(B + R`(?:such\s+as|like|e\.g\.,?|including|for\s+example|for\s+instance|i\.e\.,?)` + E, "ig");
const BARE_SW = /(?:,|\band\b|\bbut\b|\bthen\b|\botherwise\b)\s+(prompt)(?=\s+(?:afterwards?|after|before|until|thereafter|if|when|once|later|otherwise)\b|\s*[,;.)\]]|\s*$)/igd;
const PARTIAL_WORD = new RegExp(B + R`(?:partial|incomplete)(?:\s+(?:last\s+|first\s+)?(?:answers?|names?|titles?|credit|responses?))?` + E, "i");
const PARTIAL_WORD_G = new RegExp(PARTIAL_WORD.source, "ig");
const LESS_SPECIFIC = new RegExp(B + R`(?:less\s+specific|more\s+general|vaguer|general)(?:\s+answers?)?` + E, "i");
const CLASSY = /^\s*(?:and\s+|or\s+)?(?:any\s+|other\s+|all\s+|similar\s+|reasonable\s+|obvious\s+|clear(?:-knowledge)?\s+|rough\s+|close\s+|logical\s+|generic\s+|general\s+|vague\s+|broad\s+|partial\s+|incomplete\s+|less\s+specific\s+|more\s+specific\s+)*(?:equivalents?|word\s*forms?|synonyms?|descriptions?|answers?|anything|similar|translations?|specific|abbreviations?|forms?|variants?|etc\b|the\s+like|so\s+on|misspellings?|spellings?|things\s+like|terms?\s+(?:like|for|such))/i;

const OPEN_RX = /\b(?:equivalents?|synonyms?|descriptions?|descriptive|translations?|similar|variations?|paraphrases?|abbreviations?|nicknames?|(?:in|into)\s+(?:french|spanish|german|italian|latin|greek|russian|chinese|japanese|arabic|hebrew|portuguese|dutch|english|any\s+(?:other\s+)?language)|reasonable\s+(?:answers?|equivalents?|descriptions?)|clear-knowledge|close\s+equivalents?)\b/;
function maskQuotes(s, a, b) {
  const out = [];
  let i = a;
  while (i < b) {
    const ch = s[i];
    if (ch === '"') {
      const j = s.indexOf('"', i + 1);
      if (j < 0 || j >= b) break;
      out.push([i, j + 1]); i = j + 1; continue;
    }
    if (ch === "'" && (i === a || !isAlnum(s[i - 1])) && i + 1 < b && isAlnum(s[i + 1])) {
      let j = i + 1;
      while (j < b) {
        if (s[j] === "'" && (j + 1 >= b || !isAlnum(s[j + 1])) && s[j - 1] !== " ") break;
        j++;
      }
      if (j < b && j - i < 80) { out.push([i, j + 1]); i = j + 1; continue; }
    }
    i++;
  }
  return out;
}
const inRuns = (runs, k) => runs.some(([qs, qe]) => qs <= k && k < qe);

class Line {
  constructor(html) {
    this.html = html;
    const st = styleMap(html || "");
    this.text = st.text;
    this.s = normKw(st.text);
    const n = this.text.length;
    this.bu = []; this.uOnly = []; this.bOnly = []; this.it = st.it; this.tb = st.tb;
    for (let k = 0; k < n; k++) {
      this.bu.push(st.b[k] && st.u[k]);
      this.uOnly.push(st.u[k] && !st.b[k]);
      this.bOnly.push(st.b[k] && !st.u[k]);
    }
    let hasBu = false, hasU = false, hasB = false;
    for (let k = 0; k < n; k++) {
      if (!strip(this.text[k])) continue;
      if (this.bu[k]) hasBu = true;
      if (this.uOnly[k]) hasU = true;
      if (this.bOnly[k]) hasB = true;
    }
    this.reqStyle = hasBu ? "bu" : hasU ? "u" : hasB ? "b" : "none";
    this.issues = [];
  }
  issue(code, detail = "") { this.issues.push([code, String(detail).slice(0, 160)]); }
  req(k) {
    return this.reqStyle === "bu" ? this.bu[k] : this.reqStyle === "u" ? (this.uOnly[k] || this.bu[k]) : this.reqStyle === "b" ? (this.bOnly[k] || this.bu[k]) : false;
  }
  styled(k) { return this.bu[k] || this.uOnly[k] || this.bOnly[k]; }
  runs(a, b, pred) {
    const out = [];
    let k = a;
    while (k < b) {
      if (pred(k) && strip(this.s[k] || "")) {
        let j = k;
        while (j < b && pred(j)) j++;
        out.push([k, j]);
        k = j;
      } else k++;
    }
    return out;
  }
}

function spanMask(L) {
  const s = L.s.split("");
  const t = L.s;
  const mends = [[/\bdonot(?=\s)/g, "dont "], [/\bdo\s?not(accept|prompt)/g, null], [/\bacceptor(?=\s+prompt)/g, "accep or"]];
  for (const [rx, rpl] of mends) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(t)) !== null) {
      const len = m[0].length;
      const nw = rpl !== null ? rpl : "dont" + " ".repeat(len - 4 - m[1].length) + m[1];
      if (nw.length === len) for (let k = 0; k < len; k++) s[m.index + k] = nw[k];
    }
  }
  let openQ = false;
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if (ch === '"') {
      if (k > 0 && ";,".includes(s[k - 1]) && openQ) { s[k] = s[k - 1]; s[k - 1] = '"'; }
      openQ = !openQ;
    } else if (ch === "[" || ch === "]") openQ = false;
  }
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if ("[](){}".includes(ch) && (L.bu[k] || L.uOnly[k])) {
      if (k > 0 && k + 1 < s.length && (L.bu[k - 1] || L.uOnly[k - 1]) && (L.bu[k + 1] || L.uOnly[k + 1])) s[k] = "([{".includes(ch) ? "\x01" : "\x02";
    }
  }
  return s.join("");
}

const SEP_RX = /,\s*(?:or|and|nor)\s+|,\s*|\s+(?:or|nor|as\s+well\s+as)\s+|\s+and\s+|\s*\/\s*/iy;
// EXT: ". Capital" ends an item only when what follows reads as prose ("[or X. This refers to …]"), not inside a
// title ("Faust. Eine Tragödie", italics) or after an abbreviation ("Ware v. Hylton", "John F. Kennedy")
const PROSE_WORD = /\b(?:is|are|was|were|this|that|these|those|it|its|they|their|refers?|referred|because|which|who|whom|has|have|had|not|be|been|should|would|can|could|will|may|might|note|answer|question|clue|we|you|he|she|his|her|did|does|do)\b/i;
function proseCut(L, a, at, end) {
  const before = L.text.slice(Math.max(a, at - 6), at);
  if (L.styled(at) || (L.it && (L.it[at] || L.it[at + 2]))) return false;
  if (/(?:\b[A-Za-z]|\bMt|\bSt|\bDr|\bNo|\bOp|\bvs?|\bal|\bInc|\bCo|\bCorp|\bLtd|\bJr|\bSr|\bMr|\bMrs|\bMs|\bed|\bvol|\bch)$/.test(before)) return false;
  const rest = L.text.slice(at + 1, end);
  return rest.trim().split(/\s+/).length >= 3 && PROSE_WORD.test(rest);
}

function splitItems(L, a, b, qruns, kind) {
  const s = L.s;
  const seps = [];
  let d = 0, k = a;
  while (k < b) {
    const ch = s[k];
    if ("([{".includes(ch)) d++;
    else if (")]}".includes(ch)) d = Math.max(0, d - 1);
    if (d === 0 && !inRuns(qruns, k)) {
      let m = matchAt(SEP_RX, s, k, b);
      if (m) {
        for (let j = m.index; j < mEnd(m); j++) if ((L.styled(j) || L.it[j]) && strip(s[j])) { m = null; break; }
      }
      if (m && mEnd(m) > k && !(strip(m[0]) === "/" && (k === a || !isAlnum(s[k - 1])))) {
        const word = m[0].replace(/^[ ,]+|[ ,]+$/g, "");
        if (EXT) {
          const rawSep = L.text.slice(k, mEnd(m));
          const inNoSplit = L.noListSplit && L.noListSplit[0] <= k && k < L.noListSplit[1] && /^\s*,?\s*(?:and|or)?\s*$/i.test(rawSep);
          if (/\bAND\b/.test(rawSep) || (/^(?:,\s*)?and$/i.test(word) && L.andJoin) || inNoSplit) { k = mEnd(m); continue; }
        }
        seps.push([k, mEnd(m), word]);
        k = mEnd(m);
        continue;
      }
    }
    k++;
  }
  const cuts = [a];
  for (const sp of seps) cuts.push(sp[0], sp[1]);
  cuts.push(b);
  const pieces = [];
  for (let i = 0; i < cuts.length; i += 2) pieces.push([cuts[i], cuts[i + 1]]);
  const joins = seps.map((sp) => sp[2]);
  let marked = false;
  for (let j = a; j < b; j++) if (strip(s[j]) && L.styled(j)) { marked = true; break; }
  const hasAnchor = ([pa, pb]) => {
    for (let j = pa; j < pb; j++) if (strip(s[j]) && L.styled(j)) return true;
    return qruns.some(([qs, qe]) => qs >= pa && qe <= pb + 1);
  };
  let out = [];
  pieces.forEach((p, i) => {
    const txt = strip(s.slice(p[0], p[1]));
    if (!txt) return;
    const j = i > 0 ? joins[i - 1] : null;
    let glue = false;
    if (out.length) {
      const prev = out[out.length - 1];
      if (j === "and" && !(hasAnchor(p) && hasAnchor(prev)) && !CLASSY.test(txt)) {
        glue = true;
        if (hasAnchor(p) || hasAnchor(prev)) L.issue("AND_KEPT_IN_ITEM", s.slice(prev[0], p[1]).slice(0, 50));
      } else if (EXT && marked && !hasAnchor(p) && joins[i] === "and" && pieces[i + 1] && hasAnchor(pieces[i + 1]) && !CLASSY.test(txt)) {
        // "or The 1967 International and Universal <u>Exposition</u>": the unmarked piece opens the next item
        glue = false;
      } else if (marked && !hasAnchor(p) && !CLASSY.test(txt)) {
        glue = true;
        L.issue("UNMARKED_PIECE_KEPT", txt.slice(0, 50));
      } else if (j === "/" && !(hasAnchor(p) && hasAnchor(prev)) && txt.split(/\s+/).length === 1) glue = true;
    }
    if (glue) out[out.length - 1] = [out[out.length - 1][0], p[1]];
    else out.push(p);
  });
  if (marked && out.length > 1 && !hasAnchor(out[0]) && !CLASSY.test(s.slice(out[0][0], out[0][1]))) {
    out[1] = [out[0][0], out[1][1]];
    out = out.slice(1);
  }
  const res = [];
  for (const [pa, pb] of out) {
    const m = searchIn(EXAMPLES, s, pa, pb);
    if (m && !inRuns(qruns, m.index) && !L.styled(m.index) && hasAnchor([mEnd(m), pb])) {
      if (strip(s.slice(pa, m.index))) res.push([pa, hasAnchor([pa, m.index]) ? m.index : mEnd(m)]);
      res.push([mEnd(m), pb]);
      L.issue("CLASS_OPEN_WITH_EXAMPLES", s.slice(pa, mEnd(m)).slice(0, 50));
    } else res.push([pa, pb]);
  }
  return res;
}

function makeItem(L, a, b, kind, qruns) {
  const s = L.s;
  const txt = s.slice(a, b);
  const it = { kind, start: a, end: b, text: strip(L.text.slice(a, b)), R: [], P: [], quoted: null, scope: null, cls: null, ca: a, cb: b };
  let m = SCOPE_PRE.exec(txt);
  let a2 = a;
  if (m) { it.scope = "bare"; a2 = a + m[0].length; }
  let b2 = b;
  const sb = s.slice(a2, b);
  m = SCOPE_POST.exec(sb);
  if (m) { it.scope = "bare"; b2 = a2 + m.index; }
  m = TRAIL_HEDGE.exec(s.slice(a2, b2));
  if (m) b2 = a2 + m.index;
  const q = qruns.filter(([qs, qe]) => qs >= a2 && qe <= b2 + 1);
  if (q.length) it.quoted = q.map(([qs, qe]) => L.text.slice(qs + 1, qe - 1));
  if (CLASSY.test(s.slice(a2, b2))) {
    let anyReq = false;
    for (let k = a2; k < b2; k++) if (L.req(k)) { anyReq = true; break; }
    if (!anyReq) it.cls = strip(s.slice(a2, b2));
  }
  if (kind === "accept" || kind === "portion") it.R = L.runs(a2, b2, (k) => L.req(k)).map(([x, y]) => L.text.slice(x, y));
  else if (kind === "prompt" || kind === "antiprompt" || kind === "prompt_partial") {
    const pr = L.runs(a2, b2, (k) => L.uOnly[k] || L.bu[k] || (L.reqStyle === "b" && L.bOnly[k]));
    it.P = pr.map(([x, y]) => L.text.slice(x, y));
  }
  it.core = strip(L.text.slice(a2, b2));
  it.ca = a2; it.cb = b2;
  return it;
}

function slotsOf(L, a, b, pred) {
  const runs = L.runs(a, b, pred || ((k) => L.req(k)));
  const slots = [];
  runs.forEach(([x, y], i) => {
    const gap = i ? L.s.slice(runs[i - 1][1], x) : "";
    if (i && (/^[\p{L}\p{N}_'-]*["']?\s*(?:,\s*(?:or\s+)?|or\s+|\/\s*)(?:the\s+|a\s+|an\s+)?["']?[\p{L}\p{N}_'-]*$/u.test(gap) || /(?:^|[\s,])or\s/.test(gap))) slots[slots.length - 1].push(L.text.slice(x, y));
    else slots.push([L.text.slice(x, y)]);
  });
  return slots;
}

function containForm(L, kind, a, b, qruns, win, ask, subst) {
  const pred = kind === "accept" ? (k) => L.req(k) : (k) => L.uOnly[k] || L.bu[k];
  let sl = slotsOf(L, a, b, pred);
  if (NEG.has(kind) || !sl.length) {
    const qq = qruns.filter(([x]) => x >= a && x < b);
    const q = qq.map(([x, y]) => L.text.slice(x + 1, y - 1));
    if (q.length) {
      let joinedAnd = false;
      for (let i = 0; i + 1 < qq.length; i++) if (/\band\b/.test(L.s.slice(qq[i][1], qq[i + 1][0]))) joinedAnd = true;
      sl = joinedAnd && !NEG.has(kind) ? q.map((x) => [x]) : [q];
    }
  }
  return { kind, src: "class", start: a, end: b, text: strip(L.text.slice(a, b)), R: [], P: [], quoted: null, scope: null, cls: "contain", slots: sl, window: win, ask, subst_for: subst, ca: a, cb: b };
}

function timingOf(L, a, b, qruns) {
  const s = L.s;
  const depth = {};
  let d = 0;
  for (let k = a; k < b; k++) {
    if (s[k] === "(" || s[k] === "[") d++;
    else if (s[k] === ")" || s[k] === "]") d = Math.max(0, d - 1);
    depth[k] = d;
  }
  for (const m of findIter(TIMING_KW, s, a, b)) {
    if (inRuns(qruns, m.index) || L.it[m.index] || L.styled(m.index) || (depth[m.index] || 0) > 0) continue;
    const restA = mEnd(m);
    const kw = m[0].replace(/\s+/g, " ");
    const side = ["after", "once", "following", "as soon as"].includes(kw) ? "after" : "before";
    for (const [shape, rx] of [["clue", CLUE_MARK], ["quoted", QUOTED_MARK], ["self", SELF_MARK], ["words+verb", BARE_MARK]]) {
      const mm = matchAt(rx, s, restA, b);
      if (mm) {
        const w = { side, kw, shape, marker: strip(L.text.slice(restA, mEnd(mm))), end: mEnd(mm), kwStart: m.index };
        if (EXT && shape !== "clue") {
          const ms = /^\s*in\s+the\s+(last|final|first|second|third|opening)\s+(?:sentence|line|clue)/.exec(s.slice(w.end, b));
          if (ms) { w.inSent = ms[1]; w.end += ms[0].length; }
        }
        return [m.index, w];
      }
    }
    if (/^\s*(?:that|this|it|wards?)?\s*(?:$|[,;.)\]]|\s(?:and|but|or|by|with)\b)/.test(s.slice(restA, b))) return [m.index, { side, kw, shape: "previous", marker: "", end: restA, kwStart: m.index }];
    const mm = matchAt(BARE_WORDS, s, restA, b);
    if (mm) return [m.index, { side, kw, shape: "bare", marker: strip(L.text.slice(restA, mEnd(mm))), end: mEnd(mm), kwStart: m.index }];
    L.issue("TIMING_MARKER_UNKNOWN", s.slice(m.index, Math.min(b, m.index + 60)));
  }
  let m = searchIn(NOMARK_TIMING, s, a, b);
  if (!m && EXT) {
    m = searchIn(/(?<![a-z0-9])(?:during|in|on)\s+(?:the\s+)?(?:first|second|third|opening|last|final)\s+(?:line|sentence|clue)s?(?![a-z0-9])/g, s, a, b);
  }
  // "X is the one referred to in the first sentence" explains a clue; it is not a window (§6.2)
  if (m && EXT && /(?:refers?|referred|referring|mentioned|clued|described|alluded|named)\s+(?:to\s+)?$/.test(s.slice(Math.max(a, m.index - 24), m.index))) m = null;
  if (m && !inRuns(qruns, m.index) && !L.it[m.index]) {
    const w = m[0].replace(/\s+/g, " ");
    const kind = /^(?:after|thereafter|from|subsequently)/.test(w) ? "previous_flipped" : /^(?:at|even)/.test(w) ? "whole_question" : w.startsWith("early") ? "early" : "sentence";
    return [m.index, { side: kind, kw: w, shape: "none", marker: "", end: mEnd(m), kwStart: m.index }];
  }
  return [null, null];
}

function askOf(L, a, b, qruns) {
  const s = L.s;
  for (const m of findIter(DIRECTED, s, a, b)) {
    if (inRuns(qruns, m.index)) continue;
    const e = mEnd(m);
    const q = qruns.filter(([qs]) => qs >= e - 1 && qs <= e + 1);
    if (q.length) {
      const [qs, qe] = q[0];
      let end = qe;
      let m2 = /^\s*(?:or|,)\s*(?=["'])/.exec(s.slice(end, b));
      while (m2) {
        const q2 = qruns.filter(([x]) => x === end + m2[0].length);
        if (!q2.length) break;
        end = q2[0][1];
        m2 = /^\s*(?:or|,)\s*(?=["'])/.exec(s.slice(end, b));
      }
      return [m.index, L.text.slice(qs + 1, end - 1), end];
    }
    return [m.index, strip(L.text.slice(e, b)), b];
  }
  return [null, null, null];
}

function recordRule(L, out, txt) {
  const t = txt.toLowerCase();
  const r = out.rules;
  const t1 = (id) => { const re = KW[id].g; re.lastIndex = 0; return re.test(t); };
  if (t1("portion_either") || t1("portion_either_part") || t1("portion_postfix")) r.either_portion = true;
  if (t1("portion_both_required") || t1("req_both")) r.all_required = true;
  if (t1("req_either_order") || t1("req_accept_either_order")) r.order = "free";
  if (t1("req_fixed_order")) r.order = "fixed";
  if (t1("req_exact")) r.exact = true;
  if (t1("req_not_needed") || t1("req_do_not_need")) r.optional_after = t.slice(0, 80);
  if (EXT) {
    if (/\b(?:take|accept|allow)\s+any\s+(?:one\s+)?of\s+(?:the\s+)?(?:names|parts|portions|words)\b/.test(t) || /\baccept\s+either\s*(?:,|;|\)|\]|$)/.test(t) || /\bonly\s+need\s+one\s+(?:part|name)\b/.test(t)) r.either_portion = true;
    if (/\bprompt\s+on\s+either\s+(?:part|name|half|portion|word)s?\b/.test(t)) { r.prompt_either_part = true; r.partial_policy = r.partial_policy || "prompt"; }
    if (/\bprompt\s+on\s+(?:any\s+of\s+)?the\s+other\s+names\b/.test(t)) r.prompt_other_names = true;
  }
}

function buildRef(html) {
  const L = new Line(html);
  let s = L.s;
  const out = { text: L.text, forms: [], rules: {}, issues: L.issues, reqStyle: L.reqStyle, L };
  if (!strip(s)) { L.issue("EMPTY"); return out; }
  if (L.reqStyle !== "bu") L.issue("LEGACY_MARKUP", L.reqStyle);
  const sm = spanMask(L);
  s = sm.split("").map((c2, k) => (c2 === "\x01" || c2 === "\x02" ? s[k] : c2)).join("");
  L.s = s;
  const P = segParse(sm);
  const groups = P.groups, clauses = P.clauses;
  let [headA, headB] = P.head;
  const qall = maskQuotes(s, 0, s.length);
  out.qall = qall; out.groups = groups; out.sm = sm;
  if (EXT) {
    let andMain = false;
    const hr = L.runs(headA, headB, (k) => L.req(k));
    for (let i = 0; i + 1 < hr.length; i++) if (/(?:^|\s)(?:and|&)(?:\s|$)/i.test(L.text.slice(hr[i][1], hr[i + 1][0]))) andMain = true;
    L.andJoin = andMain || /\bAND\b/.test(L.text) || /\b(?:both|all|two|three|four)\b[^;\])]{0,40}\b(?:required|needed)\b/i.test(L.text);
  }
  if (P.stray_closers) L.issue("STRAY_CLOSER", String(P.stray_closers));
  for (const g of groups) if (!g.closed) L.issue("UNCLOSED_GROUP", s.slice(g.start, g.start + 40));
  // unbracketed directives inside the head
  const strong = new RegExp(R`(?:^|[;,.:]\s*|\s)(?=(?:also\s+)?(?:accept|prompt|reject|do\s+not|don't|anti-?\s?prompt)` + E + ")", "ig");
  let mh = null;
  for (const m of findIter(strong, s, headA, headB)) {
    const e = mEnd(m);
    if (m.index > headA && !inRuns(qall, e) && !L.styled(e) && !groups.some((g) => g.start <= e && e < g.end)) { mh = m; break; }
  }
  const virtual = [];
  if (mh) {
    L.issue("UNBRACKETED_DIRECTIVE", s.slice(mh.index, mh.index + 50));
    const va = mEnd(mh);
    for (const [cs, ce] of splitTop(sm, va, headB)) if (strip(s.slice(cs, ce))) virtual.push([cs, ce]);
    headB = mh.index;
  }
  // unmarked "[or X]" before the first required span
  const dirs = groups.filter((g) => g.kind === "directive" && g.start >= headB);
  const anyReq = (x, y) => { for (let k = x; k < y; k++) if (L.req(k)) return true; return false; };
  if (dirs.length && L.reqStyle === "bu" && !anyReq(headA, headB)) {
    const g0 = dirs[0];
    const nx = groups.find((g) => g.start >= g0.end);
    const nxt = nx ? nx.start : s.length;
    if (anyReq(g0.end, nxt) && !anyReq(g0.istart, g0.iend)) {
      g0.kind = "optional";
      L.issue("INLINE_OR_GROUP", s.slice(g0.start, g0.end).slice(0, 50));
      headB = dirs.length > 1 ? dirs[1].start : s.length;
    }
  }
  // main answer
  const headGroups = groups.filter((g) => headA <= g.start && g.start < headB);
  for (const g of headGroups) {
    const inner = s.slice(g.istart, g.iend);
    if ((g.kind === "optional" || g.kind === "bare_alt") && /^\s*"[^"]{1,60}"\s*$/.test(inner)) g.kind = "pron";
    if ((g.kind === "bare_alt" || g.kind === "optional") && /^\s*(?:s|es|e|n|a|i|ae|\d{1,2}|dw|jm|dl|ar|sj|joc)\s*$/.test(inner)) g.kind = /^[a-z]+$/i.test(strip(inner)) && strip(inner).length <= 2 ? "suffix" : "tag";
    if (g.kind === "bare_alt" && L.reqStyle === "bu" && !anyReq(g.istart, g.iend)) g.kind = "optional";
    if (g.kind === "pron" && anyReq(g.istart, g.iend)) g.kind = "bare_alt";
  }
  for (const g of headGroups) if (["explanation", "note", "bare_alt", "optional", "pron"].includes(g.kind)) L.issue("HEAD_GROUP_" + g.kind.toUpperCase(), s.slice(g.start, g.end).slice(0, 60));
  const drop = headGroups.filter((g) => ["pron", "explanation", "note", "tag", "empty", "bare_alt"].includes(g.kind)).map((g) => [g.start, g.end]);
  out.headDrop = drop;
  const inDrop = (k) => drop.some(([x, y]) => x <= k && k < y);
  let altCuts = [];
  let d = 0;
  for (let k = headA; k < headB; k++) {
    if (inDrop(k)) continue;
    const ch = sm[k];
    if ("([{".includes(ch)) d++;
    else if (")]}".includes(ch)) d = Math.max(0, d - 1);
    // spec B3: styling on the spaces around a separator is ignored; its own letters must be plain (EXT)
    let sk = k;
    if (EXT && /\s/.test(s[k])) { while (sk < headB - 1 && /\s/.test(s[sk])) sk++; }
    if (d || inRuns(qall, k) || L.styled(sk) || L.it[sk] || (!EXT && (L.styled(k) || L.it[k]))) continue;
    const m = /^(?:\s+or\s+|\s*\/\s*|,\s*(?:or\s+)?|;\s*(?:or\s+)?)/.exec(s.slice(k, headB));
    if (m && m[0].length > 0 && (k === headA || s[k - 1] !== " " || m[0][0] !== " ")) {
      if (/^[,;]\s*or\s*,/.test(s.slice(k, k + 6))) continue;
      altCuts.push([k, k + m[0].length]);
    }
  }
  const hasOrAfter = (x) => altCuts.some(([c0, c1]) => c0 > x && /\bor\b|\//.test(s.slice(c0, c1)));
  altCuts = altCuts.filter(([x, y]) => !(s[x] === "," && !/\bor\b/.test(s.slice(x, y))) || hasOrAfter(x));
  const pieces = [];
  let pa = headA;
  const sortedCuts = [...new Map(altCuts.map((c) => [c.join(","), c])).values()].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  for (const [x, y] of sortedCuts) {
    if (x < pa) continue;
    pieces.push([pa, x]); pa = y;
  }
  pieces.push([pa, headB]);
  const anchored = ([x, y]) => { for (let k = x; k < y; k++) if (strip(s[k]) && !inDrop(k) && L.req(k)) return true; return false; };
  const merged = [];
  for (const p of pieces) {
    if (!strip(s.slice(p[0], p[1]))) continue;
    if (merged.length && !(anchored(p) && anchored(merged[merged.length - 1]))) merged[merged.length - 1] = [merged[merged.length - 1][0], p[1]];
    else merged.push(p);
  }
  if (L.reqStyle === "none" && /\s(?:or|\/)\s/.test(s.slice(headA, headB))) L.issue("MAIN_OR_UNMARKED", s.slice(headA, headB).slice(0, 80));
  for (const p of merged) {
    const runs = L.runs(p[0], p[1], (k) => L.req(k)).filter((r) => !inDrop(r[0]));
    const f = { kind: "accept", src: "main", start: p[0], end: p[1], text: strip(L.text.slice(p[0], p[1])), R: runs.map(([x, y]) => L.text.slice(x, y)), P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: p[0], cb: p[1], drop };
    if (!runs.length) { f.R = [strip(L.text.slice(p[0], p[1]))]; L.issue("MAIN_NO_REQUIRED_SPAN", f.text.slice(0, 60)); f.wholeRequired = true; }
    out.forms.push(f);
  }
  const later = groups.filter((g) => g.kind === "directive" && g.start >= headB);
  for (const g of later) {
    const x = g.end;
    const nx = groups.find((h) => h.start >= x);
    const y = nx ? nx.start : s.length;
    const runs = L.runs(x, y, (k) => L.req(k));
    if (runs.length && EXT && /^\s*or\s/.test(s.slice(x, y))) {
      // "X (or Y) or Z or W": more alternatives of the main answer, not a second answer (EXT)
      const cuts = [];
      const rx = /\s*\bor\s+/g;
      let mm;
      const t = s.slice(x, y);
      while ((mm = rx.exec(t)) !== null) {
        const at = x + mm.index + mm[0].search(/o/);
        if (!L.styled(at) && !L.it[at] && !inRuns(qall, at)) cuts.push([x + mm.index, x + mm.index + mm[0].length]);
      }
      let pa = x;
      for (const [c0, c1] of cuts.concat([[y, y]])) {
        const pa0 = pa, pb0 = c0;
        pa = c1;
        const pr = L.runs(pa0, pb0, (k) => L.req(k));
        if (!pr.length) continue;
        out.forms.push({ kind: "accept", src: "main", start: pa0, end: pb0, text: strip(L.text.slice(pa0, pb0)), R: pr.map(([p0, p1]) => L.text.slice(p0, p1)), P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: pa0, cb: pb0 });
      }
      L.issue("MAIN_ALTERNATIVES_AFTER_GROUP", strip(L.text.slice(x, y)).slice(0, 50));
      continue;
    }
    // EXT: a line with no markup at all ("endoplasmic reticulum [or ER] AND Golgi apparatus [..]"): the text after
    // the group is the next answer, whole
    const am = EXT && !runs.length && L.reqStyle === "none" ? /^\s*(?:and|&)\s+(?=\S)/i.exec(L.text.slice(x, y)) : null;
    if (am && strip(L.text.slice(x + am[0].length, y))) {
      const t0 = x + am[0].length;
      out.forms.push({ kind: "accept", src: "main_next", start: t0, end: y, text: strip(L.text.slice(t0, y)), R: [strip(L.text.slice(t0, y))], P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: t0, cb: y, wholeRequired: true });
      L.issue("ANSWER_BETWEEN_GROUPS", strip(L.text.slice(x, y)).slice(0, 50));
      out.rules.multi = true;
      continue;
    }
    if (runs.length) {
      out.forms.push({ kind: "accept", src: "main_next", start: x, end: y, text: strip(L.text.slice(x, y)), R: runs.map(([p0, p1]) => L.text.slice(p0, p1)), P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: x, cb: y });
      L.issue("ANSWER_BETWEEN_GROUPS", strip(L.text.slice(x, y)).slice(0, 50));
      if (/^\s*(?:AND|and|&)\b/.test(L.text.slice(x, y))) out.rules.multi = true;
    }
  }
  if (merged.length > 1) L.issue("MAIN_ALTERNATIVES", merged.map(([x, y]) => strip(L.text.slice(x, y)).slice(0, 30)).join(" | "));
  if (L.text.slice(headA, headB).split(/\s+/).includes("AND")) out.rules.multi = true;
  // clauses
  const todo = clauses.map((cl) => ({ ...cl, virtual: false }));
  const have = new Set(clauses.map((cl) => cl.g));
  groups.forEach((g, gi) => {
    if (g.kind === "bare_alt" && !have.has(gi)) todo.push({ g: gi, gkind: "bare_alt", start: g.istart, end: g.iend, text: s.slice(g.istart, g.iend), leadins: [], opener: null, type: "BARE_ALTERNATE", body_start: g.istart, switches: [], postfix: [], virtual: false });
  });
  todo.sort((x, y) => x.start - y.start);
  for (const [cs, ce] of virtual) {
    const [pp, leadins] = stripLeadins(sm, cs, ce);
    const [e, mm] = matchOpener(sm, pp, ce);
    todo.push({ g: -1, gkind: "directive", start: cs, end: ce, text: s.slice(cs, ce), leadins, opener: e ? e.id : null, type: e ? e.type : "UNTYPED", body_start: e ? mEnd(mm) : pp, switches: findSwitches(sm, e ? mEnd(mm) : pp, ce), postfix: [], virtual: true });
  }
  const prevType = {};
  let lastItems = [];
  for (let cl of todo) {
    const g = cl.g;
    let ctype = cl.type;
    if (!cl.virtual && ["suffix", "tag", "pron", "optional"].includes(groups[g].kind)) continue;
    if (EXT && !cl.virtual && groups[g].kind === "bare_alt" && cl.start >= headB && L.reqStyle === "bu" && !anyReq(cl.start, cl.end)) continue;
    if (cl.start < headB && !cl.virtual && groups[g].kind !== "directive") {
      if (ctype !== "BARE_ALTERNATE" && !(EXT && groups[g].kind === "note")) continue;
    }
    if (["EXPLANATION", "PRONUNCIATION", "NOTE", "UNTYPED"].includes(ctype)) {
      const limit = ["NOTE", "PRONUNCIATION"].includes(ctype) ? cl.end : Math.min(cl.end, cl.start + 60);
      let hit = null;
      const seg = sm.slice(cl.start, limit);
      const rxw = /(?<![a-z0-9'])[a-z]/g;
      let mw;
      while ((mw = rxw.exec(seg)) !== null) {
        const pos = cl.start + mw.index;
        if (inRuns(qall, pos) || (pos < cl.body_start && ctype !== "UNTYPED")) continue;
        const [e2, m2] = matchOpener(sm, pos, cl.end, false);
        if (e2 !== null && !["NEUTRAL", "CONDITIONAL", "LENIENCY", "ACCEPT_CLASS", "REQUIREMENT", "PORTION"].includes(e2.type)) { hit = [e2, m2]; break; }
      }
      if (hit) {
        const [e2, m2] = hit;
        L.issue(["NOTE", "PRONUNCIATION"].includes(ctype) ? "NOTE_INSTRUCTION" : "LEADIN_FALLBACK", s.slice(cl.start, mEnd(m2)).slice(0, 60));
        ctype = e2.type;
        if (EXT && ctype === "ACCEPT" && /\b(?:do\s+not|don't|dont|never|not)\s+$/.test(sm.slice(Math.max(cl.start, m2.index - 14), m2.index))) ctype = "REJECT";
        const pre = s.slice(cl.start, m2.index);
        const mt = /(?:before|until|after|once|at\s+the\s+end|in\s+the\s+first\s+(?:line|sentence))[^,]*,\s*$/.exec(pre);
        cl = { ...cl, type: ctype, opener: e2.id, body_start: mEnd(m2), switches: findSwitches(sm, mEnd(m2), cl.end), leadins: cl.leadins.concat(mt ? [["front_timing", mt[0]]] : []) };
      }
    }
    if (ctype === "UNTYPED") {
      const body = s.slice(cl.start, cl.end);
      const markedCl = anyReq(cl.start, cl.end);
      if (!markedCl && ((words(body).length > 6 && PROSE_VERB.test(body)) || (L.reqStyle === "bu" && words(body).length > 6))) {
        ctype = "EXPLANATION";
        L.issue("UNTYPED_PROSE", body.slice(0, 50));
      }
    }
    if (ctype === "UNTYPED") {
      if (g in prevType) { ctype = prevType[g]; L.issue("UNTYPED_INHERITS", `${ctype}: ${s.slice(cl.start, cl.end).slice(0, 50)}`); }
      else {
        ctype = anyReq(cl.start, cl.end) || words(s.slice(cl.start, cl.end)).length <= 6 ? "BARE_ALTERNATE" : "EXPLANATION";
        L.issue("UNTYPED_GROUP_START", `${ctype}: ${s.slice(cl.start, cl.end).slice(0, 50)}`);
      }
    }
    if (EXT && /^\s*(?:they|you|players?|teams?)\s+(?:only\s+)?needs?\b/.test(s.slice(cl.start, cl.end))) {
      const nr = L.runs(cl.start, cl.end, (k) => L.req(k));
      if (nr.length) { out.rules.needWords = nr.map(([x, y]) => L.text.slice(x, y)); if (cl.opener === null || cl.opener === undefined) cl = { ...cl, needOnly: true }; }
    }
    if (ctype === "EXPLANATION" || ctype === "PRONUNCIATION") continue;
    if (ctype === "NOTE") { L.issue("NOTE", s.slice(cl.start, cl.end).slice(0, 70)); continue; }
    prevType[g] = ctype;
    recordRule(L, out, s.slice(cl.start, cl.end));
    for (const [k2, txt] of cl.leadins) if (k2 === "conditional") L.issue("CONDITIONAL", txt.slice(0, 60));
    const segs = [];
    let curT = ctype, curA = cl.body_start;
    const sw = cl.switches.map(([e, mm]) => [e, mm.index, mEnd(mm)]);
    for (const m of findIter(BARE_SW, s, cl.body_start, cl.end)) {
      const st1 = m.indices[1][0], en1 = m.indices[1][1];
      if (!inRuns(qall, st1) && !sw.some(([, x, y]) => x <= st1 && st1 < y)) sw.push([KW.prompt_bare, st1, en1]);
    }
    for (const m of findIter(KW.neg_but_not.g, s, cl.body_start, cl.end)) {
      if (!inRuns(qall, m.index) && !sw.some(([, x, y]) => x <= m.index && m.index < y)) sw.push([{ ...KW.neg_but_not, type: "REJECT" }, m.index, mEnd(m)]);
    }
    sw.sort((x, y) => x[1] - y[1]);
    for (const [e, st, en] of sw) {
      if (e.type === "NEUTRAL") continue;
      segs.push([curT, curA, st]);
      curT = e.type; curA = en;
    }
    segs.push([curT, curA, cl.end]);
    const front = cl.leadins.filter(([k2]) => k2 === "front_timing").map(([, t]) => t);
    if (EXT && (cl.opener === "cond_if" || cl.leadins.some(([k2]) => k2 === "conditional"))) conditionTargets(cl, segs);
    segs.forEach(([t, a0, b], si) => segment(t, a0, b, si, cl, front));
    if (EXT && cl.cond && !cl.condUsed) {
      const dm = /\b(anti-?\s?prompt|reverse\s+prompt|prompt|accept|reject|ask)\b/.exec(s.slice(cl.condEnd, cl.end));
      if (dm) {
        const kw2 = dm[1];
        const kind2 = /anti|reverse/.test(kw2) ? "antiprompt" : kw2 === "accept" ? "accept" : kw2 === "reject" ? "reject" : "prompt";
        const qa = /\b(?:ask(?:ing)?|by\s+asking)\s*[:,]?\s*"([^"]+)"/.exec(s.slice(cl.condEnd, cl.end));
        const askTxt = qa ? L.text.slice(cl.condEnd + qa.index + qa[0].indexOf('"') + 1, cl.condEnd + qa.index + qa[0].length - 1) : null;
        for (const [x, y, scope] of cl.cond) {
          const txt = strip(L.text.slice(x, y)).replace(/[,.;:]+$/, "");
          if (!txt) continue;
          out.forms.push({ kind: kind2, src: "condition", start: x, end: y, text: txt, R: kind2 === "accept" ? [txt] : [], P: kind2 === "accept" ? [] : [txt], quoted: [txt], scope: scope || null, cls: null, window: null, ask: askTxt, subst_for: null, ca: x, cb: y, wholeRequired: true, core: txt });
        }
      }
    }
  }
  function conditionTargets(cl, segs) {
    let condA = cl.body_start;
    if (cl.opener !== "cond_if") {
      // the condition was a lead-in: it sits before the opener
      condA = cl.start;
      const dm0 = /\b(?:anti-?\s?prompt|reverse\s+prompt|prompt|accept|reject|ask|do\s+not)\b/.exec(s.slice(cl.start, cl.end).replace(/^\s*if\s+(?:they|someone|somebody|anyone|a\s+player|the\s+player|players|a\s+team|the\s+team)\s+\S+/, (x) => " ".repeat(x.length)));
      const condEnd0 = dm0 ? cl.start + dm0.index : cl.body_start;
      const qs0 = qall.filter(([x, y]) => x >= condA && y <= condEnd0 + 1);
      const r0 = qs0.map(([x, y]) => [x + 1, y - 1, /\b(?:just|only)\s*$/.test(s.slice(Math.max(condA, x - 8), x)) ? "bare" : null]);
      if (r0.length) { cl.cond = r0; cl.condEnd = condEnd0; cl.condLead = true; }
      return;
    }
    let condEnd = segs.length > 1 ? segs[1][1] : cl.end;
    const dm = /\b(?:anti-?\s?prompt|reverse\s+prompt|prompt|accept|reject|ask|do\s+not)\b/.exec(s.slice(condA, condEnd));
    if (dm) condEnd = condA + dm.index;
    let stop = condEnd;
    const rt = /\b(?:rather\s+than|instead\s+of)\b/.exec(s.slice(condA, condEnd));
    if (rt) stop = condA + rt.index;
    const qs = qall.filter(([x, y]) => x >= condA && y <= stop + 1);
    const ranges = [];
    for (const [x, y] of qs) {
      const before = s.slice(Math.max(condA, x - 8), x);
      ranges.push([x + 1, y - 1, /\b(?:just|only)\s*$/.test(before) ? "bare" : null]);
    }
    if (!ranges.length) {
      const mt = /\b(?:says?|answers?|gives?|with|responds?)\s+(.+?)\s*,?\s*$/.exec(s.slice(condA, condEnd));
      if (mt) {
        const x = condA + mt.index + mt[0].indexOf(mt[1]);
        ranges.push([x, x + mt[1].length, null]);
      }
    }
    if (ranges.length) { cl.cond = ranges; cl.condEnd = condEnd; }
  }
  function segment(t, a, b, si, cl, front) {
    if (cl.needOnly && si === 0) return;
    let kind = KIND_OF_TYPE[t];
    const segTxt = s.slice(a, b);
    if (t === "ACCEPT_CLASS") kind = "accept";
    if ([undefined, null, "lenient", "requirement", "portion", "conditional", "note"].includes(kind)) {
      if (t === "REQUIREMENT" || t === "PORTION") recordRule(L, out, s.slice(cl.start, cl.end));
      if (t === "LENIENCY") {
        out.rules.lenient = true;
        const m = new RegExp(B + R`(?:and\s+)?(accept|prompt\s+on|prompt)` + E, "d").exec(segTxt);
        if (m) { kind = m[1] === "accept" ? "accept" : "prompt"; a = a + m.index + m[0].length; }
        else return;
      } else return;
    }
    const mnr = searchIn(KW.neutral_do_not_reveal.g, s, a, b);
    if (mnr && !inRuns(qall, mnr.index)) {
      const a2 = mEnd(mnr);
      if (/^\s*,?\s*$/.test(s.slice(a, mnr.index).replace(/but/g, "").replace(/,/g, ""))) a = a2;
    }
    let earlyWin = null;
    if (EXT) {
      const fs = /\.\s+(?=[A-Z][a-z])/g;
      fs.lastIndex = a;
      let mf;
      while ((mf = fs.exec(L.text)) !== null && mf.index < b) {
        if (inRuns(qall, mf.index) || !proseCut(L, a, mf.index, b)) continue;
        b = mf.index;
        break;
      }
      const mo = /^\s*[\])]\s*(?:on\s+)?/.exec(s.slice(a, b));
      if (mo) a += mo[0].length;
      const me = /^\s*(?:an?\s+)?early\s+(?:(?:answers?|buzz(?:es)?)\s+(?:of\s+)?)?(?=\S)/.exec(s.slice(a, b));
      const ei = me ? a + me[0].search(/early/) : -1;
      if (me && (kind === "accept" || kind === "prompt" || kind === "antiprompt") && /^early/.test(L.text.slice(ei)) && !L.styled(ei)) { a += me[0].length; earlyWin = { side: "early", kw: "early", shape: "none", marker: "", end: a }; }
    }
    if (EXT && (kind === "accept" || kind === "prompt" || kind === "antiprompt" || kind === "prompt_partial") && OPEN_RX.test(s.slice(a, b))) {
      (out.rules.open_class = out.rules.open_class || []).push(`${kind}:${(OPEN_RX.exec(s.slice(a, b)) || [""])[0]}`);
    }
    const qruns = qall.filter(([x, y]) => x >= a && y <= b + 1);
    let ask = null;
    let m = /^\s*(?:with\s+)?("[^"]+"|\([^)]*\)|\[[^\]]*\])\s*on\s+/.exec(s.slice(a, b));
    if (m && (kind === "prompt" || kind === "antiprompt")) {
      const g1s = m[0].indexOf(m[1]);
      ask = L.text.slice(a + g1s + 1, a + g1s + m[1].length - 1);
      a = a + m[0].length;
    }
    m = /^\s*on\s+/.exec(s.slice(a, b));
    if (m) a += m[0].length;
    let [ts, win] = timingOf(L, a, b, qruns);
    if (front.length) win = win || { side: "front", kw: front[0].split(/\s+/)[0], shape: "fronted", marker: front[0], end: a };
    if (earlyWin && !win) win = earlyWin;
    let [ds, dask, dend] = ["prompt", "antiprompt", "prompt_partial"].includes(kind) ? askOf(L, a, b, qruns) : [null, null, null];
    if (dask !== null) ask = ask || dask;
    if (ds !== null && /^[\s,;:(\[]*(?:i\.e\.|e\.g\.|that\s+is|namely)?[\s,;:(\[]*$/.test(s.slice(a, ds))) {
      const mon = /^[\s,)\]]*on\s+/.exec(s.slice(dend, b));
      if (mon) {
        a = dend + mon[0].length;
        [ts, win] = timingOf(L, a, b, qruns);
        ds = null;
      }
    }
    const ends = [ts, ds].filter((x) => x !== null);
    let argB = ends.length ? Math.min(...ends) : b;
    if (EXT && si === 0 && cl.opener === null && cl.postfix && cl.postfix.length) {
      const pf = cl.postfix.filter(([, x]) => x >= a).map(([, x]) => x);
      if (pf.length) argB = Math.min(argB, ...pf);
    }
    if (EXT) {
      const fs = /\.\s+(?=[A-Z][a-z])/g;
      fs.lastIndex = a;
      let mf;
      while ((mf = fs.exec(L.text)) !== null && mf.index < argB) {
        if (inRuns(qruns, mf.index) || !proseCut(L, a, mf.index, argB)) continue;
        argB = mf.index;
        break;
      }
    }
    const mc = searchIn(COMMENTARY_CUT, s, a, argB);
    if (mc && !inRuns(qruns, mc.index) && !L.styled(mc.index)) {
      if (/^(?:as|so)\s+long\s+as/.test(mc[0])) {
        const cond = strip(L.text.slice(mc.index, argB));
        L.issue("CONDITION_AS_LONG_AS", cond.slice(0, 60));
        (out.conditions = out.conditions || []).push(cond);
      }
      argB = mc.index;
    }
    if (win && win.shape !== "fronted" && (win.end || 0) < b) {
      const tail = s.slice(win.end, b);
      if (tail.replace(/^[ ,.;)]+|[ ,.;)]+$/g, "") && !/^\s*(?:,?\s*(?:by\s+asking|asking|with)|,?\s*(?:and|but)\b)/.test(tail)) {
        if (ds === null || ds < win.end) L.issue("TEXT_AFTER_TIMING", tail.slice(0, 50));
      }
    }
    let arg = s.slice(a, argB);
    if (EXT && cl.cond && (si > 0 || cl.condLead) && !arg.replace(/^[ ,.:;]+|[ ,.:;]+$/g, "")) {
      for (const [x, y, scope] of cl.cond) {
        const txt = strip(L.text.slice(x, y)).replace(/[,.;:]+$/, "");
        if (!txt) continue;
        const f = { kind: kind === "prompt_partial" ? "prompt" : kind, src: "condition", start: x, end: y, text: txt, R: kind === "accept" ? [txt] : [], P: kind === "accept" ? [] : [txt], quoted: [txt], scope: scope || null, cls: null, window: win, ask, subst_for: null, ca: x, cb: y, wholeRequired: true, core: txt };
        out.forms.push(f);
      }
      cl.condUsed = true;
      return;
    }
    if (EXT && lastItems.length && /^\s*(?:it|them|this|that|these|those)\s*$/i.test(arg)) arg = "";
    if (!arg.replace(/^[ ,.:;]+|[ ,.:;]+$/g, "")) {
      if (lastItems.length && (win || ask)) {
        for (const it of lastItems) out.forms.push({ ...it, kind, window: win, ask, src: "inherited-arg" });
        return;
      }
      if (kind === "prompt_partial") { out.rules.partial_policy = "prompt"; return; }
      L.issue("NO_ARGUMENT", `${t}: ${segTxt.slice(0, 50)}`);
      return;
    }
    if (kind === "prompt_partial" && cl.opener === "prompt_partial" && si === 0) out.rules.partial_policy = "prompt";
    if (NEG.has(kind)) {
      const mexc = new RegExp(B + R`(?:other\s+than|except(?:\s+for)?|besides|apart\s+from)` + E).exec(arg);
      if (mexc && !inRuns(qruns, a + mexc.index)) {
        const exc = qruns.filter(([x]) => x >= a + mexc.index && x < argB).map(([x, y]) => L.text.slice(x + 1, y - 1));
        out.forms.push({ kind: "exception", src: "clause", start: a + mexc.index, end: argB, text: strip(L.text.slice(a + mexc.index, argB)), R: [], P: [], quoted: exc.length ? exc : [strip(L.text.slice(a + mexc.index + mexc[0].length, argB))], scope: null, cls: null, window: win, ask: null });
        L.issue("NEG_EXCEPTION", arg.slice(mexc.index).slice(0, 50));
        argB = a + mexc.index; arg = s.slice(a, argB);
      }
    }
    if (PARTIAL_WORD.test(strip(arg)) && new RegExp("^" + PARTIAL_WORD.source, "i").test(strip(arg)) || (kind === "prompt_partial" && PARTIAL_WORD.test(arg))) {
      const pol = kind === "prompt" || kind === "prompt_partial" ? "prompt" : NEG.has(kind) ? "reject" : null;
      if (pol) {
        out.rules.partial_policy = pol;
        const pm = searchIn(PARTIAL_WORD_G, s, a, argB);
        const rest = s.slice(pm ? mEnd(pm) : a, argB);
        if (!rest.replace(/^[ ,.;]+|[ ,.;]+$/g, "")) return;
      }
    }
    if (kind === "prompt_partial" && new RegExp("^" + LESS_SPECIFIC.source, "i").test(strip(arg))) {
      out.rules.prompt_less_specific = true;
      kind = "prompt";
      L.issue("CLASS_LESS_SPECIFIC", arg.slice(0, 60));
    }
    if (EXT && /\b(?:if\s+)?(?:all\s+(?:two|three|four|five|of\s+them)|both)\b[^;]*?\b(?:are\s+|is\s+)?(?:given|said|named|stated|required|needed|mentioned)\b/i.test(s.slice(a, b))) L.noListSplit = [a, b];
    if (EXT) {
      // several "in place of “X”" slots in one clause: each chunk carries its own substitution
      const subs = [];
      for (const m2 of findIter(SUBST, s, a, argB)) {
        if (inRuns(qruns, m2.index) || !(/^(?:in |instead|in lieu)/.test(m2[0]) || /^["']/.test(m2[1]))) continue;
        subs.push(m2);
      }
      if (subs.length > 1) {
        let ca = a;
        for (const m2 of subs) {
          let x = ca;
          const lead = /^\s*(?:,\s*)?(?:or|and)?\s*/.exec(s.slice(x, m2.index));
          if (lead) x += lead[0].length;
          if (x < m2.index) processArg(kind, x, m2.index, win, ask, qruns, m2[1].replace(/^["']+|["']+$/g, ""), cl, si, t, segTxt);
          ca = mEnd(m2);
        }
        L.noListSplit = null;
        return;
      }
    }
    processArg(kind, a, argB, win, ask, qruns, undefined, cl, si, t, segTxt);
    L.noListSplit = null;
    // a timing modifier in the middle of a list binds to the item(s) before it; later items have their own window
    if (EXT && win && win.shape !== "fronted" && ts !== null && argB === ts && win.end < (ds !== null ? ds : b)) {
      const tb = ds !== null ? ds : b;
      const mt = /^\s*,?\s*(?:or|and|,)\s+/.exec(s.slice(win.end, tb));
      const tailA = mt ? win.end + mt[0].length : tb;
      let anchor = qall.some(([x, y]) => x >= tailA && y <= tb + 1);
      for (let k = tailA; k < tb && !anchor; k++) if (L.styled(k) && strip(s[k])) anchor = true;
      if (L.reqStyle === "none" && mt && /[\p{L}]{3,}/u.test(s.slice(tailA, tb)) && !/^\s*(?:but|and|or|then|otherwise)\b/.test(s.slice(tailA, tb))) anchor = true;
      if (mt && anchor) {
        const ta = win.end + mt[0].length;
        const qr2 = qall.filter(([x, y]) => x >= ta && y <= tb + 1);
        const [ts2, win2] = timingOf(L, ta, tb, qr2);
        processArg(kind, ta, ts2 !== null ? ts2 : tb, win2, ask, qr2, undefined, cl, si, t, segTxt);
      }
    }
  }
  function processArg(kind, a, argB, win, ask, qruns, substGiven, cl, si, t, segTxt) {
    let arg = s.slice(a, argB);
    let subst = null;
    if (substGiven !== undefined) subst = substGiven;
    const msub = substGiven !== undefined ? null : searchIn(SUBST, s, a, argB);
    if (msub && msub.index < argB && !inRuns(qruns, msub.index) && (/^(?:in |instead|in lieu)/.test(msub[0]) || /^["']/.test(msub[1]))) {
      subst = msub[1].replace(/^["']+|["']+$/g, "");
      argB = msub.index; arg = s.slice(a, argB);
    }
    let mcont = CONTAIN.exec(arg);
    if (!mcont && EXT && kind === "accept") {
      const ma = /^\s*(?:anything|any\s+answer)\s+(?=\S)/.exec(arg);
      if (ma && L.styled(a + ma[0].length)) mcont = ma;
    }
    if (mcont) {
      const mex0 = searchIn(EXAMPLES, s, a + mcont[0].length, argB);
      const cend = mex0 && !inRuns(qruns, mex0.index) ? mex0.index : argB;
      const f = containForm(L, kind, a, cend, qruns, win, ask, subst);
      if (!f.slots.length) L.issue("CLASS_OPEN", `${kind}: ${arg.slice(0, 60)}`);
      else L.issue("CLASS_CONTAIN", `${kind}: ${arg.slice(0, 60)}`);
      const mex = searchIn(EXAMPLES, s, a, argB);
      if (mex && !inRuns(qruns, mex.index)) {
        f.end = mex.index;
        for (const [x, y] of splitItems(L, mEnd(mex), argB, qruns, kind)) {
          const it = makeItem(L, x, y, kind, qruns);
          Object.assign(it, { src: "example", window: win, ask, subst_for: subst });
          out.forms.push(it);
        }
      }
      out.forms.push(f);
      lastItems = [f];
      return;
    }
    if (searchIn(KW.acc_range.g, arg, 0)) L.issue("NUMERIC_RANGE", arg.slice(0, 60));
    const items = splitItems(L, a, argB, qruns, kind);
    const cur = [];
    for (const [x, y] of items) {
      let it = makeItem(L, x, y, kind, qruns);
      Object.assign(it, { src: "clause", window: win, ask, subst_for: subst });
      if (CONTAIN.test(s.slice(x, y)) && !/^\s*(?:other\s+)?word\s*forms?/.test(s.slice(x, y))) {
        const f = containForm(L, kind, x, y, qruns, win, ask, subst);
        L.issue(f.slots.length ? "CLASS_CONTAIN" : "CLASS_OPEN", `${kind}: ${s.slice(x, y).slice(0, 60)}`);
        out.forms.push(f); cur.push(f);
        continue;
      }
      if (it.cls && PARTIAL_WORD.test(it.cls)) {
        const pol = kind === "prompt" || kind === "prompt_partial" ? "prompt" : NEG.has(kind) ? "reject" : null;
        if (pol) out.rules.partial_policy = pol;
        continue;
      }
      if (kind === "prompt_partial") {
        it.kind = "prompt";
        if (!it.P.length) it.P = it.quoted ? [it.quoted[0]] : [it.core];
      }
      if (it.cls) {
        const word = it.cls.toLowerCase();
        const mex = searchIn(EXAMPLES, s, x, y);
        if (/word\s*forms?/.test(word)) {
          const mof = /word\s*forms?\s+of\s+(.+)$/d.exec(s.slice(x, y));
          const target = mof ? strip(L.text.slice(x + mof.indices[1][0], y)) : (cur.length ? (cur[cur.length - 1].core || cur[cur.length - 1].text) : "MAIN");
          (out.rules.word_forms = out.rules.word_forms || []).push(`${kind}:${target.slice(0, 40)}`);
        } else if (/equivalent|synonym|description|similar|anything|answers?|translation|spelling|specific|abbreviation|the like|etc|variant|forms?/.test(word)) {
          (out.rules.open_class = out.rules.open_class || []).push(`${kind}:${word.slice(0, 40)}`);
          L.issue("CLASS_OPEN", `${kind}: ${word.slice(0, 60)}`);
        }
        if (mex) {
          for (const [x2, y2] of splitItems(L, mEnd(mex), y, qruns, kind)) {
            const it2 = makeItem(L, x2, y2, kind, qruns);
            Object.assign(it2, { src: "example", window: win, ask, subst_for: subst });
            out.forms.push(it2); cur.push(it2);
          }
        }
        continue;
      }
      let firstStyled = y;
      for (let k = x; k < y; k++) if (L.styled(k) && strip(s[k])) { firstStyled = k; break; }
      const lead = s.slice(x, firstStyled);
      if (firstStyled < y && CLASSY.test(lead) && searchIn(EXAMPLES, lead, 0) && !/word\s*forms?/.test(lead)) {
        (out.rules.open_class = out.rules.open_class || []).push(`${kind}:${strip(lead).slice(0, 40)}`);
        L.issue("CLASS_OPEN_WITH_EXAMPLES", `${kind}: ${strip(lead).slice(0, 50)}`);
      }
      const mwf = /word\s*forms?/.exec(s.slice(x, y));
      if (mwf && !it.cls) {
        (out.rules.word_forms = out.rules.word_forms || []).push(`${kind}:${cur.length ? (cur[cur.length - 1].core || cur[cur.length - 1].text).slice(0, 40) : "MAIN"}`);
        const mex = searchIn(EXAMPLES, s, x, y);
        if (mex) {
          it = makeItem(L, mEnd(mex), y, kind, qruns);
          Object.assign(it, { src: "example", window: win, ask, subst_for: subst });
        }
      }
      if (kind === "accept" && !it.R.length) {
        it.R = [it.core];
        it.wholeRequired = true;
        if (!(it.quoted || L.reqStyle !== "bu")) L.issue("ACCEPT_ITEM_UNMARKED", it.core.slice(0, 60));
      }
      if ((kind === "prompt" || kind === "antiprompt") && !it.P.length) { it.P = it.quoted ? [it.quoted[0]] : [it.core]; it.wholeRequired = true; }
      if (NEG.has(kind) && !it.quoted) L.issue("REJECT_UNQUOTED", it.core.slice(0, 60));
      const mn = /\(([^()]*)\)/d.exec(s.slice(x, y));
      if (mn && !it.window) {
        const n0 = x + mn.indices[1][0], n1 = x + mn.indices[1][1];
        const [, w2] = timingOf(L, n0, n1, qruns.filter(([q1]) => q1 >= n0));
        if (w2) { it.window = w2; L.issue("NESTED_TIMING", mn[0].slice(0, 40)); }
      }
      out.forms.push(it); cur.push(it);
    }
    if (cur.length) lastItems = cur;
  }
  const nexts = out.forms.filter((f) => f.src === "main_next").map((f) => f.start).sort((x, y) => x - y);
  if (nexts.length) {
    out.rules.multi = true;
    const dgroups = groups.filter((g) => g.kind === "directive");
    for (const f of out.forms) {
      f.answer = nexts.filter((x) => x <= f.start).length;
      for (let gi2 = 1; gi2 < dgroups.length; gi2++) {
        const g = dgroups[gi2], prev = dgroups[gi2 - 1];
        if (g.istart <= f.start && f.start < g.iend && !strip(s.slice(prev.end, g.start))) f.answer = "line";
      }
    }
  }
  return out;
}

// ======================================================================
// Judging (answerline_spec.md §8, J1–J14; judging_rules.md)
// ======================================================================

// ---------------------------------------------------------------- J1 normalisation
const SPECIAL_FOLD = new Map(Object.entries({
  "ß": "ss", "ẞ": "ss", "æ": "ae", "Æ": "ae", "œ": "oe", "Œ": "oe", "ø": "o", "Ø": "o", "ł": "l", "Ł": "l",
  "đ": "d", "Đ": "d", "ð": "d", "Ð": "d", "þ": "th", "Þ": "th", "ı": "i", "ʻ": "", "ʼ": "", "ʿ": "", "ʾ": "",
}));
const UMLAUT_STD = new Map(Object.entries({ "ö": "oe", "ü": "ue", "ä": "ae", "Ö": "oe", "Ü": "ue", "Ä": "ae" }));
const GREEK = new Map(Object.entries({
  "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "ζ": "zeta", "η": "eta", "θ": "theta", "ι": "iota",
  "κ": "kappa", "λ": "lambda", "μ": "mu", "ν": "nu", "ξ": "xi", "ο": "omicron", "π": "pi", "ρ": "rho", "σ": "sigma", "ς": "sigma",
  "τ": "tau", "υ": "upsilon", "φ": "phi", "χ": "chi", "ψ": "psi", "ω": "omega", "Δ": "delta", "Σ": "sigma", "Ω": "omega",
  "Π": "pi", "Φ": "phi", "Ψ": "psi", "Γ": "gamma", "Λ": "lambda", "Θ": "theta",
}));
const SYMBOL_WORD = new Map(Object.entries({ "&": "and", "%": "percent", "°": "degrees", "♭": "flat", "♯": "sharp", "♮": "natural" }));
const APOS_RX = /['’ʼ`´‘]/;
const ALNUM_RX = /[\p{L}\p{N}]/u;
const LETTER_RX = /\p{L}/u;
const FOLD_CACHE = [new Map(), new Map()];

function foldChar(ch, plain) {
  const cache = FOLD_CACHE[plain ? 1 : 0];
  let f = cache.get(ch);
  if (f !== undefined) return f;
  f = SPECIAL_FOLD.get(ch);
  if (f === undefined && !plain) f = UMLAUT_STD.get(ch);
  if (f === undefined) f = GREEK.get(ch);
  if (f === undefined) f = ch.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
  cache.set(ch, f);
  return f;
}

// Tokenise text into folded word tokens. attr(k) -> { r: required?, run: tag-run id, tb: tag boundary before k } or null (skip).
function tokenize(text, attr, plain) {
  const out = [];
  let cur = null;
  const n = text.length;
  let prevA = null;
  const flush = () => { if (cur && cur.t) out.push(cur); cur = null; };
  const add = (str, k, a, origCh) => {
    if (!cur) cur = { t: "", r: [], runs: [], cap: /\p{Lu}/u.test(origCh), orig: "", k0: k, k1: k + 1, dotted: false };
    for (const c of str) { cur.t += c; cur.r.push(!!(a && a.r)); cur.runs.push(a && a.r ? a.run : -1); }
    cur.orig += origCh;
    cur.k1 = k + 1;
  };
  const sym = (w, k) => { const a = attr ? attr(k) : null; const r = !!(a && a.r); flush(); out.push({ t: w, r: [...w].map(() => r), runs: [...w].map(() => (r ? a.run : -1)), cap: false, orig: w, k0: k, k1: k + 1, sym: true }); };
  for (let k = 0; k < n; k++) {
    const ch = text[k];
    const a = attr ? attr(k) : null;
    if (a === null && attr) { flush(); continue; }
    if (APOS_RX.test(ch)) {
      // "1930's" is the decade "1930s" (J§8.4)
      if (cur && /^\d+$/.test(cur.t) && /^[sS]$/.test(text[k + 1] || "") && !ALNUM_RX.test(text[k + 2] || "")) continue;
      // a possessive 's / ’s at the end of a word is dropped; any other apostrophe joins (O'Connor -> oconnor)
      if (cur && /^[sS]$/.test(text[k + 1] || "") && !ALNUM_RX.test(text[k + 2] || "")) { cur.poss = true; k++; continue; }
      continue;
    }
    if (ch === "." && cur && (cur.t.length === 1 || cur.dotted) && LETTER_RX.test(text[k + 1] || "") && !ALNUM_RX.test(text[k + 2] || "")) { cur.dotted = true; continue; }
    if ((ch === "-" || ch === "−" || ch === "–") && !cur && /\d/.test(text[k + 1] || "") && !(k > 0 && ALNUM_RX.test(text[k - 1]))) { sym("minus", k); continue; }
    if (ch === "+" && !cur && /\d/.test(text[k + 1] || "")) { sym("plus", k); continue; }
    if (ch === "+" && cur) { add("plus", k, a, ch); continue; }
    // "A*", "GNI*", "m*": a star ending a short symbol-like word is part of it ("A-star"); not emphasis ("*not*")
    // and not a censored word ("M*A*S*H")
    if (ch === "*" && cur && !ALNUM_RX.test(text[k + 1] || "") && text[cur.k0 - 1] !== "*" && (cur.t.length <= 3 || (cur.t.length <= 4 && /^[A-Z0-9]+$/.test(cur.orig)))) { add("star", k, a, ch); continue; }
    if ((ch === "-" || ch === "−") && cur && !ALNUM_RX.test(text[k + 1] || "")) { add("minus", k, a, ch); continue; }
    if (ch === "#" && cur && /^[a-g]$/.test(cur.t)) { flush(); sym("sharp", k); continue; }
    if (ch === "," && cur) { cur.comma = true; flush(); continue; }
    const sw = SYMBOL_WORD.get(ch);
    if (sw) { sym(sw, k); continue; }
    const f = foldChar(ch, plain);
    if (f === "" && LETTER_RX.test(ch)) continue;
    if (f && /^[\p{L}\p{N}]+$/u.test(f)) {
      // a tag boundary between a lower- and an upper-case letter splits glued words ("<u>Nick</u><u>Carraway</u>")
      if (cur && a && a.tb && a.r && prevA && prevA.r && /\p{Ll}/u.test(text[k - 1] || "") && /\p{Lu}/u.test(ch)) flush();
      add(f, k, a, ch);
      prevA = a;
    } else flush();
  }
  flush();
  return out;
}

// ---------------------------------------------------------------- numbers
const CARD = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11,
  twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19,
  twentieth: 20, thirtieth: 30, fortieth: 40, fiftieth: 50, sixtieth: 60, seventieth: 70, eightieth: 80, ninetieth: 90, hundredth: 100 };
const DECADE = { tens: 10, twenties: 20, thirties: 30, forties: 40, fifties: 50, sixties: 60, seventies: 70, eighties: 80, nineties: 90 };
const SCALE = { hundred: 100, thousand: 1000, million: 1000000 };
const ROMAN_RX = /^(?=[mdclxvi]+$)m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
function romanVal(s) {
  if (!ROMAN_RX.test(s)) return null;
  const v = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) { const a = v[s[i]], b = v[s[i + 1]] || 0; total += a < b ? -a : a; }
  return total;
}
function numInfo(t) {
  let m;
  if ((m = /^(\d+)$/.exec(t))) return { v: Number(m[1]), kind: "digit" };
  if ((m = /^(\d+)(st|nd|rd|th)$/.exec(t))) return { v: Number(m[1]), kind: "ord" };
  if ((m = /^(\d+)s$/.exec(t))) return { v: Number(m[1]), kind: "digit", decade: true };
  if (t in CARD) return { v: CARD[t], kind: "card" };
  if (t in ORD) return { v: ORD[t], kind: "ord" };
  if (t in DECADE) return { v: DECADE[t], kind: "card", decade: true };
  if (t in SCALE) return { v: SCALE[t], kind: "card" };
  return null;
}
// digits and Roman numerals equal any number word; cardinal words are not ordinal words ("Two Treatises" ≠ "Second Treatise")
function numEq(a, b) {
  if (!a || !b || a.v !== b.v || !!a.decade !== !!b.decade) return false;
  return a.kind === b.kind || a.kind === "digit" || b.kind === "digit" || a.kind === "roman" || b.kind === "roman";
}
// Merge runs of number words ("nineteen forty eight", "eighteen forties", "two thousand five") into one numeric token.
function mergeNumbers(toks) {
  const isW = (t) => t && !t.sym && /^[a-z]+$/.test(t.t) && (t.t in CARD || t.t in ORD || t.t in DECADE || t.t in SCALE);
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    if (!isW(toks[i])) { out.push(toks[i]); continue; }
    let j = i;
    while (j < toks.length && (isW(toks[j]) || (toks[j].t === "and" && j > i && toks[j - 1].t in SCALE && toks[j + 1] && toks[j + 1].t in CARD))) j++;
    const run = toks.slice(i, j).filter((t) => t.t !== "and").map((t) => t.t);
    if (run.length === 1) { out.push(toks[i]); continue; }
    const val = parseNumberWords(run);
    if (!val) { out.push(...toks.slice(i, j)); i = j - 1; continue; }
    const first = toks[i], last = toks[j - 1];
    const t = String(val.v) + (val.decade ? "s" : val.kind === "ord" ? "th" : "");
    const req = first.r.some(Boolean) || last.r.some(Boolean);
    const nm = { v: val.v, kind: val.kind, decade: !!val.decade };
    // "One <u>Hundred</u> Years of Solitude": the required words alone are a number too ("Hundred Years of Solitude")
    const words = toks.slice(i, j).filter((x) => x.t !== "and");
    const reqW = words.filter((x) => x.r.some(Boolean));
    if (reqW.length && reqW.length < words.length) {
      const rv = reqW.length === 1 ? numInfo(reqW[0].t) : parseNumberWords(reqW.map((x) => x.t));
      if (rv && rv.v !== val.v) nm.alt = { v: rv.v, kind: rv.kind, decade: !!rv.decade };
    }
    out.push({ t, r: [...t].map(() => req), runs: [...t].map(() => (req ? first.runs.find((x) => x >= 0) ?? -1 : -1)), cap: false,
      orig: toks.slice(i, j).map((x) => x.orig).join(" "), k0: first.k0, k1: last.k1, numMerged: nm });
    i = j - 1;
  }
  return out;
}
function parseNumberWords(run) {
  const last = run[run.length - 1];
  const kind = last in ORD ? "ord" : "card";
  const decade = last in DECADE;
  const val = (w) => (w in CARD ? CARD[w] : w in ORD ? ORD[w] : w in DECADE ? DECADE[w] : null);
  if (run.some((w) => w in SCALE)) {
    let total = 0, curv = 0;
    for (const w of run) {
      if (w in SCALE) { if (SCALE[w] === 100) curv = (curv || 1) * 100; else { total += (curv || 1) * SCALE[w]; curv = 0; } }
      else { const v = val(w); if (v === null) return null; curv += v; }
    }
    return { v: total + curv, kind, decade };
  }
  const chunks = [];
  for (let i = 0; i < run.length; i++) {
    const v = val(run[i]);
    if (v === null) return null;
    const nx = i + 1 < run.length ? val(run[i + 1]) : null;
    if (v >= 20 && v % 10 === 0 && nx !== null && nx > 0 && nx < 10) { chunks.push(v + nx); i++; }
    else chunks.push(v);
  }
  if (chunks.length === 1) return { v: chunks[0], kind, decade };
  if (chunks.length === 2 && chunks[0] >= 10 && chunks[1] < 100) return { v: chunks[0] * 100 + chunks[1], kind, decade };
  return null;
}

// ---------------------------------------------------------------- word equivalences
const ARTICLES_EN = new Set(["the", "a", "an"]);
const ARTICLES_ALL = new Set(["the", "a", "an", "le", "la", "les", "l", "el", "los", "las", "il", "lo", "gli", "der", "die", "das", "den", "dem", "des", "het", "een"]);
const CONNECTIVES = new Set(["of", "and", "de", "di", "da", "du", "del", "della", "dei", "des", "van", "von", "der", "den", "ter", "ten", "y", "et", "und", "e", "by", "al", "el", "bin", "ibn"]);
const HONORIFICS = new Set(["saint", "st", "sir", "dame", "king", "queen", "emperor", "empress", "pope", "president", "general", "dr", "doctor",
  "captain", "mr", "mrs", "ms", "professor", "prof", "sultan", "tsar", "czar", "chancellor", "senator", "admiral"]);
// generic class nouns: "name this war" makes "war" optional in a required span and an accounted extra word (J§4.8)
const GENERIC_NOUNS = new Set(("war wars battle battles river rivers dynasty empire treaty peace accord acid law laws effect sea island islands city " +
  "mountain mountains lake ocean country nation state kingdom republic god goddess deity author poet composer painter novel poem play opera " +
  "symphony painting sculpture film movie book story company theory process reaction element compound molecule protein enzyme organ cell " +
  "region province language festival holiday event conflict revolution rebellion revolt movement party team ship vessel submarine building " +
  "church temple cathedral bridge canal desert forest planet star galaxy constellation ruler family order phenomenon disease syndrome device " +
  "instrument technique method equation constant particle force council siege massacre crisis incident affair act bill case doctrine system " +
  "museum university college school prize award journal magazine newspaper album song series show character hero figure saint culture " +
  "civilization period era age style genre tribe people dance game sport ballet suite concerto sonata cantata mass requiem oratorio work").split(/\s+/));
const NEVER_ACCOUNTED = new Set(["or", "nor", "not", "no", "never", "andor", "isnt", "wasnt", "neither"]);
const ABBREV = new Map(Object.entries({ st: "saint", mt: "mount", ft: "fort", no: "number", nos: "numbers", op: "opus", vs: "versus", v: "versus",
  dr: "doctor", jr: "junior", sr: "senior", gen: "general", mtn: "mountain", mts: "mountains", pres: "president", univ: "university", bros: "brothers" }));
const IRREGULAR = [["mouse", "mice"], ["man", "men"], ["woman", "women"], ["child", "children"], ["foot", "feet"], ["tooth", "teeth"],
  ["goose", "geese"], ["ox", "oxen"], ["person", "people"], ["datum", "data"], ["medium", "media"], ["criterion", "criteria"],
  ["phenomenon", "phenomena"], ["genus", "genera"], ["corpus", "corpora"], ["louse", "lice"]];
const IRR_MAP = new Map();
for (const [a, b] of IRREGULAR) { IRR_MAP.set(a, b); IRR_MAP.set(b, a); }
const SUFFIX_PAIRS = [["us", "i"], ["um", "a"], ["on", "a"], ["a", "ae"], ["is", "es"], ["ex", "ices"], ["ix", "ices"], ["man", "men"], ["f", "ves"], ["fe", "ves"], ["y", "ies"], ["o", "oes"], ["os", "oi"]];

// Number inflection (J§7.1): may the response token r stand for the form word f? A proper noun that heads its form
// (fProt) never loses a final s ("Mars" is not "Mar").
function inflEq(f, r, fProt) {
  if (f === r) return true;
  if (f.length < 2 || r.length < 2) return false;
  if (IRR_MAP.get(f) === r) return true;
  if (r.length > f.length) {
    if (r === f + "s" || r === f + "es") return true;
  } else if (!fProt && (f === r + "s" || f === r + "es")) return true;
  if (f.length >= 4 && r.length >= 3) {
    for (const [sg, pl] of SUFFIX_PAIRS) {
      if (f.endsWith(sg) && r.endsWith(pl) && f.length - sg.length >= 2 && f.slice(0, -sg.length) === r.slice(0, -pl.length)) return true;
      if (!fProt && f.endsWith(pl) && r.endsWith(sg) && r.length - sg.length >= 2 && f.slice(0, -pl.length) === r.slice(0, -sg.length)) return true;
    }
  }
  return false;
}
function abbrevEq(a, b) { return ABBREV.get(a) === b || ABBREV.get(b) === a; }
// British / American spelling variants are the same word, not a typo (sulphuric/sulfuric, sabre/saber, flavour/flavor)
function spellKey(s) {
  return s.replace(/our(?=s?$|ed|ing|ite|ful|less|ism)/, "or").replace(/([^aeiou])re(s?)$/, "$1er$2").replace(/ae/g, "e").replace(/ph/g, "f")
    .replace(/is(e|ed|es|ing|ation|ations)$/, "iz$1").replace(/ys(e|ed|es|ing)$/, "yz$1").replace(/ogue$/, "og");
}
function spellEq(a, b) { return a.length >= 5 && b.length >= 5 && a !== b && spellKey(a) === spellKey(b); }

// Optimal string alignment (Damerau) distance, capped: returns max + 1 when over.
function osa(a, b, max) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  let p2 = new Array(lb + 1).fill(0), p1 = new Array(lb + 1), cur = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) p1[j] = j;
  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    [p2, p1, cur] = [p1, cur, p2];
  }
  return p1[lb];
}

// Consonant skeleton for "be lenient with pronunciation / spelling" lines (judging_rules §11.3, §15.4).
function phonKey(s) {
  let t = String(s).toLowerCase().replace(/[^a-z]/g, "");
  if (!t) return "";
  t = t.replace(/ph/g, "f").replace(/x/g, "ks").replace(/ck/g, "k").replace(/q/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k")
    .replace(/sch|sh|zh/g, "s").replace(/z/g, "s").replace(/th/g, "t").replace(/w/g, "v").replace(/j/g, "y")
    .replace(/([bdfgklmnprstvz])h/g, "$1");
  const head = t[0];
  return (head + t.slice(1).replace(/[aeiouy]/g, "")).replace(/(.)\1+/g, "$1");
}

// ---------------------------------------------------------------- collision lexicon (J10 guard, judging_rules.md §11.2)
// Answer words of the app's own question corpus (data/questions.db, preview build 2026-10) that occur in the required
// span of at least 10 answer lines and lie within the J10 typo budget of another answer word. Each entry is the word
// followed by its count in base 36 (two characters, capped at 1295). Built once from the corpus; parsed on first use.
// A fuzzy match is blocked when its fuzzed token is the only required token of its span (nothing corroborates it)
// and is itself a frequent answer word (count >= 10 and at least a quarter as frequent as the target word):
// "Manet" for Monet, "Lakshmi" for Lakshman, "Austria" for Australia, "cytokine" for cytosine. Rare variant spellings
// ("Tutankhamen", "Pharoah") still pass. The app can supply a fuller lexicon as opts.isKnownAnswer(normalised).
const CONFUSABLE_SRC = "aaron1n ababa0c abbasid2w abbott0j abdication0b abduction10 abdul0p abelian0i aberration10 ablation0a ablution0a abolition17 aboriginal19 aborigine16 aborigines1a abortion2p abraham34 absinthe0h absolute24 absorption0e academic16 acadia0q acceleration2o accelerator0s accident0n accidental0h according0q accordion0j acetate0e acetic1s acetyl1d achaean0b achaemenid0t acharnians0a acheson0e achilles45 acidification0a ackroyd0d acres0d acrostic0c actin2d acting0g action5l activated0b activation2b active0y actor1k adamse1 adaptive0x addams0n adderley0c addiction0n addis0e addition0l adele0b adenine0q adenosine0r adhesion0b adiabatic2e adieux0a adler1t administration12 adolf0a adolphus22 adonais0j adonis1o adoration0k adrenal17 adrenaline0r adrian0t adsorption1u adventist0q adventure0n adventures19 aegir0j aegis0f aegospotami0m aeolian0c aesop17 aesthetic0t aesthetics0x aether0f affinity14 affluent0p affordable0e afonso0g africaga african3m africanus0q after2e afternoon2t again10 agassiz0a agatha0b agent0x agincourt18 aging0i agnes0x agnew0y agnus0a agonistes0d agreement0o agricultural0j agriculture16 agrippa0h agrippina0j aharonov0n ahmad0c ahmadinejad0a ahmadiyya0b ahmed0f ahura19 ailey0l aires19 airplane0f aisha0d akbar2c akhenaten1h akhnaten0b akutagawa3i aland0c alaska4k alban0m albania36 albanian0t albans0h albany1i albee3c albers0g albert2t alberta0z alberti0p albertine0a album18 alcatraz0r alcestis0i alchemist17 alchemy0p alcoholism0b alcohols0f alcott1d alcuin0i alder2a aldol1a aldous0a aleksandr0c alexandere1 alexandria33 alexandrine0d alexei0e alexie0q alexievich0b alexios0d alexis0a alexius0g alfonso19 alfred4w algae0s algebra1n algebraic0e alger0b algeria3o algerian0l algonquin0f algorithm0j alice2v alien1t alighieri1v alignment0f alison0a alium0a alive0n aliyah0b alkan0b alkane0j alkene32 alkenes0d alkyne22 alkynes0d allah0h allegiance0e allegri0a allegro0d allele0d allen29 allende4q alley0w alliance3l allison0l alliteration0l allosteric0e allotrope0o alloy0z allport0f almanac0f alone10 along0g alpha67 alpine0g altai0c altar0h alternate0a alternating0q alternation0c alternative0f altitude0c altruism1g aluminum32 alvin0c amado0n amahl0a amarna0s amaru0n amazon4l amazons0c amber0k ambersons0a amelia0b americae4 americanm2 americans0z americas0a amerika0g amide0n amiens0e amine1q amino38 amish0n amistad0j ammit0i ammonia3s amoeba0d among17 amphitryon0c amphoteric0m amrit0c amsterdam16 amusement0b amylase0n anabaptist0m analysis1n analytic1e anansi2c anarchism16 anarchist0k anarchy3a anatolia0b anatomy1r anchorage0g ancient2n andalusia0a andersen1g anderson41 andes2f andre0w andrea0t andreas0e andrei0d andrew1p andrews0x andric0e andromache0e andromeda23 andros0r anecdote0b anemia0k angel5d angela0c angeles6e angelica0c angelico0o angelou2w angels4e angelus0d anger1r angiogenesis0e angiosperm11 angle33 angler0c anglican0t anglo14 angola23 angra0b angry21 anhydrase0i aniline0m anima0f animal48 animals2q anjou0l ankara0a annabel0u annales0m annals0e annelid0e annelida0d annie15 annihilation0w annus0c anomalous0e another0s anouilh0p anova0k anscombe14 anselm14 antaeus0c antarctica2j anthem1w anthology13 anthony3h antibodies2w antibody0q antigen0d antigone2d antigonid0c antigonus0d antilles0a antimatter0k antimony0e antioch11 antiochus0h antoine0q anton0x antonia17 antonin0n antoninus0f antonio1h antonioni0h antony27 anxiety0r anyon0b anyone0k aorta12 apartheid2e aphasia0b apical0b apocalypse16 apollinaire0n apologia0a apophis0a apoptosis32 apotheosis0o appalachia0c appalachian2w appian0i apples0y appleseed0b approximation0c april0s aqaba0c aquitaine0p arabia2m arabian24 arabic3z araby0o arachne0i arafat0i aragon1l arbitrage0b arbus14 arcade0k arcadia2g archaea0u archer0t archery0i archimedes1p architecture16 archive0j arcimboldo0d arden0j arena0g arendt27 areopagitica0i argentina9v arginine0q argon0t argonaut0o argonauts12 argos0v argus0a arhat0g ariadne1j arian0r arianism0a ariel10 aristaeus0a aristotle6e arius0a arjun0u arjuna11 arles0l armada1a armadillo0b armed0a armenia1z armenian2c armor0a armory0u arnold4p aromatic2h arpad0i arpeggio0a array17 arrhenius33 arrowsmith0f arsenic1e arslan0c artemio18 artemis39 artesian0c arthropod0h arthropoda0e articles10 artificial1o artist3y aruba0b ascending0j ascension0g aschenbach0a asclepius13 ascomycota0h ashanti1d ashbery0q ashcan11 ashoka2j ashura0l ashurbanipal10 asian0l asians0c aslan0c asoka0b assad0w assassin1a assassination5s assassins0i assembly0t assis0i assisi0j assist0a association17 assyria1o assyrian0x astana0a asterisk0e asteroid21 astor0o astronomer0o astronomy0a astrophel0a astros0i aswan0j asymmetric0d asymmetry0e asymptote0d asymptotic0x atalanta25 athabasca0c atheism1q athena30 athens7f athos0e atlanta3a atlantic39 atlantis10 atman0p atmosphere0i atomic3b atreus0g attack1b attempt0b attempted0g attendant0a attention1b attic0g attica0d attila27 attitude0a attlee10 attorney11 attractor0j attribution0t attucks0a atwood4l auction12 auden4f audubon0e auger0t augie0l augmented0l august1s augusta0d auguste0m augustine44 augustus3o aurangzeb1g aurea0a aurelian0k aureliano0f aureus0c aurora1r austen3v auster0c austerlitz17 austin1y australiahv australian0y austria4t austrian20 austro0c author3a automat0b automata0e avalokitesvara0b avery0a avesta12 awake0e awaken0f awami0a axiom0l axion0n ayers0e aymara0d ayutthaya0q ayyubid0e azeotrope1i azerbaijan0z azhar0b azide11 azores0f aztec60 baath0c babbitt16 babel2f babies0p babington0f babur11 babylon51 bacchus12 bachelors0c backward0q bacon5z bacteria0o bactria0e baden0j badge1v baeyer0h baghdad36 bahai49 bahrain0i baikal12 bailey0l baker2b bakke0c balaam0b balaclava0l balance1k balanchine18 balboa0e balcony0p balder0l baldr1p baldur0m balkan0x balla0a ballad22 ballade0i ballads1l ballard0k ballet2a ballets0b balliol0a ballistic0b balloon1h ballot0f balls0b balmer0h baltic1o baltimore3d bambi0a banana35 bananafish0t bandit0c bandung0j bandura1f bangladesh2f banjo0y banking0h bankruptcy0a banks0y banksy10 banner0t bantu14 baptism2e baptist30 barabbas0d baraka0y barbados15 barbara1v barbarian0f barbarians0v barbarossa23 barbary13 barber3w barbie0f barca0f barcarolle0e barge0c barium0k barkley0c barley0b barlow0f barnes16 barnum0k barometer0a baron1q barons0d baroque1i barque0j barre0r barrel0m barrett0i barrie0b barrier19 barry1b barth1a barthelme0j bartholdi0e bartholomew1g bartleby1b bartok3p barton0q baruch0l baryon12 basal0j basalt1u baseball3e basel0f bases0i bashir0f basho2u basic0w basie0l basil1o basin0b basis0x basket0c basketball12 basmala0a basque1u bastard0b batavia0a bates0a bateson0l bathory0e bathsheba0j batista0u batman0w baton0c batter0b batteries0n battery0w battle6l battles0a battuta13 baudelaire4g baudolino0g baudrillard0f bauer0l baumer0a bavaria1j bavarian0a bayer0a bayes1w bayeux0p bayezid0i bayle0g bayonet0e bayreuth0g beach63 beagle0i beard1o bearers0d bears0s beast1c beata0a beatles1m beatrix0d beatty0a beauregard0g beautiful26 beauty59 beaver1d beccaria0c becker0f becket14 beckett43 becquerel0f bedford0a beecher12 beetle0p begin0l behavior0j behavioral0p behaviorism0v behead0d beheading0o being8y belafonte0b belgian0c believe0m believer0g believers0a bella0c belle12 bellman0e bellow1x bellows0y bells0z belly0b bender0f bending0a beneath0c beneatha0a benedict4q benet0q bengal1m bengali16 bengals0a benin1e bennet0h bennett0r benso0f benton0t benzene4n beowulf4i berber0u berenger0r berger0f bergere0r bergman1j beria0e bering0w berio0a berkeley46 berlin8i bernadotte0f bernard13 bernarda0y bernhard0c bernice0f bernoulli35 bernstein36 berry16 berserker0a bertha0q bertrand0n betancourt0b bethe0j betrothed0j better0j beveridge0m bhagavad14 bharatiya0a biafra0p bible20 biden0q bieber0b bikini0d bilbao0q billiards0x billion0i bills0e billy2q binding1j binet0m biographies0a biography0e bipyramidal0m birch16 birches0f birdland0c birds2w birefringence0p birth7l birthday2c bismarck49 bison0i bitches0e bizet1z blackzz blackbeard0m blackbird13 blackbody0r blackwell0c blade0v blaine1h blake56 blakey0a blanc0x blanche10 bland0o blank0l blast0v blaue0r blazers0a blazing0c bleaching0d bleak0z blenheim0r bless0h bletchley0c bligh0i blind3n blindness24 blink0j bliss0k blithe0q bloch1p block15 blonde0h bloodek bloody2e bloom24 bloomd0y blows0g bluebeard0q blues3g bluest12 board17 boating0x bobby0e boccioni0s bodhidharma0g bodhisattva18 boeing0o boethius0u bogart0b boheme1o bohemia17 bohemian0h boiling1k boise0d bolano17 bolero1b bolivia2s bologna0z bolshevik0b bolton0c boltzmann5b bolzano0d bombay0e bonaparte2w bondage0q bonding0c bonds0g bones1b bonfire0m bongo0c boniface0w bonnard0b bonnie0l bonus11 boogie0y booker2a books1f boole0d boone0g boost0b booth1l boots0e borden0f border16 boreas0f borel0i borges6v boris1v borobudur0d borodin1r borodino0r boron3g bosch2g bosnia0v bosnian0d boson20 bossa0j boston8n bostonians0b botero0f botticelli2q bottle16 botulism0c boucher0z boudica0o boudicca0o bough1b boulanger19 boule0s boulevard0k boulez0e bound27 boundary1o bounded0g bourbon1m bourdieu0t bourgeois0o bourke0v bowen1e bower0a bowers0b bowie1c bowler0k bowling10 bowman0c boxer27 boxing0y boyar0f boyle1m boyne0m bradford0r bradley0w brady1k braganza0x bragg1q bragi0i brahe0m brahma1o brahman0d brahmaputra0g brahmin0s brahms77 braille0a brain3e bramante0f branch1h brancusi3k brand0m brandeis0q brandenburg2c brando0j brandt17 brant0b braque14 brasileiras0f brasilia0q brass0g brathwaite0k braun0f brautigan0b brave3f brazilg3 bread21 break19 breaking1o breast0u breath0q breathing0d breda0v breed0g bremsstrahlung0r bresson0u brest0v breton0z brett0a bretton0d breughel0d brewed0a brexit0u brian0q briand0m brick0q bride2s brideshead19 bridgec9 bridgerton0b bridges11 brief0j brigade1x briggs0r bright0o brigid0b brilliant0f bring0l brink0b brisingamen0a bristol0a britain4d britannia0g british4j britten3w broad0a broca0g brodie0x brokeback0c broken1p bromine1c bronco0a bronsted0c bronte3x bronx0a bronze5d brook0h brooke0w brooks33 brother2b browncx browne0k browning5o browns0a bruce1c bruch0p brucke0u bruckner2b bruegel24 brueghel0v bruges0c brunei0d brunel0a bruno0j brush0a brute0d brutus1s bryan2h bryant2l bryce0a bubble2d buber0a buchner0v bucket0b buckley0u buddha4s buddhism4s buddhist0u buffer27 buffett0a buhari0a build0z builder0u bukhara0m bulba0g bulgar14 bulgaria2t bulgarian0c bulge0y bullet12 bullfight0i bullfighter0u bulls0h bulow0b bulwer0n bumppo0i bundle0o bunin0a bunker14 bunny0c bunraku0q bunyan1n buonarroti11 burana1g burckhardt0b burden0x bureaucracy0e buren1d burger17 burgess1f burghers0g buried16 burke1t burma1y burne0e burned0f burner0j burney0e burning3m burns2p burnt0a burroughs14 burst0n burton0z burundi0f burying0j busoni0e buster0c butler53 butter0t byatt0i byblos0c byron4c byzantine3d byzantium1d cabal0f cabeza0a cable0t cabot0l cabral0m cache10 cactus0c cacus0b cadherin0c cadmus1r caesar4z caine0b cairo3m cajal0f cakes0b calaveras0o calcutta0z calder2g caldera0h caledonia0k calendar1c calgary0k californiac4 caligari0k called0j calling1a calliope0b callisto0o callixtus0c calorimeter12 calorimetry11 calvin3w calvinism0c calvino4e calydon0b calydonian0m calypso0y cambodia2s cambrai0s cambrian1k cambridge1x camden0d camel16 camera1n cameron1s cameroon13 camilla0f camino0b camoes0f campaign0k campbell1u campion0e campo0d camps0b camus3v canaan0a canadaaj canadian17 canal5b canaletto0h canary10 cancer3v candida0e candide3d candle22 candomble0g candy0n caning0a cannery0m cannes0t cannibal0z cannibalism0u canning0l cannizzaro0d cannon14 canoe0m canon2b canonical0y canonization0h canova1j canto18 canton0u cantonese0a cantor1q cantos0z cantus0d canute0g canyon1t capacitor36 capacity3z capek1y capet0l capital41 capitalism1u capitol0p capone0t capote26 capra0b capriccio0g caprices0e caprichos0g caprivi0g captive0a captivity0c caracalla0f caravaggio4w caravel0d carbond7 carbonari0i carbonate14 carbonyl1g carboxyl0d carboxylase0b carboxylic1a cardenas0j cardinal0q cardinals0t cards11 carey2k cargo0j caribbean1a carlisle0b carlist0r carlo1a carlos1x carlsen0e carlyle15 carmen3j carmina1g carnap0m carnatic0k carnation14 carnaval0u carnival35 carnot1m carol1k carolina6v caroline0v carpe0g carpentaria0a carpenter0w carpentier0y carpet0q carracci0j carraway0k carre0e carrey0b carriage0f carrie0w carried0w carrier0t carrington0j carroll26 carry0f carson1u carta1r cartel0h carter4f cartesian0e carthage41 cartier1d cartilage0k carton0a cartoon0q carver1e casablanca1g casals0h casanova0e casas0z cascade15 casey0l casino0e casparian0e caspian1f cassandra13 cassatt24 cassava0b cassini11 caste0t castile1f castle66 castling0a castor0t castorp0i castration0f castrato0c castro2g catalan18 catalogue0g catalonia19 catalysis0b catalyst2w catalysts0c catalytic0c catastrophe0h catch3k catcher1x catfish0e cathar0x catharsis0e cathedral3j cather33 catherine6f catholic49 catholicism0n cathy0c catiline0t cation0i cattle2a caulfield0p causal0d causation15 cause10 cavalier0t cavaliers0c cavalleria0r cavell0c cavitation0c cayley0e cayman0b ceausescu1k cecil0q cecilia0f cedar0g celan0h celebrated0n celesta0o celeste0d celestial0m celia0g celiac0f celine0f cellar0h cellini1m cello6c cells11 cellulose1e cemetery0v census0s centaur28 centauri0d central6f centre0l centrifugal0p centrifugation0r centrifuge0g cepheid1f ceres19 cervix0a cesaire1c cesare0h cesium0n cetshwayo0f chabon0u chaco14 chaeronea0f chain41 chair2q chairs0o chakri0b chalcedon0o chalk18 challenger14 chamber31 chambered0b chamberlain28 chambers0b champa0f champagne0j champions0r champlain13 chance0r chandler0t chandrasekhar10 chanel0m chang0n changan0a change28 changeling0f changes0a changing0v channel27 chant16 chaos2k chapel1t chapelle0p chaperone0j chaplin1c chapo0c character0k chardin0n charge8i chargers0a chariot3b charity0u charleshu charleston19 charli0b charlie1k charlotte1n charm0n charon10 charter15 chartism0r chartist0a chartres0q chase2d chatelier1p chatterley1q chatterton0d chechen0a checkers0g cheese1c chekhov5c chelation0n chemical3b cheney0k cherenkov1e cherubini0e chesnutt0e chess3e chest0f chesterton10 chiang1w chiapas0a chicagoh7 chichen0r chickamauga0t chicken2f chief2m chien0s chihuahua0l child4m childe0v chile8c chili0i chimp0i chinale chinese8r ching1z chios0k chips0a chirac0k chiral2t chirality0s chiron0s chitin11 chloe0w chloride19 chlorine1j chloroplast19 choir0e chola0w cholesterol2l chopin8o choral0i chord0k chordata0p chorus11 chosen0a choson0h chris0d christ7c christian6d christianity2d christie30 christina20 christine0f christmas53 christo0y christophe0g christopher11 chromatic10 chromatin0w chromatography5e chronicle20 chronicles0t chrysippus0b chrysler0g chulainn2d chung0c churchland0a churchyard1l cibber0f cilia0l cincinnati18 cincinnatus0e cinnamon0f circadian12 circassian0a circe1l circle6o circulation0r circumcision17 circumnavigation0b circus1o cirque0g cirrus0g cisplatin0b citadel0a citium0b civilca civilizations0a clade0d clair0x claisen0v clamp0d clapeyron1p clara0e clare0o clarissa11 clark2n clarke17 clash0k class3n classic0q classical1a classification0l claude17 claudel0p claudio0d claudius2b clausius2d clavier19 clayton0t clean0k clear13 cleisthenes10 clemens0g clement0t clementi0r cleveland3l cleves0i click0p client0h clinic17 clinton4o clive0q clock3o clone0b cloning0k close18 closed10 closet0a closing0k closure0i cloth0r clothes0d clotting0d cloud72 clouds1w clove0f clovis1o clown17 clowns0a cluster1j clyde0v cnidaria1w coach0m coalition0b coase1d coast2a coates0o cocaine0r cochlea0u cocoa0b coconut0v cocteau0g codex0j coding0a codominance0b codon0i coelacanth0a coffee2c coffin0y cognitive22 cohen11 coherence0w coherent0h coleman0y colette0f collage12 collagen2e collar0q collection0s collective17 college25 collider0k collins2z collision1m colloid2x colombia4m colon0l colonel10 colonial0b colonies0d colonization0o colony1o color8d colorado4r colored0i colors0c colosseum0u colossus12 colts0a columbia42 columbian0r columbine0b columbus2y combination0g combine0g comedian0a comedy58 comes1g comet2a cometh20 comfort0a comic1i coming2v comma0a command0e commander0e commedia0u commission1e committee1e commune17 communication0a communion10 communism15 communist2z communities0j community1c commutative14 commutator0g companion0a comparative1e compare0a compatibilism0b competition1m competitive0o complement11 complementary0c complete1o complex41 complexity0b composer0g composite0h composition0d compostela0g compression18 compson0h compton2m compulsive0c computer1q comte1y conan0h concept11 conception0g concerning3h concert11 concertobp concertos1e conch0l concierto0b conclave0d concord1a concrete1q conde0d condensation1d condition17 conditional0n conditions0f condon0g condor19 condottieri0d conduct0c conduction0q conductor0z coney0t confederacy14 confederate1c confederation1e conference0v confession0t confessional0h confessions24 confessor0k confidence0h configuration0d confirmation0q conformal0h conformity14 confucian0z confucius37 congestion0b congo5f congruence0d conic0h conjugate18 conjugation1n conkling0f connally0b connected0d connection0a conquer1p conqueror21 conscience0b conscious0i conscription0n consent0g conservation26 conservatism0m conservative30 consider0a consistency0b consolation0m constable1e constance11 constant65 constantine40 constitution2m constitutional0n constitutions0f constraint0a construction0e consul0y consumer0f contact1a containment0f contest0l context0p continental2e contingency0a continuity2f continuous0z continuum10 contra1u contraception0a contract37 contraction1b contradiction0k contrast0e controller0e convection2f convention1n converge0z convergence1i convergent11 conversation13 conversion1a convert0e converter0b converting0m convict0c convolution0p conway1c cooke0e cookie0k coole0d cooley0q cooling0r cooper4i coordinate0q coordination0o copeland0c copernicus0u copland4s copley1c coppelia0i copper4q copperfield13 coral2i cordelia0h cordoba14 corea0e corey19 corinna0b corinthian0c coriolanus0k coriolis2q cornea0j corneille11 cornell0f corner14 corners0g cornwall10 cornwallis14 corona1c coronado0e coronation1l corporation0i corps0w corpse0v corpus1x corral0b correction0c correggio0b correlation1b correspondence0e corrupted0e cortes17 cortex0i cortez0s cortisol0h cosby0b cosimo0i cosine1f cosmic2s cosmicomics0e costa15 costello0t cotton3d count4e countable0b counter10 countryak county1h couperin1t couple0l coupled0r couplet0p coupling0y courier0a course1l court4z courthouse0c cousin0t covariance0b covenant0z covent0b cover16 covid0p coward17 cowley0c coxey0q crack0r crafts1e craig0f crake0t cramer0i crane5y cranes0f cranmer0j crash1o crater1j crawford0q crazy16 creatine0c creating0i creation2z creative0f creed0v creek3j creep0j cremation0t creon0g crescendo0b crescent0g cressida0c crest0h crete2a creutzfeldt0i crick0u crime4k crimea1w crimean2c crisis2t crispr15 cristo27 critic0o critical3v criticism0y critics0f crito0v crittenden0h croatia24 croce0a crocodile14 croesus0a crohn0a crome0i cromwell46 cronus0t crosby0e cross9o crossing49 crossroad0a crossword0h crowd23 crowley0h crown2r crucifix0a crucifixion2u cruise0k crumb0j crusade5u crusoe2u crust0k crypto0d crystal5l cthulhu0q cuban1x cubas0e cubism25 cuchulainn1a cullen0h cultural24 cumhaill0g cuomo0d curacao0c curie35 curling0b curry13 curse0u curtain0o curtis0x curvature1e curve21 cusco0e custer0x cutter0b cuzco0p cycle3h cyclic29 cyclin0r cyclohexane1b cyclopes0k cyclops11 cyclotron0v cygnus0b cynic16 cyprus2m cyrano13 cyrus2m cythera0p cytochrome19 cytokine0g cytokinesis0s cytokinin0l cytosine0l czechoslovakia20 czerny0h dacia0j daddy1j dagger0k daily0i daisy29 dakar0f dalai1z dalembert0r daley0g dalit0j dallas1n dalton1e damnation0d damned0a damon0f damping10 danae0l dance5v dancer0u dances14 danger0i dangerous1a daniel41 danish0d dannunzio0e danse19 dante3w dantes0h danton0m danube2i daphnis0o darcy17 darien0m dario1r darkling0t darling0c dartagnan0u darwinism0b darwish0v darya0c dasein0k dating0o daughter2v daughters16 dauphin0a daviddb davidson0z davies0x davis7o davisson11 dawes15 dayton0l dazai0a deacon0b deadlock0b deathzz debussy53 decameron3f decatur0k decay1k deccan0m decembrist0w declaration28 deconstruction0a deemter0b deepavali0b defect0o defence0c defense1x deficit0a defoe20 degas2d degeneracy0p degenerate13 degeneration0e degree0u degrees1b deianira0a deirdre0q dejection0c dekker0l delano0a delft1b delhi28 delian0y delilah0e delius0s delivered0g della19 dellarte0n delos0f delphi10 delta4e demeter2a demian0i democracy32 democrat13 democratic53 democritus0p demoiselles0z demon2h demons0e denali0u dendritic0b denis0u denisovich12 dennis0c dentist0b denver15 department0k dependent0i deposition0z depression3l depth0y depths0n derby0q derek0i dervish0a desalination0f descartes61 descending0y descent1n description0j desert2q deserted0b desertion0c designated0d designator0a desire33 desiree0i desmond0e destiny1j destroy0b destruction0z detection0f detective24 detector0c determinant2o determinism0g deucalion0m deuteronomy0p deuterostome0e development1o deviance0d deviation1k devil5c devolution0k dewar0b dhaka0c dharma1q dialectic1k dialogue0i dialysis0b diamagnetism0n diana1c dianetics0d diary3a dicke0a dickinson6x dictator1i dictionary1w diego1m dielectric1n diels27 diene0f dietrich0d difference14 different0j differentiable0e differential1y differentiation1k diffusion4m digambara0j digital0t dignity0k dijkstra1f dilation1d dilution0e dimension1q dimensional0t dimer0b dindy0c dinesen1p dinner16 dinoflagellate0b diode2j diogenes1v dionysius0h dionysus3y diphthong0e diplomacy0l diplomatic0b dirac3j direct0m direction0h director0l directory0t dirichlet0x disaster0f disasters0f discipline0v disco0o discount0d discourse0z discovery0x discus0k disgrace16 dislocation0c disorder0z dispersion2a displacement1p disputation0a dissipation0m dissociation0w distribution0v disulfide0n divan0a diver0b divergence0y divergent0g diversity0s divide0p divided0k dividend0b divination0n divine24 diving0l division1p divorce1g diwali2t dixie0m dixon0s djenne0h djinn0j dmitri1a dmitry0f dobson0g doctor83 doesburg0g dogen0a dogma0a doktor0d dolce0i dollar18 dollfuss0a dolls0a dolly0t dolomite0d domestic0d dominance0j dominant1a dominica0i dominican23 dominion0t domino0b domitian0m donation0l donatism0a donelson0g donna0g donne4c donner0d doolittle14 doomed0j doping0s doppelganger0a dorado0s doria0g dorian2c doric0f dorma0m dorothea0i dorset0d dostoevsky2c dostoyevsky26 double7s doubling0b dover2o doyle1g draco0s draft1a dragon6g drake2s drakensberg0d drang14 dravidian0g dreamde dreaming0c dreiser1h dress0r dreyer0d dreyfus22 drift32 drina0b drink0r drinkard0a drinking0v drive1m driver19 driving0l drone0v drosophila28 drown1l drowning0n drude0a drugs0d druid0s drums0r drunk0n druze1o dualism1r duarte0e dublin26 ducks0a dufay0b duffy0s dukas0m dukkha0a dulce14 dulles15 dulong0i dumas2f dunbar1e dunces0s dunes0s dunning0b dupin0k dupont0d durand0n durant0g duras0e durbervilles0t durer3o durga18 durham0g durrell0g dutch3o dutchman10 dvorak4i dwight0e dying2y dylan1z dynamic1g dynamics0o dynasty0n dynein0a dystrophy0j eagle2c eagleton0d eakins1z earhart0j early0k earnest28 earring19 earth8d earthquake3v easing0c easter68 eastern0n eater0e eaters17 eating15 eaton0l ebert0i ebola0v echidna0k eclipse1c eclogues0b economic18 economics0y economist0a ecuador28 eddington0n edgar11 edmond0f edmund0u education31 edvard0e edwardag edwin0j effect40 effective19 effendi0d efficiency1m efficient0c egmont0c egyptcv eight4g eighteen0b eighteenth0f eighth0s eighty21 eilish0h einstein9p eisenstein0o either1b ekman0o elagabalus0c elastic1k elasticity1a elder2z elders0g election1s elective0c elector0a electoral0d electra12 electric5l electrocardiogram0c electrode0t electrolysis1m electrolyte0b electromagnetic0f electronaf electronic0j electrons0i electrophilic0f elegans1u elegies1x elektra0g element19 elemental0f elementary0y elements0r eleusinian0c elevation0b elevator0u elgar3q elgin0k elias0j elimination1j eliot8i elisa0c elisabeth0c elise0d elish0e elisha0f elite10 elixir0e eliza14 elizabeth7n ellen0s ellington2q elliot0b ellipse1j elliptic13 elliptical0q ellis19 ellison1h ellsworth0d elmer0l elves0f elvis0i emanuel0e emerald0i emergency0t emerson31 emile0x emilia0c emily1v emmanuel16 emmett0b emotion1h empirical0b empiricism24 empiricus0g empress0i emulsion0s enantiomer0s enclosure0v encomienda0t encyclopedia0z ender0k endless0q endlessly0g endocytosis0f endosperm0b endosymbiosis0a endosymbiotic0d endymion0k energyfn engels19 engineers0a england8q enlil0o enoch1b enquiry15 enrico0e enron0g ensor0l entente0e entertainer0j entropy77 entry0v enver0a environmental0g ephesus0x epicenter0b epicurean0o epicurus12 epidermis0e epiphyte0a episode0a epistasis0n epistle0c epistolary0k epithalamion0a epithelial0f equal1u equation1x equations0p equestrian0s equilibrium7p equivalence1y equus0d erikson1z eritrea0q ernest0y ernst1o eroica15 error1d escape14 escher0v esker0a esmeralda0e esophagus0l espagnol0c espagnole0g esperanto0i essay2o essays0u essence0q essex0f estado0o ester2t esterhazy0j esters0c esther2f estonia12 estrogen0o eternal18 ethan1f ethanol1k ether3f ethers0d ethic11 ethica0e ethical0c ethics4r ethiopia7t ethiopian0j ethnography0i ethylene1n euclidean0g eudaimonia0e eugene42 eugenics0c eugenie0e euler6b eumenides0e euphoria0b euridice0a euripides2f europa1r europe16 eurydice0t eutectic12 evangeline0s evaporation0o event1k everest12 everett0d evers0i every0r everyman0j everything1d evolution26 evolutionary0d exception0b exchange3d exclamation0b exclusion2x exclusive0f execution0z executioner0h executive0g exemplary0i exhibition2w exile0r existence13 exorcism0i exorcist0a exothermic0n expansion1q expedition0x experience1v experiment1n explosion10 exposition0o express1l expression0s expressionism28 expulsion0q externalism0b externality0h extinction1x extra0h extraction12 exxon0d faber0f fabian0c faces0l facing0d faction0e factor5s factorial2t factory13 faerie1c fagin0a fahrenheit1r fairfax0d fairy21 faisal0d faith2c faithful0d falcon1q falconet0f falcons0b falkland1c falklands1e falla1c fallacy0h fallen0n falling0v fallout0c falls2q falstaff12 familia0z families0e fancy0b fanny0m fanon14 fantasia0z fantastic0r fantastique27 farabi0g faraday46 farah0b fargo0k farmer1e farming0a farnese0m faroe0d farquhar0b farrell0d fascism19 fassbinder0c fasting0w fatal0b fates0w father30 fathers1y fatima0l fatimah0d fatimid0z fatty0p faubus0b fault1d faure1g faust45 faustus1m fauvism1f favorite0m fawkes0h feast2r feather1z federalist22 federation0i federico0c feeling0l feminism1t feminist0b fence0e fences1x fenian0f fenrir1g ferber0a ferdinand42 ferguson0z fermat4u fermi3y fermion1g fernando0a ferrara0g ferrell0e ferris0w ferro0e ferrocene0t ferromagnet0t ferromagnetism2f ferry1g fertility12 fever1p feynman3o fiber0u fibonacci2a ficciones0i fiction1x fiddler0t fidelio0y fierro0h fifteen0d fifth3t fifty0n fight1g figure12 figures0b files0a filial0t filibuster0m filipino0d fille0c filter10 filtration0t final1j finance0c financial0f finch10 finding0l finger1c finite1h finland6o finlandia0s finnegans0z finney0e finnish0j fionn14 firework0a fireworks0p firing0g firmus0a firstgd fischer2g fisher2s fishers0d fishing11 fission1r fiume0c fixation1g fixed1h fjord0l flagella18 flagellum0i flagstaff0b flame13 flamenco0q flamingo0d flanders1p flapper0a flare0b flash1l flask0a flavor0k fleece0r fleet0o fleming14 flesh0l fletcher0o fleurs1t flies3p flight2f flinders0f flint0j flood4j floor0m florence5t florentine0c flores0a florida74 flory0d floss0v flower6l flowering0b floyd0x fluctuation0n fluid1g fluorescence22 fluorescent0v fluorine2e flute7a flying26 flynn0m focal1b fodor0n folding16 foley0a folia0b folic0b folies0w folio0e follette0s following0c folly11 foner0a fontainebleau11 fools0r football1t forbidden0s forbidding0o force4k forces0c foreign0p forest3x forge0i forget0c forking19 forks0c formal0v formalism0c formation1e formic0c formio0c forms0z forrest0m forster3h forsyte0a fortas0e fortnite0b fortuna0j fortune0x forty13 fosse0m foster1n foucault5b found0c foundation0t founder0u fourier3m fourteen0n fourteenth0k fourth4f fowler0a fowles0f foxes0x fraction0o fractional0i frame1d francaise0b francelx frances0b francesca0q francia0a francis5l franciscan0e francisco70 franck1r franco5f francois0u frank3y frankfurt1v frankl0e franks0c franny0c franz4g franzen0r fraser0c fraunhofer0l frazer0p frederic0y frederick6j fredericksburg0h freedmen0n freeman0y freeze0c freezing1a frege1p freire0b frequency3b fresco0t fresh0l freud6c freya17 freyja12 frick0j friction54 friday2v fried0g friedan0u friedel15 friedman2y friedmann0b friedrich38 friend18 friends1b friendship0b fries0e frieze13 frigg0y frisch0d frome13 fromm0j fronde0t front4g frontier18 frost68 frozen0e fuego17 fugue37 fujita0i fujiwara0c fuller1b fullerene14 function42 functional1s functionalism0m fundamental2w fundy0b funes0b fungus0g funny0e furan0h furies0x furioso0w future1l futurism2j futurist0b fuzzy0b fyodor0h gabler1v gables17 gabon0j gabriel3d gabriela0b gachet0b gaddafi1m gaiman0i gaius0h galactic0q galatea0y galatians0h galaxy25 galba0c galen0s galicia0i galilee0j galilei12 galileo22 gallery0s gallic0g gallipoli19 galsworthy0i galvanic0q galveston0p gambia0o gambit0i gambler0c games1h gamma3y ganesh2z ganesha0g ganga0a ganges1i gantry0h garbage1j garcia79 gardenah gardens16 gardner0y garfield1o garfunkel0e garibaldi2g garland13 garner0c garuda13 gases0c gaskell0u gaspard0h gaspee0o gates3i gatha0a gatsby3d gattamelata0i gaucho0s gaudens0j gaudi1g gaugamela0e gauge1a gauguin2b gauls0b gauss4u gawain2f gebelawi0g gehry2g geiger0u geisha0h gender31 genealogy0x generalb4 generalized0e generation2v generations0g generator0b genet1o genetic1k geneva20 genius0k genome13 genovese0k genre0b gentile0a gentileschi1v gentle10 gentleman0o gentlemen0u geodesic0n geographic0f geography0i geomagnetic0i geometric0u geometry0w georg0e georgec6 georges0z georgia7m georgian0c gerais0c germain0m german7h germania0a germanic0e germanicus0a germanyf4 germer11 germinal0s germination0h gerome0j gerontion0c gerontius0e gerry0i geryon13 gesar0a gethsemane0f gettier0x ghana46 ghazal0x ghazali0u ghent20 ghosh0a ghost5h giant5d giants1m gibberellin0v gibberellins0c gibbon0v gibbons0s gibran0p gibson11 gideon1a giffen0j gilbert20 giles0i gilligan0c gilman12 ginkgo0a ginsberg31 ginsburg0j ginzburg0m gioachino0b gioconda0a giorgione13 giotto1z gipsy0c girls2a giscard0g giselle0v gitanjali1z giubba0c giuliani0d giuseppe0h giver0i glacier3c gladstone1p gland0c glasgow0x glassf0 glasses0b glenn0l glissando0a global0w globe0n glomerulus0g gloriosus0f glorious1y glove0l glover0f gluck1i glutamate0s glutamic0c glycol0j glycolysis27 glycosylation0r goats0c gobind0o goblet0e godard15 goddess0h godel1p godfather0w godot36 godoy0c godwin0e godwinson0l goethe6c gogol4r going1j goldeni1 goldfinch0j goldin0d golding1k goldman1c goldsmith1o goldstein0b goldstone0c golgi2y goliad0h gomez0a gonna0b gonzaga0j gonzalez0i goodall0n goodman2l google1c goose11 gordan0b gordon3h gorges0g gorgias0k gorgon0b gorilla0k gorillaz0b goriot0s gorky2g gorman0d goryeo0k gotha0e gotham0e gothic63 gouges0j gould21 gourd0b governess0a gower0f gracchus13 grace2l graces0e graduate0a gradus0b graeae0b graffiti1h graham3d grail12 grain18 grainger0r grammar1b grammatology0n granada12 grand78 grande33 grandet0b grandfather0d grandmother0p grange0q grant3s granth1q grape0y grapes1x graph2f graphic14 grass6m grating0a grave0q graves1w gravis0c gravitation0f gravitational3z grease0b greatzz greater0t grecian1e greco2u greece6w greedy0p greek7h greene6 greenberg0q greene3r greenland1u greenville0b greenwich0i greenwood0k greeny0c gregor0p gregorian0y gregory3i grenada1f grendel25 gretel0f grice0b grieg3j griffin0n grimes11 grimke0e grimm1x griot0u gropius0o gross18 grosse0a grosso0v grotius0n group4v groups0g grove0y grover0o grozny0a grunewald0d grunwald0f guadalupe0u guanine0w guano0r guarani0l guard1k guardia0i guardian0i guardians0c guatemala2a guerrero0b guest0s guevara19 guiana0l guide2e guido0b guild0u guilford0h guillaume0i guillotine0q guilt0a guise0d guitarist0b gujarat0k gulistan0a gunga0e gunner0b gupta16 gurdwara0p gurion0q gustav1w gustavus1w gutenberg1g guyana0z guzman0e gwendolyn0b gyges0g gypsy0n gyroscope0j habeas0l haber2i habsburg1m hades1s hadid14 hadith28 hadley0o hadrian2j hadron11 hafez0e hagar0s hague0s haifa0j haiku35 haile0v hainan0c hairy0i haiti5e hakim0n halakha0a halal0f haley0j halley0v halsey0a halting0n haman0j hamas0b hamburg0j hamid0l hamlet52 hammarskjold0g hammer1h hammett0x hammon0c hammond0n hampton17 hamsun0q hanafi0c handel5x handke0b handling0a hands23 hanks0b hanna0g hannah0p hanoi0j hanover0p hansa0d hansel0f hansen0c hanson0e hanukkah0y hanuman1o happen0l happiness0x happy1r hapsburg0o harald0w haram12 haraway0e harden0c harding1c hardness0q hardrada0f hardy85 haring0m harlan0n harlem47 harley0d harlow0x harmonia0n harmonic5x harmonica0h harmonious0e harmonium0n harmony1b harold4p harper12 harpsichord2g harriet0g harrington0a harrison2o harry1z harrying0a harte1f hartley0l harun0m harvard27 harvest0b harvey11 hasdrubal0d hashanah1f hasid0a hasidic0g hasidism0g hassan0b hasselbach0d hasselbalch1d hatch0b haunting0b hauptmann0o hausa0m hausdorff0p haussmann0e havana1g havel1h haven0m having0f hawai0a hawaii59 hawking1v hawkins0p hawks0c hawley0u hawthorne5a hayden0m haydn6z hayek22 hayes1d hayne0b haywood0i hayworth0e hazard0x headless0l heads0k health1l heard10 hearing0q hearst0x heartdf heartbreak0k hearts0q heath0l heathcliff0s heathen0b heaven4k heavy13 hebrides0r hecate0n hecht0d heckscher0i hector1p hegel4u hegemony0k heidegger4l height0e heike0e heimdall2f heine1n heinrich0j heinz0e heisenberg29 helen31 helena0y helens0h helga0d helicopter0f heliocentrism0b helios1a helium40 helix1m heller0w hellman1t hello0j helmer0a helmet0l helmholtz2h helot0v hemans0a hemophilia0h henderson2d hendrix0b henle0p henri1g henrik0k henryok henrys0c hephaestus27 hepworth0c heracles48 heraclitus1o heraclius0g herbert1y hercule0d herder0g herero0i heritability0e heritage0h herman0b hermann0k hermes3k hermione0i hermit0h hermite0a herod0m herodotus1q heroes0p heroic0b heron0w herpes0l herring0b herrmann0a herschel0i hershey0i hertzsprung1c herzog1a hesse45 hester0l hetero0d heterogeneous0e heterozygote0c heterozygous0g hexagon0p hexagonal0a hezbollah0k hicks0s hidden18 hideyoshi0q hieroglyph0d hijab0j hijra0f hilary0e hilbert24 hillary0c hillel0n hills1e hilton0e himalaya0o himes0b hindu2k hippo0h hippocampus1g hippocrates0i hippolyta0f hippolytus0l hiroshige0q hiroshima1g hirst0y hispania0j hispaniola0v histamine0n histidine0p historian0p historical0h histories0a hitchhiker0l hitler3i hitter0a hoare0a hobbes2z hobby0f hobson0f hockey0l hockney10 hoffa0c hoffman0z hoffmann1w hofmann0o hofstadter0p hohmann0c holberg0h holden1a holder0h holes16 holiday1b holland0g hollande0b holliday0d holly0g hollywood0u holmes4y holography0b holomorphic0e holst2f holstein0l homage0l homecoming0h homeland0g homer5e homestead1f homme0a homogeneous0h homologous0f homology0b homotopy0a honegger0t honey1v honor0n honshu0p hooke3m hooker0l hooks0l hoover2t hopkins30 hopper3b horace2v horatii15 horde1s horla0e horney0n horseck horseman3o horsemen0m horses1e horton0l horus3l hosea0c hospital1k hospitaller0q hotel3f hotelling0i hotspot0j houdini0g houdon0a hound19 hours0z housesu houses0e houston3c houyi0b howard1s huang1i huascar0i huayna0a hubble3k hudson59 huffman0j huggins0d hughes6l huitzilopochtli1n hulagu0m humaine0j humanax humanism0v humans0a humbert0k humidity0d hummel0m humphrey0s hundred7w hungarian2f hungarya1 hunger2r hungry0d hunter2a hunters0s hunting12 huntington1v huron0j hurrian0a hurricane20 hurricanes0a hurston2h husband18 husbands0f hussein1i hutcheson0h hutchinson1g huxley34 huygens1d hwang0f hyacinth0g hydra1p hydrazine0x hydride0r hydrochloric0w hydrogencr hydrophobic0s hydroxide0v hydroxyl0v hymns0f hypatia0e hyperbola0t hyperbolic13 hyperfine0c hypha0e hyphae0h hypothalamus1a hypothesis1j hysteresis1d iapetus0d iberia0n ibrahim10 icarus1x iceland47 iconoclasm0w icosahedron0b ideal5r ideas0q ideology0n idiot1j idomeneo0c ignorance0o iguana0u iliad1d illuminated0q illusion0t ilmarinen0d ilyich11 image1m imaginary1q imagine0b imagined0d imagism0w imidazole0d imine0x imitation0c immigration0n immolation0e immoralist0b immortal1g immortality1f immortals0p immunoglobulin0g imperative1n implicit0d importance2d impression1a impressionism2a incan0a incest0i inchon0c incident0z inclined0b incoherence0a indentured0a independence62 independent1z index54 indiaju indian5x indiana2a indians0f indicator14 indies0e indigo0m indira0a indole0k indonesia7w indra2a induced0i induction36 inductive0o inductor16 indulgence0d indus2y industrial23 inelastic11 inequality1u inert0c inertia4p inertial0n infant0i infante0c infection0a inferior0b infernal0h infinite32 infinity1o inflammation0x inflation4d inflection0a influence0i influenza0l inhibitor0c initiation0f injection0d inner1g innocence23 innocent1k innocents0f inoculation0b inquisition1d inquisitor0d insect0i insertion0a inside0r inspector18 institution0k institutional0b instrument0t instrumental0d instruments0a insular0b insulator1f insurance0s integrable0a integral2g integration3v intel0d intellectual0d intelligence3u intensity0b intention0j intentional0f inter0h interaction0i interest25 interferometer19 interferon0d interior0y intermolecular0a internal1w international3a internet13 internment13 interpolation0p interpretation1b interpreter1b intersection0b intersectional0e interstate0p interval0k intervention0c interview0a intestine1p intolerable0e introduction0h intron0n intuition0f invariance0b invariant0c invasion2o invention0x inverse23 inversion1x investigation0e invisibility0i invisible4h invitation0k iodide0d iodine29 iolaus0e ionesco3v ionian0l ionic17 iphigenia0r irelandby irene0r irony0x iroquois2l irrational0r irrawaddy0l irving3j isaac1h isabel0q isabella2l isaiah18 isaurian0d isherwood0p ishmael1i isidore0d ising1g islam63 islanddg islands2i islets0c ismail0l isoelectric0g isolation0b isomer1d isomorphism0e isostasy0g isothermal0b isotope1q israel6h issus0p italian4q italyf1 ithaca0u izanagi1h izanami0q jabbar0f jabberwocky0t jacinto0o jacket0h jacob28 jacobi11 jacobian0l jacobin0c jacobins0d jacobites0a jacobs1d jacqueline0b jacquerie0r jacques1b jagiello0a jaguar0r jahan0w jakob0m jakobson0k jaleo0c jamaica42 jamesjy jameson13 jamestown25 janissaries1h janus2b japanlr japanese5t jarry0b jason2q jeanne0m jeffers0e jefferson3v jelly0h jenkins10 jenner0f jenny0f jepsen0a jerry0g jerusalem5t jesse0k jester0f jesus8a jewel23 jewels0p jimmu0l jimmy0f jinnah0o joanna0i joaquin0a johann13 johnny0o johnsone1 johnston0q johnstown0c joker0l jonah1m jonathan10 jones96 jonson3n jorge0m jormungand0r jormungandr0g josef0l joseon1n josquin0q journalism0u journalist0f joust0a juana1b judah0s judaism28 judas23 judgement0h judgment2c judicial0h judith27 juice0f jules0h julia2n julian1y julie2e julien0c juliet3y julius3k jumping0y jungle3k junker0a junta0a jupiter5o juries0a justice4l justin0m justine0g justinian3y kaaba1a kabbalah1g kabila0c kadar0g kadare0a kaddish16 kadesh1s kafka6u kagame0b kalam0g kalidasa1m kalinga0q kaliningrad0f kalki0d kalmar19 kamakura1d kanagawa0k kandinsky1r kansas57 kanye11 kaposi0a kappa0q karakoram0e karakum0a karamazov27 karbala0e karenin0h karenina2r karlowitz0f karma1j karman0h karna0c karst0v kartikeya0j karyotype0c katanga0q katrina0p katyn0e kauffman0l kaufman0k kavanaugh0a kazakhstan1s kazan0s kazantzakis1h kearney0b keaton0j kebra0c keller0u kellogg0o kells0j kelly2h kelvin21 kemal12 keneally0v kennan0k kenneth0g kenning0c kente0c kentucky2s kenya5h kepler3l kerala0h kerensky0t kernel0z kerouac1i kerry0e ketone1a kevin0m keynes3v khaldun0n khali0g khalifa0h khartoum0k khayyam14 khrushchev1y khyber0g kidnapping0i kievan0e killed0i killer14 killing1q kills0c kilwa0k kinesin0c kinetic44 kings2n kipling3t kippur3g kirchhoff1k kirchner0m kirchoff0e kirkwood0c kishner0l kissinger0q kitchen1x kitchener10 kitsch0c kitty0q kleene0a klein34 kleine0f klimt27 knicks0a knife0u knight6w kochel0a kohlberg13 kondo0j kongo1b koniggratz0a konigsberg0m konstantin0g koolhaas0m kooning1u koons0r koreacv korean37 koresh0b korsakov3n koschei0b kosciuszko0l kosher0p kossuth0v kraken0j krakow0f kramer0g krapp0l krebs1o kreutzer0y kripke14 krishna3l kristallnacht0e kristin0f kroll0d kronig0g kronstadt0g kruger0w krupp0a kuala0d kubla1h kublai1s kuiper1n kumbh0c kundera32 kuomintang12 kursk0v kusanagi0f kushan0i kushner0s kutta0f kvasir0d kwanzaa0c kyoto1g kyrie0h laban0b laberinto0a labor4w labour2b labov0p labyrinth27 lacan17 lactate0e lactone0a lactose0q ladder14 laden0u ladon0d lagos10 lagrange2v lagrangian21 laika0d lakers0k lakes0m lakoff0c lakshmi18 lamar1e lament0t lamia0g laminar0u lancaster0o lancelot1p landau1u landing0k lands0b landscape2c lange29 lanier0e lanka4f lantern0n lanthanide1d laocoon18 laozi0t lapis0r lapith0j lapse0j lares0b large21 largo0g larry0c larsen0c laser42 lasso0a latent0k lateral0j lateran0p latin3v latour0h latter0v lattice24 latvia0k laughter0q laura1l laurence0a laurent0n laurier0l laval0h lawrence82 lawyer0o layer26 layla0d lazarillo0q leach0c leader0j leading1j leakey0e leander0e learnd0e learned0w learning1g lease0c least0v leave0k leaves34 leaving0h lebesgue0n lebron0j lechfeld0b leech0d lefty0n legal0b legba0r legend1t legendre0s legends0w leger0f leibniz3p leibovitz0n leiden0d leigh0p leisler0f lemma0c lemnos0f lemon0p lenin2g lennard0x lennie0c lennon0n lenore0a lensing0p leonard0s leonardo2b leonardoda0h leone15 leopard18 leopardi0m leopold2p leptin0d lepton0i lerner0d lesbia0m lesbian0j leskov0c lesser0c lessing1y lesson2d lethal0a lethe0g letter7i level18 leveller0c lever0l leverkuhn0b leviathan3e levin0c lewin0g lewinsky0a lewisbn lexington0f leyster0f leyte0c lhopital0e liaisons0h libation0h libel0j liberal31 liberalism0b liberation1m liberator0a liberia1s libertarian0e liberty6c libeskind0a libraries1f libya2d license0c lichtenstein1z lieberman0a liechtenstein0f lieder0b lienard0c lieutenant0y ligase0n ligeia0f lightdm lightning2n likud0a lilies0t lilith0f liliuokalani0f lilliput0g limbic0b limbo0d limit2h lindsay0x linear4i lines0t linga0a linkage0w linked17 linus0d linux0k lions0k lipid0z lippi0i lippmann0d lisbon2k liszt5d literary0b literature13 lithuania24 lithuanian0i litovsk0t lived0r liver3m lives1w living12 livingston0a livingstone0j livonian0e lizzo0a llywelyn0c lobby0j lobos13 local18 locke5i locking0b locus0d locust0v loess0f loftus0l logan0v logarithm0n logic2x logico10 logos0i lollard0k loman0m lombard1o londong6 lonely23 longer0u longue0b looking29 lopez2b lorca5k lorde1a lords0o lorelei0g lorentz3u lorenz1s lorenzo10 lorrain0o lorraine0p loser0b losing0a lotka0s lotus35 louhi0a louisht louisbourg0a louise0i louverture13 louvre1n loved0h lover2r lovers15 loves0j loving14 lower1b lowry0v luanda0f lubeck0r lucan0i lucas1i lucia1b lucian0i lucifer0j lucinda0p lucky1h lucretia0f lucretius0l ludendorff0a ludmila0b ludovico0e lukacs0a lullaby0l lully11 lunar0h lunch0u luncheon20 lundy0e lungs0a lupus0o luria0m lushan10 lusiads0y luther4s luxembourg0v luxemburg0f lydia14 lying0t lyman0k lynch1j lyndon0m lyotard0e lyric0w lysippos0h lysis0h lysistrata1b lysosome2d lytic0e lyudmila0a maasai0k mabinogi0c mabinogion0p macau0n macaulay0c macaw0g maccabees0c macchu0f maccool0n macdonald29 macedon1i macedonia0r macedonian0e machiavelli2m machina0g machine5y machines0g machu15 mackenzie1e macmillan10 macondo0w macquart0h macron0y macula0f macular0d madama0o madame4w madden0m madding14 madeleine0a mademoiselle0i madero0r madison2j madman15 madras0d madrid1t maduro0p maesta0b mafia16 mafic0c magazine0h magdalena0b magdalene12 magellan1e magellanic0l maggie1b magic8s magma0v magna22 magnesium2s magnet0q magnetica7 magnetism0g magneto0b magnetohydrodynamics0e magnificat0c magnificent15 magnum0a magnus0x magpie0e magyar0o mahabharat0f mahabharata25 mahal12 mahavira14 mahdi14 mahfouz46 mahler66 mahmud0a maiden1j maids0o mailer18 maillard0h maine47 mainz0e maize1m major6q making0l malachi0c malaria28 malay0h malaysia2d malcolm25 maldon0f malevich0r malfi0l malinowski2w malley0a malone0e malta2w maltese0r mambo0e mamet1o mamluk1g mammal0c manager13 manaus0k manchester1p manchu0w manchuria0w manco0i mandaeism0a mandala0v mandalay0e mandela2j mandelbrot0r mandelstam0f mandolin0g manet2s manga0d manganese11 mango1a manhattan2c manichaeism17 manifest0o manifesto2p manila1h manitoba0y mannerheim0q mannerism1o mannheim0o manning10 manon0d mansa0g manse0d mansfield3k mansion0o manson0b mantel0y mantinea0c mantle2t mantra0n mantua0g manual0c manuel0l manzikert0j manzoni0e maori4k maple0z marat1s maratha0w marble1p marburg0l marbury16 marcel0h marcellus0r march6e marche0g marco0r marcos1d marcus35 marcuse0r marcy0a margaret2f margarita21 margin23 marguerite0c maria4g marian0c mariana0n marianne0a marie31 marijuana0s marin0b marine0j mariner23 mariners0e marino0i mario1y marion0h marius1e market2u markov1z markovnikov0r marley0p marlow0h marlowe3k marne0p marner17 maroon11 marquez4o marquis0a marriage6y married0e marrow0m marry0f marsalis0p marseillaise0g marsh13 marshall47 marshmallow0m marsupial0h martel1k martha14 marti1t martial13 martian0t martin5o martinez0g martinique0d martyr0g marvel0c marvell2q maryam0a maryland1z masada0j masaryk0d maser0a masks0s maslow23 mason27 masonic0i masque0v massachusetts4j massacre3p masses0f massif0b massive0d master7d masters15 match0v mater0r materialism0h mathematica0z mathematical0c mather0s mathis0f matilda1h matisse2o matrix44 matsuo0p matter42 matthews0c matthias0p matzo0b mauberley0f mauna0j maupassant4a maurice19 mauritania0i mauritius0u maurya20 mauryan0f mausoleum0e maxim0b maximilian1q maximum0r maximus0n maxwell61 mayakovsky0f mayan0j maybe0a mayer0b mayor2z maysville0a mazarin0r mazda1c mazurka0q mazzini0q mccain0v mccarthy4z mcconnell0g mccormick0c mccullers17 mcculloch0o mcdonald18 mcgee0a mckay13 mckinley23 mcmahon0e mcpherson0i meade0k meaning10 means0h meany0b mecca2i mechanical1e mechanics0b mechanism0i medal0g medea2y medellin0d medes0b media0t median14 medical0g medici38 medicine23 medina19 meditation1b meditations27 medulla0i medusa3s meeting0h megan0c mehmed17 mehmet0f meier0b meiji3q meissner16 meister0o meitner0e melancholy15 melanchthon0g melanin0l melanogaster0h melatonin0j meleager0r melencolia0g melisande0i melisma0a mellon0i melos0g melting1c melville4c member0e memnon0j memoir0a memoirs0q memorial15 memoriam0v memories0f memory67 menace0f menander0t menard0b menchu0d mencken0n mendel1e mendeleev0w mendelssohn5u mending0x menelaus0q mengele0b meningitis0c menshevik0d menstruation0b mental0x menten14 mephistopheles0h merci0g mercia0r mercutio0d mercy0i merge0n merger0c merisi0h merkel13 merlin1h merode0b meroe0g merovingian16 merrill0l merry15 merton1l meselson0o meson19 mesopotamia0v mesozoic0g message0g messenger15 messiah2p messier0m messina0e metabolism0a metal2r metallica0g metalloid0a metamorphic0j metamorphism0f metamorphoses0v metamorphosis31 metaphysical0z metaphysics1p metastasis0j meteor0j meter0d methane26 methanol0i method2r methodism15 methodist0c metis0s metric15 metro10 metroid0b metronome0c metropolis0x mexican43 meyer0e micelle0x michael50 michaelis15 michel0g michelangelo4h michelin0a michelle0a michelson1k mickey0n micro0e microscope11 microscopy1d microsoft0q microstate0f microwave2m midaq0d midas1c middle39 middleton0f middletown0h midgard0p midlothian0h midsummer2l midway1c might0c mighty0q mikhail0o mikrokosmos0h mikveh0a milady0c milan2x milankovitch0a miles1w miletus0l military1n milky1t millais11 millay2d mille0l millennium0n miller8n millet1c millikan0i million11 millionaire0c mills2i milosevic14 milosz0b milton4x mimic0c mimir0g minaj0h minamoto0g minas0f mindanao0g minds0k miner0y mines0a mingus1i minimal18 minimalism1q mining16 minister30 minkowski0w minoan19 minor50 minos17 minuet11 minus1f minute0r mirabilis0b miranda1x miriam0k mirth0x misanthrope0l miser0k misfit0e mishnah0d missa0f mississippi67 mississippian0e mister0b mistral2k mistry0b misty0d mitch0a mitchell1l mitford0h mithra0k mithras0p mithridates0w mitochondria40 mitochondrial0d mitochondrion15 mitre0a mitterrand13 mitty0l mixed0i mixing0p mjollnir0h mjolnir13 mobile1e mobility0f mobius1p moche0e moctezuma0h modal0m model3a moderator0a modern41 modernism0d modernismo0g modest1d modular0a modulation0a modulus1v modus0g mohammad0b mohammed0e mohism0g moivre0f moksha0s molality0h molar0k molarity0c molecular4y molecule0a molina0d mollusc0a mollusca0y mollusk0b molly0t moment6c monaco0n monad0y monarch0n monarchy0b monastery0c mondale0d monde0b monet2s money4w mongol35 mongolia1s monism0k monitor0c monkey5u monkeys0b monks0b monoamine0a monopole1h monopoly21 monopsony0i monroe3j monster2c monsters10 montage0b montagu0l montaigne14 montale0i monte3r montenegro0a montesquieu1i monteverdi2w montezuma0m month0c monticello0c monty0n monument0r moons0n moonstone0u moore63 moose0a moraine18 moral30 morales0h morality17 morals12 moran0c morant0b moravia0h mordred0u moreau12 morel0d morgan4u morley1l mormon54 mormons0b morning2j moroni0t morricone0g morrill0f morris1v morrison46 morse0z mortal0f morte0d morton0p morty0b mosaic26 moseley0d moses58 mosley0f mosque24 mosses0a mosul0b motet1c mother8s motion30 motivation0d motors0k mound0t mount46 mountaincu mountains16 mourning1d mouse2p mouth12 moveable0c movement1s movie1b movies0c moving0j mower0e mozambique1v mtsensk0d mubarak0f mucus0i muerte0b mughal42 muhammad55 muisca0d mukherjee0h mulan0g muller1u mullerian0h mullerin0b mulligan0i mulliken0b multi0b multiple1j multiplication1i multiplier0q mumbai0w mummies0i munch2w mundi0f munich26 munro21 munster0f murad0h mural14 murat0a murder3k murders0w murdoch13 murillo0e murphy0o murray1l murti0a musee0k muses10 music7w musical1a musicians0d musil0b musket0p mussorgsky1z mutation1o mutiny0s mutual0q muwatalli0a myanmar33 mycenae12 mycorrhiza0h mycorrhizae0a myers0r myron0g myself1i mysteries1a mysterious0v mysterium0c mystic0o mythologies0g nabis0g nabokov3t nacht0f nadar0e nader0i nadir0c nafta0o nagast0b nagel17 nahuatl0k naked1m named29 names1d namib0j namibia17 nanak1f nancy0o nanjing12 nanking0t naomi0d naples25 napoleon96 napoleonic0a narayan0x narcissus11 narmer0g narnia0n narrative0z narrator0t narrow18 narva0a nasser25 nation3y national8q nationalism0e nations46 native49 nativity0j natta17 natty0i natura0c natural5a naturalism0h naturalist0h nature3n nauru0f nausea0y naval0b navarre0w navas0m navier2h navigation0j navigator14 naxos0l nazca1a neanderthal0q neapolitan0b nebula1q necessary0i necessity12 necrosis0d needs0p nefertiti0u negative4o negev0d negligence0a negro1j neighbors0b nelson22 nematoda0t nematode0b nemean0w neoclassicism0p neoptolemus0j nepal1k nephthys0g nerva0c nessun0m nessus0f nestorian0m netflix0r netherlandish0d netherlands7y neural1k neuron2h neurons0d neutral17 neutrality0n neutrino4w neutrinos0c neutron5a never2x newman1z newsom0e newtonian0x niagara1a nicaragua3d niche0t nicholas3q nicholson0c nicolas0a nicomachean0x nicopolis0a nicotine0j nidhogg0q nidre0j nielsen1b nietzsche5a niger1k nigeria8u nigerian0b nightp4 nightingale36 nightmare11 nights46 nigra0f nihon0h nijinsky0q nikolai0o nimrod0j nineteen1d nineteenth0f nineveh12 ninja0m nirvana1v nitrate0m nitride0b nitrile0l nixon56 nobel2o noble3x noche0b nocturne1m nodes0a noether1k noise2l nolan0l nolde0d norma0n normal5x norman1v normandy1m norse0h northea northumbria0k northwest1x norwegian11 norwich0a nostra0a notes1s nothing3b notochord0d notre3h notting0e nouveau13 novel2g novella0a novels0o novum0j nsaid0a nubia0p nuclei0z nucleic0a nucleolus0n nucleophile0f nucleophilic0g nucleotide0t nucleus4c number67 numidia0d nuova0f nuremberg1c nurse0l nutation0d nyame0j oasis0b oates1e obama26 oberon0d obrien1v obscene0e obscure19 observatory0l obsessive0c occitan0g occupation0r oceanic0a oceanus0d oconnell0f oconnor47 octahedral1b octane0b octave0i octavian0a octopus11 odessa0h odets0t offering0w office24 officer0c ogden0k ohara0x ohlin0j oisin0d okazaki0q okeeffe23 oldenburg0v olduvai0k olefin0k olenska0c olive1h oliver2o olivier0c olmsted0q olorun0h olson0h olympia1t olympic27 olympics12 omega14 oneal0d oneill4c onion0s online0h operating0j operation0p operational0i operon1e opium2y oppenheim0b oppenheimer1r oprah0j optical1y optics0g optimal0b optimism0b optimist0a option0p orange5x oration0f orban0e orbis0h orbit1g orchestra25 order59 ordinance0g oregon35 oresteia0i organ4v organization1b organon0c orgaz15 orientalism0p origen0b origin1m orion2f orisha13 orlov0g ornans0j orphan0k orphism0p orsini0b orthodox1o osaka0n osborne0l oscar1x osceola0p oscillation15 oscillator35 oskar0s osman0a ossian0f osteoclast0c ostwald19 oswald0v otello0b othello1v other2z ottawa0p otter0a ought0a outer0w outsiders0g overture3o owens0a oxford34 oxidation2x oxide1t pablo0w pachacuti0e pacific4r pacifico0c pacis0a packers0f packing0j padua0d pagan0n paganini30 pagliacci18 paine1a paint0u painted0c painter1f painting29 paintings0q pairs0d pakistan4e palace38 palatine0h palestine0v palestinian0m palestrina29 palette0b palin0d palladio0v palladium1u palma0b palme0p palmer12 pampas0c panama3y panay0a pancreas1r panda0x pandava0c pangu0c panic25 pankhurst0z pantagruel0s pantheism0d pantheon0p panther2o panthers0l pants0b panza0w papal0o paper34 papers1i papua12 parabola1u parabolic0a parade0t paradigm0h paradise4k paradiso0k paraguay2d paramagnetism1a parameter0o paramo0f parana0h parasite0s parasitism0v parent0b parents0j parisf0 parity12 parker4p parks1z parliament22 parma1b parmigianino10 parnassum0d parnassus0m parnell12 parrish0e parsifal0i parsing0c parsley0f parson0e parsons19 parte0a parthenon1m parthia16 parthian0e partial14 particle2w parties13 partita0d partition39 parts0j party8k parzival0a pascal43 pasha0g pashtun0g pasiphae0c passage2g passing0h passos10 pastoral24 patagonia12 pataliputra0a patch0o patel0a patent0k pater0c paterson17 paths1h patient0z paton1v patriarch0m patrick1o patriot0e patriots0p patroclus0o pattern0t patton0v pauli31 pauling1j paulo0z pauper0b pavarotti0f pavia0q pavilion1h pavlov17 pavlova0i paxton0g payne0n pazzi0m peace5t peach1j peaks0g peale0l peano0f pearl6h pearson11 peasant1g peasants1s pecos0h pedal0e pedro35 peele0i pegasus1j peirce1s peisistratus0b peking0c peleus0l pelli0d peloponnesian2h penal16 penderecki13 penguins0g peninsula0i peninsular0n penny0o penrose0i pentagon0x pentatonic0o pentecost0w pentecostal0u penthesilea0g pentheus0c pentose0h penzance0n peopleam pepin0r pepper0s pepsi0d pepsin0c peptide0v pepys10 pequod0a pequot0m perce0h perception14 perceval0i percival0k percussion13 percy1e perec0e perez0k perfect3e pericles23 pericyclic0a periodic1o peripatric0a perkins0r perlman0i permanence0k permanent0a permian0x permutation17 peron2m perot0o peroxide2b peroxisome1g perpendicular0p perpetual0n perry2a persecution0d perseus31 pershing0v persia23 persian4j persistence16 person2s persona0i personal0w persons0e persuasion0m perth0i perun0z peterbl peters0b petersburg2o peterson0p petit0p petition0m petra0n petrarca0e petrarch3x petri0k petroleum0q petronius0h petrushka0w phaedo0x phaethon0n phage1i pharaoh1g pharsalia0b pharsalus0g phase6s phedre0g phenol19 phenomenology2g phenotype0e phidias14 philadelphia6d philip9r philippe1j philippine0b philippines7f philistine0c phillies0h phillip0j phillips1h philonous0i philosopher13 philosophers0p philosophical1b philosophicus11 philosophy3t phineas0g phoenicia0x phoenician0q phone0u phonology0a phonon1o phosphate2p phosphine0b phosphorus2j photo1n photoelectric24 photograph0i photographer0e photography15 photon3z phrygian0c physics0q piaget39 pianokk piazza0i picard0b picaresque0w picchu1k pickett0h picking0c picot0l picture24 piece0n pieces0u pierce10 piero0v pierre1x piers0p pieta1c piety0w pigeon10 pigeonhole0k piggy0k pilate0p pillar0t pilot0o pincher0c pindar16 pineal0l pines11 pinker0v pinter4i pious0e pipeline0k piper0c pippi0a pirandello36 pirate2h pirates17 pirithous0m pissarro0l pistons0b pitch0q pitcher0k pittsburgh2u pixar0b pixel0d pizan0l pizarro18 pizza0i place23 places0l plague3k plain0t plains0t planar1m planck3x plane2z planet2p planetary0i planets2f plant1i plantation0l plantinga0n plants0c plasma56 plasmid1q plasmodium0m plasmon0i plastic1h plasticity0g plata0x plate25 plates0f plath4v plato3v platonic0i platonism0d platt0i platyhelminthes0m plautus1c playboy16 player12 players0q playing0n playstation0g pleiade0b pleiades0t plein0c pleiotropy0b plessy0y plowman0n plurality0a pluripotent0a plutarch0m pluto1r plutonium0c pocket0f poems1l poetica0k poetics0y poetry2l poets0i point8i pointe0r pointed0c pointer11 pointillism1k points0v poiseuille0q poison1k poisson33 poker1i polar2b polaris0c polarizability0g polarization30 police2u policeman0d policy0k polio16 polish2n political0p politics1f politicus0l polka0h pollen0t pollock3l polonium0a polonius0c polykleitos0f polymerase1k polymerization0z polymers0b polymorphism0r polynesia0c polynesian0a polyphemus12 polyphony0t polyploid0b polyploidy0d polyprotic0d pomerania0b pomona0a pompadour0e pompeii19 pompey1e pompidou16 ponce0h pontchartrain0b pontus0d ponty0u popish0g popol13 poppea0i popper1q poppy0a popul0i popular12 populist0z porgy16 porifera16 porphyria0g porphyrin0o porphyry0r portal0p porter1y portia0d portland1a portman0a portrait6s portraits0j portuguese3f position15 positivism1h positron1k posner0h possessed0g possession0r possibility0d postal0n poster0f posthumous0e postman0d postmodern17 postmodernism0j postulate0c potato3v potemkin1b potlatch0p potok0c potter0t pottery12 powder0g power9f poynting1l practical0g practice0e prada0i prado0i praetorian0n pragmatic0w pragmatism3k prague62 pratt0c pravda0d prayer39 praying0d precession2e predation0c predator1e predators0a prediction0c prefer0o preference0b pregnancy0w prelog0e prepared0i presence0c present0f presentation0k president3v presidente0f presidential17 presley0b press1a pressburg0d pressure9c prester0m pretoria0c pretty1c priam0j price3h pricing0b pride30 priestley0l prima0b primate0a primavera0y prime7l primer0p priming0b primitive1b primo0j prince7z princes0f princess1t princip0g principal0x principia1l principle2l principles0k print0v printing0t prion1c prior0o priori0m prism0o prison79 prisons0a private1b prize0k probe0c process1l processing0c procrustes0k proctor0d producers0a production20 profane0x profession0l professor13 profit0f program0r progress2x progressive10 project24 projection0s projective0g prokofiev43 prolactin0d proline0z prometheus3e promoter0e propagator0c proper0h propertius0k property16 prophet1k prose0s proserpina0a prospect0v prosperity0b prospero0i prostate0k protease0i proteasome0f protecting0h protection0u protest0d protestant1e proteus0i protist0d proto0z proton3w proud0o proudhon0e proust2h providence0f prussia1z prussian2g psalms16 psyche1o psycho1k psychoanalysis0e psychology0s ptolemaic0a public3d publius0b puebla0h pueblo1l puerto3a pugachev0t puget0f pulitzer1g pulley0p pulse0t punch0u punic2o punish0w punjab0i purana0c purcell2f purchase10 purgatorio0h purgatory0a purge0c purim2d purine0c puritan0o pushkin48 putin1a pylori0j pylos0a pynchon36 pyramid31 pyramidal0f pyramids0i pyridine0k pyrimidine0e pythagoras1s pythagorean1h python20 qaeda0p qatar0u qianlong0g qibla0h qizilbash0b quadratic1h quadruple0a quadrupole0i quake11 quaker1q quakers0k qualities0j quantifier0e quantitative0r quarter0o quartet7b quartets1e quartz30 quasar1p quasi10 quechua0b queen73 queene19 queens0e queer0l quest12 questions0b quetzalcoatl3q quiet3r quilt0x quince0a quincey15 quincy0d quine2t quinine0m quinn0f quintet1m quipu0h quixote6j quran3j rabbi0p rabbit48 rabies0w rabin0j rachel0x rachmaninoff3w rachmaninov0d racine1u racing13 racket0c radcliffe13 radetzky0e radial0n radiation2q radical46 radio4m radioactive0d radium0g radius2d raffles0a rahman0j raiders0e rainey0o rainier0c rains0a rainy0b raisin34 raising0v raleigh0z ramadan2r raman22 ramanujan0g ramayan0a ramayana1g rameau1i ramesses18 ramona0a ramsay0s ramses1k ramsey0u randall0d random32 range0z ranger0k rangers0k rankin0b rankine0l ranks0a ransom1b ranvier0a raoult23 raphael4c raphaelite2p rapid0a rappaccini0w rapture0e rashi0d rashid0l rastafari1o ratatosk0g ratchet0j ratio26 rational2m rationality0c ravana0p ravel53 raven45 rawls2f rayleigh34 raymond0n reactance0a reaction3b reactor0o reader0x reading2c ready0d reagan3j realism4h reaper0b rebecca1c rebel0j rebellion2l receptor0r recession0n recessive0j reciting0i reconstruction2c record0n recovery0l recreation0a rectification0d recurrence0e recursion1p recursive0j redcrosse0e redemption0c redon0g redox16 redshift1i reduced0e reduction34 reference0z referendum0a reflect0a reflection39 reflections0h reflex0c reflux0k reform1u reformation11 refraction48 refractive0o refrigerator0k refugee0f regeneration0a regia0h regina0e regionalism0b register0t regression1n regular17 regulation0d regulator0d reich2f reign0e reinhardt0i reiter0q relation0m relations0z relative0g relativism0m relativity5t relaxation0n release0b reliance0q relic0e relief0p religion2f religious13 remains0x rembrandt4k remembrance0b remington0r remote0f removal0i remus11 renaissance2z renin0a renoir2c reparation0a repeat0c repetition0a repin0x replication22 report16 representation17 reproduction0o republice8 republican23 rerum0n reservation11 reserve1i residence0d resident0i residential0e resignation0a resistance4a resolution0v resonance4x respiration0g response0p restitution0l restoration24 restriction1h resurrection1p retention0m reticulum2u retina1s retrograde0f revelation2n revenge0k revenue0b revere1n reversal0x reverse27 revisited1c revolt2i revolts0c revolutionfd revolutionary1j revolutions0t reynard0a rhapsodies0j rhapsody32 rheingold0h rhetoric0r rheumatoid0j rhine2d rhino0g rhode24 rhone0c rhyme0q rhyolite0d ribbentrop0f ribera0e ribosome2b rican0e ricardo2j ricci0s richard8s richards0c richardson1l richler0d richter1b rickshaw0a riddle0o rider21 riders1o ridge1y ridgway0a riding0m rienzi0e rifle0e right52 rigoletto1o riley12 rilke4v rimsky3q rings1f riots0k ripper0h rises1s rising1q rivals0l riverd9 rivera3e rivers1s rizal0s roach0d roads0z roaring0l robbe0a robben0e robber0j robbers1r robbery0b robbins0g robert5z roberts0s robertson0f robeson0e robie0b robin1t robot2j robots0b roche0p rocket2e rockets0f rocking1c rocks0l rocky1h rococo2k rodeo0p roderick0j rodgers0w rodin3p rodion0e rodriguez0e roger1k rogers26 rogue0a roland3g rolfe0c rolle0f roller0b rolling1e rollins0h rollo0f roman5i romance3y romania52 romanian0b romano0n romanov0z romans17 romanticism0r romeo40 romero0a romney0m ronald0z ronaldo0e rondo12 ronin0j rooms0d rooney0d rooster0l roots0r rorschach0n rosary0p rosas0j rosencrantz1s rosenkavalier0p roses25 rosetta0s rosie0l rossetti2o rossini2n rostam0j rotation34 rotten0l rouen0m rouge20 rough0s rousseau5b route0i rover0h rowlandson0f rowling0e roxana0b royal4f royale0k royce0k rubaiyat2r rubber2a rubens2y rubik0f rubin0k rubinstein0i rublev0a rugby0l ruins0n ruisdael0g rules14 runaway0l runge0p runner2k rupert0b rurik0t rusalka0d rushd0c ruskin15 ruslan0n russell86 russes0g russiads russian4o russo1g rustin0a ruthenium0c rutledge0c rwanda1y rwandan0o ryder0l ryukyu0h sabato0a sabbath0t sabine1n sabrina0b sacagawea0h sacco0w sachs1v sacks0a sacrament0f sacramento0s sacraments0a sacred24 sacrifice21 sadat0x saens3d safavid24 sagan0g sahara2l sahib0h saigon0l sailing0u saintdr sainte0k saints1r sakharov0g salah0q salamis1e salat0z saleem0k saleh0a salem1b salesman3x salic0j salicylic0f salieri0x salinger32 saliva0l sallust0h sally0g salman0g salmon1i salome1p salon16 saloon0f saltation0f salton0b salvador2a salvation0k samaritan11 samarkand1f samarra0f samba0a samberg0c samoa21 samos0b sampo0f samsa0j samsara0w samson1t samuel23 samuelson0x samurai24 sanatorium0e sancho1e sanction0v sanctuary0a sandal0h sandburg1k sanders1k sandinista0k sandman0y sands0n sandstone0a sandy0n sanger16 sangha0c sankara0g santa44 santayana1v santeria24 sapir1l sappho3w sarabande0f sarah14 sarasate0i saraswati0i sardanapalus0w sardinia16 sargasso0x sargent2a sargon1h sarin0a sarmiento0e sarto10 sassanian0b sassanid1h satan26 satie2h satire11 satori0a satrap0d satyagraha0l satyr0v satyricon12 saudi28 saunders0p sausage0c savage1q savannah1a savart0p saved0d saving10 savonarola19 savoy1k savoye0c saxon11 saxony0p scala0e scalar0j scale1g scalia0d scandal11 scanning0m scare0f scarlatti1t scarlet3f scarlett0b scathach0a scatter0j scattering37 scene0u scenes0f schechter0g scheherazade1r scheherezade0h schelling0p schenck0n scherzo0n schiele0e schiller32 schindler1i schism0r schizophrenia1o schlenk0e schlieffen0i schliemann0e schmalkaldic0b schmidt0y schmitt0o schoenberg44 scholasticism0d scholes0h schone0b school9f schopenhauer3a schroder0d schrodinger4g schubert5t schulz0h schuman0c schumann5l schutz0b schwartz0q schwarz0j schwarzschild18 scientist0g sclerosis0t scoop0e scopes11 score0v scorpion0n scotia0n scots0x scott7y scotus11 scout0g scrabble0a scream2b screen16 screw1o scrivener0t scroll0t sculpture0b scythian0k scythians0a seafloor1b seamus0c seance0b search5l searle0y sears0b season2j sebastian1h secession0n secondk3 secondary17 seconds0d secret38 secretary2k section1p secular0i securities0h security1q sedan0p seder0q sedgwick0d sedition0t sedna0t seeger0a seeing0d seine0d seinfeld0j sejanus0f sekhmet0p selection2m selena0b seleucid0r selim0o seljuk0y sellars0q selma0j semantics0d semele0n semiotics0e semitic0d senate0z sennacherib0o senor0d sense4c sensibility1g sensing0v sentences0i sentimental12 sentiments0p separate0i separation0v septimius0m sequence2b sequoia0d serbia1g serfs0e sergei15 serial0o serine0q serotonin1t serpent2u serra0u service2i servius0a sestina0g seuss0k sevastopol0l sevenc1 seventeen0g seventh2b severan0f severn0a seville25 seward1i sewer0v sextet0a sexton0w sextus0q sexuality0h shabaab0e shabbat0w shade0e shades0g shadow2c shaffer0h shahada0r shahadah0c shahnameh1e shaka1s shake0d shaker0g shakers0f shakespeare5z shakti0a shakuntala0r shale0v shall12 shalott0m shaman16 shamash0f shame0o shandy1k shang1h shanghai20 shankar0f shannon0v shanter0c shaolin0f shape0t shapiro0m shapley0c share0a sharer0e sharia1a shark3m sharon0g sharp1q sharpe0b sharpless0h shavuot0l shays13 shear11 sheba0p sheep2a sheet10 shell2e shema0f shepard15 shepherd2g sheridan1r sherif0h sherlock26 sherwood0j shielding0a shift2w shiloh1h shine0c shining14 shinto43 ships0o shipwreck0p shire0a shirk0i shirt0n shiva4m shivaji0e shock26 shockley0b shoes0m shofar0o shogun12 shoki0d shona0l shoot0y shooting1f shore1f short2j shorter0c shortest0m shoshone0h shostakovich54 shotgun0g shout0b shower0e shrek0a shrew0z shrine0k sibelius47 siberia1n siberian0c sibyl0q sicilian11 sickle1e sickness15 siddhartha1p sidgwick0f sidney1i siege1e siegfried18 siena1b sienkiewicz0v sierpinski0i sierra1x sieve0s sight0a sigismund0r sigma1w sigmund0e signac0l signal0u signature0a sigurd1d sigyn0a silence21 silent3b silica0e silicon3b silko0d silla0x silver6u silvia0p simbel0f simmel0u simmons0m simnel0b simon3y simone0r simons0a simple2s simplex0c simpson1t simulation0b simurgh0d sinai12 sinbad16 singapore38 singer3n singh1b singin0c singing12 single1c sings0w singularity0p sinking0p sinners0j siren0m sirens0d sirius0p sisley0d sister1k sisters21 sistine21 sisyphus2d sitting0n situation0d sixteen0a sixteenth0e sixth10 sizwe0b skadi0p skanderbeg0h skating0n skeleton10 skeptic0i skepticism1c sketches1i skinner24 skull2o skunk0j slater17 slaveac slavery2l slaves0t slavic0f slayer0h sleep3h sleeping25 sleepwalk0e sleepy12 slide0b slime0f sloan0c slope0r sluys0b small5i smart0i smash0p smashing0b smell0i smetana21 smile0f smiley0c smiling0c smithd0 smoke0n smoking0r smoky0b smollett0t smoot0y smooth0z smuts0e snake5r snakes0f snare0s snark0d snell24 snowball0i snowden0q snows0i snowy0p soames0e sobek0v social7s socialism10 socialist1g society5p sociological0k sociology0p socotra0c socrates3t sodom0r sofia0b solar37 soldier3v solenoid0l solid13 soliloquy0d solitary0d solomon4n solon1d solow0n solubility1e solution0t solvation0d somali0a somalia25 something0p somoza0k songhai2b songs3m sonic0v sonnet57 sonny0d soong0d sophia19 sophie0f sophist0k sorel0l sorites0c souls2b sousa1i southern2o southey0j sovereignty0g space7o spaceship0a spacex0a spade0f spades0q spainh9 spangled0l spanishct spanning0n spark0t sparta3w spartacist0b spartacus21 speak0u speaker10 speaks0e spear2e specific1t spectator0i spectral0r spectrometry0k spectrophotometry0h spectroscopy0z speeches0a speed7j speer0c spelling0g spencer1h spenser1w spherical19 sphincter0d sphinx15 spice0v spider5a spiegel0b spike0i spill0b spinal0i spine0b spinning0q spinoza3u spiral2h spirited0d spirits2x spiritual18 splicing16 split0m splitting0k spock0h spoke0l sponge0k spoon1f spore0e sports0j sportsman0m sprach16 spratly0b spreading19 springd3 springfield0l springs0z sprung0k spurs0k squad0o square9z squared1x squares0f squid15 srebrenica0f stability0r stable0p stack2a stacking0a stadium0s stael0a staff0r stage1l stages0k stagflation0c stagnation0a stahl0q stain0v stair0d stalin40 stalker0a stamen0m stamford0p stamp1d stand15 standard4s standing15 stanford48 stanislavski0b stanley23 stanton17 staph0f starch0g stark1d starr0f starry1c stars2a start0h starving0k statefo staten0b statescx static10 station2n stations0a statistics0e statius0h statue1v status0a steady0w steal0n stealing0i steam1g steel4o steele0a steelers0d steen0g steerage0d stefan0o stefano0c stegner0d stein2b steinbeck3c steiner0e stella1e stellar0g stendhal22 stephen4v stephens0d stephenson0c steppenwolf1m steps0x sterilization0c stern1i sterne0v steroid0p steven0g stevens53 stevenson3g stewart1c stick0n sticky0b stieglitz2g stiglitz0o stigma0j stijl1f still1x stilwell0b stimson0p stimulated0b stirling0z stock16 stocking0a stoic2e stoichiometry0i stoker0m stokes4m stokowski0f stolen0r stoma0f stomata0e stone7o stones0x stoning0h stono0i stool0t stoops17 stopping0o store0j stories1y storm2d storming0c stormy0h story6a stowe1n strabo0c straight0i strain1w strait10 strand0g strange36 stranger3p strasbourg0m strategic0i stratosphere0x strauss9l stravinsky56 straw0i stream3d strecker0g street7c stress42 strict0c strike3b strikes0k strindberg3d stringb5 strings12 strip1g stripes0d stripped0d stroke0g strong40 stroop0i structural0x structure39 structures0j struggle0e stuart1w studies0k study0y stuff0l stupa0i sturm1c style19 styles0e subduction1e substance0c substantia0e substitute0a suburb0b succession5g suckling0j sucre0n sucrose0a sudan36 sudetenland0b sufficient0s suffrage2f sufism0g sugano0f sugar4c suite1t sukarno1i sukkot1k suleiman1n sulfate0o sulfide0g sulla1c sullivan3m sultan0u sultanate0b sumatra0p sumer0s sumerian0i summa1g summer3o summers0c sumner1m sumter0l sunday4p sunnah0c sunni0z sunny0e sunset0j sunstone0z sunyata0a super2l superbus0o supercell0i superconduct0b superconductor28 superfluid1q superfluous0i superior0v supernova2h superstar0c supersymmetry0u supper42 suppressor0i supreme2p surah0d suriname0n surprise0y surrealism29 surrender0l survey0f surya0l susan0q susanna0i susanoo1u sutherland0e sutra22 sutter0e swahili1b swamp0g swann0x swans0q swastika0e sweat10 sweden8r sweep0n sweeper0f sweet19 sweyn0e swift4v swimmer0g swing37 swiss0q switch0x switching0o switzerland62 sydney2d sykes0o sylow0a sylvester0o sylvia0c symbiosis0b symbolic0q symbolism19 symmetric13 symmetry2f sympatric0a symphonic0o symphonie2j symphonies3o symphonyba symposium1r syncretism0e synge0x syntactic0d synth0e synthase0o synthesis15 synthesizer0e synthetic0u syracuse15 syria27 syrian0d table4g tables0a tablet0m taboo0q tabula0m tagus0e taiga0m tailleferre0f taino0o taiping1j taisho0e taken0y taking0d taklamakan0f talas0e talent0b tales6d taliban0t taliesin1k talking0i tallis1n talmud1l talos0l tamar0g tamburlaine0i tamerlane19 tamil2u taming0z taney15 tangent0r tango1k tanka0c tannenberg0i tanner0g tantalus18 tantra0g taoism12 tapestry12 tarantino0h taras0h tarkington0h tarkovsky0m tarleton0b tarot0g tarquin0q tarquinius0n tarski0w tarzan0g tasman0s tasmania17 tasso0g taste0w taurus0n taxes0e taylor5q teacher1p tears1l tectonic0f teeth3d tehran0r telegram0k telegraph0r telemachus0u teleological0d telephone0f teller1t telomerase0k telomere1g tempera0h temperance0r temperature8h temple6l temples0a tempo0e temporal0g temptation0x tenant0i tender10 tenebrism0e tengri0m tennessee35 tennis2f tenor17 tensor1l tenth10 tenure0e terence1i teresa13 terminal0t termination0f terra0u terror11 terrorism0a terry0f tertius0k tertullian0l tesla19 teton0a tetrahedral1g tetrahedron0b tetris0g tetrode0g tetroxide0c teutoburg0f teutonic1e tewkesbury0b tewodros0a texas7k tezcatlipoca1u thackeray1h thais0c thaler0b thales15 thames1n tharp0d theaetetus0f theater1w thebes4j their3g theme1f themis0a theodicy0c theodora0m theodore0u theodoric0t theodosius0o theologica14 theologico0m theology0k theorem3w theoretical0b theravada1f there1k theresa2k therese0f thermal18 thermidor0f thermidorian0b thermo0d thermohaline0c thermopylae17 theses0t theseus3t theta0x thetis0s thiamine0l thiazi0a thick0j thief1a thiers0m thing20 things95 think1a thinker1c thinking0n thiol0w third9t thirteen15 thirteenth0b thirty4w thomasaq thompson1u thomson2w thorn0e thorns0a thorpe0b thoth2j thrace0l thread17 threat0b threelh throat0s throne0y through1b throw0p thrush0v thrust0a thumb0i thunderstorm0a thymine0d thyrsis0g tiber0i tiberius0r tibet3t tidal0s tierra17 tiger48 tigers1c tigris0n tikal0j tilbury0c tilden0o tilly0i timber0b times4e timon0d timor13 timur1v tinker0t tintin0e tippett0c tiresias1p tirthankar0n tirthankara0t tisha0l tishrei0a titan2w titanic1l titans0k tithonus0r titian38 title0d titration42 titus1m tobias0b tobin0g tobit0g tocqueville0s today0d toibin0c tokarczuk0f tokyo2h tolkien1o tolls0t tolman0b toltec0h tomato0c tombs0b tommy0g tomography0c tonga0p tongue0u tongues0e toole0a tooth0c topological0h topology0k torah27 torch0l tordesillas0h torii11 tormes0p torres0k torricelli0e torsion0r torso0j torus1c total20 totec0b totem18 touch0y toulouse1e tours1n toussaint0f tower5c towers0v townshend0o toxic0c trace15 tracing0m track0e tracking0e trade4s tradition0f traffic0s tragedy4v tragic0x trail1m train5m trains0p trajan1p trans21 transaction0f transcendentalism0j transcription2l transfer2c transfiguration0q transform2h transformation1q transformer0z transistor2i transit0s transition64 transitive0b translating0l translation3j transmigration0c transpiration0g transplant0c transport1r transportation0f transpose0b transposon12 transtromer0d transubstantiation0r transverse0m trapezoid0q trauma0b travel1i traveler1m traveling19 traveller0g travelling0a travels1n travesties0d treachery0d tread0h treasure1k treasury0s treatise0z treatises0b treaty1i trees1c trembling1n trent1q trenton0m trevi0f triad0f trial4u trials0m triangular0r tribe0i tribune0x tribute0s trick0k trickster0m trieste0b trigger0e trill0m trilobite0g trilogy0v trinity1q triomphe0c tripitaka0h triple6a triplet0j triptolemus0a tristan2b triste0e tritium0a triton19 tritone0s triumph16 triumvirate0l trobriand0n trojan2e troll0a trolley1j trompe0a trophic0i tropic0g tropical0a troposphere0t troubadour0u trouble0s troubles23 trout1y trovatore0p troyes0f truck0f truffaut0p trump20 trumpet4h trung0p truss0g trust0t truth59 tryst0b tsukuyomi0g tsvetaeva0b tuareg0f tuatha0d tuchman0i tudor0m tully0b tulsa0u tumor11 tuning0m tunis0a tunnel1z tunneling1n tuonela0u turangalila0b turban1l turbidity0k turbine0h turbulence1h turbulent13 turgot0a turin0l turing4x turkey6c turks0j turned0l turner6b turning0p turnus0r turtle2z tuscany0b tutankhamun0q tutsi0n tutte0u tutuola0b twain4u tweed0v twelve38 twelvers0b twice0g twinkle0a twins1r twist1u twisted0c twitter0k tyger1d tyler2a tylor0i tyndall1a typee0a types0b typhon11 tyrant0m tyrants0g tyrone0s tyrosine19 ubermensch0c ultimate0d umayyad25 unbearable2s unbound0c uncertainty2n under38 underground30 underwood0b underworld3c unfinished18 unfortunate0c unicorn16 unionbn unique0o unitary0d unitedjy unity0q universal2j universe1i university18 unknown0k unready0k uranus1o urban1n uriah0a urine0z ursula0d uruguay24 usher0y ustase0e uther0b utopia2t utzon0f uyghur0h vacuole0j vagina0j vague0c vainamoinen19 vajrayana0a valdez0g valence1b valencia0e valentine0o valera0k valery0p valkyrie13 valkyries0r valley4n valse0b value34 valve0r vampire2w vancouver1l vandals0f vanir0i vanities0l vanity2j vanya1h vapor1t varangian0r variation0t variational0h variations2l varieties0c varna0f varuna0a vascular0f vatican2b vaughan30 vaughn0c vault0e vector4c vedas0e vegas2c vegetarian17 velazquez36 velvet1k venezuela3w venturi0k venusb6 verde10 verdi3v verdun1t vergil15 verne27 vernon0b verona0v verrocchio0o verse12 verses22 vertex0f vertical0m vertices0c vertumnus0a vesicle0p vesta0x vestal0g vesti0d vibration0r vibrato0a vicar0w vichy1s victims0b victoire0d victor1n victoria5e victorian0f victory1v vidal0w vidar0a video1e vienna8h vijayanagar0d villa3m villi0d vinci34 viola2i violation0m violence1n violencia0d violent0a violet0e virgil2m virgin38 virginia9a virgins0k virgo0f virial1u virtual1u virtue1y virus1l visit0v vista0c vital0a vitale0f vitruvius0h vitus0b vladimir21 vocation0f vodou1g vogue0v voice1l voices0m volcanic0f volga1h volta0s voodoo3e vortex0n vortices0f vorticity0i vowel2h voyage15 voyager0o vritra0g vronsky0e waals41 wager0d wages0c wagner5y wagon0g wahhab0e wahhabi0g wainwright0t waiter1f waiting4p wakefield0z waking0d walcott3d walden1l waldstein0b wales4z walesa0l walker4v walking1d walks0y wallace6l wallachia0c wallenstein0s waller0f walls0d walras0e walrus0b walser0a walsh0d walsingham0g walter1y walton1c wanderer1b wanderers0a wandering0i wants0b warhol4a warming0f warner0o warren4p warring0x washing0i washingtonh4 waste31 watch3f watchmaker0a watchman0d watchmen0p waterig waterfall0f waterfowl0g waterfront0a waters0r watership0l watling0b watson4e watts0v waverley0d waves1v wayland0f wealth1h weary0r weather1f weathering0a weaving0p webber0r weber56 webern0o wedding7a wedgwood0f weekend0f weeknd0i weeks0g weems0a weierstrass16 weight1a weimar23 weinberg1y weinstein0b weiss0l welch0d welcome0d welles1f wellesley18 wellington1g wells2y welsh10 welty1e werewolf0d werther27 wesley0w wessex1c western8s westminster11 weston0f westphalia1c weyden0n whale2l wheatstone0m where2t whiskey24 whistler2w whitetb whitehead1a whitewater0h whitman56 whole0p whore0p whorf1b whyte0a wicked16 widor0a widow0k wieland0a wiesel0v wigner0s wikipedia0k wilde5b wilder3a wildfire0a wiley0e wilfred0b wilhelm34 wilkes0p wilkins0d wilkinson0p willamette0e willebrand0f williamsfw williamson0m willie0o willis0g willy0y wilmington0d wilson9p windermere0t windhover0d window28 windows0w winds0c winged0w wings17 winkle10 winner12 winnie0h winston0s winter6t winterreise0p winterson0e witch4b witches0r within0g witness1e witte0e wives1r wodehouse0i wolfe2x wolff14 wolfgang0h wolof0c wolseley0a wolsey0j woman7a womenca wonder0v wonderful0q wonders0b woods2c woodstock0t woolf7v words1h wordsworth3w worker0d workhouse0a works16 worldzz worlds19 worms1j worth0h would0s wozzeck0i wrath21 wreck1c wrestling12 wright7d wrinkle0c write0q writing1v written1h wundt0i wuthering2k wycliffe0c xerxes12 xiongnu0l xxiii0f yahoo0e yakub0d yalta0g yamamoto0e yamato0e yankees0w yanomamo0c yaroslav0l yasna0d yazidi0l yazoo0d yearsdl yeast0z yeats65 yemen2g yerma0k yevgeny0b yevtushenko0m yggdrasil28 yokai0c yorker14 youngex younger2a youtube0g yugoslavia2c yukon0w yvain0a zadig0e zadok0g zaitsev0j zakat15 zambezi0y zapotec0n zealand8c zechariah0a zelda0j zelenskyy0b zener0c zenger0e zhang0p zheng1g zhuangzi10 ziegler1b zimbabwe45 zimmer0a zimmerman0k zinoviev0c zionism0o zodiac0x zohar0i zombie1a zoroaster0v zoroastrianism2f zuckerman0a zurbaran0j";
let CONFUSABLE = null;
function corpusCount(t) {
  if (!CONFUSABLE) {
    CONFUSABLE = new Map();
    for (const e of CONFUSABLE_SRC.split(" ")) if (e.length > 2) CONFUSABLE.set(e.slice(0, -2), parseInt(e.slice(-2), 36));
  }
  return CONFUSABLE.get(t) || 0;
}
// is the fuzzy reading of token t (for form word w) blocked by the collision guard?
function knownCollision(t, w) {
  const nt = corpusCount(t);
  if (nt < 10) return false;
  const base = w.kind === "O" ? w.t : w.segs.filter((x) => x[0]).map((x) => x[1]).join("");
  const nc = Math.max(corpusCount(w.t), corpusCount(base));
  return nt >= 0.25 * nc;
}

// ---------------------------------------------------------------- line compilation
const LINE_CACHE = new Map();
const LINE_CACHE_MAX = 500;

function getLine(html, sanitized) {
  const key = String(html || "") + "\u0001" + String(sanitized || "");
  let P = LINE_CACHE.get(key);
  if (P) { LINE_CACHE.delete(key); LINE_CACHE.set(key, P); return P; }
  P = compileLine(html, sanitized);
  LINE_CACHE.set(key, P);
  if (LINE_CACHE.size > LINE_CACHE_MAX) LINE_CACHE.delete(LINE_CACHE.keys().next().value);
  return P;
}

// Import damage in the HTML (spec §4.18): keywords glued to tags or to the next word.
function healHtml(h) {
  return String(h)
    .replace(/\bprompton(?=[\s“”"'‘’<]|$)/gi, "prompt on")
    .replace(/\bprompton(?=[A-Za-z])/gi, "prompt on ")
    .replace(/(<\/[bui]>)(before|after|until|alone|once|or|and)(?=[\s"“”,;:.)\]<]|$)/gi, "$1 $2")
    .replace(/(^|[\s;,(\[])(accept|or|prompt on|prompt|reject)((?:<[bui]>)+)(?=\S)/gi, "$1$2 $3")
    .replace(/(<\/u>(?:<\/b>)?)(e?s)(and|or)(\s+(?:<b>)?<u>)/g, "$1$2 $3$4")
    .replace(/([\p{L}.,!?])(["”])(after|before|until|is|are)\b/gu, "$1$2 $3");
}

const GUIDE_INNER = /^\s*"[^"]{0,80}"\s*$/;
const DIRECTIVE_WORD = /\b(?:accept|prompt|reject|do\s+not|don't|anti-?prompt|before|until|after|once|read|mention(?:ed)?|note|pronounced)\b/i;
const NOTE_IN_HEAD = new RegExp(R`(?:^|[\s.;,])(?:` + KW.note_players.rx + "|" + KW.note_moderator.rx + "|" + KW.note_editor.rx + "|" + KW.note_generic.rx + ")", "i");
const LENIENT_SPELL = /\b(?:pronunciations?|phonetic(?:ally)?|spellings?|spelling\s+variations?|vowels?|transliterations?)\b/;

// Inline HTML other than b/u/i (qbreader imports): subscripts glue ("H<sub>2</sub>O" -> "H2O"), <em>/<strong>
// are italics/bold, line breaks and entities are spaces. The cleaned DB lines carry only b/u/i.
function inlineTags(h) {
  if (!h || h.indexOf("<") < 0 && h.indexOf("&") < 0) return h;
  return String(h)
    .replace(/<\/?(?:sub|sup|span|font|small|big|a|mark|ins)\b[^<>]*>/gi, "")
    .replace(/<(\/?)em>/gi, "<$1i>").replace(/<(\/?)strong>/gi, "<$1b>")
    .replace(/<br\s*\/?>|<\/?p\b[^<>]*>/gi, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

// "(also called the <b><u>Huang He</u></b>)", "also spelled <b><u>X</u></b>", "a.k.a. <b><u>X</u></b>": an alternate,
// like "or", when the phrase opens a group or follows a marked answer and a marked answer follows it
const AKA_RX = /((?:^|[(\[;,])\s*|<\/u>(?:<\/b>)?(?:<\/i>)?[”"’]?\s*,?\s*)(?:also\s+(?:called|known\s+as|spelled|termed|referred\s+to\s+as)|otherwise\s+known\s+as|a\.k\.a\.?|aka)\s+(?=(?:(?:the|a|an)\s+)?(?:<i>)?<[bu]>)/gi;
function akaToOr(h) {
  return h && /also|a\.?k\.?a|otherwise/i.test(h) ? String(h).replace(AKA_RX, "$1or ") : h;
}

// "<i>The<b><u>Metamorphosis</u></b></i>": a leading article glued to the marked title by a tag
const GLUED_ARTICLE = /(^|[\s>(\[“"])(The|A|An|Les|Le|La|Die|Der|Das|El|Il|Los|Las)((?:<[bui]>)+)(?=\p{Lu}\p{Ll})/gu;

// vulgar fractions are written out ("½" = "1/2")
const VULGAR = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅕": "1/5", "⅖": "2/5", "⅗": "3/5", "⅘": "4/5", "⅙": "1/6", "⅚": "5/6", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };
const VULGAR_RX = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g;
const VULGAR_TEST = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/;
const vulgar = (t) => (t && VULGAR_TEST.test(t) ? String(t).replace(VULGAR_RX, (c) => " " + VULGAR[c] + " ") : t);

// emphasis asterisks ("do *not* accept", "**For alternate answers …**", "<u>ER</u> *and* Golgi") are not text;
// an emphasised "and" between answers means both are required
const emphasis = (t) => (t && t.indexOf("*") >= 0
  ? String(t).replace(/\*\*([^*]{1,200})\*\*/g, "$1").replace(/(^|[^\p{L}\p{N}*])\*(\p{L}[^*<>]{0,40}?\p{L}|\p{L})\*(?=[^\p{L}\p{N}*]|$)/gu, (m0, pre, w) => pre + (/^and$/i.test(w) ? "AND" : w))
  : t);

function compileLine(html, sanitized) {
  html = vulgar(emphasis(akaToOr(inlineTags(html))));
  sanitized = vulgar(emphasis(sanitized));
  // punctuation-only text after the last group ("… [Fyodor Mikhaylovich <u>Dostoevsky</u>] .") is not an answer
  if (html) html = String(html).replace(/([\])])\s*[.,;:]+\s*$/, "$1");
  if (html && html.indexOf("“") >= 0) html = String(html).replace(/“\s+“/g, "“");   // a doubled opening quote (import damage)
  if (html && /<[bu]>/.test(html)) html = String(html).replace(GLUED_ARTICLE, "$1$2 $3");
  const healed = healAnswerline(html, sanitized);
  let src = healed.answerline && String(healed.answerline).trim() ? healed.answerline : (healed.sanitized || "");
  src = healHtml(String(src).replace(/&lt;[^&<>]{0,40}&gt;\s*$/g, " ").replace(/<(?![\/]?[buiBUI]>)[A-Z][^<>]{0,30}>/g, " ").replace(/ /g, " "));
  const ref = buildRef(src);
  const L = ref.L;
  const rules = ref.rules;
  const P = { src, ref, L, rules, text: ref.text, notes: [] };
  const s = L.s;
  // notes inside the main answer ("gongs Note to players: description acceptable.") carry line rules (P9, brief §8)
  for (const f of ref.forms) {
    if (f.src !== "main" && f.src !== "main_next") continue;
    const m = NOTE_IN_HEAD.exec(s.slice(f.start, f.end));
    let marked = false;
    // a marked "note" is the answer itself ("the author’s <u>note</u> to …"), not a note
    if (m) for (let k = f.start + m.index; k < f.start + m.index + m[0].length; k++) if (L.styled(k) && /\S/.test(L.text[k])) { marked = true; break; }
    if (m && !marked) {
      const at = f.start + m.index + (/^[\s.;,]/.test(m[0]) ? 1 : 0);
      f.drop = (f.drop || []).concat([[at, f.end]]);
      P.notes.push(L.text.slice(at, f.end));
    }
  }
  if (P.notes.length) {
    const nt = normKw(P.notes.join(" "));
    if (/descriptions?\s+(?:is\s+|are\s+)?acceptable|accept\s+descriptions/.test(nt)) (rules.open_class = rules.open_class || []).push("accept:description acceptable");
    if (/exact\s+(?:spelling|answer|wording)\s+required/.test(nt)) rules.exact = true;
    if (/(?:two|three|four|both|all)\s+(?:answers|parts)\s+(?:are\s+)?required/.test(nt)) rules.multi = true;
  }
  if (/exact\s+spelling\s+required/.test(s)) rules.exact = true;
  if (/no\s+other\s+(?:answers?|words?|names?)\s+(?:is\s+|are\s+)?(?:acceptable|accepted|allowed)/.test(s)) rules.closed = true;
  const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  let m;
  if ((m = /\b(?:accept|take|allow)\s+(?:any|all)\s+(one|two|three|four|five|2|3|4|5)\s+(?:of|from)\b/.exec(s))) rules.any_n = NUMW[m[1]] || Number(m[1]);
  if ((m = /\bprompt\s+(?:on\s+)?(?:any|all)\s+(one|two|three|four|five|2|3|4|5)\s+(?:of|from)\b/.exec(s))) rules.prompt_any_n = NUMW[m[1]] || Number(m[1]);
  // "accept either first or last name", "accept either first name or surname", "accept first or last name"
  {
    const rx = /\b(?:(?:either|any)\s+(?:the\s+)?|(?:accept|take|allow)\s+(?:either\s+)?(?:the\s+|his\s+|her\s+|their\s+)?)(?:(?:first|given)\s+(?:names?\s+)?or\s+(?:the\s+)?(?:last|family|sur)\s*-?names?|(?:last|family|sur)\s*-?(?:names?\s+)?or\s+(?:the\s+)?(?:first|given)\s+names?)\b/g;
    let e;
    // applies to the parts that are one person's name (matchForm): "Edna Pontellier committing suicide" or
    // "Snape and Lily Evans" with "accept first or last name(s)" still need the rest of the answer
    while ((e = rx.exec(s))) {
      const cl = s.slice(Math.max(s.lastIndexOf(";", e.index), s.lastIndexOf("[", e.index), s.lastIndexOf("(", e.index), s.lastIndexOf(",", e.index)) + 1, e.index);
      if (!/\b(?:prompt|reject|not|n't)\b/.test(cl) && !markedRange(L, e.index, e.index + e[0].length)) { rules.either_name = true; break; }
    }
  }
  if (/\b(?:no\s+(?:credit|points)|do\s+not\s+(?:accept|prompt)[a-z\s]*)\s+(?:for\s+)?(?:getting\s+)?(?:just\s+)?(?:only\s+)?one\s+(?:correct|right|answer|part)/.test(s)) rules.partial_policy = "reject";
  if (/\bmust\s+be\s+in\s+order\b|\border\s+must\s+be\s+correct\b|\bin\s+(?:that|this|the\s+correct)\s+order\b/.test(s)) rules.order = "fixed";
  if ((rules.lenient && LENIENT_SPELL.test(s)) || /\b(?:similar|close|alternat(?:e|ive))\s+(?:phonetic\s+)?(?:pronunciations?|spellings?)\b|\bphonetic(?:ally)?\s+(?:reasonable|spellings?|equivalents?)\b/.test(s)) rules.lenientSpell = true;
  // "“X” is not needed after it is read", "do not require “X” after it is read", "accept answers without “X” after …"
  P.optional = [];
  const opt = [
    /"([^"]+)"\s+(?:is|are)\s+(?:not\s+)?(?:needed|required|necessary)\s+(?:after|once)\s+([^;)\]]*)/g,
    /\b(?:do\s+not|don't|does\s+not|doesn't)\s+(?:need|require)\s+"([^"]+)"\s+(?:after|once)\s+([^;)\]]*)/g,
    /\banswers\s+without\s+"([^"]+)"(?:\s+or\s+"[^"]+")*\s+(?:after|once)\s+([^;)\]]*)/g,
  ];
  for (const rx of opt) {
    let mm;
    while ((mm = rx.exec(s)) !== null) P.optional.push({ word: mm[1], marker: mm[2] });
  }
  return P;
}

// Words of a char range with per-char required flags. pred(k) = required; drop = [[x, y]] ranges to skip.
const JOINT_RUN = 500;
const isJointRun = (r) => r >= 0 && r % 1000 >= JOINT_RUN;
function rangeWords(P, a, b, pred, drop, plain, joint) {
  const L = P.L;
  const s = L.s;
  const skip = new Uint8Array(Math.max(0, b - a));
  for (const [x, y] of drop || []) for (let k = Math.max(a, x); k < Math.min(b, y); k++) skip[k - a] = 1;
  // nested brackets inside an item: drop guides, timing remarks, notes and directive asides; keep optional words
  let depth = 0, open = -1;
  for (let k = a; k < b; k++) {
    const ch = s[k];
    if ((ch === "(" || ch === "[") && !pred(k)) { if (depth === 0) open = k; depth++; }
    else if ((ch === ")" || ch === "]") && depth > 0 && !pred(k)) {
      depth--;
      if (depth === 0 && open >= 0) {
        const inner = s.slice(open + 1, k);
        let req = false;
        for (let j = open; j <= k; j++) if (pred(j)) { req = true; break; }
        if (!req && (GUIDE_INNER.test(inner) || DIRECTIVE_WORD.test(inner) || words(inner).length > 4 || /^\s*"?[a-z]+(?:-[a-z]+)+"?\s*$/i.test(inner)))
          for (let j = open; j <= k; j++) skip[j - a] = 1;
        open = -1;
      }
    }
  }
  // a pronunciation guide (“…”) right after a word is never part of a form (§7.6)
  const gre = /\(\s*"[^"]{1,80}"\s*\)/g;
  let gm;
  const seg = s.slice(a, b);
  while ((gm = gre.exec(seg)) !== null) {
    let req = false;
    for (let j = a + gm.index; j < a + gm.index + gm[0].length; j++) if (pred(j)) { req = true; break; }
    // a guide caught inside the underline ("<u>Ia (“one-A”) supernova</u>") is still a guide
    const pron = /-|[A-Z]{2}/.test(L.text.slice(a + gm.index, a + gm.index + gm[0].length));
    if (!req || pron) for (let j = gm.index; j < gm.index + gm[0].length; j++) skip[j] = 1;
  }
  const attrs = new Array(b - a);
  let runId = -1, inRun = false;
  for (let k = a; k < b; k++) {
    if (skip[k - a]) { attrs[k - a] = null; inRun = false; continue; }
    const r = !!pred(k) && (!!strip(L.text[k]) || inRun);
    if (r && (!inRun || (L.tb && L.tb[k] && pred(k - 1) && /\p{Ll}/u.test(L.text[k - 1] || "") && /\p{Lu}/u.test(L.text[k])))) { runId++; inRun = true; }
    else if (!r) inRun = false;
    attrs[k - a] = { r, run: r ? runId : -1, tb: !!(L.tb && L.tb[k]) };
  }
  // JOINTLY_REQUIRED_PIECES: the named pieces form one run (one required portion, spec §7.6, brief §6)
  if (joint && joint.length) {
    const runText = new Map();
    for (let k = a; k < b; k++) { const at = attrs[k - a]; if (at && at.r) runText.set(at.run, (runText.get(at.run) || "") + L.text[k]); }
    const key = (t) => tokenize(t, null, plain).map((x) => x.t).join(" ");
    const ids = [...runText.keys()].sort((x, y) => x - y);
    for (const pair of joint) {
      if (!Array.isArray(pair) || pair.length < 2) continue;
      for (let i = 0; i + 1 < ids.length; i++) {
        if (key(runText.get(ids[i])) === key(String(pair[0])) && key(runText.get(ids[i + 1])) === key(String(pair[1]))) {
          // a joined run gets an id >= JOINT_RUN (mod 1000) so groups and matchForm can recognise it
          const jid = ids[i] % 1000 >= JOINT_RUN ? ids[i] : JOINT_RUN + ids[i];
          for (const at of attrs) if (at && (at.run === ids[i + 1] || at.run === ids[i])) at.run = jid;
          ids[i + 1] = jid; runText.set(jid, (runText.get(ids[i]) || "") + " " + (runText.get(jid) || ""));
        }
      }
    }
  }
  const text = L.text.slice(a, b);
  const toks = tokenize(text, (k) => attrs[k], plain);
  for (const t of toks) { t.it = !!(L.it && L.it[t.k0 + a]); t.k0 += a; t.k1 += a; }
  let disp = "";
  for (let k = a; k < b; k++) {
    const at = attrs[k - a];
    if (at && at.tb && at.r && k > a && attrs[k - a - 1] && attrs[k - a - 1].r && /\p{Ll}/u.test(L.text[k - 1]) && /\p{Lu}/u.test(L.text[k])) disp += " ";
    disp += at ? L.text[k] : " ";
  }
  toks.display = disp.replace(/\s+/g, " ").replace(/^[\s,;:.]+|[\s,;:]+$/g, "").replace(/\s+([,.;:)\]])/g, "$1");
  return toks;
}

function wordInfo(tok, prevTok) {
  const n = tok.r.filter(Boolean).length;
  const kind = n === 0 ? "O" : n === tok.t.length ? "R" : "M";
  const segs = [];
  for (let i = 0; i < tok.t.length; i++) {
    const r = !!tok.r[i];
    if (segs.length && segs[segs.length - 1][0] === r) segs[segs.length - 1][1] += tok.t[i];
    else segs.push([r, tok.t[i]]);
  }
  const run = tok.runs.find((x) => x >= 0);
  let num = tok.numMerged || numInfo(tok.t);
  // Roman numerals fold only in numeral positions: after a name; never "Malcolm X", vitamin C, "C major" (J§8.2)
  if (!num && /^(?:[IVX]+|[IVXLC]{2,})$/.test(tok.orig) && prevTok && /^\p{L}+$/u.test(prevTok.t) && !CONNECTIVES.has(prevTok.t) && !ARTICLES_ALL.has(prevTok.t)
    && !(tok.t === "x" && prevTok.t === "malcolm")) {
    const v = romanVal(tok.t);
    if (v) num = { v, kind: "roman" };
  }
  return { t: tok.t, kind, segs, run: run === undefined ? -1 : run, cap: tok.cap, orig: tok.orig, num, k0: tok.k0, k1: tok.k1, it: !!tok.it, poss: !!tok.poss };
}
function allReqWords(toks) {
  return toks.map((t, i) => wordInfo({ ...t, r: [...t.t].map(() => true), runs: [...t.t].map(() => 0) }, toks[i - 1]));
}

function respNum(tok, prevTok) {
  if (tok.numMerged) return tok.numMerged;
  const n = numInfo(tok.t);
  if (n) return n;
  if (prevTok && /^\p{L}+$/u.test(prevTok.t) && !CONNECTIVES.has(prevTok.t) && !ARTICLES_ALL.has(prevTok.t) && /^(?:[ivx]+|[ivxlc]{2,})$/.test(tok.t)) {
    const v = romanVal(tok.t);
    if (v) return { v, kind: "roman" };
  }
  return null;
}

// Candidate surface strings of a partly required word: (tail of pre) + R + (mid or nothing) + R + (prefix of post) (§7.3)
function wordCands(w) {
  if (w._cands) return w._cands;
  let cands = [""];
  const segs = w.segs;
  const allDigitsR = segs.filter((x) => x[0]).every((x) => /^\d+$/.test(x[1]));
  segs.forEach(([r, str], i) => {
    let opts;
    if (r) opts = [str];
    else if (i === 0) { opts = []; for (let k = 0; k <= str.length; k++) opts.push(str.slice(k)); }
    else if (i === segs.length - 1) {
      if (allDigitsR && str === "s") opts = ["s"];
      else { opts = []; for (let k = 0; k <= str.length; k++) opts.push(str.slice(0, k)); }
    } else opts = ["", str];
    const next = [];
    for (const c of cands) for (const o of opts) next.push(c + o);
    cands = next.slice(0, 96);
  });
  w._cands = [...new Set(cands)].filter(Boolean);
  w._rlen = segs.filter((x) => x[0]).reduce((n, x) => n + x[1].length, 0);
  return w._cands;
}

function budgetFor(len, ctx) {
  let b = len <= 4 ? 0 : len <= 8 ? 1 : 2;
  if (len >= 3) b += ctx.extraBudget || 0;
  return b;
}

const DERIV_SUFFIX = /(?:ations?|ative|atives|ating|ated|ates|ism|isms|ists?|ians?|ically|ical|ics?|ities|ity|ive|ives|izes?|ized|izing|ises?|ised|ising|ings?|ed|ers?|ly|ness|ments?|able|ible|als?|ally|ous|ans?|ese|ish|e|s|y|n|al)$/;
function stem(t) {
  let s = t;
  for (let i = 0; i < 3; i++) {
    const n = s.replace(DERIV_SUFFIX, "");
    if (n === s || n.length < 3) break;
    s = n;
  }
  return s;
}
const STRICT_SUFFIX = /(?:ations?|atives?|ating|ated|ates|ate|isms?|ists?|ians?|ically|ical|ics|ities|ity|ives?|izes?|ized|izing|ises?|ised|ising|ings?|ness|ments?|able|ible|ous|ese|ish|ers?)$/;
function strictStem(t) { const s = t.replace(STRICT_SUFFIX, ""); return s.length >= 4 ? s : t; }
function wordFormEq(base, rt) {
  if (base.length < 3 || rt.length < 3 || /\d/.test(rt)) return false;
  const sb = stem(base), sr = stem(rt);
  if (sb.length < 3) return false;
  return sr === sb || (sb.length >= 4 && (rt.startsWith(sb) || sr.startsWith(sb)));
}

// Cost of matching response token r against form word w: 0 exact, n edits, -1 no match. (J5 exact, J10 loose)
function wordCost(w, r, ctx, fuzzy, required) {
  const rt = r.t;
  if (w.t === rt) return 0;
  const rnum = r.num !== undefined ? r.num : numInfo(rt);
  if (w.num && rnum) {
    if (numEq(w.num, rnum) || (w.num.alt && numEq(w.num.alt, rnum))) return 0;
    // a partly underlined number word says the underlined letters are enough ("<u>Eight</u>h", "<u>1940</u>s", "19<u>80s</u>")
    return w.kind === "M" && wordCands(w).includes(rt) ? 0 : -1;
  }
  if (w.num && /^\d/.test(w.t) && w.kind === "R") return -1;
  if (abbrevEq(w.t, rt)) return 0;
  const cands = w.kind === "O" ? [w.t] : wordCands(w);
  const prot = !!w.protect;
  for (const c of cands) if (c === rt || inflEq(c, rt, prot) || spellEq(c, rt)) return 0;
  const base = w.kind === "O" ? w.t : w.segs.filter((x) => x[0]).map((x) => x[1]).join("");
  if (ctx.wordForms && required && wordFormEq(base, rt)) return 0;
  if (!fuzzy || /\d/.test(rt)) return -1;
  // never fuzz a one-letter required portion (an initial), digits or numerals (J10)
  if (w.kind !== "O" && w._rlen === 1) return -1;
  let best = -1;
  for (const c of cands) {
    if (/\d/.test(c) || c.length < 3) continue;
    const bud = budgetFor(Math.max(c.length, rt.length), ctx);
    // a derivational variant (nationalist / nationalism) is a word form, not a typo
    const isForm = c.length >= 6 && rt.length >= 6 && strictStem(c) === strictStem(rt) && (strictStem(c) !== c || strictStem(rt) !== rt);
    if (bud && !isForm) {
      const d = osa(c, rt, bud);
      // an edit to the first letter counts double against the token budget (asexual/sexual, citric/nitric, attachment/detachment)
      if (d > 0 && (c[0] !== rt[0] ? d + 1 : d) <= bud && (best < 0 || d < best)) best = d;
    }
    if (best < 0 && ctx.lenientSpell && !r.split && c.length >= 6 && rt.length >= 5 && c[0] === rt[0]) {
      const kc = phonKey(c), kr = phonKey(rt);
      if (kc.length >= 3 && (kc === kr || (kc.length >= 4 && osa(kc, kr, 1) <= 1))) best = 1;
    }
  }
  return best;
}

// ---------------------------------------------------------------- forms
const NAME_REF = /^(?:(?:just|only|the|a|his|her|their|its|any|of|those|these)\s+)*(last|family|sur|first|given|fore|christian)\s?-?\s?names?(?:\s+(?:alone|only|by\s+itself|on\s+its\s+own))?$/;
const NAME_PIECE = /^(?:(?:either|any|accept|his|her|their|the|just|only)\s+)*(?:first|given|last|family|sur)(?:\s*-?names?)?(?:\s+(?:for|of|alone|only|by|in)\b.*)?$/;
const NAME_SUFFIX = /^(?:jr|sr|ii|iii|iv|i)$/;
const NAME_PARTICLE = /^(?:van|von|der|den|de|del|della|di|da|du|dos|das|do|la|le|bin|bint|ibn|ben|al|el|ad|ud|ul|ye|y|of|the)$/;
// a person's name: two or more capitalised words (particles allowed), nothing else; returns [first, last] word index
function personName(ws) {
  const caps = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (w.num || NAME_SUFFIX.test(w.t)) continue;
    if (/^\p{Lu}/u.test(w.orig || "")) caps.push(i);
    else if (!NAME_PARTICLE.test(w.t)) return null;
  }
  return caps.length >= 2 && caps.length <= 5 ? [caps[0], caps[caps.length - 1]] : null;
}

function markedRange(L, a, b) {
  if (a == null || b == null) return false;
  for (let k = a; k < b; k++) if ((L.bu[k] || L.uOnly[k] || L.bOnly[k]) && /\S/.test(L.text[k])) return true;
  return false;
}

// A reject term with a parenthetical names several responses: "alkane (s)", "(Book of) Revelations",
// "Robert C (ox) Merton", "George H (erbert) W (alker) Bush", "In (t)ernal Affairs" (without it, with it, glued)
function parenVariants(q) {
  q = String(q);
  if (!/\([^()]{1,40}\)/.test(q)) return [q];
  const removed = q.replace(/\s*\([^()]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const spaced = q.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  const glued = q.replace(/(\p{L}+)\s*\((s|es)\)/gu, "$1$2").replace(/(^|[^\p{L}])(\p{L}{1,2})\s*\((\p{L}{1,14})\)\s*(\p{Ll}*)/gu, "$1$2$3$4").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  return [...new Set([removed, spaced, glued])].filter(Boolean);
}

const REJ_COND_AFTER = /^,?\s*(?:if|unless|when|without|plus|together|along|but|as\s+part|in\s+combination|with\s+(?:another|any|other|a\s+different|some|anything)|and\s+(?:another|any|other|a\s+different|some)|of\s+(?:any|another|other|a\s+different))\b/;
const REJ_COND_WORDS = /\b(?:if|unless|when|before|after|until|without|any|anything|answers?|descriptions?|other|another|including|mentioning)\b/i;

function linesForms(P, plain, joint, qrules) {
  const qMulti = !!(qrules && qrules.qMulti);
  const key = (plain ? 1 : 0) + (qMulti ? "m" : "") + (joint && joint.length ? "|" + JSON.stringify(joint) : "");
  if (!P.formsBy) P.formsBy = new Map();
  if (P.formsBy.has(key)) return P.formsBy.get(key);
  const L = P.L;
  const rules = qMulti ? { ...P.rules, qMulti: true } : P.rules;
  const reqPred = (k) => L.req(k);
  const pPred = (k) => L.uOnly[k] || L.bu[k] || (L.reqStyle === "b" && L.bOnly[k]);
  const uPred = (k) => L.uOnly[k] || L.bu[k];
  const accepts = [], prompts = [], antis = [], rejects = [], noprompts = [], contains = [], exceptions = [], substs = [];
  let prevWin = null;
  const winOf = (f) => {
    const w = f.window;
    if (!w) return null;
    const isPrev = w.shape === "previous" || w.side === "previous_flipped";
    if (w._linked === undefined) { if (isPrev) w._prev = prevWin; w._linked = true; }
    if (!isPrev) prevWin = w;
    return w;
  };
  const needSet = rules.needWords ? new Set(rules.needWords.flatMap((x) => tokenize(x, null, plain).map((t) => t.t))) : null;
  const mkForm = (f, base, ws) => {
    const form = { ...base, kind: f.kind, words: ws, isMain: f.src === "main" || f.src === "main_next", answer: f.answer };
    if (form.isMain && needSet) for (const w of ws) if (w.kind !== "O" && !needSet.has(w.t)) { w.kind = "O"; w.segs = [[false, w.t]]; w.run = -1; }
    buildGroups(form, rules, L);
    form.key = formKey(ws);
    return form;
  };
  for (const f of P.ref.forms) {
    const win = winOf(f);
    const base = { src: f.src, text: f.text, window: win, ask: f.ask || null, scope: f.scope || null, subst_for: f.subst_for || null, raw: f };
    if (f.kind === "exception") { exceptions.push({ ...base, kind: "exception", terms: (f.quoted || []).map((q) => tokenize(q, null, plain)) }); continue; }
    if (f.cls === "contain") {
      if (f.kind === "accept" && f.subst_for) {
        // "accept answers with Ova<u>herero</u> in place of “Herero”": a substitution item
        const toks = mergeNumbers(rangeWords(P, f.start, f.end, reqPred, null, plain));
        const ws = toks.map((t, i) => wordInfo(t, toks[i - 1])).filter((w) => w.kind !== "O" || !/^(?:answers?|with|using|that|mention|mentions|mentioning|including|containing)$/.test(w.t));
        if (ws.some((w) => w.kind !== "O")) substs.push(mkForm(f, { ...base, display: strip(f.text) }, ws));
        continue;
      }
      const slots = (f.slots || []).map((alts) => alts.map((x) => tokenize(x, null, plain)).filter((t) => t.length && !t.every((x) => CONNECTIVES.has(x.t) || ARTICLES_ALL.has(x.t)))).filter((alts) => alts.length);
      let desc = null;
      if (!slots.length) {
        const mm = CONTAIN.exec(L.s.slice(f.start, f.end));
        if (mm) desc = tokenize(L.text.slice(f.start + mm[0].length, f.end), null, plain).filter((t) => !ARTICLES_ALL.has(t.t) && !CONNECTIVES.has(t.t));
      }
      const wo = /\bwithout\s+(?:the\s+words?\s+|mentioning\s+)?"([^"]+)"/.exec(L.s.slice(f.start, Math.min(L.s.length, f.end + 60)));
      contains.push({ ...base, kind: f.kind, slots, desc, without: wo ? tokenize(wo[1], null, plain) : null });
      continue;
    }
    if (NEG.has(f.kind)) {
      const terms = [];
      const quoted = f.quoted && f.quoted.length ? f.quoted : null;
      let both = false;
      if (quoted) for (const q of quoted) for (const qv of parenVariants(q)) terms.push(tokenize(qv, null, plain));
      else if (f.core) {
        const bm = /^\s*both\s+(.+)$/i.exec(f.core);
        if (bm) { both = true; for (const part of bm[1].split(/\s+and\s+|\s*,\s*/)) terms.push(tokenize(part, null, plain)); }
        else {
          for (const qv of parenVariants(f.core)) terms.push(tokenize(qv, null, plain));
          // an appositive after the term ("St. Andrew Yaphe, patron saint of Quizbowl") is not part of it
          const ap = /^([^,]{3,60}),\s+(?=\p{Ll})/u.exec(f.core);
          if (ap) terms.push(tokenize(ap[1], null, plain));
        }
      }
      // legacy underline inside an unquoted reject target: each underlined run is rejected too
      if (!quoted && !both && f.ca != null) for (const [x, y] of L.runs(f.ca, f.cb, uPred)) terms.push(tokenize(L.text.slice(x, y), null, plain));
      const clauseTail = L.s.slice(f.start, Math.min(L.s.length, f.end + 80)).split(/[;\])]/)[0];
      const superset = /\bwith\s+anything\s+(?:else\s+)?(?:before|after|added|attached|else)\b/.test(clauseTail);
      const rf = { ...base, kind: f.kind, terms: terms.filter((t) => t.length), both, superset };
      // the line's own wording of the terms, for parseDirectives (not the derived variants)
      rf.labels = quoted ? quoted.map((q) => strip(String(q))) : f.core ? [strip(String(f.core))] : [];
      // terms that name a response exactly (J4 then beats the required-words exemption): quoted terms not followed by
      // a condition, and an unquoted target with no condition words; never an underlined run swept into the clause
      if (!both && !superset) {
        rf.exactQ = [];
        if (quoted) {
          let from = f.start != null ? f.start : 0;
          for (const q of quoted) {
            const at = L.text.indexOf(q, from);
            const after = at >= 0 ? L.s.slice(at + q.length, at + q.length + 48).replace(/^["”’'\s]+/, "") : "";
            if (at >= 0) from = at + q.length;
            if (REJ_COND_AFTER.test(after)) continue;
            for (const qv of parenVariants(q)) { const t = tokenize(qv, null, plain); if (t.length) rf.exactQ.push(t); }
          }
        } else if (f.core && !REJ_COND_WORDS.test(f.core)) {
          const ap = /^([^,]{3,60}),\s+(?=\p{Ll})/u.exec(f.core);
          for (const qv of parenVariants(ap ? ap[1] : f.core)) { const t = tokenize(qv, null, plain); if (t.length) rf.exactQ.push(t); }
        }
      }
      if (f.kind === "noprompt") noprompts.push(rf);
      else { rejects.push(rf); if (f.kind === "reject_noprompt") noprompts.push(rf); }
      continue;
    }
    if (f.kind !== "accept" && f.kind !== "prompt" && f.kind !== "antiprompt") continue;
    const list = f.kind === "accept" ? accepts : f.kind === "prompt" ? prompts : antis;
    const isMain = f.src === "main" || f.src === "main_next";
    // unmarked quoted items: the quoted strings are the forms (“Denali”, “King of Egypt”)
    // a quotation alone in parentheses is a pronunciation guide, not the item ("guqin (“goo-cheen”)")
    const guideQ = (q) => {
      const at = f.ca != null ? L.text.indexOf(q, f.ca) : -1;
      return at >= 0 && /\(\s*["“‘']?\s*$/.test(L.text.slice(Math.max(0, at - 3), at)) && /^\s*["”’']?\s*\)/.test(L.text.slice(at + q.length, at + q.length + 3));
    };
    if (f.wholeRequired && f.quoted && f.quoted.length && !isMain && !f.quoted.every(guideQ)) {
      // a quotation led by other words ("additional mention of “arrows”") never shields a response from a reject
      const weak = !/^\s*(?:(?:just|only|simply|the\s+answer)\s+)?["“‘']/.test(L.text.slice(f.ca, f.cb).replace(/^[\s,;:]+/, ""));
      for (const q of f.quoted) {
        const qq = strip(String(q)).replace(/[,.;:]+$/, "");
        const toks = mergeNumbers(tokenize(qq, null, plain));
        if (!toks.length) continue;
        const form = mkForm(f, { ...base, display: qq, weak }, allReqWords(toks));
        (f.subst_for && f.kind === "accept" ? substs : list).push(form);
      }
      continue;
    }
    let pred;
    const fromPrompt = !f.R.length && f.P.length;
    let uOnlyItem = false;
    if (f.kind === "accept" && f.wholeRequired && !isMain && f.ca != null) for (let k = f.ca; k < f.cb; k++) if (L.uOnly[k] && strip(L.text[k])) { uOnlyItem = true; break; }
    if (uOnlyItem) pred = uPred;
    else if (f.wholeRequired && (isMain ? f.start : f.ca) != null && /[(\[]/.test(L.text.slice(isMain ? f.start : f.ca, isMain ? f.end : f.cb))) {
      // an unmarked answer: parenthetical words are optional ("(Henry) Graham Greene", "guqin (“goo-cheen”)")
      const x0 = isMain ? f.start : f.ca, x1 = isMain ? f.end : f.cb;
      const opt = new Uint8Array(x1 - x0);
      let d = 0;
      for (let k = x0; k < x1; k++) { const ch = L.text[k]; if (ch === "(" || ch === "[") d++; opt[k - x0] = d > 0 ? 1 : 0; if ((ch === ")" || ch === "]") && d) d--; }
      pred = (k) => !(k >= x0 && k < x1 && opt[k - x0]);
    } else if (f.wholeRequired) pred = () => true;
    else if (fromPrompt || f.kind !== "accept") pred = pPred;
    else pred = reqPred;
    const a = isMain ? f.start : f.ca, b = isMain ? f.end : f.cb;
    if (a == null || b == null) continue;
    const raw = rangeWords(P, a, b, pred, f.drop, plain, isMain ? joint : null);
    const toks = mergeNumbers(raw);
    const ws = toks.map((t, i) => wordInfo(t, toks[i - 1]));
    if (!ws.length) continue;
    if (!ws.some((w) => w.kind !== "O")) for (const w of ws) { w.kind = "R"; w.segs = [[true, w.t]]; w.run = 0; }
    const form = mkForm(f, { ...base, display: raw.display || strip(L.text.slice(a, b).replace(/\s+/g, " ")) }, ws);
    if (f.kind === "accept" && !isMain) {
      const cs = Math.max(L.s.lastIndexOf(";", a), L.s.lastIndexOf("[", a), L.s.lastIndexOf("(", a));
      const clauseTxt = L.s.slice(cs + 1, Math.min(L.s.length, b + 40)).split(/[;\])]/)[0];
      // examples of "accept more specific answers like good leads" take extra modifiers before the head (J10)
      if (/\b(?:more\s+)?specific\b[^;]*\b(?:such\s+as|like|e\.g\.|including)\b/.test(L.s.slice(cs + 1, a + 1))) form.specificEx = true;
      if (/\b(?:or\s+)?(?:other\s+)?(?:synonyms?|equivalents?)\b/.test(clauseTxt)) form.synSibling = true;
    }
    if (f.subst_for && f.kind === "accept") { substs.push(form); continue; }
    list.push(form);
  }
  const mains = accepts.filter((f) => f.isMain);
  // "prompt on surname alone", "accept last name", "prompt on first name": the item names a part of the answer's
  // name, not a literal word (J§4.2 Strauss example; keywords.json s_surname). It becomes that word of each
  // person-name accept form. "partial last name" stays with the compound-surname rule (J12).
  {
    // the pieces of "accept first or last names" itself are not answers
    if (rules.either_name) for (const list of [accepts, prompts]) for (const f of list.slice()) if (!f.isMain && f.src !== "subst" && !markedRange(L, f.raw && f.raw.ca, f.raw && f.raw.cb) && NAME_PIECE.test(strip(String(f.display || "")).toLowerCase())) list.splice(list.indexOf(f), 1);
    const nameHosts = accepts.filter((h) => !h.window && !h.scope && personName(h.words));
    for (const list of nameHosts.length ? [prompts, antis, accepts] : []) {
      for (const f of list.slice()) {
        // an item with its own markup is a literal answer ("accept last <b><u>name</u></b>s")
        if (f.isMain || f.src === "subst" || (f.raw && f.raw.quoted && f.raw.quoted.length) || markedRange(L, f.raw && f.raw.ca, f.raw && f.raw.cb)) continue;
        const m = NAME_REF.exec(strip(String(f.display || "")).toLowerCase().replace(/[“”"'‘’.,;:]+/g, " ").replace(/\s+/g, " ").trim());
        if (!m) continue;
        list.splice(list.indexOf(f), 1);
        const last = !/^(?:first|given|fore|christian)$/.test(m[1]);
        const seen = new Set();
        for (const h of nameHosts) {
          let i = personName(h.words)[last ? 1 : 0];
          const disp = String(h.display || "");
          const picks = [h.words[i]];
          // "/" alternatives fill one word slot ("Raffaello Sanzio/Santi", P14)
          while (last && i > 0 && disp.includes(h.words[i - 1].orig + "/" + h.words[i].orig)) picks.push(h.words[--i]);
          for (const w0 of picks) {
            if (seen.has(w0.t)) continue;
            seen.add(w0.t);
            const words = [{ ...w0, kind: "R", segs: [[true, w0.t]], run: 0, _cands: undefined }];
            const v = { ...f, words, src: "nameref", isMain: false, parts: null, partsFixed: false };
            buildGroups(v, rules, L);
            v.key = formKey(words);
            list.push(v);
          }
        }
      }
    }
  }
  // several main answers (glycine [..] alanine [..] serine [..]): one combined form per choice of alternatives (P5)
  const answerIdx = new Set(accepts.filter((f) => f.isMain && typeof f.answer === "number").map((f) => f.answer));
  if (answerIdx.size > 1) {
    const byAns = [...answerIdx].sort((x, y) => x - y).map((i) => accepts.filter((f) => f.answer === i && !f.window));
    if (byAns.every((l) => l.length)) {
      let combos = [[]];
      for (const l of byAns) { const nx = []; for (const c of combos) for (const f of l) nx.push(c.concat([f])); combos = nx.slice(0, 64); }
      const singles = new Set(byAns.flat());
      for (let i = accepts.length - 1; i >= 0; i--) if (singles.has(accepts[i])) accepts.splice(i, 1);
      for (const c of combos) accepts.push(combineForms(c));
    }
  }
  {
    const multis = accepts.filter((f) => !f.window && !f.scope && f.parts && f.parts.length >= 2 && (f.isMain || f.src === "clause"));
    const k = multis.length ? multis[0].parts.length : 0;
    const same = multis.filter((f) => f.parts.length === k);
    if (same.length >= 2) {
      const ref0 = same[0];
      const rWords = (f, pi) => f.parts[pi].flatMap((gi) => f.groups[gi].words.map((wi) => f.words[wi].t));
      const alts = Array.from({ length: k }, () => []);
      for (const f of same) {
        const used = new Set();
        for (let pi = 0; pi < k; pi++) {
          let best = -1, bestN = 0;
          for (let ri = 0; ri < k; ri++) {
            if (used.has(ri)) continue;
            const n = rWords(f, pi).filter((t) => rWords(ref0, ri).some((u) => u === t || (u.length >= 5 && t.slice(0, 5) === u.slice(0, 5)))).length;
            if (n > bestN) { bestN = n; best = ri; }
          }
          if (best < 0) best = [...Array(k).keys()].find((ri) => !used.has(ri) && ri === pi) ?? [...Array(k).keys()].find((ri) => !used.has(ri));
          used.add(best);
          alts[best].push(partForm(f, pi));
        }
      }
      let combos = [[]];
      for (const l of alts) { const nx = []; for (const c of combos) for (const x of l) nx.push(c.concat([x])); combos = nx.slice(0, 48); }
      const have = new Set(accepts.map((f) => f.key));
      for (const c of combos) { const cf = combineForms(c); if (!have.has(cf.key)) { have.add(cf.key); accepts.push(cf); } }
    }
  }
  const hostsOf = (slotToks) => {
    const out = [];
    for (const host of accepts) {
      if (host.src === "subst") continue;
      const hw = host.words;
      let at = -1, len = 0;
      for (let i = 0; i + slotToks.length <= hw.length && at < 0; i++) {
        let ok = true;
        for (let j = 0; j < slotToks.length; j++) if (!(hw[i + j].t === slotToks[j].t || inflEq(hw[i + j].t, slotToks[j].t, false) || (hw[i + j].kind !== "O" && wordCands(hw[i + j]).includes(slotToks[j].t)))) { ok = false; break; }
        if (ok) { at = i; len = slotToks.length; }
      }
      if (at < 0 && slotToks.length === 1 && slotToks[0].t.length >= 2) {
        // an acronym slot ("the USA" for "United States of America")
        const letters = slotToks[0].t;
        for (let i = 0; i < hw.length && at < 0; i++) {
          let li = 0, j = i;
          while (j < hw.length && li < letters.length) {
            if (j > i && (CONNECTIVES.has(hw[j].t) || ARTICLES_ALL.has(hw[j].t))) { j++; continue; }
            if (hw[j].t[0] !== letters[li]) break;
            li++; j++;
          }
          if (li === letters.length && j - i >= 2) { at = i; len = j - i; }
        }
      }
      if (at >= 0) out.push([host, at, len]);
    }
    return out;
  };
  let tag = 0;
  const variant = (host, at, len, sf) => {
    const runBase = 1000 * (++tag);
    const repl = sf.words.map((w) => ({ ...w, run: w.run >= 0 ? w.run + runBase : -1, _cands: undefined }));
    const nw = host.words.slice(0, at).concat(repl, host.words.slice(at + len)).map((w) => ({ ...w, _cands: undefined }));
    const v = { ...host, words: nw, window: sf.window || host.window, src: "subst", isMain: false, subst_for: null, raw: sf.raw, partsFixed: false, parts: null };
    buildGroups(v, rules, L);
    // the substituted words sit elsewhere in the line, so text gaps cannot split the parts: keep the host's parts
    if (host.parts && host.parts.length > 1) {
      const hp = new Map();
      host.parts.forEach((pt, pi) => pt.forEach((gi) => host.groups[gi].words.forEach((wi) => hp.set(wi, pi))));
      const rp = hp.has(at) ? hp.get(at) : hp.get(at + len - 1);
      const pid = (i) => (i < at ? hp.get(i) : i < at + repl.length ? rp : hp.get(i - repl.length + len));
      const byP = new Map();
      let last = 0;
      v.groups.forEach((g, gi) => { const p0 = pid(g.words[0]); const p = p0 === undefined ? last : p0; last = p; if (!byP.has(p)) byP.set(p, []); byP.get(p).push(gi); });
      v.parts = [...byP.entries()].sort((x, y) => x[0] - y[0]).map((e) => e[1]);
      v.partsFixed = true;
    }
    v.key = formKey(nw);
    return v;
  };
  // substitution items replace one slot of the forms that contain it (§5.4 "in place of")
  for (const sf of substs) {
    const slot = tokenize(sf.subst_for, null, plain).filter((t) => !ARTICLES_ALL.has(t.t));
    if (!slot.length) continue;
    for (const [host, at, len] of hostsOf(slot)) accepts.push(variant(host, at, len, sf));
  }
  // On a multi-answer line an accept item that gives one answer only ("accept the Republic of Chile") replaces that
  // answer; an item listed with "or other synonyms" on a multi-span line ("accept monarch or other synonyms")
  // replaces one span. Neither is an answer on its own (J§16, J§15.2).
  const multiMain = mains.find((f) => f.parts && f.parts.length > 1);
  const mainR = new Set(mains.flatMap((f) => f.words.filter((w) => w.kind !== "O").map((w) => w.t)));
  const overlap = (a, b) => a === b || inflEq(a, b, false) || (a.length >= 5 && b.length >= 5 && a.slice(0, 6) === b.slice(0, 6));
  for (const f of accepts.slice()) {
    if (f.isMain || f.src === "subst" || f.src === "combined" || f.window || f.scope) continue;
    const fr = f.words.filter((w) => w.kind !== "O").map((w) => w.t);
    if (multiMain && f.parts.length === 1) {
      const hitParts = multiMain.parts.map((p) => p.some((gi) => multiMain.groups[gi].words.some((wi) => fr.some((t) => overlap(multiMain.words[wi].t, t)))));
      if (hitParts.filter(Boolean).length !== 1) continue;
      const wis = multiMain.parts[hitParts.indexOf(true)].flatMap((gi) => multiMain.groups[gi].words);
      const at = Math.min(...wis), end = Math.max(...wis) + 1;
      accepts.splice(accepts.indexOf(f), 1);
      accepts.push(variant(multiMain, at, end - at, f));
      continue;
    }
    if (f.synSibling && f.groups.length === 1 && !fr.some((t) => mainR.has(t))) {
      const host = mains.find((m) => m.groups.length > 1);
      if (!host) continue;
      accepts.splice(accepts.indexOf(f), 1);
      for (const g of host.groups) accepts.push(variant(host, g.words[0], g.words[g.words.length - 1] - g.words[0] + 1, f));
    }
  }
  // "“X” is not needed after it is read": a copy of each form with X optional, live once the marker is read (J§4.8)
  for (const o of P.optional || []) {
    const xt = tokenize(o.word, null, plain).map((t) => t.t);
    if (!xt.length) continue;
    const self = /^\s*(?:it|they|this|that)?\s*(?:is|are|has\s+been|have\s+been)?\s*(?:read|mentioned|said|given)\b|^\s*(?:read|mention(?:ed)?)\b/.test(o.marker);
    const q = /"([^"]+)"/.exec(o.marker);
    const markerWord = self ? o.word : q ? q[1] : o.marker.replace(VERB_TAIL, "").trim();
    const w = { side: "after", kw: "after", shape: "quoted", marker: '"' + markerWord + '"', _linked: true };
    for (const host of accepts.slice()) {
      if (host.window) continue;
      const hw = host.words;
      let at = -1;
      for (let i = 0; i + xt.length <= hw.length; i++) if (xt.every((t, j) => hw[i + j].t === t || inflEq(hw[i + j].t, t, false))) { at = i; break; }
      if (at < 0) continue;
      const drop = (from) => hw.map((x, i) => (i >= from && i < at + xt.length ? { ...x, kind: "O", segs: [[false, x.t]], run: -1, _cands: undefined } : { ...x, _cands: undefined }));
      let from = at;
      // a given name directly before a dropped surname in the same span goes too ("Gustav Holst")
      if (/^\p{Lu}\p{Ll}/u.test(hw[at].orig)) while (from > 0 && hw[from - 1].kind !== "O" && /^\p{Lu}\p{Ll}/u.test(hw[from - 1].orig) && hw[from - 1].run === hw[at].run && !hw[from - 1].num) from--;
      let nw = drop(from);
      if (!nw.some((x) => x.kind !== "O")) nw = drop(at);
      if (!nw.some((x) => x.kind !== "O")) continue;
      const v = { ...host, words: nw, window: w, src: "optional", isMain: false, parts: null, partsFixed: false };
      buildGroups(v, rules, L);
      v.key = formKey(nw);
      accepts.push(v);
    }
  }
  const lineWords = new Set();
  for (const f of accepts) for (const w of f.words) { lineWords.add(w.t); if (w.kind === "M") for (const [r, str] of w.segs) if (!r && str.length >= 3) lineWords.add(str); }
  const promptPool = new Set();
  for (const f of prompts.concat(antis)) for (const w of f.words) promptPool.add(w.t);
  const byWin = new Map();
  for (const f of accepts.concat(prompts, antis)) if (f.window) { if (!byWin.has(f.window)) byWin.set(f.window, []); byWin.get(f.window).push(f); }
  for (const [, list] of byWin) if (list.length > 1) for (const f of list) f._sibs = list;
  const out = { accepts, prompts, antis, rejects, noprompts, contains, exceptions, lineWords, promptPool };
  P.formsBy.set(key, out);
  return out;
}

// part pi of a multi-part form, as a small form of its own
function partForm(f, pi) {
  const wis = f.parts[pi].flatMap((gi) => f.groups[gi].words);
  const lo = Math.min(...wis), hi = Math.max(...wis);
  const words = f.words.slice(lo, hi + 1).map((w) => ({ ...w, _cands: undefined }));
  const groups = f.parts[pi].map((gi) => ({ words: f.groups[gi].words.map((i) => i - lo), run: f.groups[gi].run }));
  return { ...f, words, groups, parts: [groups.map((_, i) => i)], partsFixed: true, display: words.map((w) => w.orig).join(" "), key: formKey(words) };
}
function formKey(ws) { return ws.map((w) => w.t + (w.poss ? "'s" : "")).join(" "); }
function combineForms(list) {
  const words = [];
  const parts = [];
  const groups = [];
  list.forEach((f, ci) => {
    const off = words.length;
    for (const w of f.words) words.push({ ...w, run: w.run >= 0 ? w.run + 1000 * (ci + 1) : -1, _cands: undefined });
    const p = [];
    for (const g of f.groups) { groups.push({ words: g.words.map((i) => i + off), run: g.run + 1000 * (ci + 1) }); p.push(groups.length - 1); }
    parts.push(p);
  });
  return { ...list[0], words, groups, parts, partsFixed: true, src: "combined", isMain: true, key: formKey(words),
    display: list.map((f) => f.display).join(" + "), text: list.map((f) => f.text).join(" + "), answer: 0 };
}

function buildGroups(form, rules, L) {
  const ws = form.words;
  let first = true;
  for (const w of ws) { w.protect = false; if (w.kind !== "O" && first) { w.protect = !!w.cap; first = false; } }
  if (form.partsFixed && form.parts) return;
  let groups = [];
  let cur = null;
  ws.forEach((w, i) => {
    if (w.kind === "O") { cur = null; return; }
    if (cur && cur.run === w.run) cur.words.push(i);
    else { cur = { words: [i], run: w.run }; groups.push(cur); }
  });
  // "accept either part / either name" with a single span: each of its words is a portion (§7.4 rule 2)
  if (rules.either_portion && groups.length === 1 && groups[0].words.length > 1 && !ws.some((w) => w.num) && !isJointRun(groups[0].run)) {
    groups = groups[0].words.filter((i) => !ARTICLES_ALL.has(ws[i].t) && !CONNECTIVES.has(ws[i].t)).map((i) => ({ words: [i], run: ws[i].run }));
  } else if (rules.either_name) {
    // "accept first or last name": a name inside one span splits into its words (matchForm nameClusters)
    groups = groups.flatMap((g) => (g.words.length > 1 && !isJointRun(g.run) && personName(g.words.map((i) => ws[i])) ? g.words.filter((i) => !NAME_PARTICLE.test(ws[i].t)).map((i) => ({ words: [i], run: ws[i].run })) : [g]));
  }
  // parts: groups separated by "AND", or on multi-answer lines by "and" / "&" / "," / ";", are separate answers (J§16)
  const multi = !!(rules.multi || rules.all_required || rules.any_n || rules.qMulti);
  const parts = [];
  groups.forEach((g, gi) => {
    if (!gi) { parts.push([0]); return; }
    const prev = groups[gi - 1];
    const x = ws[prev.words[prev.words.length - 1]].k1, y = ws[g.words[0]].k0;
    const gap = x != null && y != null && L && y >= x ? L.text.slice(x, y) : "";
    const sep = /\bAND\b/.test(gap) || (multi && /(?:^|\s)(?:and|&)(?:\s|$)|[,;]/.test(gap)) || (rules.either_name && /^\s*(?:and|&)\s*$/.test(gap));
    if (sep) parts.push([gi]); else parts[parts.length - 1].push(gi);
  });
  form.groups = groups;
  form.parts = parts;
}

// ---------------------------------------------------------------- read position and timing windows (§6, J3)
function foldSearch(text) {
  let out = "";
  for (const ch of text) {
    let f = ch.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
    if (ch === "’" || ch === "‘" || ch === "`") f = "'";
    else if (ch === "“" || ch === "”") f = '"';
    else if (ch === "–" || ch === "—") f = "-";
    if (f.length !== ch.length) f = (f + "      ").slice(0, ch.length);
    out += f;
  }
  return out;
}
// Moderator and reader notes are not read aloud: blank them (same length) before searching markers (§6.2).
function blankNotes(t) {
  return t.replace(/(?:\(|\[)?\s*(?:note\s+to\s+(?:the\s+)?(?:moderators?|readers?)|moderator(?:'s|s')?\s+note|reader\s+note)\s*[:\-][^.!?\])]*[.!?\])]?/gi, (m) => " ".repeat(m.length));
}
// per question text: the folded read-aloud copy, marker hits, sentence starts and "this <noun>" positions (small LRU)
const TEXT_CACHE = new Map();
function textInfo(full) {
  let ti = TEXT_CACHE.get(full);
  if (ti) return ti;
  ti = { folded: foldSearch(blankNotes(full)), cache: new Map(), nouns: null };
  TEXT_CACHE.set(full, ti);
  if (TEXT_CACHE.size > 32) TEXT_CACHE.delete(TEXT_CACHE.keys().next().value);
  return ti;
}
function makeReadCtx(opts) {
  const full = opts && opts.fullText != null ? String(opts.fullText) : opts && opts.readText != null ? String(opts.readText) : null;
  if (full == null) return { hasText: false, buzz: Infinity, end: Infinity, cache: new Map() };
  let buzz = opts.readLen != null ? Number(opts.readLen) : opts.readText != null ? String(opts.readText).length : full.length;
  if (!Number.isFinite(buzz)) buzz = full.length;
  const ti = textInfo(full);
  return { hasText: true, text: full, folded: ti.folded, buzz, end: full.length, cache: ti.cache, ti };
}
function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
// First occurrence of a marker in [from, to): [start, end of the marker proper] or null.
function findMarker(rc, marker, self, from = 0, to = Infinity) {
  const key = (self ? "s:" : "m:") + from + ":" + to + ":" + marker;
  if (rc.cache.has(key)) return rc.cache.get(key);
  let res = null;
  const m = foldSearch(marker).replace(/["“”]/g, "").replace(/\s+/g, " ").trim();
  const hay = rc.folded.slice(from, to === Infinity ? undefined : to);
  if (m) {
    const tries = [m];
    const parts = m.split(" ");
    const last = parts[parts.length - 1];
    if (last.length >= 4) tries.push(parts.slice(0, -1).concat(singularize(last)).join(" "));
    const poss = m.replace(/'s\b/g, "").trim();
    if (poss.length >= 4 && poss !== m) tries.push(poss);
    const consider = (mm, len) => { if (mm && (!res || from + mm.index < res[0])) res = [from + mm.index, from + mm.index + len]; };
    for (const t of tries) {
      const body = escRx(t).replace(/ /g, "[\\s\\-]+");
      const tail = self ? "\\p{L}{0,3}" : "(?:'?s|es)?\\p{L}{0,3}";
      const mm = new RegExp("(?<![\\p{L}\\p{N}])(" + body + ")" + tail + "(?![\\p{L}\\p{N}])", "u").exec(hay);
      if (mm) consider(mm, mm[1].length);
    }
    if (/\d/.test(m) && m.replace(/\s+/g, "").length <= 12) {
      const body = [...m.replace(/\s+/g, "")].map(escRx).join("\\s?");
      const mm = new RegExp("(?<![\\p{L}\\p{N}])" + body + "(?![\\p{L}\\p{N}])", "u").exec(hay);
      if (mm) consider(mm, mm[0].length);
    }
  }
  rc.cache.set(key, res);
  return res;
}
function sentenceStarts(rc) {
  if (rc._sent) return rc._sent;
  const t = rc.text;
  const starts = [0];
  const re = /[.!?]["”’)]?\s+(?=["“(]?[A-Z0-9])/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const before = t.slice(Math.max(0, m.index - 4), m.index + 1);
    if (/(?:\b[A-Z]|\bMr|\bMrs|\bDr|\bSt|\bMt|\bNo|\bvs|\bJr|\bSr|\bed|\bc|\bca)\.$/.test(before)) continue;
    starts.push(m.index + m[0].length);
  }
  rc._sent = starts;
  return starts;
}
function sentenceRange(rc, which) {
  const st = sentenceStarts(rc);
  const n = st.length;
  const i = /last|final/.test(which) ? n - 1 : /second/.test(which) ? 1 : /third/.test(which) ? 2 : 0;
  if (i >= n) return [rc.end, rc.end];
  return [st[i], i + 1 < n ? st[i + 1] : rc.end];
}
function giveawayStart(rc) {
  if (rc._give !== undefined) return rc._give;
  const m = /\b(?:for\s+(?:10|ten|15|fifteen|20|twenty)\s+points|ftp)\b/i.exec(rc.text);
  const st = sentenceStarts(rc);
  rc._give = m ? m.index : st.length > 1 ? st[st.length - 1] : null;
  return rc._give;
}
const VERB_TAIL = /\s*(?:,|\s)\s*(?:(?:is|are|has\s+been|have\s+been|gets|get|was|were|being)\s+)?(?:read|mentioned|said|given|stated|named|revealed|clued)\b.*$/i;
function markerText(w) {
  let t = String(w.marker || "");
  const q = /["“”'‘’]([^"“”'‘’]{1,80})["“”'‘’]/.exec(t);
  if (q) return q[1];
  t = t.replace(/^\s*(?:the\s+)?(?:first\s+)?mention\s+of\s+/i, "").replace(/^\s*the\s+words?\s+/i, "");
  t = t.replace(VERB_TAIL, "").replace(/\s+(?:is|are|has\s+been)\s*$/i, "");
  return t.replace(/[,.;:]+$/, "").trim();
}
function selfText(form) {
  if (!form.words) return (form.slots || []).map((alts) => alts.map((t) => t.map((x) => x.orig).join(" ")).join(" ")).filter(Boolean);
  const runs = [];
  let cur = "";
  for (const w of form.words) {
    if (w.kind === "O") { if (cur) { runs.push(cur); cur = ""; } continue; }
    const r = w.segs.filter((x) => x[0]).map((x) => x[1]).join("");
    cur = cur ? cur + " " + r : r;
  }
  if (cur) runs.push(cur);
  return runs;
}
function selfHit(form, rc, from, to) {
  const t = selfText(form);
  for (const x of t.length > 1 ? [t.join(" ")].concat(t) : t) { const h = findMarker(rc, x, true, from, to); if (h) return h; }
  if (form.display) return findMarker(rc, form.display, true, from, to);
  return null;
}
// [open, close] read-position interval of a window; live iff open <= buzz <= close.
function windowSpan(w, form, rc) {
  if (!w || w.side === "whole_question") return [0, Infinity];
  if (w.shape === "fronted") {
    if (!w._frontWin) {
      const t = String(w.marker || "").replace(/,\s*$/, "");
      const L2 = new Line(t);
      const [, fw] = timingOf(L2, 0, L2.s.length, maskQuotes(L2.s, 0, L2.s.length));
      w._frontWin = fw || { side: "whole_question", shape: "none" };
    }
    return windowSpan(w._frontWin, form, rc);
  }
  if (w.shape === "previous" || w.side === "previous_flipped") {
    const p = w._prev;
    if (!p) return [0, Infinity];
    const [o, c] = windowSpan(p, form, rc);
    if (w.side === "previous_flipped") {
      if (o === 0 && c === Infinity) return [0, Infinity];
      if (o === 0) return [c === Infinity ? Infinity : c + 1, Infinity];
      return [0, o === Infinity ? Infinity : o - 1];
    }
    if (w.side === "after") return o > 0 ? [o, Infinity] : c === Infinity ? [Infinity, Infinity] : [c + 1, Infinity];
    return o > 0 ? [0, o === Infinity ? Infinity : o - 1] : [0, c];
  }
  if (!rc.hasText) {
    if (w.side === "after") return [Infinity, Infinity];
    if (w.side === "sentence" || w.side === "early") return [0, -1];
    return [0, Infinity];
  }
  if (w.side === "early") {
    const g = giveawayStart(rc);
    const sh = selfHit(form, rc);
    let c = g == null ? Infinity : g;
    if (sh && sh[0] < c) c = sh[0];
    return [0, c];
  }
  if (w.side === "sentence") return sentenceSpan(String(w.kw || ""), rc);
  let from = 0, to = Infinity;
  if (w.inSent) [from, to] = sentenceRange(rc, w.inSent);
  let hit = null;
  if (w.shape === "clue") {
    const mk = String(w.marker || "").toLowerCase();
    const st = sentenceStarts(rc);
    if (/first|opening|lead-?in/.test(mk) && !/end\s+of\s+the\s+(?:question|tossup)/.test(mk)) {
      const e = st.length > 1 ? st[1] - 1 : rc.end;
      hit = [e, e];
    } else if (/second/.test(mk)) {
      const e = st.length > 2 ? st[2] : rc.end;
      hit = [e, e];
    } else if (/last|final/.test(mk)) {
      const e = st[st.length - 1];
      hit = [e, e];
    } else if (/\(\*\)|\*|power/.test(mk)) {
      const i = rc.text.indexOf("(*)");
      hit = i >= 0 ? [i, i + 3] : null;
    } else {
      const g = giveawayStart(rc);
      hit = g == null ? null : [g, g];
    }
  } else if (w.shape === "self") {
    hit = selfHit(form, rc, from, to);
    if (!hit && form._sibs && !/\beach\b|respective/.test(String(w.marker || ""))) {
      // a glued, damaged item ("sexchromosome") is read when the sibling it contains is read
      const mine = selfText(form).join("");
      for (const sb of form._sibs) {
        if (sb === form) continue;
        const theirs = selfText(sb).join("");
        if (!theirs || theirs.length < 4 || !mine.includes(theirs) || mine === theirs) continue;
        const h = selfHit(sb, rc, from, to);
        if (h && (!hit || h[0] < hit[0])) hit = h;
      }
    }
  } else {
    const mt = markerText(w);
    if (/^(?:each|respectively|respective)\b/i.test(mt) || /^(?:it|they|this|that|these|those)$/i.test(mt)) hit = selfHit(form, rc, from, to);
    else hit = mt ? findMarker(rc, mt, false, from, to) : null;
  }
  if (w.side === "after") return hit ? [hit[1], Infinity] : [Infinity, Infinity];
  return hit ? [0, hit[0]] : [0, Infinity];
}
function sentenceSpan(kw, rc) {
  const k = kw.toLowerCase();
  const [s0, s1] = sentenceRange(rc, k);
  if (/first|opening/.test(k) || !/second|third|last|final/.test(k)) return [0, s1 === rc.end ? Infinity : s1 - 1];
  return [s0, /last|final/.test(k) ? Infinity : s1];
}
function isLive(form, rc) {
  if (!form.window) return true;
  const [o, c] = windowSpan(form.window, form, rc);
  return o !== Infinity && o <= rc.buzz && rc.buzz <= c;
}

// ---------------------------------------------------------------- response tokens
const FILLER_RX = /^\s*(?:(?:what|who|where|whom)\s+(?:is|are|was|were)|is\s+it|it\s+is|it'?s|i\s+think(?:\s+it'?s)?|i\s+believe|um+|uh+|er+|hmm+|the\s+answer\s+is|answer\s*:)\b[\s,:]*/i;
function respTokens(resp, plain) {
  let toks = tokenize(vulgar(resp), null, plain);
  toks = mergeNumbers(toks);
  toks.forEach((t, i) => { t.num = respNum(t, toks[i - 1]); });
  return toks;
}
const ACRONYMS = new Map(Object.entries({
  uk: "united kingdom", us: "united states", usa: "united states of america", ussr: "union of soviet socialist republics",
  un: "united nations", eu: "european union", wwi: "world war i", ww1: "world war i", wwii: "world war ii", ww2: "world war ii",
  dna: "deoxyribonucleic acid", rna: "ribonucleic acid", nyc: "new york city", uae: "united arab emirates",
  drc: "democratic republic of the congo", prc: "peoples republic of china",
}));

// ---------------------------------------------------------------- matching a form
function joinWords(a, b) {
  const segs = [];
  for (const sg of a.segs.concat(b.segs)) {
    if (segs.length && segs[segs.length - 1][0] === sg[0]) segs[segs.length - 1] = [sg[0], segs[segs.length - 1][1] + sg[1]];
    else segs.push([sg[0], sg[1]]);
  }
  const kind = a.kind === "O" && b.kind === "O" ? "O" : segs.every((x) => x[0]) ? "R" : "M";
  return { t: a.t + b.t, kind, segs, cap: a.cap, num: null, run: a.run, protect: false };
}

// All ways the words of group g can match a contiguous run of response tokens starting at j.
function groupMatchesAt(form, g, T, j, ctx, fuzzy) {
  const base = g.words.map((i) => form.words[i]);
  const seqs = [base];
  // "Smith, John": a person's name may be given surname first, with a comma (J§5.2)
  if (base.length >= 2 && base.every((w) => w.cap && /^\p{L}+$/u.test(w.t)) && T[j] && T[j].comma) seqs.push([base[base.length - 1]].concat(base.slice(0, -1)));
  if (ctx.freeOrder && base.length >= 2 && base.length <= 4) {
    const perm = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm(arr.slice(0, i).concat(arr.slice(i + 1))).map((p) => [x].concat(p))));
    for (const p of perm(base)) if (p.some((w, i) => w !== base[i])) seqs.push(p);
  }
  const best = new Map();
  for (const ws of seqs) {
    const memo = new Map();
    const rec = (i, jj) => {
      const key = i * 1000 + jj;
      if (memo.has(key)) return memo.get(key);
      const res = [];
      if (i === ws.length) { res.push({ e: jj, cost: 0 }); memo.set(key, res); return res; }
      // an article inside the required span is required (spec C6: "Los Angeles", "The Invisible Man"); below strictness 15 it may be left out
      if (i === 0 && ws.length > 1 && ARTICLES_EN.has(ws[0].t) && ctx.articleOptional) for (const r of rec(1, jj)) res.push(r);
      if (i === ws.length - 1 && i > 0 && ctx.qWords && ws[i].kind === "R" && (ctx.qWords.has(ws[i].t) || ctx.qWords.has(ws[i].t.replace(/s$/, "")))) res.push({ e: jj, cost: 0 });
      // regnal numerals: "Henry the Eighth", "Louis the 14th" for Henry VIII / Louis XIV (J§5.5)
      if (jj + 1 < T.length && i > 0 && T[jj].t === "the" && ws[i].num && ws[i - 1].cap && !ws[i - 1].num) for (const r of rec(i, jj + 1)) res.push(r);
      if (jj < T.length) {
        const c = wordCost(ws[i], T[jj], ctx, fuzzy, true);
        if (c >= 0) for (const r of rec(i + 1, jj + 1)) res.push({ e: r.e, cost: r.cost + c });
        // two form words written as one response token ("Telltale", "Kim Jongun")
        if (i + 1 < ws.length && !ws[i].num) {
          const oneLetter = ws[i].t.length === 1 || ws[i + 1].t.length === 1 || (ws[i].kind !== "O" && wordCands(ws[i]) && ws[i]._rlen === 1) || (ws[i + 1].kind !== "O" && wordCands(ws[i + 1]) && ws[i + 1]._rlen === 1);
          const cj = ws[i + 1].num ? (ws[i].t + ws[i + 1].t === T[jj].t ? 0 : -1) : wordCost(joinWords(ws[i], ws[i + 1]), T[jj], ctx, fuzzy && !oneLetter, true);
          if (cj >= 0) for (const r of rec(i + 2, jj + 1)) res.push({ e: r.e, cost: r.cost + cj });
        }
        // one form word written as two response tokens ("Speed boat")
        if (jj + 1 < T.length && !ws[i].num) {
          const cs = wordCost(ws[i], { t: T[jj].t + T[jj + 1].t, num: null, split: true }, ctx, fuzzy, true);
          if (cs >= 0) for (const r of rec(i + 1, jj + 2)) res.push({ e: r.e, cost: r.cost + cs });
        }
      }
      memo.set(key, res);
      return res;
    };
    for (const r of rec(0, j)) if (r.e > j && (!best.has(r.e) || best.get(r.e).cost > r.cost)) best.set(r.e, r);
  }
  return [...best.values()].map((r) => ({ s: j, e: r.e, cost: r.cost }));
}

function poolHas(pool, x) {
  if (!pool) return false;
  if (pool.has(x)) return true;
  return x.length >= 4 && (pool.has(x.replace(/e?s$/, "")) || pool.has(x + "s") || pool.has(x + "es"));
}
function isAccountedTok(t, form, ctx, pool, i, T) {
  const x = t.t;
  for (const w of form.words) if (wordCost(w, t, ctx, false, false) >= 0) return true;
  // fragments of partly required words ("cells" of <u>T</u>cells, "cell" of cell<u>membrane</u>)
  for (const w of form.words) if (w.kind === "M") for (const [r, str] of w.segs) if (!r && str.length >= 2 && (str === x || inflEq(str, x, false))) return true;
  if (NEVER_ACCOUNTED.has(x)) return false;
  if (ARTICLES_ALL.has(x) || CONNECTIVES.has(x) || HONORIFICS.has(x)) return true;
  if (form.scope !== "bare") {
    if (poolHas(pool, x)) return true;
    if (ctx.qWords && ctx.qWords.has(x)) return true;
  }
  for (const w of form.words) {
    if (w.kind !== "O" || x.length < 5 || /\d/.test(x)) continue;
    const bud = budgetFor(Math.max(w.t.length, x.length), ctx);
    if (bud && osa(w.t, x, bud) <= bud) return true;
  }
  return x.length === 1 && /[a-z]/.test(x) && i > 0 && i < T.length - 1;
}

// initial-letter spans in a row (<u>U</u>nited <u>S</u>tates, <u>S</u>tudent <u>N</u>onviolent …) may be given as the acronym (J§4.4)
function initialRuns(form) {
  if (form._init) return form._init;
  const runs = [];
  let cur = [];
  form.groups.forEach((g, gi) => {
    const w = g.words.length === 1 ? form.words[g.words[0]] : null;
    const isInit = !!w && w.segs.length >= 1 && w.segs[0][0] && w.segs[0][1].length === 1 && w.segs.slice(1).every((x) => !x[0]) && /[a-z]/.test(w.segs[0][1]);
    if (isInit) cur.push(gi);
    else { if (cur.length >= 2) runs.push(cur); cur = []; }
  });
  if (cur.length >= 2) runs.push(cur);
  form._init = runs.map((gis) => ({ gis, letters: gis.map((gi) => form.words[form.groups[gi].words[0]].segs[0][1]).join("") }));
  return form._init;
}

// runs of two or more adjacent groups of a part that read as one person's name -> Map(group index -> run id)
function nameClusters(form, p) {
  const capW = (w) => !w.num && (/^\p{Lu}/u.test(w.orig || "") || NAME_PARTICLE.test(w.t));
  const m = new Map();
  let cur = null, id = 0;
  for (let k = 0; k < p.length; k++) {
    const g = form.groups[p[k]];
    if (!g.words.every((i) => capW(form.words[i]))) { cur = null; continue; }
    if (cur) {
      const pg = form.groups[p[k - 1]];
      for (let i = pg.words[pg.words.length - 1] + 1; i < g.words[0]; i++) if (!capW(form.words[i])) { cur = null; break; }
    }
    if (!cur) cur = { id: id++, n: 0 };
    cur.n++;
    m.set(p[k], cur);
  }
  const out = new Map();
  for (const [gi, c] of m) if (c.n >= 2) out.set(gi, c.id);
  return out;
}

// Match a form against response tokens. mode: { fuzzy, extraOk, prefixOk }
function matchForm(form, T, ctx, mode, pool) {
  const groups = form.groups;
  if (!groups || !groups.length) return null;
  const occ = groups.map((g) => {
    const list = [];
    for (let j = 0; j < T.length; j++) for (const o of groupMatchesAt(form, g, T, j, ctx, mode.fuzzy)) list.push(o);
    return list;
  });
  for (const run of initialRuns(form)) for (let j = 0; j < T.length; j++) if (T[j].t === run.letters) occ[run.gis[0]].push({ s: j, e: j + 1, cost: 0, covers: run.gis });
  const either = !!ctx.rules.either_portion;
  // "accept first or last name": any one group of a part that is a person's name
  // "accept first or last name": one group of each run of name groups is enough; the rest stays required
  const clusters = !either && ctx.rules.either_name ? form.parts.map((p) => nameClusters(form, p)) : null;
  // JOINTLY_REQUIRED_PIECES: groups of one joined run count only together (a lone piece is never an accept)
  let jointOf = null;
  if (either || clusters) {
    const byRun = new Map();
    groups.forEach((g, gi) => { if (isJointRun(g.run)) { if (!byRun.has(g.run)) byRun.set(g.run, []); byRun.get(g.run).push(gi); } });
    for (const l of byRun.values()) if (l.length > 1) { if (!jointOf) jointOf = new Map(); for (const gi of l) jointOf.set(gi, l); }
  }
  const got = (gi, sel) => !!sel[gi] && (!jointOf || !jointOf.has(gi) || jointOf.get(gi).every((x) => sel[x]));
  const partOk = (p, pi, sel) => {
    if (either) return p.some((gi) => got(gi, sel));
    if (!clusters || !clusters[pi].size) return p.every((gi) => sel[gi]);
    const need = new Map();
    for (const gi of p) {
      const c = clusters[pi].get(gi);
      if (c === undefined) { if (!sel[gi]) return false; } else need.set(c, need.get(c) || got(gi, sel));
    }
    for (const v of need.values()) if (!v) return false;
    return true;
  };
  const anyN = ctx.rules.any_n || 0;
  const fixed = ctx.rules.order === "fixed";
  const satisfied = (sel) => {
    const pk = form.parts.map((p, pi) => partOk(p, pi, sel));
    const n = pk.filter(Boolean).length;
    if (anyN && form.parts.length > 1) return n >= Math.min(anyN, form.parts.length);
    return n === form.parts.length;
  };
  let best = null;
  let nodes = 0;
  const sel = new Array(groups.length).fill(null);
  const used = new Uint8Array(T.length);
  const score = (c) => (c.sat ? 1e6 : 0) - c.left.length * 1e4 + c.nGroups * 100 - c.cost;
  const dfs = (gi, cost) => {
    if (++nodes > 5000) return;
    if (gi === groups.length) {
      const s2 = sel.map(Boolean);
      if (!s2.some(Boolean)) return;
      const sat = satisfied(s2);
      if (fixed) {
        let last = -1;
        for (const o of sel) if (o && o !== true) { if (o.s < last) return; last = o.s; }
      }
      const left = [];
      for (let k = 0; k < T.length; k++) if (!used[k] && !isAccountedTok(T[k], form, ctx, pool, k, T)) left.push(k);
      const cand = { sat, cost, left, nGroups: s2.filter(Boolean).length, sel: sel.slice() };
      if (!best || score(cand) > score(best)) best = cand;
      return;
    }
    if (sel[gi] === true) { dfs(gi + 1, cost); return; }
    dfs(gi + 1, cost);
    for (const o of occ[gi]) {
      let free = true;
      for (let k = o.s; k < o.e; k++) if (used[k]) { free = false; break; }
      if (!free) continue;
      if (o.covers && o.covers.some((g2) => g2 !== gi && sel[g2])) continue;
      for (let k = o.s; k < o.e; k++) used[k] = 1;
      sel[gi] = o;
      if (o.covers) for (const g2 of o.covers) if (g2 !== gi) sel[g2] = true;
      dfs(gi + 1, cost + o.cost);
      if (o.covers) for (const g2 of o.covers) if (g2 !== gi) sel[g2] = null;
      sel[gi] = null;
      for (let k = o.s; k < o.e; k++) used[k] = 0;
    }
  };
  dfs(0, 0);
  if (!best) return null;
  let leftOk = best.left.length === 0 || (mode.extraOk && form.scope !== "bare");
  if (!leftOk && mode.prefixOk && best.sat) {
    // extra modifiers before the head only ("Mississippi River" for "specific rivers such as Yellow River")
    const starts = best.sel.filter((o) => o && o !== true).map((o) => o.s);
    const firstPos = starts.length ? Math.min(...starts) : 0;
    leftOk = best.left.every((k) => k < firstPos && !NEVER_ACCOUNTED.has(T[k].t));
  }
  const full = best.sat && best.cost <= ctx.formBudget && leftOk;
  return { full, sat: best.sat, cost: best.cost, left: best.left, nGroups: best.nGroups, sel: best.sel };
}

// J9: the number of required words matched when the response gives a strict, non-empty subset of them (every other
// token accounted for); 0 otherwise. anyWord: count every word of the form ("prompt on either part alone").
function partialOf(form, T, ctx, pool, anyWord) {
  const req = [];
  form.words.forEach((w, i) => { if (anyWord ? !ARTICLES_ALL.has(w.t) && !CONNECTIVES.has(w.t) : w.kind !== "O") req.push(i); });
  if (!req.length) return 0;
  const hitW = new Set();
  let hitTok = 0;
  for (let k = 0; k < T.length; k++) {
    let m = -1;
    for (const i of req) if (wordCost(form.words[i], T[k], ctx, false, true) >= 0) { m = i; break; }
    if (m >= 0) { hitW.add(m); hitTok++; continue; }
    if (ARTICLES_ALL.has(T[k].t) || CONNECTIVES.has(T[k].t)) continue;
    if (anyWord || !isAccountedTok(T[k], form, ctx, null, k, T)) return 0;
  }
  if (!hitTok) return 0;
  return hitW.size < req.length ? hitW.size : 0;
}

// ---------------------------------------------------------------- strict comparisons (J4 rejects, hidden entries)
function contentToks(toks) {
  let i = 0;
  while (i < toks.length - 1 && ARTICLES_ALL.has(toks[i].t)) i++;
  return i ? toks.slice(i) : toks;
}
function tokEqLoose(a, b) {
  if (a.t === b.t) return true;
  const na = a.num || numInfo(a.t), nb = b.num || numInfo(b.t);
  if (na && nb) return numEq(na, nb);
  return inflEq(a.t, b.t, false) || inflEq(b.t, a.t, false) || abbrevEq(a.t, b.t);
}
// equality ignoring articles, number, joining, and (for multi-word items) word order (J4)
// protect: response words that are required words of a live accept form; folding (plural, abbreviation) never
// turns a different reject word into one of them ("Metamorphoses" never catches "Metamorphosis")
function strictEq(itemToks, T, ordered, protect) {
  const a = contentToks(itemToks), b = contentToks(T);
  if (!a.length || !b.length) return false;
  if (a.map((t) => t.t).join("") === b.map((t) => t.t).join("")) return true;
  if (a.length !== b.length) return false;
  const eq = protect ? (x, y) => x.t === y.t || (!protect.has(y.t) && tokEqLoose(x, y)) || (protect.has(y.t) && !!(x.num || numInfo(x.t)) && tokEqLoose(x, y)) : tokEqLoose;
  if (ordered) return a.every((x, i) => eq(x, b[i]));
  const used = new Uint8Array(b.length);
  for (const x of a) {
    let ok = false;
    for (let i = 0; i < b.length; i++) if (!used[i] && eq(x, b[i])) { used[i] = 1; ok = true; break; }
    if (!ok) return false;
  }
  return true;
}
// does T contain the term as a contiguous token run?
function containsRun(T, term) {
  const a = contentToks(term);
  if (!a.length) return false;
  for (let i = 0; i + a.length <= T.length; i++) {
    let ok = true;
    for (let j = 0; j < a.length; j++) if (!tokEqLoose(a[j], T[i + j])) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

// ---------------------------------------------------------------- the judge
function verdict(status, extra) { return { status, matchedAnswer: null, prompt: null, ...extra }; }

function judgeOnce(resp, P, strictness, opts, rc, plain) {
  const T = respTokens(resp, plain);
  if (!T.length) return verdict("reject", { rule: "J14" });
  const rules = rc.rules;
  const F = linesForms(P, plain, opts.jointPieces, rules);
  const exact = !!rules.exact;
  const lenient = !!rules.lenient;
  const ctx = {
    rules, extraBudget: (lenient ? 1 : 0) + (strictness < 10 ? 1 : 0) + (strictness < 5 ? 1 : 0),
    formBudget: (strictness >= 20 ? 1 : strictness >= 15 ? 2 : strictness >= 10 ? 3 : 4) + (lenient ? 1 : 0), wordForms: false, qWords: rc.qWords || null,
    lenientSpell: !!rules.lenientSpell && !exact, freeOrder: strictness < 10 && rules.order !== "fixed" && !exact, articleOptional: strictness < 15 && !exact,
  };
  // the line's own "accept X alone after …" decides the bare word; the generic-word rule then stays out
  if (F.accepts.some((f) => f.window && f.scope === "bare")) ctx.qWords = null;
  const respKey = formKey(T);
  const live = (f) => isLive(f, rc);
  const out = (status, f, rule, extra) => {
    const v = verdict(status, { rule, via: "line", ...extra });
    if (f) {
      v.matchedAnswer = f.display || f.text;
      if (status === "prompt") v.prompt = { target: f.display || f.text, ask: f.ask || null };
    }
    return v;
  };
  const multiLine = !!(rules.multi || rules.all_required || rules.qMulti || rules.any_n) || F.accepts.some((f) => f.isMain && f.parts && f.parts.length > 1);
  // a response that is exactly a live accept form, or exactly its required words, is never caught by a reject (J4)
  // The required-words exemption undoes folding only ("Metamorphoses", "A Guide for …" never catch "Metamorphosis",
  // "Guide for …"); a reject that names the response exactly ("do not accept “Invisible Man”") still wins.
  // (a partly underlined word also counts by its underlined letters: "<u>herm</u>s" → "herm", "<u>screen print</u>ing")
  const reqLetters = (w) => (w.kind === "M" ? w.segs.filter((x) => x[0]).map((x) => x[1]).join("") : w.t);
  const reqKey = (f) => {
    if (f._reqKey === undefined) { const ws = f.words.filter((w) => w.kind !== "O"); f._reqKey = [formKey(ws), ws.map(reqLetters).join(" ")]; }
    return f._reqKey;
  };
  // (the same normalisation on both sides: leading articles drop from the response and from the required words)
  const respContent = formKey(contentToks(T));
  const artless = (k) => k.replace(/^(?:(?:the|a|an)\s+)+/, "");
  const wholeAccept = (byReq = true) => F.accepts.some((f) => f.src !== "subst" && !f.weak && live(f) && (f.key === respKey || (byReq && reqKey(f).some((k) => k === respKey || artless(k) === respContent))));
  // only a quoted term with no qualifier after it ("“Ivan” if …", "“Caesar” and another name") names the response
  const exactTerm = (r) => (r.exactQ || []).some((t) => formKey(t) === respKey);
  let protect = null;
  for (const f of F.accepts) if (!f.weak && live(f)) for (const w of f.words) if (w.kind !== "O") { (protect || (protect = new Set())).add(w.t); if (w.kind === "M") protect.add(reqLetters(w)); }
  // ---- J4 strict reject (and hidden rejects, G1); on a multi-answer line one rejected answer rejects the whole
  const pieces = [T];
  if (multiLine) {
    const ps = String(resp).split(/\s*(?:,|;|&|\band\b)\s*/i).map((x) => x.trim()).filter(Boolean);
    if (ps.length > 1) for (const p of ps) pieces.push(respTokens(p, plain));
  }
  const excepted = (TT) => F.exceptions.some((x) => x.terms.some((t) => strictEq(t, TT, false) || containsRun(TT, t)));
  for (const r of F.rejects) {
    if (!live(r)) continue;
    const hit = r.both ? r.terms.length > 1 && r.terms.every((t) => containsRun(T, t))
      : r.superset ? r.terms.some((t) => containsRun(T, t) && contentToks(T).length > contentToks(t).length)
      // a reject term with "and" names an order ("volume and entropy" against an accepted "entropy and volume")
      : pieces.some((TT) => r.terms.some((t) => strictEq(t, TT, t.some((x) => x.t === "and"), r.window ? null : protect)));
    // a timed reject ("do not accept … afterwards") is aimed at an accepted item on purpose: only a whole live
    // accept form is exempt from it
    if (hit && !wholeAccept(!r.window && !exactTerm(r)) && !excepted(T)) return out("reject", null, "J4");
  }
  for (const c of F.contains) {
    if (!NEG.has(c.kind) || !live(c)) continue;
    let hit = false;
    if (c.slots.length) hit = c.slots.some((alts) => alts.some((t) => containsRun(T, t)));
    else if (c.desc && c.desc.length) hit = c.desc.every((d) => T.some((t) => tokEqLoose(d, t)));
    if (hit && c.without && c.without.length && containsRun(T, c.without)) hit = false;
    if (hit && !wholeAccept() && !excepted(T)) return out("reject", null, "J4");
  }
  const hidden = opts.hidden && typeof opts.hidden === "object" && !Array.isArray(opts.hidden) ? opts.hidden : null;
  const hTok = (list) => (Array.isArray(list) ? list : []).map((e) => respTokens(String(e), plain)).filter((t) => t.length);
  const H = hidden ? { accept: hTok(hidden.accept), prompt: hTok(hidden.prompt), antiprompt: hTok(hidden.antiprompt), reject: hTok(hidden.reject) } : null;
  if (H && H.reject.some((t) => strictEq(t, T, true)) && !wholeAccept()) return verdict("reject", { rule: "J4", via: "hidden" });
  let noPrompt = false;
  for (const r of F.noprompts) if (live(r) && !r.superset && r.terms.some((t) => strictEq(t, T, false))) noPrompt = true;
  // ---- J5 exact accept
  const liveAccepts = F.accepts.filter(live);
  // extra words may come from the line's other live accept forms ("Saul of Tarsus"), never a number
  const linePool = new Set();
  for (const f of liveAccepts) for (const w of f.words) {
    if (w.num) continue;
    linePool.add(w.t);
    if (w.kind === "M") for (const [r, str] of w.segs) if (!r && str.length >= 3) linePool.add(str);
  }
  for (const f of liveAccepts) {
    const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, linePool);
    if (m && m.full && m.cost === 0) return out("accept", f, "J5");
  }
  // ---- J6 / J7 named prompt and anti-prompt
  if (!noPrompt) {
    for (const f of F.prompts) {
      if (!live(f)) continue;
      const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, F.promptPool);
      if (m && m.full && m.cost === 0) return out("prompt", f, "J6");
    }
    for (const f of F.antis) {
      if (!live(f)) continue;
      const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, F.promptPool);
      if (m && m.full && m.cost === 0) {
        const v = out("prompt", f, "J7", { antiprompt: true });
        v.prompt.ask = f.ask || "Can you be less specific?";
        return v;
      }
    }
    for (const c of F.contains) {
      if (c.kind !== "prompt" && c.kind !== "antiprompt") continue;
      if (!live(c) || !c.slots.length) continue;
      // class descriptions take word forms and extra words (P16): "Indian states" mentions India
      if (c.slots.every((alts) => alts.some((t) => containsRun(T, t) || containsWordsLoose(T, t))) && !(c.without && containsRun(T, c.without))) {
        const anti = c.kind === "antiprompt";
        const v = verdict("prompt", { rule: anti ? "J7" : "J6", via: "line", matchedAnswer: c.text, prompt: { target: c.text, ask: c.ask || (anti ? "Can you be less specific?" : null) } });
        if (anti) v.antiprompt = true;
        return v;
      }
    }
  }
  // ---- J8 closed window
  for (const f of F.accepts) {
    if (live(f) || !f.window || windowSpan(f.window, f, rc)[1] >= rc.buzz) continue;
    const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, linePool);
    if (m && m.full) return out("reject", null, "J8", { note: "accepted only while its window was open" });
  }
  // ---- J9 partial policy
  const policy = rules.partial_policy || null;
  const extraOk = strictness < 20 && !exact && !rules.closed;
  const wordFormsOk = (!!(rules.word_forms && rules.word_forms.some((x) => /^accept:/.test(x))) || lenient) && !exact;
  for (const f of liveAccepts) {
    if (f.src === "subst" || f.scope === "bare") continue;
    if (!partialOf(f, T, ctx, linePool, false)) continue;
    ctx.wordForms = wordFormsOk;
    const loose = matchForm(f, T, ctx, { fuzzy: !exact, extraOk: false }, linePool);
    ctx.wordForms = false;
    if (loose && loose.full) continue;
    if (!noPrompt && rules.prompt_any_n && f.parts.length > 1) {
      const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, linePool);
      const nParts = m && m.sel ? f.parts.filter((p) => p.every((gi) => m.sel[gi])).length : 0;
      if (nParts >= rules.prompt_any_n) return out("prompt", f, "J9");
    }
    if (policy === "prompt" && !noPrompt) return out("prompt", f, "J9");
    if (policy === "reject" || rules.closed) return out("reject", null, "J9");
  }
  if (!noPrompt && multiLine && F.prompts.length) {
    const host = liveAccepts.find((f) => f.isMain && f.parts && f.parts.length > 1);
    const ps = String(resp).split(/\s*(?:,|;|&|\band\b)\s*/i).map((x) => x.trim()).filter(Boolean);
    if (host && ps.length > 1 && ps.length <= host.parts.length) {
      let promptHit = null, partHits = 0;
      const usedParts = new Set();
      const ok = ps.every((p) => {
        const PT = respTokens(p, plain);
        for (let pi = 0; pi < host.parts.length; pi++) {
          if (usedParts.has(pi)) continue;
          const m = matchForm(partForm(host, pi), PT, ctx, { fuzzy: false, extraOk: false }, null);
          if (m && m.full) { usedParts.add(pi); partHits++; return true; }
        }
        const pf = F.prompts.find((f) => live(f) && (() => { const m = matchForm(f, PT, ctx, { fuzzy: false, extraOk: false }, null); return m && m.full; })());
        if (pf) { promptHit = promptHit || pf; return true; }
        return false;
      });
      if (ok && promptHit && partHits) return out("prompt", promptHit, "J9");
    }
  }
  if (!noPrompt && (rules.prompt_either_part || rules.prompt_other_names)) {
    for (const f of liveAccepts) {
      if (!f.isMain) continue;
      if (rules.prompt_other_names) {
        const names = f.words.filter((w) => w.kind === "O" && w.cap && !ARTICLES_ALL.has(w.t) && !CONNECTIVES.has(w.t));
        if (names.length && T.every((t) => ARTICLES_ALL.has(t.t) || names.some((w) => wordCost(w, t, ctx, false, false) >= 0))) return out("prompt", f, "J9");
      }
      if (rules.prompt_either_part && partialOf(f, T, ctx, null, true)) return out("prompt", f, "J9");
    }
  }
  // ---- J10 loose accept: typos within the budget (with the collision guard), word forms, extra words, classes
  ctx.wordForms = wordFormsOk;
  for (const f of liveAccepts) {
    const m = matchForm(f, T, ctx, { fuzzy: !exact, extraOk, prefixOk: !!f.specificEx }, linePool);
    if (!m || !m.full) continue;
    if (m.cost > 0 && collides(f, T, m, F, opts)) continue;
    if (m.left.length && !extraWordsOk(T, m, opts, f)) continue;
    ctx.wordForms = false;
    return out("accept", f, "J10", m.left.length ? { note: "extra words ignored" } : m.cost ? { note: "spelling accepted" } : {});
  }
  ctx.wordForms = false;
  for (const c of F.contains) {
    if (c.kind !== "accept" || !live(c) || !c.slots.length) continue;
    const ok = c.slots.every((alts) => alts.some((t) => containsWordsLoose(T, t)));
    if (ok && !(c.without && containsRun(T, c.without))) return verdict("accept", { rule: "J10", via: "line", matchedAnswer: c.text });
  }
  // ---- J11 loose prompt
  if (!noPrompt) {
    for (const f of F.prompts.concat(F.antis)) {
      if (!live(f)) continue;
      const m = matchForm(f, T, ctx, { fuzzy: !exact, extraOk }, F.promptPool);
      if (!m || !m.full) continue;
      if (m.cost > 0 && collides(f, T, m, F, opts)) continue;
      if (m.left.length && !extraWordsOk(T, m, opts, f)) continue;
      const anti = F.antis.includes(f);
      const v = out("prompt", f, "J11", anti ? { antiprompt: true } : {});
      if (anti) v.prompt.ask = f.ask || "Can you be less specific?";
      return v;
    }
    // ---- J12 NAQT implicit prompts (closed list)
    const imp = implicitPrompt(F, T);
    if (imp) return out("prompt", imp, "J12");
  }
  // ---- J13 hidden answers, then the open class
  if (H) {
    const eq = (list) => list.find((t) => strictEq(t, T, true));
    if (eq(H.reject)) return verdict("reject", { rule: "J13", via: "hidden" });
    if (!noPrompt && eq(H.prompt)) return verdict("prompt", { rule: "J13", via: "hidden", prompt: { target: null, ask: null } });
    if (!noPrompt && eq(H.antiprompt)) return verdict("prompt", { rule: "J13", via: "hidden", antiprompt: true, prompt: { target: null, ask: "Can you be less specific?" } });
    const ha = eq(H.accept);
    if (ha) return verdict("accept", { rule: "J13", via: "hidden", matchedAnswer: ha.map((t) => t.orig).join(" ") });
    const others = H.reject.concat(H.prompt, H.antiprompt, H.accept);
    const guardOk = () => !others.some((o) => strictEq(o, T, true)) && !(opts.isKnownAnswer && opts.isKnownAnswer(respKey))
      && !F.rejects.some((r) => r.terms.some((t) => strictEq(t, T, false))) && !F.prompts.concat(F.antis).some((f) => f.key === respKey);
    const fuzzyHit = (list) => (exact ? null : list.find((t) => hiddenFuzzy(t, T, ctx)));
    if (!noPrompt && fuzzyHit(H.prompt) && guardOk()) return verdict("prompt", { rule: "J13", via: "hidden", prompt: { target: null, ask: null } });
    if (!noPrompt && fuzzyHit(H.antiprompt) && guardOk()) return verdict("prompt", { rule: "J13", via: "hidden", antiprompt: true, prompt: { target: null, ask: "Can you be less specific?" } });
    const fa = fuzzyHit(H.accept);
    if (fa && guardOk()) return verdict("accept", { rule: "J13", via: "hidden", matchedAnswer: fa.map((t) => t.orig).join(" "), note: "spelling accepted" });
    if (extraOk) {
      const ex = H.accept.find((t) => hiddenExtra(t, T));
      if (ex && guardOk()) return verdict("accept", { rule: "J13", via: "hidden", matchedAnswer: ex.map((t) => t.orig).join(" "), note: "extra words ignored" });
    }
  }
  if (openClass(rules, F)) return verdict("reject", { rule: "J13", via: "line", unsure: true, note: "the answer line allows equivalents or descriptions: judge it yourself" });
  return verdict("reject", { rule: "J14" });
}

function containsWordsLoose(T, term) {
  const a = contentToks(term);
  if (!a.length) return false;
  return a.every((x) => T.some((t) => tokEqLoose(x, t) || wordFormEq(x.t, t.t)));
}

function hiddenFuzzy(entry, T, ctx) {
  const a = contentToks(entry), b = contentToks(T);
  if (!a.length || a.length !== b.length) return false;
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    if (tokEqLoose(a[i], b[i])) continue;
    if (/\d/.test(a[i].t) || /\d/.test(b[i].t) || a[i].t.length < 3) return false;
    const bud = budgetFor(Math.max(a[i].t.length, b[i].t.length), ctx);
    const d = osa(a[i].t, b[i].t, bud);
    if (d > 0 && (a[i].t[0] !== b[i].t[0] ? d + 1 : d) > bud) return false;
    if (d > bud) return false;
    if (a.length === 1 && knownCollision(b[i].t, { kind: "O", t: a[i].t, segs: [[false, a[i].t]] })) return false;
    total += d;
  }
  return total > 0 && total <= 2;
}
function hiddenExtra(entry, T) {
  const a = contentToks(entry);
  if (!a.length || a.every((t) => numInfo(t.t))) return false; // number guard
  const b = contentToks(T);
  if (b.length <= a.length || b.some((t) => NEVER_ACCOUNTED.has(t.t))) return false;
  for (let i = 0; i + a.length <= b.length; i++) {
    let ok = true;
    for (let j = 0; j < a.length; j++) if (!tokEqLoose(a[j], b[i + j])) { ok = false; break; }
    if (!ok) continue;
    if (a.length === 1 && i + a.length < b.length) continue; // head guard: a one-word entry takes words before it only
    return true;
  }
  return false;
}

// J10 collision guard: a fuzzy match is blocked when the response is itself another known answer.
function collides(form, T, m, F, opts) {
  const respKey = T.map((t) => t.t).join(" ");
  if (opts.isKnownAnswer && opts.isKnownAnswer(respKey)) return true;
  // (a) the whole response equals another item of this line (a reject, prompt or anti-prompt target)
  for (const r of F.rejects) if (r.terms.some((t) => strictEq(t, T, false))) return true;
  for (const f of F.prompts.concat(F.antis)) if (f.key === respKey) return true;
  // (b) the fuzzed token is the only required token of its span and is itself a frequent answer word
  for (let gi = 0; gi < m.sel.length; gi++) {
    const o = m.sel[gi];
    if (!o || o === true || !o.cost) continue;
    const g = form.groups[gi];
    const reqWords = g.words.map((i) => form.words[i]).filter((w) => w.kind !== "O");
    if (reqWords.length !== 1 || o.e - o.s !== 1) continue;
    const t = T[o.s].t;
    if (form.words.some((w) => w.t === t)) continue;
    if (knownCollision(t, reqWords[0])) return true;
    if (opts.isKnownAnswer && opts.isKnownAnswer(t)) return true;
  }
  return false;
}

// Extra unaccounted words (J10 below strictness 20): never a negation or a hedge, never a known different answer.
function extraWordsOk(T, m, opts, form) {
  for (const k of m.left) if (NEVER_ACCOUNTED.has(T[k].t)) return false;
  if (form && !form.specificEx) {
    for (let gi = 0; gi < m.sel.length; gi++) {
      const o = m.sel[gi];
      if (!o || o === true || !m.left.includes(o.s - 1)) continue;
      const g = form.groups[gi];
      const first = form.words[g.words[0]], before = form.words[g.words[0] - 1];
      if (first && first.cap && before && before.kind === "O" && before.cap && !ARTICLES_ALL.has(before.t) && !CONNECTIVES.has(before.t) && !HONORIFICS.has(before.t)) return false;
    }
  }
  return !(opts.isKnownAnswer && opts.isKnownAnswer(T.map((x) => x.t).join(" ")));
}

// is the group italic (a title, not a person's name)?
function P_IT(f, g) { const w = f.words[g.words[0]]; return !!(w && w.it); }
// J12: the NAQT implicit prompts (closed list).
function implicitPrompt(F, T) {
  for (const f of F.accepts) {
    if (!f.isMain) continue;
    // part of a space-separated compound surname that follows a given name (J§5.3)
    for (const g of f.groups) {
      if (g.words.length !== 2) continue;
      const w1 = f.words[g.words[0]], w2 = f.words[g.words[1]];
      if (!w1.cap || !w2.cap || w1.kind !== "R" || w2.kind !== "R") continue;
      const before = f.words[g.words[0] - 1];
      if (!before || before.kind !== "O" || !before.cap || ARTICLES_ALL.has(before.t) || CONNECTIVES.has(before.t)) continue;
      if (f.raw && f.raw.src === "main" && P_IT(f, g)) continue;
      const rest = T.filter((t) => !(t.t === before.t || ARTICLES_ALL.has(t.t)));
      if (rest.length === 1 && (rest[0].t === w1.t || rest[0].t === w2.t)) return f;
    }
    // a two-digit year, or decade shorthand (J§8.3, J§8.4)
    for (const w of f.words) {
      if (!w.num || w.num.kind !== "digit" || w.num.v < 1000 || w.num.v > 2099) continue;
      const TT = T.filter((t) => !ARTICLES_ALL.has(t.t));
      const rv = TT.length === 1 ? TT[0].num : null;
      if (rv && rv.v === w.num.v % 100 && !!rv.decade === !!w.num.decade) return f;
    }
  }
  return null;
}

function openClass(rules, F) {
  const oc = rules.open_class || [];
  if (oc.some((x) => /^(?:accept|prompt|antiprompt|prompt_partial):/.test(x))) return true;
  return F.contains.some((c) => (c.kind === "accept" || c.kind === "prompt") && !c.slots.length);
}

// Question-side notes and words ("Two answers required", "Description acceptable", the generic-word rule).
function questionInfo(rc, P) {
  rc.rules = P.rules;
  if (!rc.hasText) return;
  const t = rc.text;
  const extra = {};
  if (/\b(?:two|three|four|both)\s+answers?\s+(?:are\s+)?required\b/i.test(t)) extra.qMulti = true;
  if (/\bdescriptions?\s+(?:is\s+|are\s+)?acceptable\b/i.test(t)) extra.open_class = (P.rules.open_class || []).concat(["accept:description acceptable (question)"]);
  if (Object.keys(extra).length) rc.rules = { ...P.rules, ...extra };
  if (!rc.ti.nouns) {
    rc.ti.nouns = [];
    const toks = tokenize(t, null, false);
    for (let i = 0; i < toks.length; i++) {
      if (!/^(?:this|these|that|those)$/.test(toks[i].t)) continue;
      for (let j = i + 1; j <= i + 3 && j < toks.length; j++) {
        const w = toks[j].t;
        if (GENERIC_NOUNS.has(w)) rc.ti.nouns.push([toks[j].k1, w]);
        else if (w.endsWith("s") && GENERIC_NOUNS.has(w.slice(0, -1))) rc.ti.nouns.push([toks[j].k1, w.slice(0, -1)]);
      }
    }
  }
  // only what has been read: "name this acid" counts once the moderator has said it
  rc.qWords = new Set(rc.ti.nouns.filter(([end]) => end <= rc.buzz).map(([, w]) => w));
}

function judgeTop(resp, P, strictness, opts, plain) {
  const rc = makeReadCtx(opts);
  questionInfo(rc, P);
  const r = String(resp || "").replace(/[?!.]+\s*$/, "").trim();
  let v = judgeOnce(r, P, strictness, opts, rc, plain);
  // a strict reject of the whole response (J4) is final: no filler, acronym or hedge retry may override it
  if (v.status === "accept" || v.rule === "J4") return v;
  const better = (x) => x.status === "accept" || (x.status === "prompt" && v.status !== "prompt");
  // J1 response fillers ("what is", "um", "I think")
  const f = r.replace(FILLER_RX, "");
  if (f !== r && f.trim()) {
    const v2 = judgeOnce(f, P, strictness, opts, rc, plain);
    if (better(v2)) { v = v2; if (v.status === "accept") return v; }
  }
  // common acronyms (J§9.3): UK, USA, WWII, ...
  const toks = r.split(/\s+/);
  if (toks.some((x) => ACRONYMS.has(x.toLowerCase().replace(/\./g, "")))) {
    const ex = toks.map((x) => ACRONYMS.get(x.toLowerCase().replace(/\./g, "")) || x).join(" ");
    const v3 = judgeOnce(ex, P, strictness, opts, rc, plain);
    if (v3.status === "accept") return { ...v3, note: "acronym" };
  }
  // J2 one answer: only the first of several hedged answers counts
  const multi = !!(rc.rules.multi || rc.rules.all_required || rc.rules.qMulti || rc.rules.any_n);
  const pieces = r.split(/\s+(?:or|nor)\s+|\s*;\s*|(?<=\p{L})\s*\/\s*(?=\p{L})|,\s*(?=\S)/u).map((x) => x.trim()).filter(Boolean);
  // a strict reject of the whole response stands ("Portland, Maine" is not a hedge of "Portland")
  if (!multi && pieces.length > 1 && v.status !== "prompt" && v.rule !== "J4") {
    const v4 = judgeOnce(pieces[0], P, strictness, opts, rc, plain);
    v4.note = "only the first answer counts";
    return v4;
  }
  return v;
}

// ======================================================================
// Public API
// ======================================================================
const RANK = { accept: 3, prompt: 2, reject: 1 };
const rankOf = (v) => (RANK[v.status] || 0) + (v.unsure ? 0.5 : 0);

function judgeWithFollowups(resp, P, strictness, opts, plain) {
  const v = judgeTop(resp, P, strictness, opts, plain);
  const prev = [].concat(opts.previous || []).map((x) => String(x || "").trim()).filter(Boolean);
  if (!prev.length || v.status === "accept" || v.rule === "J4") return v;
  // a prompt follow-up is judged alone, then as "first answer + reply" and "reply + first answer" (spec §8)
  let best = v;
  for (const p of prev) {
    for (const combo of [p + " " + resp, resp + " " + p]) {
      const c = judgeTop(combo, P, strictness, opts, plain);
      if (rankOf(c) > rankOf(best)) best = { ...c, note: "judged together with the first answer" };
    }
  }
  if (best.status === "prompt" && prev.some((p) => normalizeText(p) === normalizeText(resp))) {
    return { status: "reject", matchedAnswer: null, prompt: null, rule: "J14", note: "the same answer was already prompted" };
  }
  return best;
}

// Both umlaut transliterations are acceptable (J§3.3): when the standard pass (ö→oe) does not accept and the line
// has ö/ü/ä, a second pass folds them plainly (ö→o).
export function evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10, opts = {}) {
  opts = opts && typeof opts === "object" ? opts : {};
  const resp = String(userAnswer == null ? "" : userAnswer).trim();
  if (!resp) return { status: "reject", matchedAnswer: null, prompt: null };
  const s = Number.isFinite(Number(strictness)) ? Number(strictness) : 10;
  try {
    const P = getLine(answerline, sanitizedAnswerline);
    let v = judgeWithFollowups(resp, P, s, opts, false);
    if (v.status !== "accept" && v.rule !== "J4" && /[öüäÖÜÄ]/.test(P.src)) {
      const v2 = judgeWithFollowups(resp, P, s, opts, true);
      if (rankOf(v2) > rankOf(v)) v = v2;
    }
    return v;
  } catch (e) {
    // never throw into the caller: fall back to a plain comparison with the main answer
    const main = stripTags(String(answerline || sanitizedAnswerline || "")).split(/[\[(]/)[0];
    const ok = normalizeText(main) && normalizeText(main) === normalizeText(resp);
    return { status: ok ? "accept" : "reject", matchedAnswer: ok ? main.trim() : null, prompt: null, error: String(e && e.message || e) };
  }
}

function windowSummary(w, form) {
  if (!w) return { until: null, after: null };
  if (w.side === "whole_question") return { until: null, after: null };
  const mk = w.shape === "self" ? "__self__" : w.shape === "clue" ? String(w.marker || "") : (markerText(w) || "__self__");
  if (w.side === "after") return { until: null, after: mk };
  if (w.side === "before") return { until: mk, after: null };
  if (w.side === "previous_flipped" && w._prev) {
    const p = windowSummary(w._prev, form);
    return { until: p.after, after: p.until };
  }
  if (w.side === "early" || w.side === "sentence" || w.side === "front") return { until: String(w.marker || w.kw || "") || null, after: null };
  return { until: null, after: null };
}

// Legacy summary of a parsed answer line (used by /api/parse-answerline and plugins), plus the spec forms.
export function parseDirectives(answerline, sanitizedAnswerline) {
  const P = getLine(answerline, sanitizedAnswerline);
  const F = linesForms(P, false, null, null);
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const accept = uniq(F.accepts.map((f) => f.display));
  const qualifiers = {};
  for (const f of F.accepts) {
    if (!f.window) continue;
    const w = windowSummary(f.window, f);
    if (w.until || w.after) qualifiers[f.display] = { until: w.until, after: w.after, group: [f.display] };
  }
  const prompt = F.prompts.map((f) => ({ target: f.display, ask: f.ask, ...windowSummary(f.window, f) }));
  for (const c of F.contains) if (c.kind === "prompt") prompt.push({ target: c.text, ask: c.ask, ...windowSummary(c.window) });
  if (P.rules.partial_policy === "prompt") prompt.push({ target: "__partial__", ask: null, until: null, after: null });
  const antiprompt = F.antis.map((f) => ({ target: f.display, ask: f.ask, ...windowSummary(f.window, f) }));
  for (const c of F.contains) if (c.kind === "antiprompt") antiprompt.push({ target: c.text, ask: c.ask, ...windowSummary(c.window) });
  const reject = [];
  for (const r of F.rejects) {
    if (r.labels && r.labels.length) for (const l of r.labels) reject.push(l);
    else for (const t of r.terms) reject.push(t.map((x) => x.orig + (x.poss ? "’s" : "")).join(" "));
  }
  for (const c of F.contains) if (NEG.has(c.kind)) reject.push(c.text);
  if (P.rules.partial_policy === "reject") reject.push("__partial__");
  const main = F.accepts.find((f) => f.isMain);
  const forms = P.ref.forms.map((f) => ({
    kind: f.kind, src: f.src, text: f.text, required: f.R || [], promptable: f.P || [], quoted: f.quoted || null,
    window: f.window ? { side: f.window.side, shape: f.window.shape, marker: f.window.marker } : null,
    ask: f.ask || null, scope: f.scope || null, class: f.cls || null, slots: f.slots || null, substFor: f.subst_for || null,
  }));
  const rules = JSON.parse(JSON.stringify(P.rules));
  return {
    accept, prompt, reject: uniq(reject), antiprompt, qualifiers,
    wordForms: !!(P.rules.word_forms && P.rules.word_forms.length), mainAnswer: main ? main.display : stripTags(P.src).split(/[\[(]/)[0].trim(),
    forms, rules,
  };
}

// A PROMPT is not correct: `correct` is true only for an accept (the bonus-scoring bug, spec §9 rank 1).
export function checkAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10, opts = {}) {
  const r = evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness, opts);
  return {
    correct: r.status === "accept",
    matchedAnswer: r.matchedAnswer,
    isDirective: false,
    prompted: r.status === "prompt",
    status: r.status,
    prompt: r.prompt || null,
    antiprompt: !!r.antiprompt,
    unsure: !!r.unsure,
  };
}

export function checkBonusPart(userAnswer, partAnswerline, partSanitizedLine, pointValue = 10, strictness = 10, opts = {}) {
  const result = checkAnswer(userAnswer, partAnswerline, partSanitizedLine, strictness, opts);
  return {
    correct: result.correct,
    points: result.correct ? pointValue : 0,
    matchedAnswer: result.matchedAnswer,
    status: result.status,
    prompted: result.prompted,
    prompt: result.prompt,
    antiprompt: result.antiprompt,
    unsure: result.unsure,
  };
}

// partOpts: optional array, one object per part ({ jointPieces?, hidden?, readText?, fullText?, readLen?, previous? }),
// merged into that part's evaluateAnswer opts.
export function checkBonus(userAnswers, bonusData, strictness = 10, partOpts = null) {
  const parts = [];
  let totalPoints = 0;
  // DB row fields are JSON strings; already-parsed arrays work too
  const arr = (v, d) => {
    if (Array.isArray(v)) return v;
    try { const x = JSON.parse(v); return Array.isArray(x) ? x : d; } catch { return d; }
  };
  const bd = bonusData || {};
  const answers = arr(bd.answers, []);
  const answersSanitized = arr(bd.answers_sanitized, []);
  const values = arr(bd.point_values ?? bd.values, [10, 10, 10]);
  const n = Math.max(answers.length, answersSanitized.length) || 3;
  for (let i = 0; i < n; i++) {
    const po = Array.isArray(partOpts) && partOpts[i] && typeof partOpts[i] === "object" ? partOpts[i] : {};
    const value = Number(values[i]) || 10;
    const r = checkBonusPart((userAnswers && userAnswers[i]) || "", answers[i] || "", answersSanitized[i] || "", value, strictness, po);
    parts.push(r);
    totalPoints += r.points;
  }
  return { parts, totalPoints };
}

// The spec forms of an answer line (parse half only): { forms, rules } — for tools and tests.
export function parseAnswerLineForms(answerline, sanitizedAnswerline) {
  const d = parseDirectives(answerline, sanitizedAnswerline);
  return { forms: d.forms, rules: d.rules };
}

// debugging aid for tests (not part of the stable API)
export function __debugLine(answerline, sanitized, opts = {}) {
  const P = getLine(answerline, sanitized);
  const rc = makeReadCtx(opts);
  questionInfo(rc, P);
  const F = linesForms(P, false, opts.jointPieces, rc.rules);
  const fw = (f) => ({ kind: f.kind, src: f.src, display: f.display, live: isLive(f, rc), win: f.window ? [f.window.side, f.window.shape, f.window.marker, f.window.inSent, windowSpan(f.window, f, rc)] : null,
    words: f.words.map((w) => w.t + ":" + w.kind + (w.run >= 0 ? "#" + w.run : "")).join(" "), groups: f.groups.map((g) => g.words.join("+")).join(" | "), parts: JSON.stringify(f.parts), ask: f.ask, scope: f.scope });
  return { rules: rc.rules, buzz: rc.buzz, accepts: F.accepts.map(fw), prompts: F.prompts.map(fw), antis: F.antis.map(fw),
    rejects: F.rejects.map((r) => ({ kind: r.kind, terms: r.terms.map((t) => t.map((x) => x.t).join(" ")), both: r.both, live: isLive(r, rc) })),
    noprompts: F.noprompts.map((r) => r.terms.map((t) => t.map((x) => x.t).join(" "))),
    contains: F.contains.map((c) => ({ kind: c.kind, slots: c.slots.map((a) => a.map((t) => t.map((x) => x.t).join(" "))), desc: c.desc && c.desc.map((x) => x.t).join(" "), live: isLive(c, rc) })),
    issues: P.L.issues };
}
