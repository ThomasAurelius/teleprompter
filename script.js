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

const renderTeleprompter = () => {
  teleprompterContent.innerHTML = "";
  outputTeleprompterContent.innerHTML = "";
  const lines = ensureLineNodes();

  lines.forEach((line) => {
    const lineElement = document.createElement("div");
    lineElement.classList.add("line");
    if (line.node) {
      lineElement.appendChild(line.node);
    } else {
      lineElement.textContent = line.text;
    }
    teleprompterContent.appendChild(lineElement);
    outputTeleprompterContent.appendChild(lineElement.cloneNode(true));
  });

  [teleprompterContent, outputTeleprompterContent].forEach((content) => {
    content.classList.toggle("alternate", alternateLinesInput.checked);
  });
};

const hexToRgba = (hex, alpha) => {
  const cleanHex = hex.replace("#", "");
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((char) => char + char)
          .join("")
      : cleanHex;
  const int = Number.parseInt(fullHex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const rgba = hexToRgba(alternateColorInput.value, 0.35);
  document.documentElement.style.setProperty("--line-alt", rgba);
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

scriptInput.addEventListener("input", renderTeleprompter);
scriptInput.addEventListener("blur", renderTeleprompter);

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
