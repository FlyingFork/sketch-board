import { test } from "./canvas.js";

let CURRENT_OPTION = "pointer";
let CURRENT_COLOR = "#000000";
let COLORS = {};

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
    const DOMCanvas = document.getElementById("board");
    const CTX = DOMCanvas.getContext("2d");
    CTX.clearRect(0, 0, DOMCanvas.width, DOMCanvas.height);
  }
}

function populateSubitems(items, isColors = false) {
  const DOMRoot = document.getElementById("subitems");
  DOMRoot.style.display = "flex";
  DOMRoot.innerHTML = "";

  let addSubItem = (element) => {
    const DOMElement = document.createElement("div");

    if (element.id) DOMElement.id = element.id;

    if (element.inner) DOMElement.innerHTML = element.inner;

    if (element.tooltip) {
      DOMElement.dataset.bsPlacement = "right";
      DOMElement.dataset.bsToggle = "tooltip";
      DOMElement.dataset.bsTitle = element.tooltip;
      new bootstrap.Tooltip(DOMElement);
    }

    DOMRoot.appendChild(DOMElement);

    if (element.color) {
      const DOMSvg = DOMElement.querySelector("svg");
      if (DOMSvg) DOMSvg.style.fill = element.color;
      if (CURRENT_COLOR === element.color) DOMElement.classList.add("selected");
    }

    DOMElement.addEventListener("click", () => {
      let DOMOldSelected = DOMRoot.querySelector(".selected");
      if (DOMOldSelected) DOMOldSelected.classList.remove("selected");

      DOMElement.classList.add("selected");

      if (element.color) {
        CURRENT_COLOR = element.color;
      }
    });
  };

  if (isColors) {
    COLORS.forEach(addSubItem);

    const DOMSeparator = document.createElement("div");
    DOMSeparator.classList.add("separator");
    DOMSeparator.style = "width: 100%; height: 1px;";
    DOMRoot.appendChild(DOMSeparator);

    const DOMAdd = document.createElement("div");
    DOMAdd.dataset.bsPlacement = "right";
    DOMAdd.dataset.bsToggle = "tooltip";
    DOMAdd.dataset.bsTitle = "Add Color";
    new bootstrap.Tooltip(DOMAdd);
    DOMAdd.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>';
    DOMRoot.appendChild(DOMAdd);

    // DOMAdd.addEventListener("click", () => {
    //   COLORS.push({
    //     "selectable": true,
    //     "color": "#000000",
    //   })
    // })
  } else {
    items.forEach(addSubItem);
  }
}

function populateMenu(DOMRoot, JSONData) {
  JSONData.forEach((element) => {
    const DOMElement = document.createElement("div");

    if (element.class) DOMElement.classList.add(element.class);

    if (element.id) DOMElement.id = element.id;

    if (element.inner) DOMElement.innerHTML = element.inner;

    if (element.tooltip) {
      DOMElement.dataset.bsPlacement = "top";
      DOMElement.dataset.bsToggle = "tooltip";
      DOMElement.dataset.bsTitle = element.tooltip;
      new bootstrap.Tooltip(DOMElement);
    }

    if (CURRENT_OPTION === element.id) DOMElement.classList.add("selected");

    if (element.deactivated) DOMElement.classList.add("deactivated");

    DOMElement.addEventListener("click", () => {
      if (element.selectable || element.subitems) {
        let DOMOldSelected = DOMRoot.querySelector(".selected");
        if (DOMOldSelected) {
          DOMOldSelected.classList.remove("selected");

          let DOMSubItems = document.getElementById("subitems");
          DOMSubItems.style.display = "none";
        }
      }

      if (element.modal) {
        showBootstrapModal(element.modal.title, element.modal.body);
      } else {
        if (element.selectable || element.subitems) {
          DOMElement.classList.add("selected");
          CURRENT_OPTION = DOMElement.id;
        }

        if (element.subitems)
          populateSubitems(
            element.subitems,
            (element.id === "palette" && true) || false
          );
      }
    });

    DOMRoot.appendChild(DOMElement);
  });
}

fetch("./data/menu-buttons.json")
  .then((response) => response.json())
  .then((data) => {
    COLORS = data.toolbar[2].subitems;
    const DOMToolbar = document.getElementById("toolbar");
    populateMenu(DOMToolbar, data.toolbar);
    test();
  });
