import { installLoader } from "./site.js";
import { viewerAvailable } from "./viewer-bootstrap.js";
import { scenes, predictionKey, viewerExamples } from "./comparison-scenes.js";
import { installPickerIndicator } from "./picker-indicator.js";
import { installScenePreview } from "./scene-previews.js";
import { comparisonURL, readComparisonState } from "./comparison-state.js";

const root = document.querySelector("[data-comparison-section]");
const $ = (selector) => root.querySelector(selector);
const shell = $('[data-viewer-host="arrow"] [data-arrow-viewer]');
const positionTaskIndicator = installPickerIndicator($(".control-row-primary .example-picker"));
const state = readComparisonState(window.location.search);
const taskSelections = new Map();
let controller;

installLoader(shell.querySelector("[data-viewer-loading]"));

function saveSelection() {
  const url = comparisonURL(window.location.href, state);
  window.history.replaceState(window.history.state, "", url);
}

function update() {
  const key = predictionKey(state.task, state.scene);
  shell.dataset.example = key;
  controller?.select(key);
  root.querySelectorAll("[data-scene]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.scene === state.scene));
  });
  root.querySelectorAll("[data-task]").forEach((button) => {
    const active = button.dataset.task === state.task;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function loadTask(switchingTask = false) {
  root.dataset.comparisonTask = state.task;
  $("[data-scenes]").replaceChildren(
    ...scenes[state.task].map((scene) => {
      const button =
        (!switchingTask && $(`[data-scenes] [data-scene="${scene.id}"][data-scene-task="${state.task}"]`)) ||
        document.createElement("button");
      button.type = "button";
      button.className = "scene-card";
      button.dataset.scene = scene.id;
      button.dataset.sceneTask = state.task;
      button.setAttribute("aria-pressed", String(scene.id === state.scene));
      button.setAttribute("aria-label", scene.title);
      button.title = scene.title;
      const image = button.querySelector("img") || document.createElement("img");
      [image.width, image.height] = scene.imageSize;
      installScenePreview(image, scene.image);
      image.alt = "";
      image.draggable = false;
      if (!image.parentElement) button.append(image);
      button.onclick = () => {
        if (state.scene === scene.id) return;
        state.scene = scene.id;
        update();
        saveSelection();
      };
      return button;
    }),
  );
  if (state.task === "tracking") $('[data-scene="davis"]').after($('[data-scene="kubric-20"]'));
  update();
}

root.querySelectorAll("[data-task]").forEach((button) =>
  button.addEventListener("click", () => {
    if (state.task === button.dataset.task) return;
    taskSelections.set(state.task, state.scene);
    state.task = button.dataset.task;
    state.scene = taskSelections.get(state.task) || scenes[state.task][0].id;
    loadTask(true);
    positionTaskIndicator(true);
    saveSelection();
  }),
);

shell.addEventListener("viewerexpansionchange", () => {
  requestAnimationFrame(() => controller?.resize());
});

loadTask();

if (viewerAvailable) {
  import("./viewer.js")
    .then(({ installViewer }) => {
      controller = installViewer(shell, viewerExamples());
    })
    .catch((error) => console.error("Could not initialize example viewer", error));
}
