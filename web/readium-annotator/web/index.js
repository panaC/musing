// build/vendor/apache-annotator/dom/owner-document.js
function ownerDocument(nodeOrRange) {
  const node = isRange(nodeOrRange) ? nodeOrRange.startContainer : nodeOrRange;
  return node.ownerDocument ?? node;
}
function isRange(nodeOrRange) {
  return "startContainer" in nodeOrRange;
}

// build/vendor/apache-annotator/dom/to-range.js
function toRange(nodeOrRange) {
  if (isRange2(nodeOrRange)) {
    return nodeOrRange;
  } else {
    const node = nodeOrRange;
    const range = ownerDocument(node).createRange();
    range.selectNodeContents(node);
    return range;
  }
}
function isRange2(nodeOrRange) {
  return "startContainer" in nodeOrRange;
}

// build/vendor/apache-annotator/dom/range/cartesian.js
async function* cartesian(...iterables) {
  const iterators = iterables.map((iterable, index2) => {
    const generator = async function* () {
      for await (const value of iterable) {
        yield { index: index2, value };
      }
      return { index: index2 };
    };
    return generator();
  });
  try {
    let active = iterators.length;
    const logs = iterators.map(() => []);
    const nexts = iterators.map((it) => it.next());
    while (active) {
      const result = await Promise.race(nexts);
      const { index: index2 } = result.value;
      if (result.done) {
        active--;
        nexts[index2] = new Promise(() => void 0);
        continue;
      }
      const { value } = result.value;
      logs[index2].push(value);
      nexts[index2] = iterators[index2].next();
      const scratch = [...logs];
      scratch[index2] = [value];
      yield* scratch.reduce((acc, next) => acc.flatMap((v) => next.map((w) => [...v, w])), [[]]);
    }
  } finally {
    const closeAll = iterators.map((it, index2) => it.return({ index: index2 }));
    await Promise.all(closeAll);
  }
}

// build/vendor/apache-annotator/dom/range/match.js
function makeCreateRangeSelectorMatcher(createMatcher2) {
  return function createRangeSelectorMatcher(selector2) {
    const startMatcher = createMatcher2(selector2.startSelector);
    const endMatcher = createMatcher2(selector2.endSelector);
    return async function* matchAll(scope) {
      const startMatches = startMatcher(scope);
      const endMatches = endMatcher(scope);
      const pairs = cartesian(startMatches, endMatches);
      for await (let [start2, end] of pairs) {
        start2 = toRange(start2);
        end = toRange(end);
        const result = ownerDocument(scope).createRange();
        result.setStart(start2.startContainer, start2.startOffset);
        result.setEnd(end.startContainer, end.startOffset);
        if (!result.collapsed)
          yield result;
      }
    };
  };
}

// build/vendor/apache-annotator/selector/text/match-text-quote.js
function textQuoteSelectorMatcher(selector2) {
  return async function* matchAll(textChunks) {
    const exact = selector2.exact;
    const prefix = selector2.prefix || "";
    const suffix = selector2.suffix || "";
    const searchPattern = prefix + exact + suffix;
    let partialMatches = [];
    let isFirstChunk = true;
    do {
      const chunk = textChunks.currentChunk;
      const chunkValue = chunk.data;
      const remainingPartialMatches = [];
      for (const partialMatch of partialMatches) {
        const charactersMatched = partialMatch.charactersMatched;
        if (partialMatch.endChunk === void 0) {
          const charactersUntilMatchEnd = prefix.length + exact.length - charactersMatched;
          if (charactersUntilMatchEnd <= chunkValue.length) {
            partialMatch.endChunk = chunk;
            partialMatch.endIndex = charactersUntilMatchEnd;
          }
        }
        if (partialMatch.startChunk === void 0) {
          const charactersUntilMatchStart = prefix.length - charactersMatched;
          if (charactersUntilMatchStart < chunkValue.length || partialMatch.endChunk !== void 0) {
            partialMatch.startChunk = chunk;
            partialMatch.startIndex = charactersUntilMatchStart;
          }
        }
        const charactersUntilSuffixEnd = searchPattern.length - charactersMatched;
        if (charactersUntilSuffixEnd <= chunkValue.length) {
          if (chunkValue.startsWith(searchPattern.substring(charactersMatched))) {
            yield partialMatch;
          }
        } else if (chunkValue === searchPattern.substring(charactersMatched, charactersMatched + chunkValue.length)) {
          partialMatch.charactersMatched += chunkValue.length;
          remainingPartialMatches.push(partialMatch);
        }
      }
      partialMatches = remainingPartialMatches;
      if (searchPattern.length <= chunkValue.length) {
        let fromIndex = 0;
        while (fromIndex <= chunkValue.length) {
          const patternStartIndex = chunkValue.indexOf(searchPattern, fromIndex);
          if (patternStartIndex === -1)
            break;
          fromIndex = patternStartIndex + 1;
          if (patternStartIndex === 0 && searchPattern.length === 0 && !isFirstChunk)
            continue;
          yield {
            startChunk: chunk,
            startIndex: patternStartIndex + prefix.length,
            endChunk: chunk,
            endIndex: patternStartIndex + prefix.length + exact.length
          };
        }
      }
      let newPartialMatches = [];
      const searchStartPoint = Math.max(chunkValue.length - searchPattern.length + 1, 0);
      for (let i = searchStartPoint; i < chunkValue.length; i++) {
        const character = chunkValue[i];
        newPartialMatches = newPartialMatches.filter((partialMatchStartIndex) => character === searchPattern[i - partialMatchStartIndex]);
        if (character === searchPattern[0])
          newPartialMatches.push(i);
      }
      for (const partialMatchStartIndex of newPartialMatches) {
        const charactersMatched = chunkValue.length - partialMatchStartIndex;
        const partialMatch = {
          charactersMatched
        };
        if (charactersMatched >= prefix.length + exact.length) {
          partialMatch.endChunk = chunk;
          partialMatch.endIndex = partialMatchStartIndex + prefix.length + exact.length;
        }
        if (charactersMatched > prefix.length || partialMatch.endChunk !== void 0) {
          partialMatch.startChunk = chunk;
          partialMatch.startIndex = partialMatchStartIndex + prefix.length;
        }
        partialMatches.push(partialMatch);
      }
      isFirstChunk = false;
    } while (textChunks.nextChunk() !== null);
  };
}

