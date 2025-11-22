import { updateState, clearCanvas, addHistory, undo, redo } from "./canvas.js";

const MIN_STROKE = 3;
const MAX_STROKE = 30;

let CURRENT_OPTION = "pointer";
let CURRENT_COLOR = "#000000";
let CURRENT_VOLUME = 0.6;
let CURRENT_STROKE = 3;
let STROKES = {};
let COLORS = {};

function addMenuItem(parent, data, tooltipPlacement = "right") {
  const DOMElement = document.createElement("div");

  if (data.id) DOMElement.id = data.id;

  if (data.class) DOMElement.classList.add(data.class);
  if (data.deactivated) DOMElement.classList.add("deactivated");
  if (CURRENT_OPTION === data.id) DOMElement.classList.add("selected");

  if (data.tooltip) {
    DOMElement.dataset.bsToggle = "tooltip";
    DOMElement.dataset.bsTitle = data.tooltip;
    DOMElement.dataset.bsPlacement = tooltipPlacement;

    new bootstrap.Tooltip(DOMElement);
  }

  if (data.inner) {
    DOMElement.innerHTML = data.inner;
  } else {
    if (data.color) {
      DOMElement.innerHTML =
        '<div class="circle" style="background-color: ' +
        data.color +
        ';"></div>';

      if (CURRENT_COLOR === data.color) DOMElement.classList.add("selected");
    } else if (data.size) {
      DOMElement.innerHTML =
        '<div class="circle" style="width: ' +
        data.size +
        "px; height: " +
        data.size * 2 +
        'px ;"></div>';

      if (CURRENT_STROKE === data.size) DOMElement.classList.add("selected");

      DOMElement.dataset.bsToggle = "tooltip";
      DOMElement.dataset.bsTitle = "Stroke " + data.size;
      DOMElement.dataset.bsPlacement = tooltipPlacement;

      new bootstrap.Tooltip(DOMElement);
    } else if (data.id === "sound") {
      DOMElement.innerHTML = data.states[CURRENT_VOLUME];
    }
  }

  DOMElement.addEventListener("click", () => {
    if (data.class === "separator") return;
    if (data.modal)
      return showBootstrapModal(data.modal.title, data.modal.body);

    if (!DOMElement.classList.contains("deactivated")) {
      if (data.id === "undo") return undo();
      if (data.id === "redo") return redo();
    }

    if (parent.id === "toolbar" && !data.action) {
      let DOMSubitems = document.getElementById("subitems");
      DOMSubitems.style.display = "none";
    }

    if (!data.action) {
      let DOMOldSelected = parent.querySelectorAll(".selected");
      if (DOMOldSelected)
        DOMOldSelected.forEach((e) => {
          if (data.subitems) {
            if (e.id !== CURRENT_OPTION) e.classList.remove("selected");
          } else {
            e.classList.remove("selected");
          }
        });

      DOMElement.classList.add("selected");
    }

    if (data.subitems)
      return populateSubitems(data.subitems, {
        isColors: (data.id === "palette" && true) || false,
        isStrokes: (data.id === "stroke" && true) || false,
      });

    if (data.size) {
      CURRENT_STROKE = data.size;
      updateState("stroke", CURRENT_STROKE);
    } else if (data.color) {
      CURRENT_COLOR = data.color;
      updateState("color", CURRENT_COLOR);
    } else if (data.id === "sound") {
      let newVolume = CURRENT_VOLUME;

      switch (CURRENT_VOLUME) {
        case 0.6:
          newVolume = 0.3;
          break;
        case 0.3:
          newVolume = 0;
          break;
        case 0:
          newVolume = 0.6;
          break;
      }

      CURRENT_VOLUME = newVolume;
      updateState("volume", CURRENT_VOLUME);

      DOMElement.innerHTML = data.states[CURRENT_VOLUME];
    } else {
      CURRENT_OPTION = data.id;
      updateState("tool", CURRENT_OPTION);
    }
  });

  parent.appendChild(DOMElement);
}

function showBootstrapModal(Title, Body) {
  const bootstrapModal = document.getElementById("bootstrapModal");

  let DOMTitle = document.querySelector(
    "div#bootstrapModal > div > div > div.modal-header > h1"
  );
  let DOMBody = document.querySelector(
    "div#bootstrapModal > div > div > div.modal-body"
  );
  let DOMFotter = document.querySelector(
    "div#bootstrapModal > div > div > div.modal-footer"
  );

  DOMTitle.textContent = Title;
  DOMBody.innerHTML = Body;
  DOMFotter.innerHTML = "";

  const CloseButton = document.createElement("button");
  CloseButton.type = "button";
  CloseButton.innerText = "Close";
  CloseButton.dataset.bsDismiss = "modal";
  CloseButton.classList.add("btn", "btn-secondary");

  const ConfirmButton = document.createElement("button");
  ConfirmButton.type = "button";
  ConfirmButton.innerText = "Confirm";
  ConfirmButton.dataset.modalTitle = Title;
  ConfirmButton.dataset.bsDismiss = "modal";
  ConfirmButton.classList.add("btn", "btn-primary");
  ConfirmButton.addEventListener("click", ModalListener);

  DOMFotter.appendChild(CloseButton);
  DOMFotter.appendChild(ConfirmButton);

  const modalInstance = new bootstrap.Modal(bootstrapModal);
  modalInstance.show();
}

