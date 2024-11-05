import {
  makeCreateRangeSelectorMatcher,
  createTextQuoteSelectorMatcher,
  describeTextQuote,
  createTextPositionSelectorMatcher,
  createCssSelectorMatcher,
  describeTextPosition,
  describeCss,
  normalizeRange,
  toRange,
  ownerDocument,
} from "@apache-annotator/dom";

import * as aa from "@apache-annotator/dom";

import { finder } from "@medv/finder";

import {
  makeRefinable,
  // type Selector,
  type TextQuoteSelector,
  type RangeSelector,
  type CssSelector,
  Matcher,
} from "@apache-annotator/selector";




import { anchor, cleanup } from "./highlight.mjs";

import { TextQuoteAnchor, TextPositionAnchor } from "../vendor/anchoring/types.js";

import { xpathFromNode, nodeFromXPath } from "../vendor/anchoring/xpath.js";


interface Selector {
  /**
   * A Selector can be refined by another Selector.
   *
   * See {@link https://www.w3.org/TR/2017/REC-annotation-model-20170223/#refinement-of-selection
   * | §4.2.9 Refinement of Selection} in the Web Annotation Data Model.
   *
   * Corresponds to RDF property {@link http://www.w3.org/ns/oa#refinedBy}
   */
  refinedBy?: Selector;
}

interface XPathSelector extends Selector {
  type: "XPathSelector";
  value: string;
}


/*
function areRangesEqual(ranges: Range[]) {
  if (ranges.length < 2) return false;
  const rangeA = ranges[0];

  for (const rangeB of  ranges.slice(1)) {
    if (
      rangeA.startContainer === rangeB.startContainer &&
      rangeA.startOffset === rangeB.startOffset &&
      rangeA.endContainer === rangeB.endContainer &&
      rangeA.endOffset === rangeB.endOffset &&
      rangeA.commonAncestorContainer === rangeB.commonAncestorContainer
    ) continue;
    else return false;
  }
  return true;
}
*/

function debounce(func: any, timeout: any) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // @ts-expect-error
      func.apply(this, args);
    }, timeout);
  };
}

function createXPathSelectorMatcher(
  selector: XPathSelector,
): Matcher<Node | Range, Element> {
  return async function* matchAll(scope: Node | Range) {
    scope = toRange(scope);
    const document = ownerDocument(scope);
		const source = document.getElementById("source") as HTMLElement;
    const element = nodeFromXPath(selector.value, source);
		console.log("XPath node found :", element);
    if (!element) return ;
    const range = document.createRange();
    range.selectNode(element);

    if (
      scope.isPointInRange(range.startContainer, range.startOffset) &&
      scope.isPointInRange(range.endContainer, range.endOffset)
    ) {
      yield element;
    }
  };
}