// build/vendor/apache-annotator/dom/normalize-range.js
function normalizeRange(range, scope) {
  const document2 = ownerDocument(range);
  const walker = document2.createTreeWalker(document2, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return !scope || scope.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  let [startContainer, startOffset] = snapBoundaryPointToTextNode(range.startContainer, range.startOffset);
  walker.currentNode = startContainer;
  while (startOffset === startContainer.length && walker.nextNode()) {
    startContainer = walker.currentNode;
    startOffset = 0;
  }
  range.setStart(startContainer, startOffset);
  let [endContainer, endOffset] = snapBoundaryPointToTextNode(range.endContainer, range.endOffset);
  walker.currentNode = endContainer;
  while (endOffset === 0 && walker.previousNode()) {
    endContainer = walker.currentNode;
    endOffset = endContainer.length;
  }
  range.setEnd(endContainer, endOffset);
  return range;
}
function snapBoundaryPointToTextNode(node, offset) {
  if (isText(node))
    return [node, offset];
  let curNode;
  if (isCharacterData(node)) {
    curNode = node;
  } else if (offset < node.childNodes.length) {
    curNode = node.childNodes[offset];
  } else {
    curNode = node;
    while (curNode.nextSibling === null) {
      if (curNode.parentNode === null)
        throw new Error("not implemented");
      curNode = curNode.parentNode;
    }
    curNode = curNode.nextSibling;
  }
  if (isText(curNode))
    return [curNode, 0];
  const document2 = node.ownerDocument ?? node;
  const walker = document2.createTreeWalker(document2, NodeFilter.SHOW_TEXT);
  walker.currentNode = curNode;
  if (walker.nextNode() !== null) {
    return [walker.currentNode, 0];
  } else if (walker.previousNode() !== null) {
    return [walker.currentNode, walker.currentNode.length];
  } else {
    throw new Error("Document contains no text nodes.");
  }
}
function isText(node) {
  return node.nodeType === Node.TEXT_NODE;
}
function isCharacterData(node) {
  return node.nodeType === Node.PROCESSING_INSTRUCTION_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.TEXT_NODE;
}

// build/vendor/apache-annotator/dom/text-node-chunker.js
var EmptyScopeError = class extends TypeError {
  constructor(message) {
    super(message || "Scope contains no text nodes.");
  }
};
var OutOfScopeError = class extends TypeError {
  constructor(message) {
    super(message || "Cannot convert node to chunk, as it falls outside of chunker\u2019s scope.");
  }
};
var TextNodeChunker = class {
  scope;
  iter;
  get currentChunk() {
    const node = this.iter.referenceNode;
    if (!isText2(node))
      throw new EmptyScopeError();
    return this.nodeToChunk(node);
  }
  nodeToChunk(node) {
    if (!this.scope.intersectsNode(node))
      throw new OutOfScopeError();
    const startOffset = node === this.scope.startContainer ? this.scope.startOffset : 0;
    const endOffset = node === this.scope.endContainer ? this.scope.endOffset : node.length;
    return {
      node,
      startOffset,
      endOffset,
      data: node.data.substring(startOffset, endOffset),
      equals(other) {
        return other.node === this.node && other.startOffset === this.startOffset && other.endOffset === this.endOffset;
      }
    };
  }
  rangeToChunkRange(range) {
    range = range.cloneRange();
    if (range.compareBoundaryPoints(Range.START_TO_START, this.scope) === -1)
      range.setStart(this.scope.startContainer, this.scope.startOffset);
    if (range.compareBoundaryPoints(Range.END_TO_END, this.scope) === 1)
      range.setEnd(this.scope.endContainer, this.scope.endOffset);
    const textRange = normalizeRange(range, this.scope);
    const startChunk = this.nodeToChunk(textRange.startContainer);
    const startIndex = textRange.startOffset - startChunk.startOffset;
    const endChunk = this.nodeToChunk(textRange.endContainer);
    const endIndex = textRange.endOffset - endChunk.startOffset;
    return { startChunk, startIndex, endChunk, endIndex };
  }
  chunkRangeToRange(chunkRange) {
    const range = ownerDocument(this.scope).createRange();
    range.setStart(chunkRange.startChunk.node, chunkRange.startIndex + chunkRange.startChunk.startOffset);
    range.setEnd(chunkRange.endChunk.node, chunkRange.endIndex + chunkRange.endChunk.startOffset);
    return range;
  }
  /**
   * @param scope A Range that overlaps with at least one text node.
   */
  constructor(scope) {
    this.scope = toRange(scope);
    this.iter = ownerDocument(scope).createNodeIterator(this.scope.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        return this.scope.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    this.iter.nextNode();
    if (!isText2(this.iter.referenceNode)) {
      const nextNode = this.iter.nextNode();
      if (nextNode === null)
        throw new EmptyScopeError();
    }
  }
  nextChunk() {
    if (this.iter.pointerBeforeReferenceNode)
      this.iter.nextNode();
    if (this.iter.nextNode())
      return this.currentChunk;
    else
      return null;
  }
  previousChunk() {
    if (!this.iter.pointerBeforeReferenceNode)
      this.iter.previousNode();
    if (this.iter.previousNode())
      return this.currentChunk;
    else
      return null;
  }
  precedesCurrentChunk(chunk) {
    if (this.currentChunk === null)
      return false;
    return !!(this.currentChunk.node.compareDocumentPosition(chunk.node) & Node.DOCUMENT_POSITION_PRECEDING);
  }
};
function isText2(node) {
  return node.nodeType === Node.TEXT_NODE;
}

// build/vendor/apache-annotator/dom/text-quote/match.js
function createTextQuoteSelectorMatcher(selector2) {
  const abstractMatcher = textQuoteSelectorMatcher(selector2);
  return async function* matchAll(scope) {
    let textChunks;
    try {
      textChunks = new TextNodeChunker(scope);
    } catch (err) {
      if (err instanceof EmptyScopeError)
        return;
      else
        throw err;
    }
    for await (const abstractMatch of abstractMatcher(textChunks)) {
      yield textChunks.chunkRangeToRange(abstractMatch);
    }
  };
}

// build/vendor/apache-annotator/selector/text/code-point-seeker.js
var CodePointSeeker = class {
  raw;
  position = 0;
  /**
   *
   * @param raw  The {@link Seeker} to wrap, which counts in code *units* (e.g.
   * a {@link TextSeeker}). It should have {@link Seeker.position | position}
   * `0` and its methods must no longer be used directly if the
   * `CodePointSeeker`’s position is to remain correct.
   */
  constructor(raw) {
    this.raw = raw;
  }
  seekBy(length) {
    this.seekTo(this.position + length);
  }
  seekTo(target) {
    this._readOrSeekTo(false, target);
  }
  read(length, roundUp) {
    return this.readTo(this.position + length, roundUp);
  }
  readTo(target, roundUp) {
    return this._readOrSeekTo(true, target, roundUp);
  }
  get currentChunk() {
    return this.raw.currentChunk;
  }
  get offsetInChunk() {
    return this.raw.offsetInChunk;
  }
  seekToChunk(target, offset = 0) {
    this._readOrSeekToChunk(false, target, offset);
  }
  readToChunk(target, offset = 0) {
    return this._readOrSeekToChunk(true, target, offset);
  }
  _readOrSeekToChunk(read, target, offset = 0) {
    const oldRawPosition = this.raw.position;
    let s = this.raw.readToChunk(target, offset);
    const movedForward = this.raw.position >= oldRawPosition;
    if (movedForward && endsWithinCharacter(s)) {
      this.raw.seekBy(-1);
      s = s.slice(0, -1);
    } else if (!movedForward && startsWithinCharacter(s)) {
      this.raw.seekBy(1);
      s = s.slice(1);
    }
    const result = [...s];
    this.position = movedForward ? this.position + result.length : this.position - result.length;
    if (read)
      return result;
  }
  _readOrSeekTo(read, target, roundUp = false) {
    let result = [];
    if (this.position < target) {
      let unpairedSurrogate = "";
      let characters = [];
      while (this.position < target) {
        let s = unpairedSurrogate + this.raw.read(1, true);
        if (endsWithinCharacter(s)) {
          unpairedSurrogate = s.slice(-1);
          s = s.slice(0, -1);
        } else {
          unpairedSurrogate = "";
        }
        characters = [...s];
        this.position += characters.length;
        if (read)
          result = result.concat(characters);
      }
      if (unpairedSurrogate)
        this.raw.seekBy(-1);
      if (!roundUp && this.position > target) {
        const overshootInCodePoints = this.position - target;
        const overshootInCodeUnits = characters.slice(-overshootInCodePoints).join("").length;
        this.position -= overshootInCodePoints;
        this.raw.seekBy(-overshootInCodeUnits);
      }
    } else {
      let unpairedSurrogate = "";
      let characters = [];
      while (this.position > target) {
        let s = this.raw.read(-1, true) + unpairedSurrogate;
        if (startsWithinCharacter(s)) {
          unpairedSurrogate = s[0];
          s = s.slice(1);
        } else {
          unpairedSurrogate = "";
        }
        characters = [...s];
        this.position -= characters.length;
        if (read)
          result = characters.concat(result);
      }
      if (unpairedSurrogate)
        this.raw.seekBy(1);
      if (!roundUp && this.position < target) {
        const overshootInCodePoints = target - this.position;
        const overshootInCodeUnits = characters.slice(0, overshootInCodePoints).join("").length;
        this.position += overshootInCodePoints;
        this.raw.seekBy(overshootInCodeUnits);
      }
    }
    if (read)
      return result;
  }
};
function endsWithinCharacter(s) {
  const codeUnit = s.charCodeAt(s.length - 1);
  return 55296 <= codeUnit && codeUnit <= 56319;
}
function startsWithinCharacter(s) {
  const codeUnit = s.charCodeAt(0);
  return 56320 <= codeUnit && codeUnit <= 57343;
}

// build/vendor/apache-annotator/selector/text/chunker.js
function chunkEquals(chunk1, chunk2) {
  if (chunk1.equals)
    return chunk1.equals(chunk2);
  if (chunk2.equals)
    return chunk2.equals(chunk1);
  return chunk1 === chunk2;
}
function chunkRangeEquals(range1, range2) {
  return chunkEquals(range1.startChunk, range2.startChunk) && chunkEquals(range1.endChunk, range2.endChunk) && range1.startIndex === range2.startIndex && range1.endIndex === range2.endIndex;
}

// build/vendor/apache-annotator/selector/text/seeker.js
var E_END = "Iterator exhausted before seek ended.";
var TextSeeker = class {
  chunker;
  // The chunk containing our current text position.
  get currentChunk() {
    return this.chunker.currentChunk;
  }
  // The index of the first character of the current chunk inside the text.
  currentChunkPosition = 0;
  // The position inside the chunk where the last seek ended up.
  offsetInChunk = 0;
  // The current text position (measured in code units)
  get position() {
    return this.currentChunkPosition + this.offsetInChunk;
  }
  constructor(chunker) {
    this.chunker = chunker;
    this.seekTo(0);
  }
  read(length, roundUp = false, lessIsFine = false) {
    return this._readOrSeekTo(true, this.position + length, roundUp, lessIsFine);
  }
  readTo(target, roundUp = false) {
    return this._readOrSeekTo(true, target, roundUp);
  }
  seekBy(length) {
    this.seekTo(this.position + length);
  }
  seekTo(target) {
    this._readOrSeekTo(false, target);
  }
  seekToChunk(target, offset = 0) {
    this._readOrSeekToChunk(false, target, offset);
  }
  readToChunk(target, offset = 0) {
    return this._readOrSeekToChunk(true, target, offset);
  }
  _readOrSeekToChunk(read, target, offset = 0) {
    const oldPosition = this.position;
    let result = "";
    if (!this.chunker.precedesCurrentChunk(target)) {
      while (!chunkEquals(this.currentChunk, target)) {
        const [data, nextChunk] = this._readToNextChunk();
        if (read)
          result += data;
        if (nextChunk === null)
          throw new RangeError(E_END);
      }
    } else {
      while (!chunkEquals(this.currentChunk, target)) {
        const [data, previousChunk] = this._readToPreviousChunk();
        if (read)
          result = data + result;
        if (previousChunk === null)
          throw new RangeError(E_END);
      }
    }
    const targetPosition = this.currentChunkPosition + offset;
    if (!read) {
      this.seekTo(targetPosition);
    } else {
      if (targetPosition >= this.position) {
        result += this.readTo(targetPosition);
      } else if (targetPosition >= oldPosition) {
        this.seekTo(targetPosition);
        result = result.slice(0, targetPosition - oldPosition);
      } else {
        this.seekTo(oldPosition);
        result = this.readTo(targetPosition);
      }
      return result;
    }
  }
  _readOrSeekTo(read, target, roundUp = false, lessIsFine = false) {
    let result = "";
    if (this.position <= target) {
      while (true) {
        const endOfChunk = this.currentChunkPosition + this.currentChunk.data.length;
        if (endOfChunk <= target) {
          const [data, nextChunk] = this._readToNextChunk();
          if (read)
            result += data;
          if (nextChunk === null) {
            if (this.position === target || lessIsFine)
              break;
            else
              throw new RangeError(E_END);
          }
        } else {
          const newOffset = roundUp ? this.currentChunk.data.length : target - this.currentChunkPosition;
          if (read)
            result += this.currentChunk.data.substring(this.offsetInChunk, newOffset);
          this.offsetInChunk = newOffset;
          if (roundUp)
            this.seekBy(0);
          break;
        }
      }
    } else {
      while (this.position > target) {
        if (this.currentChunkPosition <= target) {
          const newOffset = roundUp ? 0 : target - this.currentChunkPosition;
          if (read)
            result = this.currentChunk.data.substring(newOffset, this.offsetInChunk) + result;
          this.offsetInChunk = newOffset;
          break;
        } else {
          const [data, previousChunk] = this._readToPreviousChunk();
          if (read)
            result = data + result;
          if (previousChunk === null) {
            if (lessIsFine)
              break;
            else
              throw new RangeError(E_END);
          }
        }
      }
    }
    if (read)
      return result;
  }
  // Read to the start of the next chunk, if any; otherwise to the end of the current chunk.
  _readToNextChunk() {
    const data = this.currentChunk.data.substring(this.offsetInChunk);
    const chunkLength = this.currentChunk.data.length;
    const nextChunk = this.chunker.nextChunk();
    if (nextChunk !== null) {
      this.currentChunkPosition += chunkLength;
      this.offsetInChunk = 0;
    } else {
      this.offsetInChunk = chunkLength;
    }
    return [data, nextChunk];
  }
  // Read backwards to the end of the previous chunk, if any; otherwise to the start of the current chunk.
  _readToPreviousChunk() {
    const data = this.currentChunk.data.substring(0, this.offsetInChunk);
    const previousChunk = this.chunker.previousChunk();
    if (previousChunk !== null) {
      this.currentChunkPosition -= this.currentChunk.data.length;
      this.offsetInChunk = this.currentChunk.data.length;
    } else {
      this.offsetInChunk = 0;
    }
    return [data, previousChunk];
  }
};

// build/vendor/apache-annotator/selector/text/match-text-position.js
function textPositionSelectorMatcher(selector2) {
  const { start: start2, end } = selector2;
  return async function* matchAll(textChunks) {
    const codeUnitSeeker = new TextSeeker(textChunks);
    const codePointSeeker = new CodePointSeeker(codeUnitSeeker);
    codePointSeeker.seekTo(start2);
    const startChunk = codeUnitSeeker.currentChunk;
    const startIndex = codeUnitSeeker.offsetInChunk;
    codePointSeeker.seekTo(end);
    const endChunk = codeUnitSeeker.currentChunk;
    const endIndex = codeUnitSeeker.offsetInChunk;
    yield { startChunk, startIndex, endChunk, endIndex };
  };
}

// build/vendor/apache-annotator/dom/text-position/match.js
function createTextPositionSelectorMatcher(selector2) {
  const abstractMatcher = textPositionSelectorMatcher(selector2);
  return async function* matchAll(scope) {
    const textChunks = new TextNodeChunker(scope);
    const matches = abstractMatcher(textChunks);
    for await (const abstractMatch of matches) {
      yield textChunks.chunkRangeToRange(abstractMatch);
    }
  };
}

// build/vendor/apache-annotator/selector/text/describe-text-quote.js
async function describeTextQuote(target, scope, options = {}) {
  const { minimalContext = false, minimumQuoteLength = 0, maxWordLength = 50 } = options;
  const seekerAtTarget = new TextSeeker(scope());
  const seekerAtUnintendedMatch = new TextSeeker(scope());
  seekerAtTarget.seekToChunk(target.startChunk, target.startIndex);
  const exact = seekerAtTarget.readToChunk(target.endChunk, target.endIndex);
  let prefix = "";
  let suffix = "";
  const currentQuoteLength = () => prefix.length + exact.length + suffix.length;
  if (currentQuoteLength() < minimumQuoteLength) {
    seekerAtTarget.seekToChunk(target.startChunk, target.startIndex - prefix.length);
    const length = Math.floor((minimumQuoteLength - currentQuoteLength()) / 2);
    prefix = seekerAtTarget.read(-length, false, true) + prefix;
    if (currentQuoteLength() < minimumQuoteLength) {
      seekerAtTarget.seekToChunk(target.endChunk, target.endIndex + suffix.length);
      const length2 = minimumQuoteLength - currentQuoteLength();
      suffix = suffix + seekerAtTarget.read(length2, false, true);
      if (currentQuoteLength() < minimumQuoteLength) {
        seekerAtTarget.seekToChunk(target.startChunk, target.startIndex - prefix.length);
        const length3 = minimumQuoteLength - currentQuoteLength();
        prefix = seekerAtTarget.read(-length3, false, true) + prefix;
      }
    }
  }
  if (!minimalContext) {
    seekerAtTarget.seekToChunk(target.startChunk, target.startIndex - prefix.length);
    prefix = readUntilWhitespace(seekerAtTarget, maxWordLength, true) + prefix;
    seekerAtTarget.seekToChunk(target.endChunk, target.endIndex + suffix.length);
    suffix = suffix + readUntilWhitespace(seekerAtTarget, maxWordLength, false);
  }
  while (true) {
    const tentativeSelector = {
      type: "TextQuoteSelector",
      exact,
      prefix,
      suffix
    };
    const matches = textQuoteSelectorMatcher(tentativeSelector)(scope());
    let nextMatch = await matches.next();
    if (!nextMatch.done && chunkRangeEquals(nextMatch.value, target)) {
      nextMatch = await matches.next();
    }
    if (nextMatch.done)
      return tentativeSelector;
    const unintendedMatch = nextMatch.value;
    seekerAtTarget.seekToChunk(target.startChunk, target.startIndex - prefix.length);
    seekerAtUnintendedMatch.seekToChunk(unintendedMatch.startChunk, unintendedMatch.startIndex - prefix.length);
    let extraPrefix = readUntilDifferent(seekerAtTarget, seekerAtUnintendedMatch, true);
    if (extraPrefix !== void 0 && !minimalContext)
      extraPrefix = readUntilWhitespace(seekerAtTarget, maxWordLength, true) + extraPrefix;
    seekerAtTarget.seekToChunk(target.endChunk, target.endIndex + suffix.length);
    seekerAtUnintendedMatch.seekToChunk(unintendedMatch.endChunk, unintendedMatch.endIndex + suffix.length);
    let extraSuffix = readUntilDifferent(seekerAtTarget, seekerAtUnintendedMatch, false);
    if (extraSuffix !== void 0 && !minimalContext)
      extraSuffix = extraSuffix + readUntilWhitespace(seekerAtTarget, maxWordLength, false);
    if (minimalContext) {
      if (extraPrefix !== void 0 && (extraSuffix === void 0 || extraPrefix.length <= extraSuffix.length)) {
        prefix = extraPrefix + prefix;
      } else if (extraSuffix !== void 0) {
        suffix = suffix + extraSuffix;
      } else {
        throw new Error("Target cannot be disambiguated; how could that have happened\u203D");
      }
    } else {
      if (extraPrefix !== void 0)
        prefix = extraPrefix + prefix;
      if (extraSuffix !== void 0)
        suffix = suffix + extraSuffix;
    }
  }
}
function readUntilDifferent(seeker1, seeker2, reverse2) {
  let result = "";
  while (true) {
    let nextCharacter;
    try {
      nextCharacter = seeker1.read(reverse2 ? -1 : 1);
    } catch (err) {
      return void 0;
    }
    result = reverse2 ? nextCharacter + result : result + nextCharacter;
    let comparisonCharacter;
    try {
      comparisonCharacter = seeker2.read(reverse2 ? -1 : 1);
    } catch (err) {
      if (!(err instanceof RangeError))
        throw err;
    }
    if (nextCharacter !== comparisonCharacter)
      return result;
  }
}
function readUntilWhitespace(seeker, limit = Infinity, reverse2 = false) {
  let result = "";
  while (result.length < limit) {
    let nextCharacter;
    try {
      nextCharacter = seeker.read(reverse2 ? -1 : 1);
    } catch (err) {
      if (!(err instanceof RangeError))
        throw err;
      break;
    }
    if (isWhitespace(nextCharacter)) {
      seeker.seekBy(reverse2 ? 1 : -1);
      break;
    }
    result = reverse2 ? nextCharacter + result : result + nextCharacter;
  }
  return result;
}
function isWhitespace(s) {
  return /^\s+$/.test(s);
}

// build/vendor/apache-annotator/dom/text-quote/describe.js
async function describeTextQuote2(range, scope, options = {}) {
  const scopeAsRange = toRange(scope ?? ownerDocument(range));
  const chunker = new TextNodeChunker(scopeAsRange);
  return await describeTextQuote(chunker.rangeToChunkRange(range), () => new TextNodeChunker(scopeAsRange), options);
}

// build/vendor/apache-annotator/selector/text/describe-text-position.js
async function describeTextPosition(target, scope) {
  const codeUnitSeeker = new TextSeeker(scope);
  const codePointSeeker = new CodePointSeeker(codeUnitSeeker);
  codePointSeeker.seekToChunk(target.startChunk, target.startIndex);
  const start2 = codePointSeeker.position;
  codePointSeeker.seekToChunk(target.endChunk, target.endIndex);
  const end = codePointSeeker.position;
  return {
    type: "TextPositionSelector",
    start: start2,
    end
  };
}

// build/vendor/apache-annotator/dom/text-position/describe.js
async function describeTextPosition2(range, scope) {
  scope = toRange(scope ?? ownerDocument(range));
  const textChunks = new TextNodeChunker(scope);
  if (textChunks.currentChunk === null)
    throw new RangeError("Scope does not contain any Text nodes.");
  return await describeTextPosition(textChunks.rangeToChunkRange(range), textChunks);
}

// node_modules/@medv/finder/finder.js
var config;
var rootDocument;
var start;
function finder(input, options) {
  start = /* @__PURE__ */ new Date();
  if (input.nodeType !== Node.ELEMENT_NODE) {
    throw new Error(`Can't generate CSS selector for non-element node type.`);
  }
  if ("html" === input.tagName.toLowerCase()) {
    return "html";
  }
  const defaults = {
    root: document.body,
    idName: (name) => true,
    className: (name) => true,
    tagName: (name) => true,
    attr: (name, value) => false,
    seedMinLength: 1,
    optimizedMinLength: 2,
    threshold: 1e3,
    maxNumberOfTries: 1e4,
    timeoutMs: void 0
  };
  config = { ...defaults, ...options };
  rootDocument = findRootDocument(config.root, defaults);
  let path = bottomUpSearch(input, "all", () => bottomUpSearch(input, "two", () => bottomUpSearch(input, "one", () => bottomUpSearch(input, "none"))));
  if (path) {
    const optimized = sort(optimize(path, input));
    if (optimized.length > 0) {
      path = optimized[0];
    }
    return selector(path);
  } else {
    throw new Error(`Selector was not found.`);
  }
}
function findRootDocument(rootNode, defaults) {
  if (rootNode.nodeType === Node.DOCUMENT_NODE) {
    return rootNode;
  }
  if (rootNode === defaults.root) {
    return rootNode.ownerDocument;
  }
  return rootNode;
}
function bottomUpSearch(input, limit, fallback) {
  let path = null;
  let stack = [];
  let current = input;
  let i = 0;
  while (current) {
    const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - start.getTime();
    if (config.timeoutMs !== void 0 && elapsedTime > config.timeoutMs) {
      throw new Error(`Timeout: Can't find a unique selector after ${elapsedTime}ms`);
    }
    let level = maybe(id(current)) || maybe(...attr(current)) || maybe(...classNames(current)) || maybe(tagName(current)) || [any()];
    const nth = index(current);
    if (limit == "all") {
      if (nth) {
        level = level.concat(level.filter(dispensableNth).map((node) => nthChild(node, nth)));
      }
    } else if (limit == "two") {
      level = level.slice(0, 1);
      if (nth) {
        level = level.concat(level.filter(dispensableNth).map((node) => nthChild(node, nth)));
      }
    } else if (limit == "one") {
      const [node] = level = level.slice(0, 1);
      if (nth && dispensableNth(node)) {
        level = [nthChild(node, nth)];
      }
    } else if (limit == "none") {
      level = [any()];
      if (nth) {
        level = [nthChild(level[0], nth)];
      }
    }
    for (let node of level) {
      node.level = i;
    }
    stack.push(level);
    if (stack.length >= config.seedMinLength) {
      path = findUniquePath(stack, fallback);
      if (path) {
        break;
      }
    }
    current = current.parentElement;
    i++;
  }
  if (!path) {
    path = findUniquePath(stack, fallback);
  }
  if (!path && fallback) {
    return fallback();
  }
  return path;
}
function findUniquePath(stack, fallback) {
  const paths = sort(combinations(stack));
  if (paths.length > config.threshold) {
    return fallback ? fallback() : null;
  }
  for (let candidate of paths) {
    if (unique(candidate)) {
      return candidate;
    }
  }
  return null;
}
function selector(path) {
  let node = path[0];
  let query = node.name;
  for (let i = 1; i < path.length; i++) {
    const level = path[i].level || 0;
    if (node.level === level - 1) {
      query = `${path[i].name} > ${query}`;
    } else {
      query = `${path[i].name} ${query}`;
    }
    node = path[i];
  }
  return query;
}
function penalty(path) {
  return path.map((node) => node.penalty).reduce((acc, i) => acc + i, 0);
}
function unique(path) {
  const css = selector(path);
  switch (rootDocument.querySelectorAll(css).length) {
    case 0:
      throw new Error(`Can't select any node with this selector: ${css}`);
    case 1:
      return true;
    default:
      return false;
  }
}
function id(input) {
  const elementId = input.getAttribute("id");
  if (elementId && config.idName(elementId)) {
    return {
      name: "#" + CSS.escape(elementId),
      penalty: 0
    };
  }
  return null;
}
function attr(input) {
  const attrs = Array.from(input.attributes).filter((attr2) => config.attr(attr2.name, attr2.value));
  return attrs.map((attr2) => ({
    name: `[${CSS.escape(attr2.name)}="${CSS.escape(attr2.value)}"]`,
    penalty: 0.5
  }));
}
function classNames(input) {
  const names = Array.from(input.classList).filter(config.className);
  return names.map((name) => ({
    name: "." + CSS.escape(name),
    penalty: 1
  }));
}
function tagName(input) {
  const name = input.tagName.toLowerCase();
  if (config.tagName(name)) {
    return {
      name,
      penalty: 2
    };
  }
  return null;
}
function any() {
  return {
    name: "*",
    penalty: 3
  };
}
function index(input) {
  const parent = input.parentNode;
  if (!parent) {
    return null;
  }
  let child = parent.firstChild;
  if (!child) {
    return null;
  }
  let i = 0;
  while (child) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      i++;
    }
    if (child === input) {
      break;
    }
    child = child.nextSibling;
  }
  return i;
}
function nthChild(node, i) {
  return {
    name: node.name + `:nth-child(${i})`,
    penalty: node.penalty + 1
  };
}
function dispensableNth(node) {
  return node.name !== "html" && !node.name.startsWith("#");
}
function maybe(...level) {
  const list = level.filter(notEmpty);
  if (list.length > 0) {
    return list;
  }
  return null;
}
function notEmpty(value) {
  return value !== null && value !== void 0;
}
function* combinations(stack, path = []) {
  if (stack.length > 0) {
    for (let node of stack[0]) {
      yield* combinations(stack.slice(1, stack.length), path.concat(node));
    }
  } else {
    yield path;
  }
}
function sort(paths) {
  return [...paths].sort((a, b) => penalty(a) - penalty(b));
}
function* optimize(path, input, scope = {
  counter: 0,
  visited: /* @__PURE__ */ new Map()
}) {
  if (path.length > 2 && path.length > config.optimizedMinLength) {
    for (let i = 1; i < path.length - 1; i++) {
      if (scope.counter > config.maxNumberOfTries) {
        return;
      }
      scope.counter += 1;
      const newPath = [...path];
      newPath.splice(i, 1);
      const newPathKey = selector(newPath);
      if (scope.visited.has(newPathKey)) {
        return;
      }
      if (unique(newPath) && same(newPath, input)) {
        yield newPath;
        scope.visited.set(newPathKey, true);
        yield* optimize(newPath, input, scope);
      }
    }
  }
}
function same(path, input) {
  return rootDocument.querySelector(selector(path)) === input;
}

