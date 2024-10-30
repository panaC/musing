import {
  makeCreateRangeSelectorMatcher,
  createTextQuoteSelectorMatcher,
  describeTextQuote,
  createTextPositionSelectorMatcher,
  createCssSelectorMatcher,
  describeTextPosition,
  describeCss,
  normalizeRange,
} from "@apache-annotator/dom";

import * as aa from "@apache-annotator/dom";

import { finder } from "@medv/finder";

import {
  makeRefinable,
  Selector,
  type TextQuoteSelector,
  type RangeSelector,
  type CssSelector,
} from "@apache-annotator/selector";

import { anchor } from "./highlight.mjs";

const createMatcher = makeRefinable((selector: any) => {
  // @ts-expect-error
  const innerCreateMatcher: any = {
    TextQuoteSelector: createTextQuoteSelectorMatcher,
    TextPositionSelector: createTextPositionSelectorMatcher,
    CssSelector: createCssSelectorMatcher,
    RangeSelector: makeCreateRangeSelectorMatcher(createMatcher),
  }[selector.type];

  if (!innerCreateMatcher) {
    throw new Error(`Unsupported selector type: ${selector.type}`);
  }

  return innerCreateMatcher(selector);
});

const describeRange = async (range: Range): Promise<RangeSelector> => {
  const rangeNormalize = normalizeRange(range);

  const startIsElement =
    rangeNormalize.startContainer.nodeType === Node.ELEMENT_NODE;
  if (startIsElement) {
    return undefined;
  }
  const startContainerHTMLElement =
    rangeNormalize.startContainer.parentNode instanceof HTMLElement
      ? rangeNormalize.startContainer.parentNode
      : undefined;
  if (!startContainerHTMLElement) {
    return undefined;
  }

  const endIsElement = range.endContainer.nodeType === Node.ELEMENT_NODE;
  if (endIsElement) {
    return undefined;
  }
  const endContainerHTMLElement =
    rangeNormalize.endContainer.parentNode instanceof HTMLElement
      ? rangeNormalize.endContainer.parentNode
      : undefined;
  if (!endContainerHTMLElement) {
    return undefined;
  }

  const startAndEndEqual =
    startContainerHTMLElement === endContainerHTMLElement;
  const startContainerHTMLElementCssSelector = finder(
    startContainerHTMLElement,
  );
  const endContainerHTMLElementCssSelector = startAndEndEqual
    ? startContainerHTMLElementCssSelector
    : finder(endContainerHTMLElement);

  return {
    type: "RangeSelector",
    startSelector: {
      type: "CssSelector",
      value: startContainerHTMLElementCssSelector,
      refinedBy: {
        type: "TextPositionSelector",
        start: rangeNormalize.startOffset,
        end: startAndEndEqual
          ? rangeNormalize.endOffset
          : rangeNormalize.startContainer.data.length,
      },
    },
    endSelector: {
      type: "CssSelector",
      value: endContainerHTMLElementCssSelector,
      refinedBy: {
        type: "TextPositionSelector",
        start: rangeNormalize.endOffset,
        end: rangeNormalize.endContainer.data.length,
      },
    },
    // refinedBy: {
    //   type: "TextPositionSelector",
    //   start: rangeNormalize.startOffset,
    //   end: rangeNormalize.endOffset,
    // },
  };
};

const describeRangeCssSelector = async (range: Range): Promise<CssSelector> => {
  const rangeNormalize = normalizeRange(range);

  const commonAncestorHTMLElement =
    rangeNormalize.commonAncestorContainer instanceof HTMLElement
      ? rangeNormalize.commonAncestorContainer
      : range.startContainer.parentNode instanceof HTMLElement
        ? range.startContainer.parentNode
        : undefined;
  if (!commonAncestorHTMLElement) {
    return undefined;
  }

  return {
    type: "CssSelector",
    value: finder(commonAncestorHTMLElement),
    refinedBy: await describeTextPosition(
      rangeNormalize,
      commonAncestorHTMLElement,
    ),
  };
};

async function onSelectionChange() {
  const selection = document.getSelection();
  if (!selection) return;
  const source = document.getElementById("source");
  if (!source) return;
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    let selector: Selector;
    let elem: HTMLElement | null;
    let selectorToHighlight: Selector;
    const ranges = [];

    selector = await describeTextPosition(range, source);
    let matchAll = createMatcher(selector);
    for await (const range of matchAll(source)) {
      ranges.push(range);
    }
    elem = document.getElementById("selector-out-textposition");
    if (elem) elem.innerText = JSON.stringify(selector, null, 4);

    selector = await describeTextQuote(range, source, {
      minimumQuoteLength: 10,
    });
    matchAll = createMatcher(selector);
    for await (const range of matchAll(source)) {
      ranges.push(range);
    }
    elem = document.getElementById("selector-out-textquote");
    if (elem) elem.innerText = JSON.stringify(selector, null, 4);

    selector = await describeRange(range);
    matchAll = createMatcher(selector);
    for await (const range of matchAll(source)) {
      ranges.push(range);
    }
    elem = document.getElementById("selector-out-range");
    if (elem) elem.innerText = JSON.stringify(selector, null, 4);

    selector = await describeRangeCssSelector(range);
    matchAll = createMatcher(selector);
    for await (const range of matchAll(source)) {
      ranges.push(range);
    }
    elem = document.getElementById("selector-out-rangecss");
    if (elem) elem.innerText = JSON.stringify(selector, null, 4);

    if (!ranges.length) anchor(undefined);

    console.log(`There are ${ranges.length} ranges found on 4 selectors`);
    for (const range of ranges) {
      anchor(range);
    }
  }
}
document.addEventListener("selectionchange", onSelectionChange);