const createMatcher = makeRefinable((selector: any) => {
  // @ts-expect-error
  const innerCreateMatcher: any = {
    TextQuoteSelector: createTextQuoteSelectorMatcher,
    TextPositionSelector: createTextPositionSelectorMatcher,
    CssSelector: createCssSelectorMatcher,
    XPathSelector: createXPathSelectorMatcher,
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

const describeRangeXPathSelector = async (range: Range): Promise<XPathSelector | undefined> => {
  const rangeNormalize = normalizeRange(range);

  const commonAncestorHTMLElement =
    rangeNormalize.commonAncestorContainer;
  if (!commonAncestorHTMLElement) {
    return undefined;
  }

  const source = document.getElementById("source") as HTMLElement;
  return {
    type: "XPathSelector",
    value: xpathFromNode(commonAncestorHTMLElement, source),
    refinedBy: await describeTextPosition(
      rangeNormalize,
      commonAncestorHTMLElement,
    ),
  };
}

const debounceOnSelectionChange = debounce(async function onSelectionChange() {
  const selection = document.getSelection();
  if (!selection) return;
  if (
    selection?.isCollapsed ||
    !selection?.anchorNode ||
    !selection?.focusNode
  ) {
    return;
  }
  console.log(selection.toString());

  const source = document.getElementById("source") as HTMLElement;
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    let selector: any;
    let elem: HTMLElement | null;
    let selectorToHighlight: Selector;
    let matchAll: any;
    const ranges = [];

    elem = document.getElementById("selector-out-textposition");
    try {
      selector = await describeTextPosition(range, source);
      matchAll = createMatcher(selector);
      for await (const range of matchAll(source)) {
        ranges.push([range, "pos"]);
      }
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("TextPositionSelector error: ", e);
      if (elem) elem.innerText = "TextPositionSelector error: " +  e;
    }

    elem = document.getElementById("selector-out-textposition-hypo");
    try {

      selector = TextQuoteAnchor.fromRange(source, range).toPositionAnchor().toSelector();
      const rangeFound = TextPositionAnchor.fromSelector(source, selector).toRange();
      if (rangeFound) ranges.push([rangeFound, "poshypo"]);
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("TextPositionSelectorHypothesis error: ", e);
      if (elem) elem.innerText = "TextPositionSelectorHypothesis error: " +  e;
    }

    elem = document.getElementById("selector-out-textquote-hypo");
    try {

      selector = TextQuoteAnchor.fromRange(source, range).toSelector();
      const rangeFound = TextQuoteAnchor.fromSelector(source, selector).toRange();
      if (rangeFound) ranges.push([rangeFound, "quotehypo"]);
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("TextQuoteSelectorHypothesis error: ", e);
      if (elem) elem.innerText = "TextQuoteSelectorHypothesis error: " +  e;
    }

    elem = document.getElementById("selector-out-textquote");
    try {
      selector = await describeTextQuote(range, source, {
        minimumQuoteLength: 10,
      });
      matchAll = createMatcher(selector);
      for await (const range of matchAll(source)) {
        ranges.push([range, "quote"]);
      }
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("TextQuoteSelector error: ", e);
      if (elem) elem.innerText = "TextQuoteSelector error: " +  e;
    }



    elem = document.getElementById("selector-out-range");
    try {
      selector = await describeRange(range);
      matchAll = createMatcher(selector);
      for await (const range of matchAll(source)) {
        ranges.push([range, "range"]);
      }
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("RangeSelector error: ", e);
      if (elem) elem.innerText = "RangeSelector error: " +  e;
    }

    elem = document.getElementById("selector-out-rangecss");
    try {
      selector = await describeRangeCssSelector(range);
      matchAll = createMatcher(selector);
      for await (const range of matchAll(source)) {
        ranges.push([range, "rangecss"]);
      }
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("RangeCss error: ", e);
      if (elem) elem.innerText = "RangeCss error: " +  e;
    }

    elem = document.getElementById("selector-out-rangexpath");
    try {
      selector = await describeRangeXPathSelector(range);
      matchAll = createMatcher(selector);
      for await (const range of matchAll(source)) {
        ranges.push([range, "rangexpath"]);
      }
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("RangeXpath error: ", e);
      if (elem) elem.innerText = "RangeXpath error: " +  e;
    }

    cleanup();
    // if (!ranges.length) anchor(undefined);

    console.log(`There are ${ranges.length} ranges found on 7 selectors`);
    elem = document.getElementById("results") as HTMLElement;
    elem.innerText = `There are ${ranges.length} ranges found on 6 selectors. `;
    //    elem.innerText += areRangesEqual(ranges) ? "All Ranges are equal" : "Not all Ranges are equal !!";

		for (const [range, id] of ranges) {
			console.log("highlight this Range: ", range);
			anchor(range, id);
		}
	}
}, 500);
document.addEventListener("selectionchange", debounceOnSelectionChange);

const inputTextArea = document.getElementById("input") as HTMLElement;

const debounceInputChange = debounce(async (e: any) => {

	const inputTextArea = document.getElementById("input") as HTMLTextAreaElement;
	const selector = inputTextArea.value;
	if (!selector) return ;

	let selectorParsed: any;
	try {
		selectorParsed = JSON.parse(selector);
	} catch {
		return ;
	}

	console.log(selectorParsed);

	const source = document.getElementById("source") as HTMLElement;
	cleanup();
	let elem: HTMLElement;

	elem = document.getElementById("selector-out-rangecss") as HTMLElement;
	elem.innerText = "";

	elem = document.getElementById("selector-out-range") as HTMLElement;
	elem.innerText = "";

	elem = document.getElementById("selector-out-textquote")as HTMLElement;

	elem.innerText = "";

	elem = document.getElementById("selector-out-textquote-hypo")as HTMLElement;
	elem.innerText = "";

	elem = document.getElementById("selector-out-textposition-hypo") as HTMLElement;
	elem.innerText = "";

	elem = document.getElementById("selector-out-textposition") as HTMLElement;
	elem.innerText = "";
	const matchAll = createMatcher(selectorParsed);
	for await (const range of matchAll(source)) {
		anchor(range, "custom");
	}


}, 500);
inputTextArea.addEventListener("change", debounceInputChange);

const inputButton  = document.getElementById("inputButton") as HTMLElement;


inputButton.onclick = () => debounceInputChange();;