// build/vendor/apache-annotator/dom/css.js
function createCssSelectorMatcher(selector2) {
  return async function* matchAll(scope) {
    scope = toRange(scope);
    const document2 = ownerDocument(scope);
    for (const element of document2.querySelectorAll(selector2.value)) {
      const range = document2.createRange();
      range.selectNode(element);
      if (scope.isPointInRange(range.startContainer, range.startOffset) && scope.isPointInRange(range.endContainer, range.endOffset)) {
        yield element;
      }
    }
  };
}

// build/vendor/apache-annotator/selector/refinable.js
function makeRefinable(matcherCreator) {
  return function createMatcherWithRefinement(sourceSelector) {
    const matcher = matcherCreator(sourceSelector);
    if (sourceSelector.refinedBy) {
      const refiningSelector = createMatcherWithRefinement(sourceSelector.refinedBy);
      return async function* matchAll(scope) {
        for await (const match of matcher(scope)) {
          yield* refiningSelector(match);
        }
      };
    }
    return matcher;
  };
}

// build/demo/highlight.mjs
console.log("loaded");
var cleanup = () => {
  const divs = document.querySelectorAll(".highlight");
  if (divs) {
    for (const div of divs) {
      if (div) {
        div.parentElement?.removeChild(div);
      }
    }
  }
};
var anchor = (r, id2) => {
  if (!r || r.collapsed) {
    console.log("range collapsed, exit, ", r);
    return;
  }
  console.log("Draws : ", r.getClientRects());
  for (const rect of r.getClientRects()) {
    const div = document.createElement("div");
    div.setAttribute("id", id2);
    div.setAttribute("class", "highlight");
    div.setAttribute("style", `backgroundColor: red; opacity: 0.7; position: absolute; width: ${rect.width}px; height: ${rect.height}px; left: ${rect.left + window.scrollX}px; right: ${rect.right}px; top: ${rect.top + window.scrollY}px; bottom: ${rect.bottom}px;`);
    div.style.backgroundColor = "red";
    div.style.opacity = "0.1";
    div.style.position = "absolute";
    document.body.appendChild(div);
  }
};

