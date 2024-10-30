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
const debouncedSelectionChangeHandler = debounce(() => {
  const selection = document.getSelection();
  if (
    selection?.isCollapsed ||
    !selection?.anchorNode ||
    !selection?.focusNode
  ) {
    return;
  }
  console.log(selection.toString());

  let r = selection.rangeCount === 1 ? selection.getRangeAt(0) : undefined;
  console.log(r);
  if (!r) {
    const range = new Range();
    range.setStart(selection.anchorNode, selection.anchorOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    if (!range.collapsed) {
      console.log("range not collapsed");
      r = range;
    } else {
      const rangeReverse = new Range();
      rangeReverse.setStart(selection.focusNode, selection.focusOffset);
      rangeReverse.setEnd(selection.anchorNode, selection.anchorOffset);
      if (!rangeReverse.collapsed) {
        console.log("range not collapsed");
        r = range;
      }
    }
  }
  if (!r || r.collapsed) {
    console.log("return");
    return;
  }
  // r = normalizeRange(r);

  // const rect = r.getBoundingClientRect();
  for (const rect of r.getClientRects()) {
    const div = document.createElement("div");
    div.setAttribute("class", "highlight");
    div.setAttribute(
      "style",
      `backgroundColor: red; opacity: 0.7; position: absolute; width: ${rect.width}px; height: ${rect.height}px; left: ${rect.left + window.scrollX}px; right: ${rect.right}px; top: ${rect.top + window.scrollY}px; bottom: ${rect.bottom}px;`,
    );
    div.style.backgroundColor = "red";
    div.style.opacity = "0.7";
    div.style.position = "absolute";
    // creates inset!
    // div.style.left = rect.left + "px";
    // div.style.top = rect.top + "px";
    // div.style.right = rect.right + "px";
    // div.style.bottom = rect.bottom + "px";
    document.body.appendChild(div);
  }
  // selection.removeAllRanges();
}, 500);
export const cleanup = () => {
  const divs = document.querySelectorAll(".highlight");
  if (divs) {
    for (const div of divs) {
      if (div) {
        div.parentElement?.removeChild(div);
      }
    }
  }
};

console.log("loaded");
const createHighlightFromSelection = () => {
  // console.log("selection from highlight");
  // const selection = document.getSelection();
  // if (selection.isCollapsed) {
  //     return;
  // }
  // cleanup();
  // debouncedSelectionChangeHandler();
};
document.addEventListener("selectionchange", createHighlightFromSelection);
window.addEventListener("resize", createHighlightFromSelection);
window.addEventListener("scroll", createHighlightFromSelection);

export const anchor = debounce((r: Range) => {
  cleanup();

  if (!r || r.collapsed) {
    console.log("return");
    return;
  }

  // const rect = r.getBoundingClientRect();
  for (const rect of r.getClientRects()) {
    const div = document.createElement("div");
    div.setAttribute("class", "highlight");
    div.setAttribute(
      "style",
      `backgroundColor: red; opacity: 0.7; position: absolute; width: ${rect.width}px; height: ${rect.height}px; left: ${rect.left + window.scrollX}px; right: ${rect.right}px; top: ${rect.top + window.scrollY}px; bottom: ${rect.bottom}px;`,
    );
    div.style.backgroundColor = "red";
    div.style.opacity = "0.7";
    div.style.position = "absolute";
    // creates inset!
    // div.style.left = rect.left + "px";
    // div.style.top = rect.top + "px";
    // div.style.right = rect.right + "px";
    // div.style.bottom = rect.bottom + "px";
    document.body.appendChild(div);
  }
}, 500);
