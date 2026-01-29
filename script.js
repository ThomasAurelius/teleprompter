const scriptInput = document.getElementById("scriptInput");
const teleprompter = document.getElementById("teleprompter");
const teleprompterContent = document.getElementById("teleprompterContent");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const fontSizeInput = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const alternateColorInput = document.getElementById("alternateColor");
const alternateColorValue = document.getElementById("alternateColorValue");
const alternateLinesInput = document.getElementById("alternateLines");
const flipHorizontalInput = document.getElementById("flipHorizontal");
const flipVerticalInput = document.getElementById("flipVertical");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const openOutputButton = document.getElementById("openOutputButton");
const outputOverlay = document.getElementById("outputOverlay");
const outputTeleprompter = document.getElementById("outputTeleprompter");
const outputTeleprompterContent = document.getElementById(
  "outputTeleprompterContent"
);
const outputSpeedInput = document.getElementById("outputSpeed");
const outputSpeedValue = document.getElementById("outputSpeedValue");
const outputFontSizeInput = document.getElementById("outputFontSize");
const outputFontSizeValue = document.getElementById("outputFontSizeValue");
const outputPlayButton = document.getElementById("outputPlayButton");
const outputPauseButton = document.getElementById("outputPauseButton");
const outputResetButton = document.getElementById("outputResetButton");
const closeOutputButton = document.getElementById("closeOutputButton");

let offset = 0;
let lastFrameTime = null;
let isPlaying = false;

// Drag state
let isDragging = false;
let dragStartY = 0;
let dragStartOffset = 0;

const ensureLineNodes = () => {
  const lines = [];
  const childNodes = Array.from(scriptInput.childNodes).filter(
    (node) => node.nodeType !== Node.COMMENT_NODE
  );

  if (childNodes.length === 0) {
    return [""].map((text) => ({ text }));
  }

  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      // Skip text nodes that are only whitespace
      if (text.trim() === "") {
        return;
      }
      text.split(/\n/).forEach((line) => lines.push({ text: line }));
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === "BR") {
        lines.push({ text: "" });
        return;
      }

      lines.push({ node: node.cloneNode(true) });
    }
  });

  return lines.length ? lines : [{ text: "" }];
};

const stripInlineFormatting = (node, isRoot = true) => {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  // Remove inline styles and formatting attributes
  node.removeAttribute("style");
  node.removeAttribute("color");
  node.removeAttribute("size");
  node.removeAttribute("face");
  // Only remove class attribute from children, not from the root node (which has the "line" class)
  if (!isRoot) {
    node.removeAttribute("class");
  }
  Array.from(node.children).forEach((child) => stripInlineFormatting(child, false));
};

const createTextFragment = (text) => {
  const fragment = document.createDocumentFragment();
  const lines = text.split(/\r?\n/);
  
  // Filter out trailing empty line from text ending with newline
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  
  // Wrap each line in a div element for consistency with contenteditable behavior
  lines.forEach((line) => {
    const div = document.createElement('div');
    if (line === '') {
      // Empty lines need a br element to maintain proper height and cursor positioning
      div.appendChild(document.createElement('br'));
    } else {
      div.textContent = line;
    }
    fragment.appendChild(div);
  });
  
  return fragment;
};

const sanitizeNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tagName = node.tagName.toUpperCase();
  const allowedInlineTags = new Set(["B", "STRONG", "I", "EM", "U", "SPAN"]);
  const allowedBlockTags = new Set(["DIV", "P"]);

  if (tagName === "BR") {
    return document.createElement("br");
  }

  if (!allowedInlineTags.has(tagName) && !allowedBlockTags.has(tagName)) {
    const fragment = document.createDocumentFragment();
    Array.from(node.childNodes).forEach((child) => {
      const sanitizedChild = sanitizeNode(child);
      if (sanitizedChild) {
        fragment.appendChild(sanitizedChild);
      }
    });
    return fragment;
  }

  const elementTag = tagName === "P" ? "div" : tagName.toLowerCase();
  const sanitizedElement = document.createElement(elementTag);
  Array.from(node.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeNode(child);
    if (sanitizedChild) {
      sanitizedElement.appendChild(sanitizedChild);
    }
  });

  stripInlineFormatting(sanitizedElement);
  return sanitizedElement;
};

const sanitizePaste = (text) => {
  // Always use plain text to ensure alternate coloring works correctly
  return createTextFragment(text);
};

const insertFragmentAtSelection = (fragment) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(fragment);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

const renderTeleprompter = () => {
  teleprompterContent.innerHTML = "";
  outputTeleprompterContent.innerHTML = "";
  const lines = ensureLineNodes();

  lines.forEach((line) => {
    let lineElement;
    if (line.node) {
      // Use the cloned node itself as the line element
      lineElement = line.node;
      lineElement.classList.add("line");
    } else {
      // Create a new div for plain text
      lineElement = document.createElement("div");
      lineElement.classList.add("line");
      lineElement.textContent = line.text;
    }
    stripInlineFormatting(lineElement);
    teleprompterContent.appendChild(lineElement);
    const outputLine = lineElement.cloneNode(true);
    stripInlineFormatting(outputLine);
    outputTeleprompterContent.appendChild(outputLine);
  });

  teleprompterContent.classList.toggle(
    "alternate",
    alternateLinesInput.checked
  );
  outputTeleprompterContent.classList.toggle(
    "alternate",
    alternateLinesInput.checked
  );
};

const updateSpeed = () => {
  speedValue.textContent = `${speedInput.value} px/s`;
  outputSpeedValue.textContent = `${outputSpeedInput.value} px/s`;
};

