export function stripTags(text) {
  return text.replace(/<[^>]+>/g, "").trim();
}

export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
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
    // Fold any remaining combining diacritics (ř → r, ą → a, …).
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    // Hyphenated words compare as separate words ("Beer-Lambert" ≡ "Beer Lambert"),
    // otherwise "beer-lambert" would be one token that never matches "Beer".
    .replace(/[-–—‐]/g, " ")
    // Keep every letter/digit (π, đ …) plus + and # — they distinguish
    // answers ("C" vs "C++" vs "C#", "π").
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

// ── Fuzzy Word Matching ────────────────────────────────

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

const FUZZY = /^[a-z]/; // word must start with a letter for fuzzy matching

function stripWordSuffixes(w) {
  return w.replace(/[''](s|ll|re|ve|d|m|t)$/, "").replace(/(ing|ed|er|est|ly|ment)$/, "");
}

function hasDigits(w) { return /\d/.test(w); }

// strictness: 0 (very lenient) … 20 (exact only). Controls typo tolerance.
function fuzzyWordMatch(requiredText, userText, strictness = 10) {
  if (!requiredText || !userText) return false;

  const reqNorm = normalizeText(requiredText);
  const userNorm = normalizeText(userText);

  // Full text exact match after normalization
  if (reqNorm === userNorm) return true;

  // Check if concatenated user words match required (catches "Fuente Ovejuna" vs "Fuenteovejuna")
  const userJoined = userNorm.replace(/\s+/g, "");
  const reqJoined = reqNorm.replace(/\s+/g, "");
  if (reqJoined === userJoined) return true;

  const reqWords = reqNorm.split(/\s+/);
  const userWords = userNorm.split(/\s+/);

  // All-words exact string checks (after stripping suffixes)
  const reqStripped = reqWords.map(stripWordSuffixes);
  const userStripped = userWords.map(stripWordSuffixes);

  const smaller = reqStripped.length <= userStripped.length ? reqStripped : userStripped;
  const larger = reqStripped.length <= userStripped.length ? userStripped : reqStripped;

  for (const sw of smaller) {
    if (sw.length < 1) continue;
    let found = false;
    for (const lw of larger) {
      if (lw.length < 1) continue;
      if (sw === lw) { found = true; break; }

      // Short words (1-2 chars) must match exactly — no fuzz
      if (sw.length < 3 || lw.length < 3) continue;

      // Digit-containing words must match exactly
      if (hasDigits(sw) || hasDigits(lw)) continue;

      // Typos allowed scales with strictness: ~1 per 4 chars when lenient,
      // capped at 1 when strict, +1 when very lenient.
      let maxDist = Math.max(1, Math.floor(Math.min(sw.length, lw.length) / 4));
      if (strictness >= 14) maxDist = 1;
      if (strictness >= 20) maxDist = 0; // perfect typing — exact words only, no typos
      if (strictness <= 4) maxDist += 1;
      const dist = levenshtein(sw, lw);
      if (dist <= maxDist) { found = true; break; }

      // Partial contains (e.g. "revere" inside "reveres") — only when not strict
      if (strictness < 14 && sw.length >= 4 && lw.length >= 4) {
        if (lw.includes(sw) || sw.includes(lw)) { found = true; break; }
      }
    }
    if (!found) return false;
  }
  return true;
}

// ── Main Check ─────────────────────────────────────────

// Backwards-compatible boolean check (used by bonuses, which have no re-prompt
// UI so a prompt-level match still counts as correct). Rejects are honored.
export function checkAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10) {
  const r = evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness);
  return {
    correct: r.status === "accept" || r.status === "prompt",
    matchedAnswer: r.matchedAnswer,
    isDirective: false,
    prompted: r.status === "prompt",
  };
}

// ── Accept / Prompt / Reject evaluation ────────────────
// Parse an answerline into accept / prompt / reject directives.
function stripQuotes(s) {
  return (s || "").replace(/^["“”'']+|["“”'']+$/g, "").trim();
}
function splitAlts(content) {
  return content
    .split(/\s+or\s+|;|,/i)
    .map((a) => stripQuotes(stripTags(a).trim()))
    .filter(Boolean);
}
// Pull the text of every <u>…</u> (underline = the required/acceptable part).
function extractUnderlined(html) {
  const out = [];
  const re = /<u>([\s\S]*?)<\/u>/gi;
  let m;
  while ((m = re.exec(html)) !== null) { const t = stripTags(m[1]).trim(); if (t) out.push(t); }
  return out;
}