// build/vendor/anchoring/approx-string-match.js
function reverse(s) {
  return s.split("").reverse().join("");
}
function findMatchStarts(text, pattern, matches) {
  const patRev = reverse(pattern);
  return matches.map((m) => {
    const minStart = Math.max(0, m.end - pattern.length - m.errors);
    const textRev = reverse(text.slice(minStart, m.end));
    const start2 = findMatchEnds(textRev, patRev, m.errors).reduce((min, rm) => {
      if (m.end - rm.end < min) {
        return m.end - rm.end;
      }
      return min;
    }, m.end);
    return {
      start: start2,
      end: m.end,
      errors: m.errors
    };
  });
}
function oneIfNotZero(n) {
  return (n | -n) >> 31 & 1;
}
function advanceBlock(ctx, peq, b, hIn) {
  let pV = ctx.P[b];
  let mV = ctx.M[b];
  const hInIsNegative = hIn >>> 31;
  const eq = peq[b] | hInIsNegative;
  const xV = eq | mV;
  const xH = (eq & pV) + pV ^ pV | eq;
  let pH = mV | ~(xH | pV);
  let mH = pV & xH;
  const hOut = oneIfNotZero(pH & ctx.lastRowMask[b]) - oneIfNotZero(mH & ctx.lastRowMask[b]);
  pH <<= 1;
  mH <<= 1;
  mH |= hInIsNegative;
  pH |= oneIfNotZero(hIn) - hInIsNegative;
  pV = mH | ~(xV | pH);
  mV = pH & xV;
  ctx.P[b] = pV;
  ctx.M[b] = mV;
  return hOut;
}
function findMatchEnds(text, pattern, maxErrors) {
  if (pattern.length === 0) {
    return [];
  }
  maxErrors = Math.min(maxErrors, pattern.length);
  const matches = [];
  const w = 32;
  const bMax = Math.ceil(pattern.length / w) - 1;
  const ctx = {
    P: new Uint32Array(bMax + 1),
    M: new Uint32Array(bMax + 1),
    lastRowMask: new Uint32Array(bMax + 1)
  };
  ctx.lastRowMask.fill(1 << 31);
  ctx.lastRowMask[bMax] = 1 << (pattern.length - 1) % w;
  const emptyPeq = new Uint32Array(bMax + 1);
  const peq = /* @__PURE__ */ new Map();
  const asciiPeq = [];
  for (let i = 0; i < 256; i++) {
    asciiPeq.push(emptyPeq);
  }
  for (let c = 0; c < pattern.length; c += 1) {
    const val = pattern.charCodeAt(c);
    if (peq.has(val)) {
      continue;
    }
    const charPeq = new Uint32Array(bMax + 1);
    peq.set(val, charPeq);
    if (val < asciiPeq.length) {
      asciiPeq[val] = charPeq;
    }
    for (let b = 0; b <= bMax; b += 1) {
      charPeq[b] = 0;
      for (let r = 0; r < w; r += 1) {
        const idx = b * w + r;
        if (idx >= pattern.length) {
          continue;
        }
        const match = pattern.charCodeAt(idx) === val;
        if (match) {
          charPeq[b] |= 1 << r;
        }
      }
    }
  }
  let y = Math.max(0, Math.ceil(maxErrors / w) - 1);
  const score = new Uint32Array(bMax + 1);
  for (let b = 0; b <= y; b += 1) {
    score[b] = (b + 1) * w;
  }
  score[bMax] = pattern.length;
  for (let b = 0; b <= y; b += 1) {
    ctx.P[b] = ~0;
    ctx.M[b] = 0;
  }
  for (let j = 0; j < text.length; j += 1) {
    const charCode = text.charCodeAt(j);
    let charPeq;
    if (charCode < asciiPeq.length) {
      charPeq = asciiPeq[charCode];
    } else {
      charPeq = peq.get(charCode);
      if (typeof charPeq === "undefined") {
        charPeq = emptyPeq;
      }
    }
    let carry = 0;
    for (let b = 0; b <= y; b += 1) {
      carry = advanceBlock(ctx, charPeq, b, carry);
      score[b] += carry;
    }
    if (score[y] - carry <= maxErrors && y < bMax && (charPeq[y + 1] & 1 || carry < 0)) {
      y += 1;
      ctx.P[y] = ~0;
      ctx.M[y] = 0;
      let maxBlockScore;
      if (y === bMax) {
        const remainder = pattern.length % w;
        maxBlockScore = remainder === 0 ? w : remainder;
      } else {
        maxBlockScore = w;
      }
      score[y] = score[y - 1] + maxBlockScore - carry + advanceBlock(ctx, charPeq, y, carry);
    } else {
      while (y > 0 && score[y] >= maxErrors + w) {
        y -= 1;
      }
    }
    if (y === bMax && score[y] <= maxErrors) {
      if (score[y] < maxErrors) {
        matches.splice(0, matches.length);
      }
      matches.push({
        start: -1,
        end: j + 1,
        errors: score[y]
      });
      maxErrors = score[y];
    }
  }
  return matches;
}
function search(text, pattern, maxErrors) {
  const matches = findMatchEnds(text, pattern, maxErrors);
  return findMatchStarts(text, pattern, matches);
}

