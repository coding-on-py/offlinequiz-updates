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

const FUZZY = /^[a-z]/;

function stripWordSuffixes(w) {
  return w.replace(/[''](s|ll|re|ve|d|m|t)$/, "").replace(/(ing|ed|er|est|ly|ment)$/, "");
}

function hasDigits(w) { return /\d/.test(w); }

function fuzzyWordMatch(requiredText, userText, strictness = 10) {
  if (!requiredText || !userText) return false;

  const reqNorm = normalizeText(requiredText);
  const userNorm = normalizeText(userText);

  if (reqNorm === userNorm) return true;

  const userJoined = userNorm.replace(/\s+/g, "");
  const reqJoined = reqNorm.replace(/\s+/g, "");
  if (reqJoined === userJoined) return true;

  const reqWords = reqNorm.split(/\s+/);
  const userWords = userNorm.split(/\s+/);

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

      if (sw.length < 3 || lw.length < 3) continue;

      if (hasDigits(sw) || hasDigits(lw)) continue;

      let maxDist = Math.max(1, Math.floor(Math.min(sw.length, lw.length) / 4));
      if (strictness >= 14) maxDist = 1;
      if (strictness >= 20) maxDist = 0;
      if (strictness <= 4) maxDist += 1;
      const dist = levenshtein(sw, lw);
      if (dist <= maxDist) { found = true; break; }

      if (strictness < 14 && sw.length >= 4 && lw.length >= 4) {
        if (lw.includes(sw) || sw.includes(lw)) { found = true; break; }
      }
    }
    if (!found) return false;
  }
  return true;
}


export function checkAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10) {
  const r = evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness);
  return {
    correct: r.status === "accept" || r.status === "prompt",
    matchedAnswer: r.matchedAnswer,
    isDirective: false,
    prompted: r.status === "prompt",
  };
}

function stripQuotes(s) {
  return (s || "").replace(/^["“”'']+|["“”'']+$/g, "").trim();
}
function splitAlts(content) {
  return content
    .split(/\s+or\s+|;|,/i)
    .map((a) => stripQuotes(stripTags(a).trim()))
    .filter(Boolean);
}
function extractUnderlined(html) {
  const out = [];
  const re = /<u>([\s\S]*?)<\/u>/gi;
  let m;
  while ((m = re.exec(html)) !== null) { const t = stripTags(m[1]).trim(); if (t) out.push(t); }
  return out;
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
      terms.push(stems.join(""));
      terms.push(fulls.join(" "));
      terms.push(fulls.join(""));
    } else {
      stems.forEach((t) => { if (t.length > 1) terms.push(t); });
      fulls.forEach((t) => { if (t.length > 1 || stems.length === 1) terms.push(t); });
      if (stems.length > 1) terms.push(stems.join(" "));
      if (fulls.length > 1) terms.push(fulls.join(" "));
    }
  } else {
    const full = stripQuotes(stripTags(html).trim());
    if (full) terms.push(full);
  }
  return [...new Set(terms.filter((t) => t && /[a-zA-Z0-9]/.test(t)))];
}

const FILLER_TERM = /^((or|and)\s+)?(just|only|merely|simply|plainly?|exactly|precisely|similar|(obvious|reasonable|clear)\s+equivalents?|equivalents?|synonyms?|(equivalent\s+)?descriptions?|word\s*forms?|forms?|etc\.?|so\s+on|the\s+like|and\s+so\s+forth|anything\s+similar|likewise)$/i;

const COMMENTARY = /\b(accept|prompt|reject|do not|is read|in the question|not needed|if it is|before this|are totally|any of the above|by asking)\b/i;

const INSTRUCTION_TERM = /\b(underlined|bolded|italici[sz]ed|highlighted|capitali[sz]ed)\b|^(?:either|any|both|each)\s+(?:of\s+(?:the\s+)?)?(?:parts?|answers?|names?|portions?|words?)$|^(?:similar|such|other)\s+answers?$/i;

