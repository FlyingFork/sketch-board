import { enableRedo, enableUndo, disableRedo, disableUndo } from "./menu.js";

const DOMCanvas = document.getElementById("board");
const CTX = DOMCanvas.getContext("2d");
const CANVAS_BACKGROUND = "#f2f2f2";
const STATES = {
  tool: "pointer",
  color: "#000000",
  isDrawing: false,
  snapshot: null,
  stroke: 3,
  startX: 0,
  startY: 0,
};

const HISTORY = {
  undo: [],
  redo: [],
  MAX_HISTORY: 30,
};

function resizeCanvas() {
  const ClientRect = DOMCanvas.getBoundingClientRect();
  DOMCanvas.width = ClientRect.width;
  DOMCanvas.height = ClientRect.height;
}

resizeCanvas();
window.addEventListener("resize", () => {
  const prev = CTX.getImageData(0, 0, DOMCanvas.width, DOMCanvas.height);
  resizeCanvas();
  CTX.putImageData(prev, 0, 0);
});

export function addHistory() {
  if (HISTORY.undo.length >= HISTORY.MAX_HISTORY) HISTORY.undo.shift();
  HISTORY.undo.push(CTX.getImageData(0, 0, DOMCanvas.width, DOMCanvas.height));
  HISTORY.redo = [];

  if (HISTORY.undo.length > 1) enableUndo();
  disableRedo();
}

export function undo() {
  if (HISTORY.undo.length <= 1) return;
  HISTORY.redo.push(HISTORY.undo.pop());
  CTX.putImageData(HISTORY.undo[HISTORY.undo.length - 1], 0, 0);
  enableRedo();
  if (HISTORY.undo.length <= 1) disableUndo();
}

export function redo() {
  if (!HISTORY.redo.length) return;
  const state = HISTORY.redo.pop();
  HISTORY.undo.push(state);
  CTX.putImageData(state, 0, 0);

  if (!HISTORY.redo.length) disableRedo();
}

export function updateState(state, value) {
  STATES[state] = value;
}

export function clearCanvas() {
  CTX.clearRect(0, 0, DOMCanvas.width, DOMCanvas.height);
  addHistory();
}

function getMousePos(e) {
  const rect = DOMCanvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function drawShape(x1, y1, x2, y2) {
  CTX.strokeStyle = STATES.color;
  CTX.lineWidth = STATES.stroke;
  CTX.beginPath();

  if (STATES.tool === "square") {
    CTX.strokeRect(x2, y2, x1 - x2, y1 - y2);
  } else if (STATES.tool === "circle") {
    const radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    CTX.arc(x1, y1, radius, 0, Math.PI * 2);
    CTX.stroke();
  } else if (STATES.tool === "triangle") {
    CTX.moveTo(x1, y1);
    CTX.lineTo(x2, y2);
    CTX.lineTo(x1 * 2 - x2, y2);
    CTX.closePath();
    CTX.stroke();
  }
}

DOMCanvas.addEventListener("mousedown", (e) => {
  if (STATES.tool === "pointer") return;

  const mousePos = getMousePos(e);
  STATES.startX = mousePos.x;
  STATES.startY = mousePos.y;
  STATES.isDrawing = true;

  CTX.strokeStyle =
    (STATES.tool === "eraser" && CANVAS_BACKGROUND) || STATES.color;
  CTX.lineWidth = STATES.stroke;
  CTX.lineCap = "round";
  CTX.lineJoin = "round";

  if (STATES.tool === "brush" || STATES.tool === "eraser") {
    CTX.beginPath();
    CTX.moveTo(STATES.startX, STATES.startY);
  } else {
    STATES.snapshot = CTX.getImageData(0, 0, DOMCanvas.width, DOMCanvas.height);
  }
});

DOMCanvas.addEventListener("mousemove", (e) => {
  if (STATES.tool === "pointer" || !STATES.isDrawing) return;

  const mousePos = getMousePos(e);
  const x = mousePos.x;
  const y = mousePos.y;

  if (STATES.tool === "brush" || STATES.tool === "eraser") {
    CTX.lineTo(x, y);
    CTX.stroke();
  } else {
    CTX.putImageData(STATES.snapshot, 0, 0);
    drawShape(STATES.startX, STATES.startY, x, y);
  }
});

function finishDraw(e) {
  if (!STATES.isDrawing) return;
  STATES.isDrawing = false;

  if (STATES.tool !== "brush" && STATES.tool !== "eraser" && STATES.snapshot) {
    const mousePos = getMousePos(e);
    CTX.putImageData(STATES.snapshot, 0, 0);
    drawShape(STATES.startX, STATES.startY, mousePos.x, mousePos.y);
    STATES.snapshot = null;
  }

  addHistory();
}

DOMCanvas.addEventListener("mouseup", finishDraw);
DOMCanvas.addEventListener("mouseleave", () => {
  if (STATES.isDrawing) {
    STATES.isDrawing = false;
    STATES.snapshot = null;
    addHistory();
  }
});