const updateFontSize = () => {
  fontSizeValue.textContent = `${fontSizeInput.value} px`;
  outputFontSizeValue.textContent = `${outputFontSizeInput.value} px`;
  document.documentElement.style.setProperty(
    "--font-size",
    `${fontSizeInput.value}px`
  );
};

const updateAlternateColor = () => {
  alternateColorValue.textContent = alternateColorInput.value.toUpperCase();
  document.documentElement.style.setProperty(
    "--line-alt",
    alternateColorInput.value
  );
};

const updateMirroring = () => {
  teleprompter.classList.toggle("flip-horizontal", flipHorizontalInput.checked);
  teleprompter.classList.toggle("flip-vertical", flipVerticalInput.checked);
  outputTeleprompter.classList.toggle(
    "flip-horizontal",
    flipHorizontalInput.checked
  );
  outputTeleprompter.classList.toggle(
    "flip-vertical",
    flipVerticalInput.checked
  );
};

const setScrollOffset = () => {
  teleprompterContent.style.setProperty("--scroll-offset", `${offset}px`);
  outputTeleprompterContent.style.setProperty("--scroll-offset", `${offset}px`);
};

const updateScroll = (timestamp) => {
  if (!isPlaying) {
    lastFrameTime = null;
    return;
  }

  if (lastFrameTime === null) {
    lastFrameTime = timestamp;
  }

  const deltaSeconds = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;
  offset -= Number(speedInput.value) * deltaSeconds;
  setScrollOffset();

  requestAnimationFrame(updateScroll);
};

const play = () => {
  if (isPlaying) return;
  isPlaying = true;
  playButton.disabled = true;
  pauseButton.disabled = false;
  outputPlayButton.disabled = true;
  outputPauseButton.disabled = false;
  requestAnimationFrame(updateScroll);
};

const pause = () => {
  isPlaying = false;
  playButton.disabled = false;
  pauseButton.disabled = true;
  outputPlayButton.disabled = false;
  outputPauseButton.disabled = true;
};

const reset = () => {
  offset = 0;
  lastFrameTime = null;
  setScrollOffset();
};

const syncSpeed = (value) => {
  speedInput.value = value;
  outputSpeedInput.value = value;
  updateSpeed();
};

const syncFontSize = (value) => {
  fontSizeInput.value = value;
  outputFontSizeInput.value = value;
  updateFontSize();
};

const setOutputOpen = (shouldOpen) => {
  outputOverlay.hidden = !shouldOpen;
  document.body.classList.toggle("output-open", shouldOpen);
  openOutputButton.setAttribute("aria-expanded", String(shouldOpen));
};

const openOutput = () => setOutputOpen(true);
const closeOutput = () => setOutputOpen(false);

// Drag functionality for output teleprompter
const startDrag = (clientY) => {
  isDragging = true;
  dragStartY = clientY;
  dragStartOffset = offset;
  if (isPlaying) {
    pause();
  }
  outputTeleprompter.classList.add('dragging');
};

const onDrag = (clientY) => {
  if (!isDragging) return;
  const deltaY = clientY - dragStartY;
  offset = dragStartOffset + deltaY;
  setScrollOffset();
};

const endDrag = () => {
  if (!isDragging) return;
  isDragging = false;
  outputTeleprompter.classList.remove('dragging');
};

// Mouse event handlers
outputTeleprompter.addEventListener('mousedown', (event) => {
  event.preventDefault();
  startDrag(event.clientY);
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    event.preventDefault();
    onDrag(event.clientY);
  }
});

document.addEventListener('mouseup', () => {
  endDrag();
});

// Touch event handlers
outputTeleprompter.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) {
    event.preventDefault();
    startDrag(event.touches[0].clientY);
  }
});

outputTeleprompter.addEventListener('touchmove', (event) => {
  if (isDragging && event.touches.length === 1) {
    event.preventDefault();
    onDrag(event.touches[0].clientY);
  }
});

outputTeleprompter.addEventListener('touchend', (event) => {
  if (event.touches.length === 0) {
    endDrag();
  }
});

outputTeleprompter.addEventListener('touchcancel', (event) => {
  if (event.touches.length === 0) {
    endDrag();
  }
});

scriptInput.addEventListener("input", renderTeleprompter);
scriptInput.addEventListener("blur", renderTeleprompter);
scriptInput.addEventListener("paste", (event) => {
  event.preventDefault();
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return;
  }
  const text = clipboardData.getData("text/plain");
  const fragment = sanitizePaste(text);
  insertFragmentAtSelection(fragment);
  renderTeleprompter();
});

speedInput.addEventListener("input", (event) => syncSpeed(event.target.value));
fontSizeInput.addEventListener("input", (event) =>
  syncFontSize(event.target.value)
);
alternateColorInput.addEventListener("input", updateAlternateColor);
alternateLinesInput.addEventListener("change", renderTeleprompter);
flipHorizontalInput.addEventListener("change", updateMirroring);
flipVerticalInput.addEventListener("change", updateMirroring);
playButton.addEventListener("click", play);
pauseButton.addEventListener("click", pause);
resetButton.addEventListener("click", reset);
openOutputButton.addEventListener("click", openOutput);
closeOutputButton.addEventListener("click", closeOutput);
outputSpeedInput.addEventListener("input", (event) =>
  syncSpeed(event.target.value)
);
outputFontSizeInput.addEventListener("input", (event) =>
  syncFontSize(event.target.value)
);
outputPlayButton.addEventListener("click", play);
outputPauseButton.addEventListener("click", pause);
outputResetButton.addEventListener("click", reset);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !outputOverlay.hidden) {
    closeOutput();
  }
});

syncSpeed(speedInput.value);
syncFontSize(fontSizeInput.value);
updateAlternateColor();
updateMirroring();
renderTeleprompter();
setOutputOpen(!outputOverlay.hidden);
