const scriptInput = document.getElementById("scriptInput");
const teleprompter = document.getElementById("teleprompter");
const teleprompterContent = document.getElementById("teleprompterContent");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const fontSizeInput = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const alternateLinesInput = document.getElementById("alternateLines");
const flipHorizontalInput = document.getElementById("flipHorizontal");
const flipVerticalInput = document.getElementById("flipVertical");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");

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
  });

  teleprompterContent.classList.toggle(
    "alternate",
    alternateLinesInput.checked
  );
};

const updateSpeed = () => {
  speedValue.textContent = `${speedInput.value} px/s`;
};

const updateFontSize = () => {
  fontSizeValue.textContent = `${fontSizeInput.value} px`;
  document.documentElement.style.setProperty(
    "--font-size",
    `${fontSizeInput.value}px`
  );
};

const updateMirroring = () => {
  teleprompter.classList.toggle("flip-horizontal", flipHorizontalInput.checked);
  teleprompter.classList.toggle("flip-vertical", flipVerticalInput.checked);
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
  teleprompterContent.style.setProperty("--scroll-offset", `${offset}px`);

  requestAnimationFrame(updateScroll);
};

const play = () => {
  if (isPlaying) return;
  isPlaying = true;
  playButton.disabled = true;
  pauseButton.disabled = false;
  requestAnimationFrame(updateScroll);
};

const pause = () => {
  isPlaying = false;
  playButton.disabled = false;
  pauseButton.disabled = true;
};

const reset = () => {
  offset = 0;
  teleprompterContent.style.setProperty("--scroll-offset", "0px");
};

scriptInput.addEventListener("input", renderTeleprompter);
scriptInput.addEventListener("blur", renderTeleprompter);

speedInput.addEventListener("input", updateSpeed);
fontSizeInput.addEventListener("input", updateFontSize);
alternateLinesInput.addEventListener("change", renderTeleprompter);
flipHorizontalInput.addEventListener("change", updateMirroring);
flipVerticalInput.addEventListener("change", updateMirroring);
playButton.addEventListener("click", play);
pauseButton.addEventListener("click", pause);
resetButton.addEventListener("click", reset);

updateSpeed();
updateFontSize();
updateMirroring();
renderTeleprompter();
