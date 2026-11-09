import { trackingScenes } from "./tracking2d-scenes.js";
import { observeViewport } from "./viewport.js";

const root = document.querySelector("[data-tracking2d-gallery]");
const assets = new URL("../../assets/exports/tracking2d/", import.meta.url);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const nearby = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    prepare(video);
    nearby.unobserve(video);
  }
}, { rootMargin: "400px 0px" });

function prepare(video) {
  if (video.hasAttribute("src")) return;
  video.poster = new URL(`${video.dataset.scene}/poster.jpg`, assets).href;
  video.src = new URL(`${video.dataset.scene}/preview.mp4`, assets).href;
}

for (const scene of trackingScenes) {
  const card = document.createElement("figure");
  card.className = "tracking2d-card";
  card.id = `tracking2d-${scene.id}`;
  const video = document.createElement("video");
  video.controls = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.dataset.scene = scene.id;
  video.setAttribute("controlslist", "nodownload");
  video.setAttribute("aria-label", `${scene.title}: 2D point tracking`);
  const caption = document.createElement("figcaption");
  caption.textContent = scene.title;
  card.append(video, caption);
  root.append(card);
  nearby.observe(video);
  observeViewport(video, (active) => {
    if (active) {
      prepare(video);
      if (!reducedMotion.matches) video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}
