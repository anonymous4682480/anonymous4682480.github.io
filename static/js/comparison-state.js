import { scenes } from "./comparison-scenes.js";

const taskIds = { tracking: "track", reconstruction: "recon" };

export function readComparisonState(search) {
  const query = new URLSearchParams(search);
  const requestedTask = query.get("task") ?? query.get("comparison");
  const task =
    Object.keys(taskIds).find((task) => task === requestedTask || taskIds[task] === requestedTask) || "tracking";
  const requestedScene = query.get("scene") ?? query.get("example");
  const scene = scenes[task].find((scene) => scene.id === requestedScene) || scenes[task][0];
  return { task, scene: scene.id };
}

export function comparisonURL(href, state) {
  const url = new URL(href);
  url.searchParams.delete("comparison");
  url.searchParams.delete("example");
  url.searchParams.set("task", taskIds[state.task]);
  url.searchParams.set("scene", state.scene);
  url.searchParams.delete("model");
  url.hash = "";
  return url;
}