// build/vendor/anchoring/match-quote.js
function search2(text, str, maxErrors) {
  let matchPos = 0;
  const exactMatches = [];
  while (matchPos !== -1) {
    matchPos = text.indexOf(str, matchPos);
    if (matchPos !== -1) {
      exactMatches.push({
        start: matchPos,
        end: matchPos + str.length,
        errors: 0
      });
      matchPos += 1;
    }
  }
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  return search(text, str, maxErrors);
}
function textMatchScore(text, str) {
  if (str.length === 0 || text.length === 0) {
    return 0;
  }
  const matches = search2(text, str, str.length);
  return 1 - matches[0].errors / str.length;
}
function matchQuote(text, quote, context = {}) {
  if (quote.length === 0) {
    return null;
  }
  const maxErrors = Math.min(256, quote.length / 2);
  const matches = search2(text, quote, maxErrors);
  if (matches.length === 0) {
    return null;
  }
  const scoreMatch = (match) => {
    const quoteWeight = 50;
    const prefixWeight = 20;
    const suffixWeight = 20;
    const posWeight = 2;
    const quoteScore = 1 - match.errors / quote.length;
    const prefixScore = context.prefix ? textMatchScore(text.slice(Math.max(0, match.start - context.prefix.length), match.start), context.prefix) : 1;
    const suffixScore = context.suffix ? textMatchScore(text.slice(match.end, match.end + context.suffix.length), context.suffix) : 1;
    let posScore = 1;
    if (typeof context.hint === "number") {
      const offset = Math.abs(match.start - context.hint);
      posScore = 1 - offset / text.length;
    }
    const rawScore = quoteWeight * quoteScore + prefixWeight * prefixScore + suffixWeight * suffixScore + posWeight * posScore;
    const maxScore = quoteWeight + prefixWeight + suffixWeight + posWeight;
    const normalizedScore = rawScore / maxScore;
    return normalizedScore;
  };
  const scoredMatches = matches.map((m) => ({
    start: m.start,
    end: m.end,
    score: scoreMatch(m)
  }));
  scoredMatches.sort((a, b) => b.score - a.score);
  return scoredMatches[0];
}