// Visible text of an HTML fragment plus the [start,end) spans (in visible-text
// coordinates) covered by <u> underlining. Needed because answer lines often
// underline only part of a word ("<u>pleb</u>eians"): the stem is the minimum
// acceptable answer, but the surrounding full word must be acceptable too.
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
  // Merge spans separated only by an apostrophe/space ("<u>Night</u>’<u>s
  // Dream</u>" is ONE phrase, not two stems).
  const merged = [];
  for (const sp of spans) {
    const prev = merged[merged.length - 1];
    if (prev && sp[0] - prev[1] <= 1 && /^['’\u2019-]?$/.test(vis.slice(prev[1], sp[0]))) prev[1] = sp[1];
    else merged.push([sp[0], sp[1]]);
  }
  return { vis, spans: merged };
}

const WORD_CHAR = /[A-Za-z0-9'’]/;

// Candidate acceptable strings for ONE answer phrase. If any part is underlined,
// ONLY the underlined parts count (so non-underlined words like "Ludwig" in
// "Ludwig Mies van der Rohe" are NOT accepted). A partially-underlined word
// contributes both the underlined stem AND the full word ("<u>pleb</u>eians" →
// "pleb" and "plebeians"). With no underlining, the whole visible text counts.
function phraseTerms(html) {
  const terms = [];
  const { vis, spans } = underlineSpans(html);
  if (spans.length) {
    const stems = [], fulls = [];
    for (const [s0, e0] of spans) {
      const stem = vis.slice(s0, e0).trim();
      if (stem) stems.push(stem);
      let s = s0, e = e0;
      while (s > 0 && WORD_CHAR.test(vis[s - 1])) s--;
      while (e < vis.length && WORD_CHAR.test(vis[e])) e++;
      const full = vis.slice(s, e).trim();
      if (full) fulls.push(full);
    }
    const acronym = stems.length > 1 && stems.every((t) => t.length === 1);
    if (acronym) {
      // First-letter underlining = the acronym + the full phrase only.
      terms.push(stems.join(""));
      terms.push(fulls.join(" "));
      terms.push(fulls.join(""));
    } else {
      stems.forEach((t) => { if (t.length > 1) terms.push(t); });
      fulls.forEach((t) => { if (t.length > 1 || stems.length === 1) terms.push(t); });
      if (stems.length > 1) { terms.push(stems.join("")); terms.push(stems.join(" ")); }
      if (fulls.length > 1) { terms.push(fulls.join("")); terms.push(fulls.join(" ")); }
    }
  } else {
    const full = stripQuotes(stripTags(html).trim());
    if (full) terms.push(full);
  }
  // A term must contain something pronounceable — drops stray punctuation
  // fragments (e.g. a lone "’" between two underline segments).
  return [...new Set(terms.filter((t) => t && /[a-zA-Z0-9]/.test(t)))];
}

// Terms inside a directive clause: split into "or"/comma alternates, expand each
// via phraseTerms, and also pull out double-quoted substrings.
// opts.fullPhrase: use each part's whole visible text instead of the
// underlined-only rule. Prompt/reject directives need this — underlining there
// is emphasis ("prompt on characters from <u>Midnight's Children</u>"), and
// reducing the target to its underlined words would turn the real answer into
// a prompt target.
// Filler that means "and variations of the above", not an answer itself
// ("…or keening or similar" must not make "similar" an acceptable answer).
const FILLER_TERM = /^(or\s+)?(similar|equivalents?|word\s*forms?|forms?|etc\.?|so\s+on|the\s+like|and\s+so\s+forth|anything\s+similar|likewise)$/i;

// Commentary, not a term: editor notes that leak into directive content.
const COMMENTARY = /\b(accept|prompt|reject|do not|is read|in the question|not needed|if it is|before this|are totally|any of the above|by asking)\b/i;

function extractTerms(content, opts = {}) {
  const out = [];
  // Quoted phrases are ATOMIC — pull them out before comma/semicolon splitting
  // so '"Alexandre Dumas, fils"' stays one term instead of being severed at
  // the comma (which would wrongly reject "Alexandre Dumas" itself).
  content = String(content).replace(/["“”]([^"“”]+)["“”]/g, (m, inner) => {
    const t = stripTags(inner).trim();
    if (t) out.push(t);
    return " ";
  });
  content.split(/\s+or\s+|,|;/i).forEach((part) => {
    // "answers similar to X" / "similar to X" — the term is X, not the phrase.
    part = part.replace(/^\s*(answers?|anything|things?)\s+similar\s+to\s+/i, "")
               .replace(/^\s*similar\s+to\s+/i, "")
               // Connective lead-ins ("logical equivalents like X", "specific
               // derivations such as X", "things like X") are NOT terms — keep
               // only what follows the connective. If a quoted term was already
               // pulled out, what remains is just the lead-in and becomes empty.
               .replace(/^.*?\b(equivalents?|derivations?|variants?|synonyms?|spellings?|abbreviations?|forms?|names?|titles?|versions?|things?|answers?|terms?|examples?)\s+(?:like|such as|including)\b[\s:,.–—-]*/i, "")
               .replace(/^[\s:;,.–—-]+/, "");
    if (opts.fullPhrase) {
      const t = stripQuotes(stripTags(part).trim()).replace(/^[\s:;,.–—-]+/, "");
      if (t) out.push(t);
    } else {
      phraseTerms(part).forEach((t) => out.push(t));
    }
  });
  return [...new Set(out.filter((t) =>
    t && /[a-zA-Z0-9]/.test(t) &&
    !FILLER_TERM.test(t.trim()) &&
    !/\b(like|such as|including)\s*$/i.test(t.trim()) &&  // bare connective lead-in
    t.split(/\s+/).length <= 6 &&        // 7+ words = commentary, not an answer
    !COMMENTARY.test(t)
  ))];
}

// A [..]/(..) container counts as a DIRECTIVE only if it has a directive keyword
// (so "(Mary)", "(“beck-doo”)", "(5)" and "[AU]" stay part of the answer).
function isDirectiveInner(inner) {
  return /\b(accept|prompt|reject|do not|anti-?prompt)\b/i.test(inner) || /^\s*or\b/i.test(inner);
}

// All top-level [..] / (..) containers, with BALANCED nesting — a regex like
// \([^)]*\) would truncate '(do not accept "Christopher (Robin) Milne")' at
// the first ")", mangling the directive into a reject of the real answer.
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

export function parseDirectives(answerline, sanitizedAnswerline) {
  const raw = (answerline && answerline.trim()) ? answerline : (sanitizedAnswerline || "");
  const accept = [];
  const prompt = []; // { target, ask, until, after }
  const reject = [];
  const antiprompt = []; // { target, ask } — answer was TOO SPECIFIC
  const qualifiers = {}; // accept term -> { until, after } read-position rules
  const pushUniq = (arr, v) => { if (v && !arr.includes(v)) arr.push(v); };

  // Main answer = everything before the first DIRECTIVE container.
  const containers = findContainers(raw);
  const firstDirC = containers.find((c) => isDirectiveInner(c.text.slice(1, -1)));
  const mainRaw = firstDirC ? raw.slice(0, firstDirC.start) : raw;
  phraseTerms(mainRaw).forEach((t) => pushUniq(accept, t));
  // Typing the ENTIRE main answer always works, even when only part of it is
  // underlined. All content words are required, so this never loosens what a
  // partial answer can match.
  const mainFull = stripQuotes(stripTags(mainRaw).trim());
  if (mainFull && /[a-zA-Z0-9]/.test(mainFull)) pushUniq(accept, mainFull);
  // The sanitized line's spelling can differ from the raw one (e.g. "Für
  // Elise" vs "Fur Elise") — accept the sanitized main answer too.
  if (sanitizedAnswerline && sanitizedAnswerline !== raw) {
    const sContainers = findContainers(sanitizedAnswerline);
    const sFirst = sContainers.find((c) => isDirectiveInner(c.text.slice(1, -1)));
    const sMain = stripQuotes((sFirst ? sanitizedAnswerline.slice(0, sFirst.start) : sanitizedAnswerline).trim());
    if (sMain && /[a-zA-Z0-9]/.test(sMain)) pushUniq(accept, sMain);
  }

  // "accept word forms" → looser stem matching for the accept terms.
  const wordForms = /accept\s+(\w+\s+)?word\s*forms?/i.test(raw) || /\(accept forms\)/i.test(raw);

  const DIR_RE = /\b(do not accept or prompt on|do not accept|do not prompt on|anti-?prompt on|antiprompt on|antiprompt|anti-?prompt|also accept|accept|prompt on|prompt|reject)\b/gi;

  // "until X (is read)" / "before X" / "after X" → a read-position rule.
  // Returns { content (clause stripped), until, after }.
  function takeQualifier(content) {
    const out = { content, until: null, after: null };
    const m = content.match(/\b(before|until|after)\b\s*([\s\S]{0,80})$/i);
    if (!m) return out;
    out.content = content.slice(0, m.index).trim();
    const kind = m[1].toLowerCase();
    let markerSrc = m[2] || "";
    // "until read" / "until mentioned" → the marker is the term itself.
    let marker;
    if (/^(it\s+is\s+)?(read|mention(ed)?|given|said)\b/i.test(markerSrc.trim()) || !markerSrc.trim()) {
      marker = "__self__";
    } else {
      const q = markerSrc.match(/["“”']([^"“”']+)["“”']/);
      marker = stripTags(q ? q[1] : markerSrc).replace(/\b(is read|is mentioned|is said|is given|mention(ed)?|read)\b[\s\S]*$/i, "").trim();
      marker = marker.split(/\s+/).slice(0, 5).join(" ");
      if (!marker) marker = "__self__";
    }
    if (kind === "after") out.after = marker;
    else out.until = marker;
    return out;
  }

  // A clean prompt question: prefer the quoted text, drop stray tails.
  function cleanAsk(askSrc) {
    if (!askSrc) return null;
    const q = String(askSrc).match(/["“”]([^"“”]+)["“”]/);
    let a = q ? q[1] : askSrc;
    a = stripTags(String(a)).replace(/["“”;,.\s]+$/g, "").replace(/^["“”\s]+/g, "").trim();
    return a || null;
  }

  function classify(dir, content) {
    dir = dir.toLowerCase().replace(/[-\s]+/g, " ");
    const qual = takeQualifier(content);
    content = qual.content;
    if (/^(accept|also accept|or)$/.test(dir)) {
      // "accept Y in place of / instead of / for "X"" — X names the substituted
      // part of the answer; it is NOT itself acceptable. Drop that phrasing.
      content = content.replace(/\b(in place of|instead of|for)\s+["“”][^"“”]*["“”]/gi, "").trim();
      const terms = extractTerms(content);
      terms.forEach((t) => {
        const isNew = !accept.includes(t);
        pushUniq(accept, t);
        // An UNCONDITIONED accept always wins: if the term was already
        // acceptable without a window, don't shackle it with one
        // ("<u>Gestalt</u> psychology (accept Gestalt therapy before X)").
        if (isNew && (qual.until || qual.after)) qualifiers[t] = { until: qual.until, after: qual.after, group: terms };
      });
    } else if (/^anti ?prompt/.test(dir)) {
      let ask = null;
      const askM = content.match(/\bby asking\b[:,]?\s*([\s\S]+)$/i);
      if (askM) { ask = cleanAsk(askM[1]); content = content.slice(0, content.indexOf(askM[0])).trim(); }
      extractTerms(content, { fullPhrase: true }).forEach((t) => antiprompt.push({ target: t, ask }));
    } else if (/^prompt/.test(dir)) {
      let ask = null;
      const askM = content.match(/\bby asking\b[:,]?\s*([\s\S]+)$/i);
      if (askM) { ask = cleanAsk(askM[1]); content = content.slice(0, content.indexOf(askM[0])).trim(); }
      // "prompt to be less specific on X" / "prompt by asking for less
      // specificity on X" — the target is X, the rest is phrasing.
      content = content.replace(/^\s*(to\s+be|by\s+being|for)\s+less\s+specific(ity)?\s+(on|about)?\s*/i, "");
      if (/\b(partial|incomplete|less[- ]specific)\s+answers?\b/i.test(content)) {
        prompt.push({ target: "__partial__", ask, until: qual.until, after: qual.after });
        content = content.replace(/\b(such as|like|e\.g\.?,?)\b/i, ";").split(";").slice(1).join(";");
      }
      extractTerms(content, { fullPhrase: true }).forEach((t) => prompt.push({ target: t, ask, until: qual.until, after: qual.after }));
    } else {
      if (/\b(partial|incomplete)\s+answers?\b/i.test(content)) {
        pushUniq(reject, "__partial__");
        content = content.replace(/\b(such as|like|e\.g\.?,?)\b/i, ";").split(";").slice(1).join(";");
      }
      extractTerms(content, { fullPhrase: true }).forEach((t) => pushUniq(reject, t));
    }
  }

  for (const cont of containers) {
    const g = cont.text;
    const inner = g.slice(1, -1);
    if (!isDirectiveInner(inner)) continue;
    const matches = [...inner.matchAll(DIR_RE)];
    const head = matches.length ? inner.slice(0, matches[0].index) : inner;
    const hm = head.match(/^\s*(also accept|accept|or)\b\s*/i);
    if (hm) {
      const headQual = takeQualifier(head.slice(hm[0].length).replace(/[;,\s]+$/, ""));
      const headTerms = extractTerms(headQual.content);
      headTerms.forEach((t) => {
        const isNew = !accept.includes(t);
        pushUniq(accept, t);
        if (isNew && (headQual.until || headQual.after)) qualifiers[t] = { until: headQual.until, after: headQual.after, group: headTerms };
      });
    }
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : inner.length;
      let content = inner.slice(start, end).replace(/^\s*(but|and|;|,|:)\s*/i, "").replace(/\s+(but|and)\s*$/i, "").trim();
      classify(matches[i][1], content);
    }
  }
  return { accept, prompt, reject, antiprompt, qualifiers, wordForms, mainAnswer: mainFull };
}

// ── Matching helpers ───────────────────────────────────
const STOPWORDS = new Set(["the", "a", "an", "of", "and", "or", "de", "la", "le", "el", "il"]);
function singularize(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";   // babies -> baby
  if (w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2); // boxes -> box
  if (w.length > 2 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1); // serbs -> serb, popes -> pope
  return w;
}
// Content words: drop stopwords, singularize (so plural forms match).
function contentWords(norm) {
  return norm.split(/\s+/).filter((w) => w && !STOPWORDS.has(w)).map(singularize);
}

// The PRIMARY display answer of a line: the (expanded) underlined part of the
// main answer — aliases in [or …]/[accept …] are ignored, so "China",
// "Zhongguo" and "People's Republic of China" don't make three entries.
export function primaryAnswer(raw, sanitized) {
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

// A grouping key that folds plural forms together (for the frequency list).
export function frequencyKey(answer) {
  return normalizeText(answer || "").split(/\s+/).filter(Boolean).map(singularize).join(" ");
}

// Are two answers "similar enough" to count as the same frequency entry
// (e.g. mitochondria / mitochondrion, or singular/plural forms)?
// Key with light verbal-suffix stemming, used to fold word forms together
// in the frequency list ("weeping"/"weep", "mourning"/"mourn").
function stemKey(answer) {
  return normalizeText(answer || "")
    .split(/\s+/).filter(Boolean).map(singularize)
    .map((w) => (w.length > 5 ? w.replace(/(ing|ed|ment|ness|tion)$/, "") : w))
    .join("");
}

export function answersSimilar(a, b) {
  const ka = frequencyKey(a).replace(/\s+/g, "");
  const kb = frequencyKey(b).replace(/\s+/g, "");
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (stemKey(a) === stemKey(b)) return true;
  const min = Math.min(ka.length, kb.length);
  if (min < 5) return false; // short words must match exactly (after singularize)
  // Long shared prefix differing only by a short suffix (mitochondri-a / -on).
  if (ka.slice(0, min - 2) === kb.slice(0, min - 2) && Math.abs(ka.length - kb.length) <= 3) return true;
  return levenshtein(ka, kb) <= Math.max(1, Math.floor(min / 5));
}

// Spelled-out numbers equal their digits ("eight" ≡ "8", "thousand" ≡ "1000").
const NUM_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  million: 1000000,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7,
  eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
};
const ROMAN = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15, xvi: 16, xvii: 17, xviii: 18,
  xix: 19, xx: 20,
};
function numVal(w) {
  if (/^\d+(st|nd|rd|th)?$/.test(w)) return parseInt(w, 10);
  if (w in NUM_WORDS) return NUM_WORDS[w];
  if (w in ROMAN) return ROMAN[w]; // "Act III" ≡ "Act 3" ≡ "Act three"
  return null;
}

// One term word vs one user word: exact, or (below max strictness) a small typo.
function wordMatches(tw, uw, strictness) {
  if (tw === uw) return true;
  const na = numVal(tw), nb = numVal(uw);
  if (na !== null && nb !== null) return na === nb;
  if (strictness < 20 && tw.length >= 4 && uw.length >= 4 && !/\d/.test(tw) && !/\d/.test(uw)) {
    const maxDist = strictness >= 14 ? 1 : Math.max(1, Math.floor(Math.min(tw.length, uw.length) / 4));
    if (levenshtein(tw, uw) <= maxDist) return true;
  }
  return false;
}

// ACCEPT: the user must have said (at least) every required word of the term.
// Extra words are fine; plurals and (looser strictness) typos are tolerated.
// Each user word can satisfy only ONE term word — otherwise "wang" alone would
// fuzzily satisfy both words of "Wang Mang".
function acceptMatch(term, userNorm, strictness, wordForms) {
  const t = normalizeText(term);
  if (!t) return false;
  const tNoArt = stripLeadingArticle(t), uNoArt = stripLeadingArticle(userNorm);
  if (userNorm === t || userNorm === tNoArt || uNoArt === t || uNoArt === tNoArt) return true;
  if (t.replace(/\s+/g, "") === userNorm.replace(/\s+/g, "") && t.replace(/\s+/g, "")) return true;
  const termWords = contentWords(t), userWords = contentWords(userNorm);
  if (!termWords.length || !userWords.length) return false;
  const used = new Array(userWords.length).fill(false);
  for (const tw of termWords) {
    let found = false;
    for (let i = 0; i < userWords.length; i++) {
      if (used[i]) continue;
      if (wordMatches(tw, userWords[i], strictness)) { used[i] = true; found = true; break; }
      // "(accept word forms)": Italian ≡ Italy ≡ Italians — shared stem of 4+
      // letters with short differing suffixes.
      if (wordForms) {
        const a = tw, b = userWords[i];
        const pre = Math.min(a.length, b.length);
        let k = 0; while (k < pre && a[k] === b[k]) k++;
        if (k >= 4 && a.length - k <= 4 && b.length - k <= 4) { used[i] = true; found = true; break; }
      }
    }
    if (!found) return false;
  }
  return true;
}

// PROMPT: lenient — prompt when the user's answer matches the target outright,
// or contains a significant part of it (at least half the target's content
// words), e.g. "water polo game" includes the promptable "water polo matches".
function promptMatch(target, userNorm, strictness) {
  if (acceptMatch(target, userNorm, strictness)) return true;
  const tw = contentWords(normalizeText(target));
  const uw = contentWords(userNorm);
  if (tw.length < 2 || !uw.length) return false;
  const used = new Array(uw.length).fill(false);
  let found = 0;
  for (const t of tw) {
    for (let i = 0; i < uw.length; i++) {
      if (used[i]) continue;
      if (wordMatches(t, uw[i], strictness)) { used[i] = true; found++; break; }
    }
  }
  return found >= Math.ceil(tw.length / 2);
}

// PROMPT / REJECT: the user's answer must essentially BE the term (plural-aware,
// no "extra words" leniency) so partials/real answers aren't wrongly caught.
function strictMatch(target, userNorm) {
  const t = normalizeText(target);
  if (!t || !userNorm) return false;
  const tNoArt = stripLeadingArticle(t), uNoArt = stripLeadingArticle(userNorm);
  if (userNorm === t || userNorm === tNoArt || uNoArt === t || uNoArt === tNoArt) return true;
  const tw = contentWords(t), uw = contentWords(userNorm);
  if (tw.length && tw.length === uw.length && tw.every((w, i) => w === uw[i])) return true;
  const tj = tw.join(""), uj = uw.join("");
  if (tj && tj === uj) return true;
  if (!/\s/.test(t) && !/\s/.test(userNorm) && t.length >= 5 && levenshtein(t, userNorm) <= 1) return true;
  return false;
}

// Returns { status: "accept" | "prompt" | "reject", matchedAnswer, prompt }.
// Order: explicit rejects (strict), then accepts (but a bare prompt-target is not
// auto-accepted), then prompts (lenient — if the answer INCLUDES a promptable
// part, prompt on it).
// Words/bigrams of the main answer, for "prompt on partial answer" lines.
function partialTargets(d) {
  const main = normalizeText(d.mainAnswer || (d.accept[0] || ""));
  const words = contentWords(main);
  const out = new Set();
  for (const w of words) if (w.length >= 2) out.add(w);
  for (let i = 0; i + 1 < words.length; i++) out.add(words[i] + " " + words[i + 1]);
  return [...out];
}

// opts.readText / opts.fullText / opts.readLen: how much of the question has
// been read at buzz time (null = unknown). Window semantics are WORD-EXACT:
// "before X" dies the moment X STARTS being read; "after X" only lives once X
// has FINISHED being read.
export function evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10, opts = {}) {
  if (!userAnswer || !userAnswer.trim()) return { status: "reject", matchedAnswer: null, prompt: null };
  const userNorm = normalizeText(userAnswer.trim());
  if (!userNorm) return { status: "reject", matchedAnswer: null, prompt: null };
  const d = parseDirectives(answerline, sanitizedAnswerline);
  const rejectNorms = new Set(d.reject.map((r) => normalizeText(r)));
  const hasPos = opts.readText != null;
  const readNorm = hasPos ? normalizeText(opts.readText) : null;
  const fullLower = hasPos && opts.fullText ? String(opts.fullText).toLowerCase() : null;
  const readLen = hasPos ? (opts.readLen != null ? opts.readLen : String(opts.readText).length) : null;

  // Has `marker` STARTED / FINISHED being read? Prefer exact positions in the
  // full question text; fall back to a contains check on the read part.
  function markerStarted(marker) {
    const m = String(marker).toLowerCase().trim();
    if (!m) return false;
    if (fullLower) {
      const idx = fullLower.indexOf(m);
      if (idx >= 0) return readLen > idx;
    }
    return readNorm.includes(normalizeText(m));
  }
  function markerFinished(marker) {
    const m = String(marker).toLowerCase().trim();
    if (!m) return false;
    if (fullLower) {
      const idx = fullLower.indexOf(m);
      if (idx >= 0) return readLen >= idx + m.length;
    }
    return readNorm.includes(normalizeText(m));
  }
  function termLive(term, until, after, group) {
    if (!hasPos) return true; // no position info — be generous
    if (until) {
      const variants = until === "__self__" ? (group && group.length ? group : [term]) : [until];
      for (const v of variants) if (markerStarted(v)) return false;
    }
    if (after) {
      const marker = after === "__self__" ? term : after;
      if (!markerFinished(marker)) return false;
    }
    return true;
  }
  function isConditioned(a) { const q = d.qualifiers[a]; return !!(q && (q.until || q.after)); }
  function acceptLive(a) {
    const q = d.qualifiers[a];
    return !q || termLive(a, q.until, q.after, q.group);
  }

  // ── 1) REJECT (strict, plural-aware) — explicit rejects always win, except
  //       a verbatim accept beats a fuzzy-near reject.
  const userJoined = userNorm.replace(/\s+/g, "");
  const exactAccept = d.accept.find((a) => {
    if (!acceptLive(a)) return false;
    const an = normalizeText(a);
    return an && !rejectNorms.has(an) && (an === userNorm || an.replace(/\s+/g, "") === userJoined);
  });
  if (!exactAccept) {
    const rejTargets = [];
    for (const r of d.reject) {
      if (r === "__partial__") partialTargets(d).forEach((t) => rejTargets.push(t));
      else rejTargets.push(r);
    }
    for (const r of rejTargets) {
      if (strictMatch(r, userNorm)) return { status: "reject", matchedAnswer: null, prompt: null };
    }
  } else {
    return { status: "accept", matchedAnswer: exactAccept, prompt: null };
  }

  // ── 2) ACCEPT — unconditioned terms first, then windowed ones ──
  for (const a of d.accept) {
    if (isConditioned(a)) continue;
    if (acceptMatch(a, userNorm, strictness, d.wordForms)) return { status: "accept", matchedAnswer: a, prompt: null };
  }
  for (const a of d.accept) {
    if (!isConditioned(a) || !acceptLive(a)) continue;
    if (acceptMatch(a, userNorm, strictness, d.wordForms)) return { status: "accept", matchedAnswer: a, prompt: null };
  }

  // ── 2.5) A windowed accept whose window EXPIRED is a dead answer — reject. ──
  for (const a of d.accept) {
    if (!isConditioned(a) || acceptLive(a)) continue;
    if (strictMatch(a, userNorm) || acceptMatch(a, userNorm, strictness, d.wordForms)) {
      return { status: "reject", matchedAnswer: null, prompt: null };
    }
  }

  // ── 3) PROMPT — unconditioned targets first, then windowed ones ──
  const mainNorm = normalizeText(d.mainAnswer || "");
  function promptDead(target) {
    if (!hasPos) return false;
    const tn = normalizeText(target);
    if (!tn) return true;
    return readNorm.includes(tn);
  }
  function tryPrompt(p) {
    const isPartial = p.target === "__partial__";
    const targets = isPartial ? partialTargets(d) : [p.target];
    for (const target of targets) {
      if (!termLive(target, p.until, p.after)) continue;
      if (isPartial && promptDead(target)) continue;
      const hit = isPartial ? strictMatch(target, userNorm) : promptMatch(target, userNorm, strictness);
      if (hit) return { status: "prompt", matchedAnswer: target, prompt: { target, ask: p.ask || null } };
    }
    return null;
  }
  for (const p of d.prompt) {
    if (p.until || p.after) continue;
    const r = tryPrompt(p);
    if (r) return r;
  }
  for (const p of d.prompt) {
    if (!p.until && !p.after) continue;
    const r = tryPrompt(p);
    if (r) return r;
  }

  // ── 4) ANTI-PROMPT (answer too specific — prompt them back up) ──
  for (const ap of d.antiprompt) {
    if (strictMatch(ap.target, userNorm) || acceptMatch(ap.target, userNorm, strictness)) {
      return {
        status: "prompt", antiprompt: true, matchedAnswer: ap.target,
        prompt: { target: ap.target, ask: ap.ask || "your answer is too specific — be less specific" },
      };
    }
  }
  return { status: "reject", matchedAnswer: null, prompt: null };
}

function parsePromptAnswers(answerline, sanitizedAnswerline) {
  const prompts = [];
  const raw = answerline || "";
  const regex = /\[prompt on\s+([^\]]+)\]/gi;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const content = match[1].trim();
    const alts = content.split(/\s+or\s+|\s*,\s*/);
    for (const alt of alts) {
      const a = stripTags(alt).trim();
      if (a) prompts.push(a);
    }
  }
  if (sanitizedAnswerline && prompts.length === 0) {
    const sanRegex = /\[prompt on\s+([^\]]+)\]/gi;
    while ((match = sanRegex.exec(sanitizedAnswerline)) !== null) {
      const alts = match[1].trim().split(/\s+or\s+|\s*,\s*/);
      for (const alt of alts) {
        const a = alt.trim();
        if (a) prompts.push(a);
      }
    }
  }
  return prompts;
}

export function checkBonusPart(userAnswer, partAnswerline, partSanitizedLine, pointValue = 10) {
  const result = checkAnswer(userAnswer, partAnswerline, partSanitizedLine);
  return {
    correct: result.correct,
    points: result.correct ? pointValue : 0,
    matchedAnswer: result.matchedAnswer,
  };
}

export function checkBonus(userAnswers, bonusData) {
  const parts = [];
  let totalPoints = 0;
  let answers, answersSanitized, values;
  try { answers = JSON.parse(bonusData.answers); } catch { answers = []; }
  try { answersSanitized = JSON.parse(bonusData.answers_sanitized); } catch { answersSanitized = []; }
  try { values = JSON.parse(bonusData.point_values ?? bonusData.values); } catch { values = [10, 10, 10]; }

  for (let i = 0; i < 3; i++) {
    const r = checkBonusPart(userAnswers[i] || "", answers[i] || "", answersSanitized[i] || "", values[i] || 10);
    parts.push(r);
    totalPoints += r.points;
  }
  return { parts, totalPoints };
}
