
import { makeCreateRangeSelectorMatcher } from "../vendor/apache-annotator/dom/range/match.js";
import { createTextQuoteSelectorMatcher } from "../vendor/apache-annotator/dom/text-quote/match.js";
import { createTextPositionSelectorMatcher } from "../vendor/apache-annotator/dom/text-position/match.js";
import { describeTextQuote } from "../vendor/apache-annotator/dom/text-quote/describe.js";
import { describeTextPosition } from "../vendor/apache-annotator/dom/text-position/describe.js";
import { createCssSelectorMatcher, describeCss } from "../vendor/apache-annotator/dom/css.js";
import { normalizeRange } from "../vendor/apache-annotator/dom/normalize-range.js";
import { toRange } from "../vendor/apache-annotator/dom/to-range.js";
import { ownerDocument } from "../vendor/apache-annotator/dom/owner-document.js";

import { finder } from "@medv/finder";

import { makeRefinable } from "../vendor/apache-annotator/selector/refinable.js";
import { type Matcher, type TextQuoteSelector, type RangeSelector, type CssSelector, type Selector, TextPositionSelector } from "../vendor/apache-annotator/selector/types.js";

import { anchor, cleanup } from "./highlight.mjs";

import { TextQuoteAnchor, TextPositionAnchor } from "../vendor/anchoring/types.js";

import { xpathFromNode, nodeFromXPath } from "../vendor/anchoring/xpath.js";

interface XPathSelector<T = undefined> extends Selector<T> {
  type: "XPathSelector";
  value: string;
}

function copyPreContent(event: any) {
  // Get the pre element containing the text to be copied
  var preElement = event.target.nextSibling;
  while (preElement && preElement.nodeName !== 'PRE') {
    preElement = preElement.nextSibling;
  }
  if (!preElement) return;

  // Get the text to be copied
  var text = JSON.stringify(JSON.parse(preElement.textContent), null, 4);

  // Copy the text to the clipboard using the Clipboard API
  navigator.clipboard.writeText(text).then(function() {
    // Display a message indicating that the text was copied successfully
    alert('Text copied to clipboard');
  }, function(err) {
    // Display an error message if there was a problem copying the text
    console.error('There was an error copying the text: ', err);
  });
}

// Get all pre elements in the body
var preElements = document.body.querySelectorAll('pre');

// Add a copy button to just before each pre element
preElements.forEach(function(preElement) {
  // Create a button element
  var button = document.createElement('button');
  button.innerHTML = '<i class="fa fa-clipboard" aria-hidden="true"></i> Copy';
  button.onclick = copyPreContent;
  // Add the button just before the pre element
  preElement.parentNode!.insertBefore(button, preElement);
});

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
): Matcher<Node | Range, Node> {
  return async function* matchAll(scope) {
    const scopeRange = toRange(scope);
    const document = ownerDocument(scopeRange);
    const scopeRangeElement = scopeRange.commonAncestorContainer as HTMLElement;
    const element = nodeFromXPath(selector.value, scopeRangeElement);
		console.log("XPath node found :", element);
    if (!element) throw new Error("XPath node not found !:") ;
    const range = document.createRange();
    range.selectNode(element);

    if (
      scopeRange.isPointInRange(range.startContainer, range.startOffset) &&
      scopeRange.isPointInRange(range.endContainer, range.endOffset)
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
    RangeSelector: makeCreateRangeSelectorMatcher(createMatcher as any),
  }[selector.type];

  if (!innerCreateMatcher) {
    throw new Error(`Unsupported selector type: ${selector.type}`);
  }

  return innerCreateMatcher(selector);
});

const describeRange = async (range: Range): Promise<RangeSelector<any> | undefined> => {
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

  const startContainerChildTextNodeIndex =
    Array.from(startContainerHTMLElement.childNodes).indexOf(rangeNormalize.startContainer as ChildNode);
  if (startContainerChildTextNodeIndex < -1) {
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

  const endContainerChildTextNodeIndex =
    Array.from(endContainerHTMLElement.childNodes).indexOf(rangeNormalize.startContainer as ChildNode);
  if (endContainerChildTextNodeIndex < -1) {
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

  const startTextPositionSelector = {
    type: "TextPositionSelector",
    start: rangeNormalize.startOffset,
    end: startAndEndEqual
    ? rangeNormalize.endOffset
    : rangeNormalize.startContainer.data.length,
  };

  const endTextPositionSelector = {
    type: "TextPositionSelector",
    start: rangeNormalize.endOffset,
    end: rangeNormalize.endContainer.data.length,
  };

  return {
    type: "RangeSelector",
    startSelector: {
      type: "CssSelector",
      value: startContainerHTMLElementCssSelector,
      refinedBy: startContainerChildTextNodeIndex > 0 ? {
        type: "XPathSelector",
        value: "/text()[" + startContainerChildTextNodeIndex + "]",
        refinedBy: startTextPositionSelector,
      } : startTextPositionSelector,
    },
    endSelector: {
      type: "CssSelector",
      value: endContainerHTMLElementCssSelector,
      refinedBy: endContainerChildTextNodeIndex > 0 ? {
        type: "XPathSelector",
        value: "/text()[" + endContainerChildTextNodeIndex + "]",
        refinedBy: endTextPositionSelector,
      } : endTextPositionSelector,
    },
  };
};

const describeRangeCssSelector = async (range: Range): Promise<CssSelector | undefined> => {
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
    // let selectorToHighlight: Selector;
    let matchAll: any;
    const ranges = [];

    elem = document.getElementById("selector-out-textposition");
    try {
      selector = await describeTextPosition(range, source);
      matchAll = createMatcher(selector);
      for await (const range of matchAll(source)) {
        ranges.push([range, "textposition"]);
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
      if (rangeFound) ranges.push([rangeFound, "textposition-hypothesis"]);
      if (elem) elem.innerText = JSON.stringify(selector, null, 4);
    } catch (e) {
      console.error("TextPositionSelectorHypothesis error: ", e);
      if (elem) elem.innerText = "TextPositionSelectorHypothesis error: " +  e;
    }

    elem = document.getElementById("selector-out-textquote-hypo");
    try {

      selector = TextQuoteAnchor.fromRange(source, range).toSelector();
      const rangeFound = TextQuoteAnchor.fromSelector(source, selector).toRange();
      if (rangeFound) ranges.push([rangeFound, "quoteposition-hypothesis"]);
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
        ranges.push([range, "textquote"]);
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

    const txt = `There are ${ranges.length} ranges found [ ${ranges.map(([, v]) => v).join(", ")} ] on 7 selectors`;
    console.log(txt);
    elem = document.getElementById("results") as HTMLElement;
    elem.innerText = txt;
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

  elem = document.getElementById("selector-out-rangexpath") as HTMLElement;
  elem.innerText = "";

	const matchAll = createMatcher(selectorParsed);
	for await (const range of matchAll(source)) {
		anchor(range as Range, "custom");
	}


}, 500);
inputTextArea.addEventListener("change", debounceInputChange);

const inputButton  = document.getElementById("inputButton") as HTMLElement;


inputButton.onclick = () => debounceInputChange();;

