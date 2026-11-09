(() => {
  const sections = [...document.querySelectorAll("[data-section-path]")];
  const targetForURL = (url) => {
    if (url.hash) {
      try {
        return document.getElementById(decodeURIComponent(url.hash.slice(1)));
      } catch {
        return null;
      }
    }
    const path = url.pathname.replace(/^\/|\/$/g, "");
    return path ? sections.find((section) => section.dataset.sectionPath === path) : document.body;
  };
  const jump = (target, smooth = true) => {
    if (!target) return;
    const behavior = smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant";
    if (target === document.body) window.scrollTo({ top: 0, left: 0, behavior });
    else target.scrollIntoView({ behavior, block: "start" });
  };
  const initialTarget = targetForURL(new URL(location.href));
  if (initialTarget && initialTarget !== document.body) {
    const keepAligned = new ResizeObserver(() => jump(initialTarget, false));
    keepAligned.observe(document.body);
    const stop = () => {
      keepAligned.disconnect();
      for (const event of ["pointerdown", "touchstart", "wheel", "keydown"]) window.removeEventListener(event, stop);
    };
    for (const event of ["pointerdown", "touchstart", "wheel", "keydown"]) window.addEventListener(event, stop, { passive: true });
    jump(initialTarget, false);
  }
  window.addEventListener("popstate", () => jump(targetForURL(new URL(location.href)), false));
  window.addEventListener("hashchange", () => jump(targetForURL(new URL(location.href)), false));
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('.site-nav a, .wordmark, .skip-link, a[href^="#"]');
    if (!link || link.target === "_blank") return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    const target = targetForURL(url);
    if (!target) return;
    event.preventDefault();
    if (!link.classList.contains("skip-link") && url.href !== location.href) history.pushState(null, "", url);
    jump(target);
    if (link.classList.contains("skip-link")) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
  for (const button of document.querySelectorAll("[data-copy-section]")) {
    button.addEventListener("click", async () => {
      const path = button.closest("section").dataset.sectionPath;
      const status = document.querySelector("[data-copy-status]");
      try {
        await navigator.clipboard.writeText(new URL(`/${path}`, location.origin).href);
        status.textContent = "Section link copied.";
        button.querySelector("i").className = "fa-solid fa-check";
        setTimeout(() => { button.querySelector("i").className = "fa-solid fa-link"; }, 2000);
      } catch {
        status.textContent = "Could not copy the section link. Please allow clipboard access and try again.";
      }
    });
  }
})();