// build/vendor/anchoring/trim-range.js
var TrimDirection;
(function(TrimDirection2) {
  TrimDirection2[TrimDirection2["Forwards"] = 1] = "Forwards";
  TrimDirection2[TrimDirection2["Backwards"] = 2] = "Backwards";
})(TrimDirection || (TrimDirection = {}));
function closestNonSpaceInString(text, baseOffset, direction) {
  const nextChar = direction === TrimDirection.Forwards ? baseOffset : baseOffset - 1;
  if (text.charAt(nextChar).trim() !== "") {
    return baseOffset;
  }
  let availableChars;
  let availableNonWhitespaceChars;
  if (direction === TrimDirection.Backwards) {
    availableChars = text.substring(0, baseOffset);
    availableNonWhitespaceChars = availableChars.trimEnd();
  } else {
    availableChars = text.substring(baseOffset);
    availableNonWhitespaceChars = availableChars.trimStart();
  }
  if (!availableNonWhitespaceChars.length) {
    return -1;
  }
  const offsetDelta = availableChars.length - availableNonWhitespaceChars.length;
  return direction === TrimDirection.Backwards ? baseOffset - offsetDelta : baseOffset + offsetDelta;
}
function closestNonSpaceInRange(range, direction) {
  const nodeIter = range.commonAncestorContainer.ownerDocument.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
  const initialBoundaryNode = direction === TrimDirection.Forwards ? range.startContainer : range.endContainer;
  const terminalBoundaryNode = direction === TrimDirection.Forwards ? range.endContainer : range.startContainer;
  let currentNode = nodeIter.nextNode();
  while (currentNode && currentNode !== initialBoundaryNode) {
    currentNode = nodeIter.nextNode();
  }
  if (direction === TrimDirection.Backwards) {
    currentNode = nodeIter.previousNode();
  }
  let trimmedOffset = -1;
  const advance = () => {
    currentNode = direction === TrimDirection.Forwards ? nodeIter.nextNode() : nodeIter.previousNode();
    if (currentNode) {
      const nodeText = currentNode.textContent;
      const baseOffset = direction === TrimDirection.Forwards ? 0 : nodeText.length;
      trimmedOffset = closestNonSpaceInString(nodeText, baseOffset, direction);
    }
  };
  while (currentNode && trimmedOffset === -1 && currentNode !== terminalBoundaryNode) {
    advance();
  }
  if (currentNode && trimmedOffset >= 0) {
    return { node: currentNode, offset: trimmedOffset };
  }
  throw new RangeError("No text nodes with non-whitespace text found in range");
}
function trimRange(range) {
  if (!range.toString().trim().length) {
    throw new RangeError("Range contains no non-whitespace text");
  }
  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    throw new RangeError("Range startContainer is not a text node");
  }
  if (range.endContainer.nodeType !== Node.TEXT_NODE) {
    throw new RangeError("Range endContainer is not a text node");
  }
  const trimmedRange = range.cloneRange();
  let startTrimmed = false;
  let endTrimmed = false;
  const trimmedOffsets = {
    start: closestNonSpaceInString(range.startContainer.textContent, range.startOffset, TrimDirection.Forwards),
    end: closestNonSpaceInString(range.endContainer.textContent, range.endOffset, TrimDirection.Backwards)
  };
  if (trimmedOffsets.start >= 0) {
    trimmedRange.setStart(range.startContainer, trimmedOffsets.start);
    startTrimmed = true;
  }
  if (trimmedOffsets.end > 0) {
    trimmedRange.setEnd(range.endContainer, trimmedOffsets.end);
    endTrimmed = true;
  }
  if (startTrimmed && endTrimmed) {
    return trimmedRange;
  }
  if (!startTrimmed) {
    const { node, offset } = closestNonSpaceInRange(trimmedRange, TrimDirection.Forwards);
    if (node && offset >= 0) {
      trimmedRange.setStart(node, offset);
    }
  }
  if (!endTrimmed) {
    const { node, offset } = closestNonSpaceInRange(trimmedRange, TrimDirection.Backwards);
    if (node && offset > 0) {
      trimmedRange.setEnd(node, offset);
    }
  }
  return trimmedRange;
}

// build/vendor/anchoring/text-range.js
function nodeTextLength(node) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
    case Node.TEXT_NODE:
      return node.textContent?.length ?? 0;
    default:
      return 0;
  }
}
function previousSiblingsTextLength(node) {
  let sibling = node.previousSibling;
  let length = 0;
  while (sibling) {
    length += nodeTextLength(sibling);
    sibling = sibling.previousSibling;
  }
  return length;
}
function resolveOffsets(element, ...offsets) {
  let nextOffset = offsets.shift();
  const nodeIter = element.ownerDocument.createNodeIterator(element, NodeFilter.SHOW_TEXT);
  const results = [];
  let currentNode = nodeIter.nextNode();
  let textNode;
  let length = 0;
  while (nextOffset !== void 0 && currentNode) {
    textNode = currentNode;
    if (length + textNode.data.length > nextOffset) {
      results.push({ node: textNode, offset: nextOffset - length });
      nextOffset = offsets.shift();
    } else {
      currentNode = nodeIter.nextNode();
      length += textNode.data.length;
    }
  }
  while (nextOffset !== void 0 && textNode && length === nextOffset) {
    results.push({ node: textNode, offset: textNode.data.length });
    nextOffset = offsets.shift();
  }
  if (nextOffset !== void 0) {
    throw new RangeError("Offset exceeds text length");
  }
  return results;
}
var ResolveDirection;
(function(ResolveDirection2) {
  ResolveDirection2[ResolveDirection2["FORWARDS"] = 1] = "FORWARDS";
  ResolveDirection2[ResolveDirection2["BACKWARDS"] = 2] = "BACKWARDS";
})(ResolveDirection || (ResolveDirection = {}));
var TextPosition = class _TextPosition {
  element;
  offset;
  constructor(element, offset) {
    if (offset < 0) {
      throw new Error("Offset is invalid");
    }
    this.element = element;
    this.offset = offset;
  }
  /**
   * Return a copy of this position with offset relative to a given ancestor
   * element.
   *
   * @param parent - Ancestor of `this.element`
   */
  relativeTo(parent) {
    if (!parent.contains(this.element)) {
      throw new Error("Parent is not an ancestor of current element");
    }
    let el = this.element;
    let offset = this.offset;
    while (el !== parent) {
      offset += previousSiblingsTextLength(el);
      el = el.parentElement;
    }
    return new _TextPosition(el, offset);
  }
  /**
   * Resolve the position to a specific text node and offset within that node.
   *
   * Throws if `this.offset` exceeds the length of the element's text. In the
   * case where the element has no text and `this.offset` is 0, the `direction`
   * option determines what happens.
   *
   * Offsets at the boundary between two nodes are resolved to the start of the
   * node that begins at the boundary.
   *
   * @param options.direction - Specifies in which direction to search for the
   *                            nearest text node if `this.offset` is `0` and
   *                            `this.element` has no text. If not specified an
   *                            error is thrown.
   *
   * @throws {RangeError}
   */
  resolve(options = {}) {
    try {
      return resolveOffsets(this.element, this.offset)[0];
    } catch (err) {
      if (this.offset === 0 && options.direction !== void 0) {
        const tw = document.createTreeWalker(this.element.getRootNode(), NodeFilter.SHOW_TEXT);
        tw.currentNode = this.element;
        const forwards = options.direction === ResolveDirection.FORWARDS;
        const text = forwards ? tw.nextNode() : tw.previousNode();
        if (!text) {
          throw err;
        }
        return { node: text, offset: forwards ? 0 : text.data.length };
      } else {
        throw err;
      }
    }
  }
  /**
   * Construct a `TextPosition` that refers to the `offset`th character within
   * `node`.
   */
  static fromCharOffset(node, offset) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return _TextPosition.fromPoint(node, offset);
      case Node.ELEMENT_NODE:
        return new _TextPosition(node, offset);
      default:
        throw new Error("Node is not an element or text node");
    }
  }
  /**
   * Construct a `TextPosition` representing the range start or end point (node, offset).
   *
   * @param node
   * @param offset - Offset within the node
   */
  static fromPoint(node, offset) {
    switch (node.nodeType) {
      case Node.TEXT_NODE: {
        if (offset < 0 || offset > node.data.length) {
          throw new Error("Text node offset is out of range");
        }
        if (!node.parentElement) {
          throw new Error("Text node has no parent");
        }
        const textOffset = previousSiblingsTextLength(node) + offset;
        return new _TextPosition(node.parentElement, textOffset);
      }
      case Node.ELEMENT_NODE: {
        if (offset < 0 || offset > node.childNodes.length) {
          throw new Error("Child node offset is out of range");
        }
        let textOffset = 0;
        for (let i = 0; i < offset; i++) {
          textOffset += nodeTextLength(node.childNodes[i]);
        }
        return new _TextPosition(node, textOffset);
      }
      default:
        throw new Error("Point is not in an element or text node");
    }
  }
};
var TextRange = class _TextRange {
  start;
  end;
  constructor(start2, end) {
    this.start = start2;
    this.end = end;
  }
  /**
   * Create a new TextRange whose `start` and `end` are computed relative to
   * `element`. `element` must be an ancestor of both `start.element` and
   * `end.element`.
   */
  relativeTo(element) {
    return new _TextRange(this.start.relativeTo(element), this.end.relativeTo(element));
  }
  /**
   * Resolve this TextRange to a (DOM) Range.
   *
   * The resulting DOM Range will always start and end in a `Text` node.
   * Hence `TextRange.fromRange(range).toRange()` can be used to "shrink" a
   * range to the text it contains.
   *
   * May throw if the `start` or `end` positions cannot be resolved to a range.
   */
  toRange() {
    let start2;
    let end;
    if (this.start.element === this.end.element && this.start.offset <= this.end.offset) {
      [start2, end] = resolveOffsets(this.start.element, this.start.offset, this.end.offset);
    } else {
      start2 = this.start.resolve({
        direction: ResolveDirection.FORWARDS
      });
      end = this.end.resolve({ direction: ResolveDirection.BACKWARDS });
    }
    const range = new Range();
    range.setStart(start2.node, start2.offset);
    range.setEnd(end.node, end.offset);
    return range;
  }
  /**
   * Create a TextRange from a (DOM) Range
   */
  static fromRange(range) {
    const start2 = TextPosition.fromPoint(range.startContainer, range.startOffset);
    const end = TextPosition.fromPoint(range.endContainer, range.endOffset);
    return new _TextRange(start2, end);
  }
  /**
   * Create a TextRange representing the `start`th to `end`th characters in
   * `root`
   */
  static fromOffsets(root, start2, end) {
    return new _TextRange(new TextPosition(root, start2), new TextPosition(root, end));
  }
  /**
   * Return a new Range representing `range` trimmed of any leading or trailing
   * whitespace
   */
  static trimmedRange(range) {
    return trimRange(_TextRange.fromRange(range).toRange());
  }
};