const NOTE_BRACKET = /\b(underlined|bolded|italici[sz]ed|highlighted|moderator|(writer|editor|ed)['’]?s?\s+note|read(er|ing)?\b.*\bnote|note\b.*\b(moderator|reader)|are\s+needed|is\s+needed|are\s+acceptable|is\s+acceptable|is\s+fine|are\s+fine|required|in\s+either\s+order)\b/i;

function stripNoteBrackets(s) {
  let out = s;
  for (const c of findContainers(s)) {
    const innerC = c.text.slice(1, -1);
    if (!isDirectiveInner(innerC) && NOTE_BRACKET.test(stripTags(innerC))) {
      out = out.replace(c.text, " ");
    }
  }
  return out;
}

function stripInlineNote(s) {
  return s.replace(
    /\s*[;,.]?\s*\b(?:also\s+)?(?:accept|prompt|reject|do\s+not\s+(?:accept|prompt))\b[\s\S]*$/i,
    (m) => (NOTE_BRACKET.test(m) || /\b(either|both|each)\b/i.test(m)) ? "" : m,
  );
}

function extractTerms(content, opts = {}) {
  const out = [];
  const quoted = new Set();
  // Quoted spans become atomic terms, but their words also stay in place so a
  // quote glued to neighbouring words ('"ultraviolet" singularity') still
  // yields the full phrase instead of two unrelated terms.
  content = String(content).replace(/["“”]([^"“”]+)["“”]/g, (m, inner) => {
    const t = stripTags(inner).trim();
    if (t) { out.push(t); quoted.add(t); }
    return " " + inner.replace(/[,;]/g, " ") + " ";
  });
  // Underline membership is decided against the WHOLE content, not each
  // comma/or fragment: a split inside "<u>Meg, Jo, Beth and Amy</u>" keeps the
  // middle names (carry), and leading alternates BEFORE the first underline
  // ("accept Allie, Phoebe, or Holden <u>Caulfield</u>") are explicit accepts —
  // only trailing non-underlined fragments (title tails like "Escher", "Bach")
  // are dropped.
  const firstU = content.search(/<u[\s>]/i);
  let uDepth = 0;
  let segOffset = 0;
  content.split(/(\s+or\s+|,|;)/i).forEach((part, segIdx) => {
    const partStart = segOffset;
    segOffset += (part || "").length;
    if (segIdx % 2 === 1) return;
    const opens = (part.match(/<u[\s>]/gi) || []).length;
    const closes = (part.match(/<\/u\s*>/gi) || []).length;
    const startDepth = uDepth;
    uDepth = Math.max(0, uDepth + opens - closes);
    if (opts.requireUnderline && !(opens > 0 || startDepth > 0 || (firstU >= 0 && partStart < firstU))) return;
    part = part.replace(/^\s*(answers?|anything|things?)\s+similar\s+to\s+/i, "")
               .replace(/^\s*similar\s+to\s+/i, "")
               .replace(/^\s*(?:such\s+as|e\.g\.?,?)\s+/i, "")
               .replace(/^\s*any\s+(specific|particular)\s+/i, "")
               .replace(/^\s*(just|only|merely|simply|plainly|exactly|precisely)\s+/i, "")
               .replace(/^.*?\b(equivalents?|derivations?|variants?|synonyms?|spellings?|abbreviations?|forms?|names?|titles?|versions?|things?|answers?|terms?|examples?)\s+(?:like|such as|including)\b[\s:,.–—-]*/i, "")
               .replace(/^(?:[\s:;,.–—]|-(?!\d))+/, "");
    if (opts.fullPhrase) {
      const t = stripQuotes(stripTags(part).trim()).replace(/^(?:[\s:;,.–—]|-(?!\d))+/, "");
      if (t) out.push(t);
    } else {
      phraseTerms(part).forEach((t) => out.push(t));
    }
  });
  return [...new Set(out.filter((t) => {
    const tt = t.trim();
    if (!tt || !/[a-zA-Z0-9]/.test(tt)) return false;
    if (FILLER_TERM.test(tt) || INSTRUCTION_TERM.test(tt) || /^(the|a|an|or|and|of)$/i.test(tt)) return false;
    if (quoted.has(t)) return true;
    return !/\b(like|such as|including)\s*$/i.test(tt) && tt.split(/\s+/).length <= 6 && !COMMENTARY.test(t);
  }))];
}

function isDirectiveInner(inner) {
  return /\b(accept|prompt|reject|do not|anti-?prompt)\b/i.test(inner) || /^\s*or\b/i.test(inner);
}
function isDirectiveBoundary(c, raw) {
  const inner = c.text.slice(1, -1);
  if (c.text[0] === "[") return isDirectiveInner(inner);
  if (/\b(accept|prompt|reject|do not|anti-?prompt)\b/i.test(inner)) return true;
  if (/^\s*or\b/i.test(inner)) return !/<u[\s>]/i.test(raw.slice(c.start + c.text.length));
  return false;
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

export function parseDirectives(answerline, sanitizedAnswerline) {
  const raw = (answerline && answerline.trim()) ? answerline : (sanitizedAnswerline || "");
  const accept = [];
  const prompt = [];
  const reject = [];
  const antiprompt = [];
  const qualifiers = {};
  const pushUniq = (arr, v) => { if (v && !arr.includes(v)) arr.push(v); };

  // Norms of WHOLE answers (full main answer, whole underlined phrase, or an
  // explicit accept-directive phrase). Only these outrank a reject directive —
  // a lone stem of a multi-word underline ("Macbeth" in "Lady Macbeth") stays
  // rejectable, because "do not accept 'Macbeth'" is deliberate.
  // The key preserves a numeric minus sign, so accept "-1" cannot protect the
  // explicitly rejected "1" (normalizeText folds both to "1").
  const protectedNorms = new Set();
  const protectKey = (t) => normalizeText(String(t || "").replace(/(^|[\s("“])-(?=\d)/g, "$1minus "));
  const protect = (t) => { const n = protectKey(t); if (n) protectedNorms.add(n); };
  // Protection from accept-directive content: quoted spans are commentary
  // mentions ("…with 'salah' in place of 'prayer'"), and anything after a
  // combination connective is not a standalone answer — neither may shield a
  // deliberate reject of the bare term.
  const protectFrom = (content) => {
    const c = String(content).split(/\b(?:in\s+conjunction\s+with|in\s+place\s+of|instead\s+of|along\s+with|combined\s+with|only\s+(?:after|if|when))\b/i)[0];
    const quotedKeys = new Set();
    c.replace(/["“”]([^"“”]+)["“”]/g, (m, inner) => { const t = stripTags(inner).trim(); if (t) quotedKeys.add(protectKey(t)); return " "; });
    extractTerms(c, { fullPhrase: true }).forEach((t) => { const n = protectKey(t); if (n && !quotedKeys.has(n)) protectedNorms.add(n); });
  };

  const containers = findContainers(raw);
  const firstDirC = containers.find((c) => isDirectiveBoundary(c, raw));
  const mainRaw = firstDirC ? raw.slice(0, firstDirC.start) : raw;
  phraseTerms(mainRaw).forEach((t) => pushUniq(accept, t));
  {
    const { vis, spans } = underlineSpans(mainRaw);
    if (spans.length === 1) {
      const [s0, e0] = spans[0];
      protect(vis.slice(s0, e0));
      let s = s0, e = e0;
      while (s > 0 && WORD_CHAR.test(vis[s - 1])) s--;
      while (e < vis.length && WORD_CHAR.test(vis[e])) e++;
      protect(vis.slice(s, e));
    } else if (spans.length > 1) {
      protect(spans.map(([s0, e0]) => vis.slice(s0, e0).trim()).filter(Boolean).join(" "));
    }
  }
  const mainFull = stripQuotes(stripInlineNote(stripTags(stripNoteBrackets(mainRaw))).trim());
  if (mainFull && /[a-zA-Z0-9]/.test(mainFull)) pushUniq(accept, mainFull);
  protect(mainFull);
  if (sanitizedAnswerline && sanitizedAnswerline !== raw) {
    const sContainers = findContainers(sanitizedAnswerline);
    const sFirst = sContainers.find((c) => isDirectiveBoundary(c, sanitizedAnswerline));
    const sMainRaw = sFirst ? sanitizedAnswerline.slice(0, sFirst.start) : sanitizedAnswerline;
    const sMain = stripQuotes(stripInlineNote(stripTags(stripNoteBrackets(sMainRaw))).trim());
    if (sMain && /[a-zA-Z0-9]/.test(sMain)) { pushUniq(accept, sMain); protect(sMain); }
  }

  const wordForms = /accept\s+(\w+\s+)?word\s*forms?/i.test(raw) || /\(accept forms\)/i.test(raw);

  const DIR_RE = /\b(do not accept or prompt on|do not accept|do not prompt on|anti-?prompt on|antiprompt on|antiprompt|anti-?prompt|also accept|accept|prompt on|prompt|reject)\b/gi;

  function takeQualifier(content) {
    const out = { content, until: null, after: null };
    const m = content.match(/\b(before|until|after)\b\s*([\s\S]{0,80}?)(?=\s+by\s+asking\b|\s+with\b\s*["“”]|$)/i);
    if (!m) return out;
    out.content = (content.slice(0, m.index) + " " + content.slice(m.index + m[0].length)).trim();
    const kind = m[1].toLowerCase();
    let markerSrc = m[2] || "";
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

  function cleanAsk(askSrc) {
    if (!askSrc) return null;
    const q = String(askSrc).match(/["“”]([^"“”]+)["“”]/);
    let a = q ? q[1] : askSrc;
    a = stripTags(String(a)).replace(/["“”;,.\s]+$/g, "").replace(/^["“”\s]+/g, "").trim();
    return a || null;
  }

  function takeAsk(content) {
    let m = content.match(/\bby asking\b[:,]?\s*([\s\S]+)$/i);
    if (!m) m = content.match(/\bwith\b\s+(?:the\s+question\s+)?(["“”][\s\S]+)$/i);
    if (!m) return { ask: null, content };
    const ask = cleanAsk(m[1]);
    const rest = content.slice(0, content.indexOf(m[0])).trim();
    return { ask, content: rest };
  }

  function classify(dir, content) {
    dir = dir.toLowerCase().replace(/[-\s]+/g, " ");
    const qual = takeQualifier(content);
    content = qual.content;
    if (/^(accept|also accept|or)$/.test(dir)) {
      content = content.replace(/\b(in place of|instead of|for)\s+["“”][^"“”]*["“”]/gi, "").trim();
      const terms = extractTerms(content, { requireUnderline: /<u[\s>]/i.test(content) });
      terms.forEach((t) => {
        const isNew = !accept.includes(t);
        pushUniq(accept, t);
        if (isNew && (qual.until || qual.after)) qualifiers[t] = { until: qual.until, after: qual.after, group: terms };
      });
      protectFrom(content);
    } else if (/^anti ?prompt/.test(dir)) {
      const a = takeAsk(content); const ask = a.ask; content = a.content;
      extractTerms(content, { fullPhrase: true }).forEach((t) => antiprompt.push({ target: t, ask, until: qual.until, after: qual.after }));
    } else if (/^prompt/.test(dir)) {
      const a = takeAsk(content); let ask = a.ask; content = a.content;
      content = content.replace(/^\s*(to\s+be|by\s+being|for)\s+less\s+specific(ity)?\s+(on|about)?\s*/i, "");
      content = content.replace(/\s*\b(afterwards?|thereafter)\b\s*$/i, "").replace(/\s+(alone|by\s+itself)(?=\s*(?:$|[,;.]))/gi, "");
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
      content = content.split(/\b(?:unless|since|because|without)\b/i)[0];
      content = content.replace(/\s*\b(afterwards?|thereafter)\b\s*$/i, "").replace(/\s+(alone|by\s+itself)(?=\s*(?:$|[,;.]))/gi, "");
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
      const headTerms = extractTerms(headQual.content, { requireUnderline: /<u[\s>]/i.test(headQual.content) });
      headTerms.forEach((t) => {
        const isNew = !accept.includes(t);
        pushUniq(accept, t);
        if (isNew && (headQual.until || headQual.after)) qualifiers[t] = { until: headQual.until, after: headQual.after, group: headTerms };
      });
      protectFrom(headQual.content);
    }
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : inner.length;
      let content = inner.slice(start, end).replace(/^\s*(but|and|;|,|:)\s*/i, "").replace(/\s+(but|and)\s*$/i, "").trim();
      classify(matches[i][1], content);
    }
  }
  // A WHOLE answer (protectedNorms: full main answer, whole underline, or an
  // explicit accept-directive phrase) can never double as a reject: those
  // rejects come from commentary that quotes the correct answer ("…unless that
  // name is 'Trajan'"). A lone stem of a multi-word underline is NOT protected
  // ("do not accept 'Macbeth'" for Lady Macbeth is deliberate). Likewise an
  // explicit "prompt on X" beats a reject of the same bare X — those rejects
  // describe supersets ("reject 'X' with anything else before or after it").
  const promptNorms = new Set(prompt.filter((p) => p.target && p.target !== "__partial__").map((p) => protectKey(p.target)).filter(Boolean));
  const cleanReject = reject.filter((t) => t === "__partial__" || (!protectedNorms.has(protectKey(t)) && !promptNorms.has(protectKey(t))));
  return { accept, prompt, reject: cleanReject, antiprompt, qualifiers, wordForms, mainAnswer: mainFull };
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
  const ka = frequencyKey(a).replace(/\s+/g, "");
  const kb = frequencyKey(b).replace(/\s+/g, "");
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (stemKey(a) === stemKey(b)) return true;
  const min = Math.min(ka.length, kb.length);
  if (min < 5) return false;
  if (ka.slice(0, min - 2) === kb.slice(0, min - 2) && Math.abs(ka.length - kb.length) <= 3) return true;
  return levenshtein(ka, kb) <= Math.max(1, Math.floor(min / 5));
}

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
  if (w in ROMAN) return ROMAN[w];
  return null;
}

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

function promptMatch(target, userNorm, strictness) {
  return acceptMatch(target, userNorm, strictness);
}

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

function partialTargets(d) {
  const main = normalizeText(d.mainAnswer || (d.accept[0] || ""));
  const words = contentWords(main);
  const out = new Set();
  for (const w of words) if (w.length >= 2) out.add(w);
  for (let i = 0; i + 1 < words.length; i++) out.add(words[i] + " " + words[i + 1]);
  return [...out];
}

export function evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10, opts = {}) {
  if (!userAnswer || !userAnswer.trim()) return { status: "reject", matchedAnswer: null, prompt: null };
  const userNorm = normalizeText(userAnswer.trim());
  if (!userNorm) return { status: "reject", matchedAnswer: null, prompt: null };
  const d = parseDirectives(answerline, sanitizedAnswerline);
  const rejectNorms = new Set(d.reject.map((r) => normalizeText(r)));
  // A verbatim reject term always rejects — including when a squished accept
  // form would otherwise collide ("3-4" must not make "34" acceptable when the
  // answerline explicitly rejects "34").
  if (rejectNorms.has(userNorm)) return { status: "reject", matchedAnswer: null, prompt: null };
  const hasPos = opts.readText != null;
  const readNorm = hasPos ? normalizeText(opts.readText) : null;
  const fullLower = hasPos && opts.fullText ? String(opts.fullText).toLowerCase() : null;
  const readLen = hasPos ? (opts.readLen != null ? opts.readLen : String(opts.readText).length) : null;

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
    if (!hasPos) return true;
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

  const userJoined = userNorm.replace(/\s+/g, "");
  const exactAccept = d.accept.find((a) => {
    if (!acceptLive(a)) return false;
    const an = normalizeText(a);
    return an && !rejectNorms.has(an) && (an === userNorm || an.replace(/\s+/g, "") === userJoined);
  });
  if (!exactAccept) {
    const rejTargets = [];
    // "reject partial answers" never overrides an explicitly named prompt
    // target ("prompt on forest; reject partial answers" → "forest" prompts).
    const explicitPromptNorms = new Set(
      d.prompt.filter((p) => p.target && p.target !== "__partial__").map((p) => normalizeText(p.target)).filter(Boolean)
    );
    for (const r of d.reject) {
      if (r === "__partial__") partialTargets(d).forEach((t) => { if (!explicitPromptNorms.has(normalizeText(t))) rejTargets.push(t); });
      else rejTargets.push(r);
    }
    // An answer that IS a live prompt target (verbatim) prompts even when a
    // reject term happens to be a fuzzy/partial match for it ("Bosniaks" must
    // not swallow "prompt on Bosnians"). An exact reject still wins.
    const promptExact = d.prompt.some((p) => {
      if (!p.target || p.target === "__partial__") return false;
      const tn = normalizeText(p.target);
      if (!tn || !termLive(p.target, p.until, p.after)) return false;
      return tn === userNorm || tn.replace(/\s+/g, "") === userJoined;
    });
    for (const r of rejTargets) {
      if (!strictMatch(r, userNorm)) continue;
      const rn = normalizeText(r);
      if (promptExact && rn !== userNorm && rn.replace(/\s+/g, "") !== userJoined) continue;
      return { status: "reject", matchedAnswer: null, prompt: null };
    }
  } else {
    return { status: "accept", matchedAnswer: exactAccept, prompt: null };
  }

  for (const a of d.accept) {
    if (isConditioned(a)) continue;
    if (acceptMatch(a, userNorm, strictness, d.wordForms)) return { status: "accept", matchedAnswer: a, prompt: null };
  }
  for (const a of d.accept) {
    if (!isConditioned(a) || !acceptLive(a)) continue;
    if (acceptMatch(a, userNorm, strictness, d.wordForms)) return { status: "accept", matchedAnswer: a, prompt: null };
  }

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
  function anyPrompt() {
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
    return null;
  }

  // A matching accept whose read-position window has closed rejects — unless
  // an explicit prompt directive still covers the answer ("accept sea before
  // 'railroad', after that prompt on sea").
  for (const a of d.accept) {
    if (!isConditioned(a) || acceptLive(a)) continue;
    if (strictMatch(a, userNorm) || acceptMatch(a, userNorm, strictness, d.wordForms)) {
      const pr = anyPrompt();
      if (pr) return pr;
      return { status: "reject", matchedAnswer: null, prompt: null };
    }
  }

  {
    const pr = anyPrompt();
    if (pr) return pr;
  }

  for (const ap of d.antiprompt) {
    if (!termLive(ap.target, ap.until, ap.after)) continue;
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
