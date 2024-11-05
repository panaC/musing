console.log("loaded");

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

// const createHighlightFromSelection = () => {
//   // console.log("selection from highlight");
//   // const selection = document.getSelection();
//   // if (selection.isCollapsed) {
//   //     return;
//   // }
//   // cleanup();
//   // debouncedSelectionChangeHandler();
// };
// document.addEventListener("selectionchange", createHighlightFromSelection);
// window.addEventListener("resize", createHighlightFromSelection);
// window.addEventListener("scroll", createHighlightFromSelection);

export const anchor = (r: Range | undefined, id: string) => {

  if (!r || r.collapsed) {
    console.log("range collapsed, exit, ", r);
    return;
  }

  console.log("Draws : ", r.getClientRects());

  // const rect = r.getBoundingClientRect();
  for (const rect of r.getClientRects()) {
    const div = document.createElement("div");
    div.setAttribute("id", id);
    div.setAttribute("class", "highlight");
    div.setAttribute(
      "style",
      `backgroundColor: red; opacity: 0.7; position: absolute; width: ${rect.width}px; height: ${rect.height}px; left: ${rect.left + window.scrollX}px; right: ${rect.right}px; top: ${rect.top + window.scrollY}px; bottom: ${rect.bottom}px;`,
    );
    div.style.backgroundColor = "red";
    div.style.opacity = "0.1";
    div.style.position = "absolute";
    // creates inset!
    // div.style.left = rect.left + "px";
    // div.style.top = rect.top + "px";
    // div.style.right = rect.right + "px";
    // div.style.bottom = rect.bottom + "px";
    document.body.appendChild(div);
  }
};