// build/vendor/anchoring/xpath.js
function getNodeName(node) {
  const nodeName = node.nodeName.toLowerCase();
  return nodeName === "#text" ? "text()" : nodeName;
}
function getNodePosition(node) {
  let pos = 0;
  let tmp = node;
  while (tmp) {
    if (tmp.nodeName === node.nodeName) {
      pos += 1;
    }
    tmp = tmp.previousSibling;
  }
  return pos;
}
function getPathSegment(node) {
  const name = getNodeName(node);
  const pos = getNodePosition(node);
  return `${name}[${pos}]`;
}
function xpathFromNode(node, root) {
  let xpath = "";
  let elem = node;
  while (elem !== root) {
    if (!elem) {
      throw new Error("Node is not a descendant of root");
    }
    xpath = getPathSegment(elem) + "/" + xpath;
    elem = elem.parentNode;
  }
  xpath = "/" + xpath;
  xpath = xpath.replace(/\/$/, "");
  return xpath;
}
function nthChildOfType(element, nodeName, index2) {
  nodeName = nodeName.toUpperCase();
  let matchIndex = -1;
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    if (child.nodeName.toUpperCase() === nodeName) {
      ++matchIndex;
      if (matchIndex === index2) {
        return child;
      }
    }
  }
  return null;
}
function evaluateSimpleXPath(xpath, root) {
  const isSimpleXPath = xpath.match(/^(\/[A-Za-z0-9-]+(\[[0-9]+\])?)+$/) !== null;
  if (!isSimpleXPath) {
    throw new Error("Expression is not a simple XPath");
  }
  const segments = xpath.split("/");
  let element = root;
  segments.shift();
  for (const segment of segments) {
    let elementName;
    let elementIndex;
    const separatorPos = segment.indexOf("[");
    if (separatorPos !== -1) {
      elementName = segment.slice(0, separatorPos);
      const indexStr = segment.slice(separatorPos + 1, segment.indexOf("]"));
      elementIndex = parseInt(indexStr) - 1;
      if (elementIndex < 0) {
        return null;
      }
    } else {
      elementName = segment;
      elementIndex = 0;
    }
    const child = nthChildOfType(element, elementName, elementIndex);
    if (!child) {
      return null;
    }
    element = child;
  }
  return element;
}
function nodeFromXPath(xpath, root = document.body) {
  try {
    return evaluateSimpleXPath(xpath, root);
  } catch {
    return document.evaluate(
      "." + xpath,
      root,
      // nb. The `namespaceResolver` and `result` arguments are optional in the spec
      // but required in Edge Legacy.
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
      /* result */
    ).singleNodeValue;
  }
}

// build/vendor/anchoring/types.js
var TextPositionAnchor = class _TextPositionAnchor {
  root;
  start;
  end;
  constructor(root, start2, end) {
    this.root = root;
    this.start = start2;
    this.end = end;
  }
  static fromRange(root, range) {
    const textRange = TextRange.fromRange(range).relativeTo(root);
    return new _TextPositionAnchor(root, textRange.start.offset, textRange.end.offset);
  }
  static fromSelector(root, selector2) {
    return new _TextPositionAnchor(root, selector2.start, selector2.end);
  }
  toSelector() {
    return {
      type: "TextPositionSelector",
      start: this.start,
      end: this.end
    };
  }
  toRange() {
    return TextRange.fromOffsets(this.root, this.start, this.end).toRange();
  }
};
var TextQuoteAnchor = class _TextQuoteAnchor {
  root;
  exact;
  context;
  /**
   * @param root - A root element from which to anchor.
   */
  constructor(root, exact, context = {}) {
    this.root = root;
    this.exact = exact;
    this.context = context;
  }
  /**
   * Create a `TextQuoteAnchor` from a range.
   *
   * Will throw if `range` does not contain any text nodes.
   */
  static fromRange(root, range) {
    const text = root.textContent;
    const textRange = TextRange.fromRange(range).relativeTo(root);
    const start2 = textRange.start.offset;
    const end = textRange.end.offset;
    const contextLen = 32;
    return new _TextQuoteAnchor(root, text.slice(start2, end), {
      prefix: text.slice(Math.max(0, start2 - contextLen), start2),
      suffix: text.slice(end, Math.min(text.length, end + contextLen))
    });
  }
  static fromSelector(root, selector2) {
    const { prefix, suffix } = selector2;
    return new _TextQuoteAnchor(root, selector2.exact, { prefix, suffix });
  }
  toSelector() {
    return {
      type: "TextQuoteSelector",
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix
    };
  }
  toRange(options = {}) {
    return this.toPositionAnchor(options).toRange();
  }
  toPositionAnchor(options = {}) {
    const text = this.root.textContent;
    const match = matchQuote(text, this.exact, {
      ...this.context,
      hint: options.hint
    });
    if (!match) {
      throw new Error("Quote not found");
    }
    return new TextPositionAnchor(this.root, match.start, match.end);
  }
};