function ModalListener() {
  const identifier = this.dataset.modalTitle;

  if (identifier == "Start fresh?") {
    clearCanvas();
  }
}

function populateSubitems(
  items,
  options = { isColors: false, isStrokes: false }
) {
  const DOMRoot = document.getElementById("subitems");
  DOMRoot.style.display = "flex";
  DOMRoot.innerHTML = "";

  let subItems = items;

  if (options.isColors) {
    subItems = COLORS;
  } else if (options.isStrokes) {
    subItems = STROKES;
  }

  subItems.forEach((entry) => {
    addMenuItem(DOMRoot, entry, "right");
  });

  if (options.isColors || options.isStrokes) {
    const DOMSeparator = document.createElement("div");
    DOMSeparator.classList.add("separator");
    DOMSeparator.style = "width: 100%; height: 1px;";
    DOMRoot.appendChild(DOMSeparator);

    if (
      (options.isColors && COLORS.length < 5) ||
      (options.isStrokes && STROKES.length < 5)
    ) {
      const DOMAdd = document.createElement("div");
      DOMAdd.dataset.bsPlacement = "right";
      DOMAdd.dataset.bsToggle = "tooltip";
      DOMAdd.dataset.bsTitle =
        "Add " + ((options.isColors && "Color") || "Stroke");
      DOMAdd.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>';

      new bootstrap.Tooltip(DOMAdd);
      DOMRoot.appendChild(DOMAdd);

      DOMAdd.addEventListener("click", () => {
        if (options.isColors) {
          COLORS.push({
            color: "#000001",
          });
        } else if (options.isStrokes) {
          STROKES.push({
            id: "stroke",
            tooltip: "Stroke " + CURRENT_STROKE + 4,
            size: CURRENT_STROKE + 4,
          });
        }

        document.body.querySelectorAll(".tooltip").forEach((e) => e.remove());
        populateSubitems(items, options);
      });
    }

    const DOMEdit = document.createElement("div");
    DOMEdit.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"/></svg>';

    // DOMEdit.dataset.bsPlacement = "right";
    // DOMEdit.dataset.bsToggle = "tooltip";
    // DOMEdit.dataset.bsTitle = "Edit Selected";
    // new bootstrap.Tooltip(DOMEdit);

    if (!options.isStrokes) DOMRoot.appendChild(DOMEdit);

    if (options.isColors) {
      const DOMColorSelector = document.createElement("input");

      DOMColorSelector.type = "color";
      DOMColorSelector.id = "colorPicker";

      DOMColorSelector.value = CURRENT_COLOR;

      DOMColorSelector.style.width = 0;
      DOMColorSelector.style.height = 0;
      DOMColorSelector.style.opacity = 0;
      DOMColorSelector.style.top = "50%";
      DOMColorSelector.style.left = "50px";
      DOMColorSelector.style.position = "absolute";
      DOMColorSelector.style.pointerEvents = "none";
      DOMColorSelector.style.transform = "translateY(-50%)";

      DOMEdit.addEventListener("click", () => {
        DOMColorSelector.click();
        DOMColorSelector.value = CURRENT_COLOR;
      });

      DOMColorSelector.addEventListener("change", () => {
        let NEW_COLOR = DOMColorSelector.value;
        let OLD_COLOR = CURRENT_COLOR;

        CURRENT_COLOR = NEW_COLOR;
        updateState("color", CURRENT_COLOR);

        for (let index = 0; index < COLORS.length; index++) {
          const entry = COLORS[index];
          if (entry.color === OLD_COLOR) {
            COLORS[index].color = CURRENT_COLOR;
            let colorDIV = DOMRoot.querySelectorAll("#subitems > div")[index];
            if (colorDIV) {
              let circleDIV = colorDIV.querySelector("div");
              if (circleDIV) {
                circleDIV.style.backgroundColor = CURRENT_COLOR;
              }
            } else {
              document.body
                .querySelectorAll(".tooltip")
                .forEach((e) => e.remove());
              populateSubitems(items, options);
            }

            break;
          }
        }
      });

      DOMRoot.appendChild(DOMColorSelector);
    } else if (options.isStrokes) {
      // let popover = new bootstrap.Popover(DOMEdit, {
      //   content: "Test",
      //   title: "Select Stroke Size",
      //   trigger: "click"
      // });
    }
  }
}

function populateMenu(DOMRoot, JSONData) {
  JSONData.forEach((entry) => {
    addMenuItem(DOMRoot, entry, "top");
  });
}

export function enableUndo() {
  document.getElementById("undo").classList.remove("deactivated");
}

export function disableUndo() {
  document.getElementById("undo").classList.add("deactivated");
}

export function enableRedo() {
  document.getElementById("redo").classList.remove("deactivated");
}

export function disableRedo() {
  document.getElementById("redo").classList.add("deactivated");
}

fetch("./data/menu-buttons.json")
  .then((response) => response.json())
  .then((data) => {
    COLORS = data.toolbar[3].subitems;
    STROKES = data.toolbar[5].subitems;
    const DOMToolbar = document.getElementById("toolbar");
    populateMenu(DOMToolbar, data.toolbar);
    addHistory();
  });
