# AltTeleprompter Studio

A lightweight, browser-based teleprompter that runs entirely in the browser — no server, no installation, no dependencies.

## Features

- **Script editor** — Rich-text editing with support for bold, italic, and underline formatting (Ctrl/Cmd + B / I / U).
- **Live preview** — A teleprompter preview pane updates in real time as you type.
- **Smooth scrolling** — Frame-accurate animation loop driven by `requestAnimationFrame`.
- **Scroll speed control** — Adjustable from 10 to 200 px/s via a slider.
- **Text size control** — Font size adjustable from 18 to 80 px.
- **Alternate line colors** — Improve readability by highlighting every other line in a customisable accent colour.
- **Mirror modes** — Flip the display horizontally and/or vertically for use with teleprompter glass or beam-splitter setups.
- **Full-screen output** — Dedicated full-screen presentation view with its own Play / Pause / Reset and speed controls.
- **Drag-to-scroll** — Click-and-drag (or touch-and-drag) in the full-screen view to manually reposition the script.
- **Mouse-wheel scrolling** — Scroll through the script in both preview and full-screen views using the mouse wheel.
- **Voice pace control** — Uses the browser's on-device Web Speech API to detect your speaking tempo and automatically adjust the scroll speed to match.
- **Keyboard shortcut** — Press **Escape** to exit the full-screen output view.
- **Responsive layout** — Works on desktop and mobile screens.

## Getting Started

Because AltTeleprompter is a pure HTML/CSS/JavaScript project with no build step, you can open it directly in a browser.

### Option 1 — Open locally

1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, or Safari).

```bash
git clone https://github.com/ThomasAurelius/teleprompter.git
cd teleprompter
open index.html   # macOS
# or: xdg-open index.html  (Linux)
# or double-click index.html in your file explorer
```

### Option 2 — Serve with a local web server

Serving over HTTP is required if you want the **Voice pace control** feature, because the Web Speech API is restricted to secure contexts (`https://` or `localhost`).

```bash
# Using Python 3
python -m http.server 8080
# Then visit http://localhost:8080
```

```bash
# Using Node.js (npx)
npx serve .
```

## Usage

1. **Type or paste your script** into the *Script* editor on the left. Standard keyboard shortcuts for bold (`Ctrl+B`), italic (`Ctrl+I`), and underline (`Ctrl+U`) are supported. Pasted text is automatically sanitised to plain text so that alternate line colouring always works correctly.
2. **Adjust settings** in the control panel:
   - *Scroll speed* — how fast the text scrolls.
   - *Text size* — font size rendered in the teleprompter.
   - *Alternate line color* — colour picker for the accent colour used on even-numbered lines.
   - *Alternate line colors* — toggle alternating colours on or off.
   - *Flip horizontally / Flip vertically* — mirror the display for reflective setups.
3. **Press Play** to start scrolling. Use **Pause** to hold the position and **Reset** to jump back to the top.
4. **Full Screen Output** — opens a full-screen presentation view ideal for recording or broadcast. All controls (speed, size, play/pause/reset, voice) are also available in the full-screen toolbar. Press **Back to Options** or **Escape** to return to the editor.
5. **Voice pace control** — click *Enable Mic* and grant microphone access. AltTeleprompter will listen to your speech, estimate your words-per-minute rate, and smoothly adjust the scroll speed to keep pace with your delivery. Use the *Voice speed scale* slider to fine-tune the sensitivity.

## Project Structure

```
teleprompter/
├── index.html   # Application markup and layout
├── script.js    # Application logic (scrolling, voice, controls)
└── styles.css   # Dark-theme styles and responsive layout
```

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Core teleprompter | ✅ | ✅ | ✅ | ✅ |
| Voice pace control | ✅ | ✅ | ⚠️ Partial | ✅ |

> **Note:** The Web Speech API (`SpeechRecognition`) has the widest support in Chromium-based browsers. In browsers where it is unavailable the voice controls are automatically disabled and a status message is shown.

## License

This project is open source. See the repository for licensing details.