// build/demo/index.mjs
function copyPreContent(event) {
  var preElement = event.target.nextSibling;
  while (preElement && preElement.nodeName !== "PRE") {
    preElement = preElement.nextSibling;
  }
  if (!preElement)
    return;
  var text = JSON.stringify(JSON.parse(preElement.textContent), null, 4);
  navigator.clipboard.writeText(text).then(function() {
    alert("Text copied to clipboard");
  }, function(err) {
    console.error("There was an error copying the text: ", err);
  });
}
var preElements = document.body.querySelectorAll("pre");
preElements.forEach(function(preElement) {
  var button = document.createElement("button");
  button.innerHTML = '<i class="fa fa-clipboard" aria-hidden="true"></i> Copy';
  button.onclick = copyPreContent;
  preElement.parentNode.insertBefore(button, preElement);
});
function debounce(func, timeout) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
function createXPathSelectorMatcher(selector2) {
  return async function* matchAll(scope) {
    const scopeRange = toRange(scope);
    const document2 = ownerDocument(scopeRange);
    const scopeRangeElement = scopeRange.commonAncestorContainer;
    const element = nodeFromXPath(selector2.value, scopeRangeElement);
    console.log("XPath node found :", element);
    if (!element)
      throw new Error("XPath node not found !:");
    const range = document2.createRange();
    range.selectNode(element);
    if (scopeRange.isPointInRange(range.startContainer, range.startOffset) && scopeRange.isPointInRange(range.endContainer, range.endOffset)) {
      yield element;
    }
  };
}
var createMatcher = makeRefinable((selector2) => {
  const innerCreateMatcher = {
    TextQuoteSelector: createTextQuoteSelectorMatcher,
    TextPositionSelector: createTextPositionSelectorMatcher,
    CssSelector: createCssSelectorMatcher,
    XPathSelector: createXPathSelectorMatcher,
    RangeSelector: makeCreateRangeSelectorMatcher(createMatcher)
  }[selector2.type];
  if (!innerCreateMatcher) {
    throw new Error(`Unsupported selector type: ${selector2.type}`);
  }
  return innerCreateMatcher(selector2);
});
var describeRange = async (range) => {
  const rangeNormalize = normalizeRange(range);
  const startIsElement = rangeNormalize.startContainer.nodeType === Node.ELEMENT_NODE;
  if (startIsElement) {
    return void 0;
  }
  const startContainerHTMLElement = rangeNormalize.startContainer.parentNode instanceof HTMLElement ? rangeNormalize.startContainer.parentNode : void 0;
  if (!startContainerHTMLElement) {
    return void 0;
  }
  const startContainerChildTextNodeIndex = Array.from(startContainerHTMLElement.childNodes).indexOf(rangeNormalize.startContainer);
  if (startContainerChildTextNodeIndex < -1) {
    return void 0;
  }
  const endIsElement = range.endContainer.nodeType === Node.ELEMENT_NODE;
  if (endIsElement) {
    return void 0;
  }
  const endContainerHTMLElement = rangeNormalize.endContainer.parentNode instanceof HTMLElement ? rangeNormalize.endContainer.parentNode : void 0;
  if (!endContainerHTMLElement) {
    return void 0;
  }
  const endContainerChildTextNodeIndex = Array.from(endContainerHTMLElement.childNodes).indexOf(rangeNormalize.startContainer);
  if (endContainerChildTextNodeIndex < -1) {
    return void 0;
  }
  const startAndEndEqual = startContainerHTMLElement === endContainerHTMLElement;
  const startContainerHTMLElementCssSelector = finder(startContainerHTMLElement);
  const endContainerHTMLElementCssSelector = startAndEndEqual ? startContainerHTMLElementCssSelector : finder(endContainerHTMLElement);
  const startTextPositionSelector = {
    type: "TextPositionSelector",
    start: rangeNormalize.startOffset,
    end: startAndEndEqual ? rangeNormalize.endOffset : rangeNormalize.startContainer.data.length
  };
  const endTextPositionSelector = {
    type: "TextPositionSelector",
    start: rangeNormalize.endOffset,
    end: rangeNormalize.endContainer.data.length
  };
  return {
    type: "RangeSelector",
    startSelector: {
      type: "CssSelector",
      value: startContainerHTMLElementCssSelector,
      refinedBy: startContainerChildTextNodeIndex > 0 ? {
        type: "XPathSelector",
        value: "/text()[" + startContainerChildTextNodeIndex + "]",
        refinedBy: startTextPositionSelector
      } : startTextPositionSelector
    },
    endSelector: {
      type: "CssSelector",
      value: endContainerHTMLElementCssSelector,
      refinedBy: endContainerChildTextNodeIndex > 0 ? {
        type: "XPathSelector",
        value: "/text()[" + endContainerChildTextNodeIndex + "]",
        refinedBy: endTextPositionSelector
      } : endTextPositionSelector
    }
  };
};
var describeRangeCssSelector = async (range) => {
  const rangeNormalize = normalizeRange(range);
  const commonAncestorHTMLElement = rangeNormalize.commonAncestorContainer instanceof HTMLElement ? rangeNormalize.commonAncestorContainer : range.startContainer.parentNode instanceof HTMLElement ? range.startContainer.parentNode : void 0;
  if (!commonAncestorHTMLElement) {
    return void 0;
  }
  return {
    type: "CssSelector",
    value: finder(commonAncestorHTMLElement),
    refinedBy: await describeTextPosition2(rangeNormalize, commonAncestorHTMLElement)
  };
};
var describeRangeXPathSelector = async (range) => {
  const rangeNormalize = normalizeRange(range);
  const commonAncestorHTMLElement = rangeNormalize.commonAncestorContainer;
  if (!commonAncestorHTMLElement) {
    return void 0;
  }
  const source = document.getElementById("source");
  return {
    type: "XPathSelector",
    value: xpathFromNode(commonAncestorHTMLElement, source),
    refinedBy: await describeTextPosition2(rangeNormalize, commonAncestorHTMLElement)
  };
};
var debounceOnSelectionChange = debounce(async function onSelectionChange() {
  const selection = document.getSelection();
  if (!selection)
    return;
  if (selection?.isCollapsed || !selection?.anchorNode || !selection?.focusNode) {
    return;
  }
  console.log(selection.toString());
  const source = document.getElementById("source");
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    let selector2;
    let elem;
    let matchAll;
    const ranges = [];
    elem = document.getElementById("selector-out-textposition");
    try {
      selector2 = await describeTextPosition2(range, source);
      matchAll = createMatcher(selector2);
      for await (const range2 of matchAll(source)) {
        ranges.push([range2, "textposition"]);
      }
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("TextPositionSelector error: ", e);
      if (elem)
        elem.innerText = "TextPositionSelector error: " + e;
    }
    elem = document.getElementById("selector-out-textposition-hypo");
    try {
      selector2 = TextQuoteAnchor.fromRange(source, range).toPositionAnchor().toSelector();
      const rangeFound = TextPositionAnchor.fromSelector(source, selector2).toRange();
      if (rangeFound)
        ranges.push([rangeFound, "textposition-hypothesis"]);
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("TextPositionSelectorHypothesis error: ", e);
      if (elem)
        elem.innerText = "TextPositionSelectorHypothesis error: " + e;
    }
    elem = document.getElementById("selector-out-textquote-hypo");
    try {
      selector2 = TextQuoteAnchor.fromRange(source, range).toSelector();
      const rangeFound = TextQuoteAnchor.fromSelector(source, selector2).toRange();
      if (rangeFound)
        ranges.push([rangeFound, "quoteposition-hypothesis"]);
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("TextQuoteSelectorHypothesis error: ", e);
      if (elem)
        elem.innerText = "TextQuoteSelectorHypothesis error: " + e;
    }
    elem = document.getElementById("selector-out-textquote");
    try {
      selector2 = await describeTextQuote2(range, source, {
        minimumQuoteLength: 10
      });
      matchAll = createMatcher(selector2);
      for await (const range2 of matchAll(source)) {
        ranges.push([range2, "textquote"]);
      }
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("TextQuoteSelector error: ", e);
      if (elem)
        elem.innerText = "TextQuoteSelector error: " + e;
    }
    elem = document.getElementById("selector-out-range");
    try {
      selector2 = await describeRange(range);
      matchAll = createMatcher(selector2);
      for await (const range2 of matchAll(source)) {
        ranges.push([range2, "range"]);
      }
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("RangeSelector error: ", e);
      if (elem)
        elem.innerText = "RangeSelector error: " + e;
    }
    elem = document.getElementById("selector-out-rangecss");
    try {
      selector2 = await describeRangeCssSelector(range);
      matchAll = createMatcher(selector2);
      for await (const range2 of matchAll(source)) {
        ranges.push([range2, "rangecss"]);
      }
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("RangeCss error: ", e);
      if (elem)
        elem.innerText = "RangeCss error: " + e;
    }
    elem = document.getElementById("selector-out-rangexpath");
    try {
      selector2 = await describeRangeXPathSelector(range);
      matchAll = createMatcher(selector2);
      for await (const range2 of matchAll(source)) {
        ranges.push([range2, "rangexpath"]);
      }
      if (elem)
        elem.innerText = JSON.stringify(selector2, null, 4);
    } catch (e) {
      console.error("RangeXpath error: ", e);
      if (elem)
        elem.innerText = "RangeXpath error: " + e;
    }
    cleanup();
    const txt = `There are ${ranges.length} ranges found ( ${ranges.map(([, v]) => v).join(", ")} )on 7 selectors`;
    console.log(txt);
    elem = document.getElementById("results");
    elem.innerText = txt;
    for (const [range2, id2] of ranges) {
      console.log("highlight this Range: ", range2);
      anchor(range2, id2);
    }
  }
}, 500);
document.addEventListener("selectionchange", debounceOnSelectionChange);
var inputTextArea = document.getElementById("input");
var debounceInputChange = debounce(async (e) => {
  const inputTextArea2 = document.getElementById("input");
  const selector2 = inputTextArea2.value;
  if (!selector2)
    return;
  let selectorParsed;
  try {
    selectorParsed = JSON.parse(selector2);
  } catch {
    return;
  }
  console.log(selectorParsed);
  const source = document.getElementById("source");
  cleanup();
  let elem;
  elem = document.getElementById("selector-out-rangecss");
  elem.innerText = "";
  elem = document.getElementById("selector-out-range");
  elem.innerText = "";
  elem = document.getElementById("selector-out-textquote");
  elem.innerText = "";
  elem = document.getElementById("selector-out-textquote-hypo");
  elem.innerText = "";
  elem = document.getElementById("selector-out-textposition-hypo");
  elem.innerText = "";
  elem = document.getElementById("selector-out-textposition");
  elem.innerText = "";
  elem = document.getElementById("selector-out-rangexpath");
  elem.innerText = "";
  const matchAll = createMatcher(selectorParsed);
  for await (const range of matchAll(source)) {
    anchor(range, "custom");
  }
}, 500);
inputTextArea.addEventListener("change", debounceInputChange);
var inputButton = document.getElementById("inputButton");
inputButton.onclick = () => debounceInputChange();
/**
 * @license
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-FileCopyrightText: The Apache Software Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
