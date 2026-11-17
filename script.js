const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const currentYear = document.querySelector("#current-year");
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroPhotoTrigger = document.querySelector(".hero-photo-trigger");
const previousSlideButton = document.querySelector(".slide-previous");
const nextSlideButton = document.querySelector(".slide-next");
const fieldCarousels = Array.from(document.querySelectorAll(".field-carousel"));
const fieldCarouselAutoplayInterval = 4000;
const pageScrollbarTrack = document.querySelector(".page-scrollbar-track");
const pageScrollbarLine = pageScrollbarTrack?.querySelector(".page-scrollbar-line");
const photoDialog = document.querySelector(".photo-dialog");
const photoDialogClose = document.querySelector(".photo-dialog-close");
const photoDialogImage = document.querySelector("#photo-dialog-image");
const photoDialogCaption = document.querySelector("#photo-dialog-caption");
const photoDialogViewport = photoDialog?.querySelector(".photo-dialog-viewport");
const photoZoomLevel = photoDialog?.querySelector(".photo-zoom-level");
const projectMapTrigger = document.querySelector(".project-map-trigger");
const pageTransitionOverlay = document.querySelector(".page-transition-overlay");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeSlideIndex = 0;
let photoZoom = 1;
let photoPanX = 0;
let photoPanY = 0;
let photoPinchState = null;
let photoPointerMoved = false;
let photoIgnoreNextClick = false;
const photoPointers = new Map();

if (document.body && !prefersReducedMotion) {
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
} else if (document.body) {
  document.body.classList.add("is-ready");
}

if (pageTransitionOverlay && !prefersReducedMotion) {
  const triggerPageTransition = (targetUrl) => {
    if (!targetUrl) {
      return;
    }

    document.body.classList.add("is-page-transitioning");
    pageTransitionOverlay.classList.add("is-visible");
    window.setTimeout(() => {
      window.location.assign(targetUrl);
    }, 220);
  };

  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (
        href === "" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank"
      ) {
        return;
      }

      const targetHref = new URL(href, window.location.href).href;
      if (targetHref === window.location.href) {
        return;
      }

      event.preventDefault();
      triggerPageTransition(targetHref);
    });
  });
}

function setMenuOpen(isOpen) {
  if (!menuToggle || !primaryNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  primaryNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });
}

window.addEventListener("resize", () => {
  if (
    window.matchMedia("(min-width: 1401px)").matches &&
    menuToggle?.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    if (document.activeElement === menuToggle) {
      primaryNav?.querySelector("a")?.focus();
    }
  }
});

if (primaryNav) {
  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoDialog?.open) {
    event.preventDefault();
    photoDialog.close();
    return;
  }

  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function openPhotoViewer(source, caption) {
  if (!photoDialog || !photoDialogImage || !photoDialogCaption) {
    return;
  }

  resetPhotoZoom();
  photoDialogImage.src = source;
  photoDialogImage.alt = caption;
  photoDialogCaption.textContent = caption;
  fitPhotoViewport();
  if (!photoDialog.open) {
    photoDialog.showModal();
  }
}

function fitPhotoViewport() {
  if (!photoDialogViewport || !photoDialogImage?.naturalWidth) {
    return;
  }

  const aspectRatio = photoDialogImage.naturalWidth / photoDialogImage.naturalHeight;
  const maximumWidth = Math.min(window.innerWidth - 72, 1200);
  const maximumHeight = Math.min(window.innerHeight * 0.68, 928);
  let width = maximumWidth;
  let height = width / aspectRatio;

  if (height > maximumHeight) {
    height = maximumHeight;
    width = height * aspectRatio;
  }

  photoDialogViewport.style.width = `${width}px`;
  photoDialogViewport.style.height = `${height}px`;
  updatePhotoZoom();
}

function clampPhotoPan() {
  if (!photoDialogViewport || !photoDialogImage) {
    photoPanX = 0;
    photoPanY = 0;
    return;
  }

  const maximumX = Math.max(
    0,
    (photoDialogImage.clientWidth * photoZoom - photoDialogViewport.clientWidth) / 2,
  );
  const maximumY = Math.max(
    0,
    (photoDialogImage.clientHeight * photoZoom - photoDialogViewport.clientHeight) / 2,
  );
  photoPanX = Math.max(-maximumX, Math.min(maximumX, photoPanX));
  photoPanY = Math.max(-maximumY, Math.min(maximumY, photoPanY));
}

function updatePhotoZoom() {
  if (!photoDialogImage || !photoDialogViewport) {
    return;
  }

  clampPhotoPan();
  photoDialogImage.style.transform =
    `translate(${photoPanX}px, ${photoPanY}px) scale(${photoZoom})`;
  photoDialogViewport.classList.toggle("is-zoomed", photoZoom > 1);
  photoDialogViewport.classList.toggle("is-panning", photoPointers.size > 0 && photoZoom > 1);
  photoDialogViewport.setAttribute(
    "aria-label",
    `Image viewer, zoom ${Math.round(photoZoom * 100)} percent. Scroll or pinch to zoom; drag to move.`,
  );
  if (photoZoomLevel) {
    photoZoomLevel.value = `${Math.round(photoZoom * 100)}%`;
  }
}

function resetPhotoZoom() {
  photoZoom = 1;
  photoPanX = 0;
  photoPanY = 0;
  photoPinchState = null;
  photoPointerMoved = false;
  photoIgnoreNextClick = false;
  photoPointers.clear();
  updatePhotoZoom();
}

function setPhotoZoom(nextZoom, anchorX, anchorY) {
  if (!photoDialogViewport) {
    return;
  }

  const boundedZoom = Math.max(1, Math.min(5, nextZoom));
  const bounds = photoDialogViewport.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const relativeX = (anchorX ?? centerX) - centerX;
  const relativeY = (anchorY ?? centerY) - centerY;
  const zoomRatio = boundedZoom / photoZoom;
  photoPanX = relativeX - (relativeX - photoPanX) * zoomRatio;
  photoPanY = relativeY - (relativeY - photoPanY) * zoomRatio;
  photoZoom = boundedZoom;
  updatePhotoZoom();
}

if (photoDialogViewport) {
  photoDialogImage?.addEventListener("load", fitPhotoViewport);

  photoDialogViewport.addEventListener("click", (event) => {
    if (photoIgnoreNextClick) {
      photoIgnoreNextClick = false;
      return;
    }

    if (photoZoom > 1) {
      resetPhotoZoom();
    } else {
      setPhotoZoom(2, event.clientX, event.clientY);
    }
  });

  window.addEventListener("resize", () => {
    if (photoDialog?.open) {
      fitPhotoViewport();
    }
  });

  photoDialogViewport.addEventListener(
    "wheel",
    (event) => {
      if (!photoDialog?.open) {
        return;
      }

      event.preventDefault();
      setPhotoZoom(photoZoom * Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
    },
    { passive: false },
  );

  photoDialogViewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && photoZoom <= 1) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (photoPointers.size === 0) {
      photoPointerMoved = false;
    }
    photoPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    photoDialogViewport.setPointerCapture(event.pointerId);
    if (photoPointers.size === 2) {
      const [first, second] = Array.from(photoPointers.values());
      photoPinchState = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
      };
    }
    updatePhotoZoom();
  });

  photoDialogViewport.addEventListener("pointermove", (event) => {
    const pointer = photoPointers.get(event.pointerId);
    if (!pointer) {
      return;
    }

    event.preventDefault();
    const previousX = pointer.x;
    const previousY = pointer.y;
    if (Math.hypot(event.clientX - previousX, event.clientY - previousY) > 5) {
      photoPointerMoved = true;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (photoPointers.size >= 2) {
      const [first, second] = Array.from(photoPointers.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const midpointX = (first.x + second.x) / 2;
      const midpointY = (first.y + second.y) / 2;
      if (photoPinchState && photoPinchState.distance > 0) {
        setPhotoZoom(
          photoZoom * (distance / photoPinchState.distance),
          photoPinchState.x,
          photoPinchState.y,
        );
        photoPanX += midpointX - photoPinchState.x;
        photoPanY += midpointY - photoPinchState.y;
        updatePhotoZoom();
      }
      photoPinchState = { distance, x: midpointX, y: midpointY };
    } else if (photoZoom > 1) {
      photoPanX += event.clientX - previousX;
      photoPanY += event.clientY - previousY;
      updatePhotoZoom();
    }
  });

  const finishPhotoPointer = (event) => {
    photoPointers.delete(event.pointerId);
    if (photoPointerMoved) {
      photoIgnoreNextClick = true;
      window.setTimeout(() => {
        photoIgnoreNextClick = false;
      }, 0);
    }
    if (photoPointers.size < 2) {
      photoPinchState = null;
    }
    updatePhotoZoom();
  };
  photoDialogViewport.addEventListener("pointerup", finishPhotoPointer);
  photoDialogViewport.addEventListener("pointercancel", finishPhotoPointer);
}

function getMaximumPageScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function updatePageScrollbar() {
  if (!pageScrollbarTrack || !pageScrollbarLine) {
    return;
  }

  const maximumScroll = getMaximumPageScroll();
  const progress = maximumScroll > 0 ? window.scrollY / maximumScroll : 0;
  pageScrollbarTrack.style.setProperty(
    "--scroll-offset",
    `${progress * pageScrollbarLine.clientHeight}px`,
  );
  pageScrollbarTrack.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
}

function scrollToPagePosition(clientY) {
  if (!pageScrollbarLine) {
    return;
  }

  const lineBounds = pageScrollbarLine.getBoundingClientRect();
  if (lineBounds.height === 0) {
    return;
  }

  const progress = Math.max(0, Math.min(1, (clientY - lineBounds.top) / lineBounds.height));
  window.scrollTo({ top: progress * getMaximumPageScroll(), behavior: "auto" });
}

function showSlide(index) {
  if (heroSlides.length === 0) {
    return;
  }

  activeSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const activeSlide = heroSlides[activeSlideIndex];
  const caption = activeSlide.dataset.caption || "Project photo";

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlideIndex);
  });

  if (heroPhotoTrigger) {
    heroPhotoTrigger.setAttribute("aria-label", `View photo: ${caption}`);
  }
}

fieldCarousels.forEach((carousel) => {
  const frame = carousel.querySelector(".field-carousel-frame");
  const slides = Array.from(carousel.querySelectorAll(".field-carousel-slide"));
  const counter = carousel.querySelector(".field-carousel-counter");
  const paginationButtons = Array.from(
    carousel.querySelectorAll(".field-carousel-pagination button"),
  );
  const configuredInterval = Number.parseInt(carousel.dataset.interval || "", 10);
  const autoplayInterval =
    Number.isFinite(configuredInterval) && configuredInterval > 0
      ? configuredInterval
      : fieldCarouselAutoplayInterval;
  if (!frame || slides.length === 0) {
    return;
  }

  let isDragging = false;
  let isInteracting = false;
  let didDrag = false;
  let activeIndex = 0;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  const updateCounterAnnouncement = () => {
    if (!counter) {
      return;
    }

    const otherElementFocused = carousel.contains(document.activeElement);
    counter.setAttribute(
      "aria-live",
      prefersReducedMotion || otherElementFocused ? "polite" : "off",
    );
  };

  const shouldPauseAutoplay = () => {
    const bounds = carousel.getBoundingClientRect();
    const otherElementFocused = carousel.contains(document.activeElement);
    const mouseHoveringFrame =
      window.matchMedia("(hover: hover)").matches && frame.matches(":hover");

    return (
      isInteracting ||
      mouseHoveringFrame ||
      otherElementFocused ||
      document.hidden ||
      photoDialog?.open === true ||
      bounds.bottom <= 0 ||
      bounds.top >= window.innerHeight
    );
  };

  const updateSlide = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
    });

    paginationButtons.forEach((button, buttonIndex) => {
      if (buttonIndex === activeIndex) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    if (counter) {
      counter.textContent = `${activeIndex + 1} / ${slides.length}`;
    }
    updateCounterAnnouncement();
  };

  paginationButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      frame.scrollTo({
        left: index * frame.clientWidth,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });

  carousel.addEventListener("focusin", updateCounterAnnouncement);
  carousel.addEventListener("focusout", () => {
    window.requestAnimationFrame(updateCounterAnnouncement);
  });

  slides.forEach((slide, slideIndex) => {
    if (slide instanceof HTMLImageElement) {
      const caption = slide.alt || "Carousel photo";
      slide.setAttribute("role", "button");
      slide.setAttribute("aria-label", `View full-size photo: ${caption}`);
      slide.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        openPhotoViewer(slide.currentSrc || slide.src, caption);
      });
      return;
    }

    const title = slide.dataset.title || "Carousel information";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label", `Slide ${slideIndex + 1} of ${slides.length}: ${title}`);
  });

  frame.addEventListener("click", (event) => {
    if (didDrag) {
      didDrag = false;
      return;
    }

    if (event.detail === 0) {
      return;
    }

    const clickedSlide =
      slides.find((slide) => slide.contains(event.target)) ?? slides[activeIndex];
    if (!(clickedSlide instanceof HTMLImageElement)) {
      return;
    }
    openPhotoViewer(clickedSlide.currentSrc || clickedSlide.src, clickedSlide.alt || "Carousel photo");
  });

  frame.addEventListener("scroll", () => {
    const slideWidth = frame.clientWidth;
    if (slideWidth > 0) {
      updateSlide(Math.round(frame.scrollLeft / slideWidth));
    }
  });

  frame.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.max(
      0,
      Math.min(activeIndex + direction, slides.length - 1),
    );
    frame.scrollTo({
      left: nextIndex * frame.clientWidth,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  frame.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isInteracting = true;
    if (event.pointerType !== "mouse") {
      return;
    }

    isDragging = true;
    didDrag = false;
    dragStartX = event.clientX;
    dragStartScrollLeft = frame.scrollLeft;
    frame.classList.add("is-dragging");
    frame.setPointerCapture(event.pointerId);
  });

  frame.addEventListener("pointermove", (event) => {
    if (isDragging) {
      if (Math.abs(event.clientX - dragStartX) > 4) {
        didDrag = true;
      }
      frame.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
    }
  });

  const stopDrag = () => {
    isDragging = false;
    isInteracting = false;
    frame.classList.remove("is-dragging");
  };

  frame.addEventListener("pointerup", stopDrag);
  frame.addEventListener("pointercancel", stopDrag);
  frame.addEventListener("dragstart", (event) => event.preventDefault());
  updateSlide(0);

  if (carousel.dataset.autoplay !== "false" && !prefersReducedMotion && slides.length > 1) {
    window.setInterval(() => {
      if (shouldPauseAutoplay()) {
        return;
      }

      const nextIndex = (activeIndex + 1) % slides.length;
      frame.scrollTo({
        left: nextIndex * frame.clientWidth,
        behavior: nextIndex === 0 ? "auto" : "smooth",
      });
    }, autoplayInterval);
  }
});

if (pageScrollbarTrack && pageScrollbarLine) {
  let isDraggingScrollbar = false;
  let pendingPageScrollbarFrame = null;

  const schedulePageScrollbarUpdate = () => {
    if (pendingPageScrollbarFrame !== null) {
      return;
    }

    pendingPageScrollbarFrame = window.requestAnimationFrame(() => {
      pendingPageScrollbarFrame = null;
      updatePageScrollbar();
    });
  };

  pageScrollbarTrack.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isDraggingScrollbar = true;
    pageScrollbarTrack.classList.add("is-dragging");
    pageScrollbarTrack.setPointerCapture(event.pointerId);
    pageScrollbarTrack.focus({ preventScroll: true });
    scrollToPagePosition(event.clientY);
    event.preventDefault();
  });

  pageScrollbarTrack.addEventListener("pointermove", (event) => {
    if (isDraggingScrollbar) {
      scrollToPagePosition(event.clientY);
    }
  });

  const stopScrollbarDrag = () => {
    isDraggingScrollbar = false;
    pageScrollbarTrack.classList.remove("is-dragging");
  };

  pageScrollbarTrack.addEventListener("pointerup", stopScrollbarDrag);
  pageScrollbarTrack.addEventListener("pointercancel", stopScrollbarDrag);
  pageScrollbarTrack.addEventListener("keydown", (event) => {
    const currentScroll = window.scrollY;
    const maximumScroll = getMaximumPageScroll();
    const arrowStep = Math.max(40, window.innerHeight * 0.1);
    let targetScroll;

    switch (event.key) {
      case "ArrowUp":
        targetScroll = currentScroll - arrowStep;
        break;
      case "ArrowDown":
        targetScroll = currentScroll + arrowStep;
        break;
      case "PageUp":
        targetScroll = currentScroll - window.innerHeight * 0.9;
        break;
      case "PageDown":
        targetScroll = currentScroll + window.innerHeight * 0.9;
        break;
      case "Home":
        targetScroll = 0;
        break;
      case "End":
        targetScroll = maximumScroll;
        break;
      default:
        return;
    }

    event.preventDefault();
    window.scrollTo({
      top: Math.max(0, Math.min(targetScroll, maximumScroll)),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  window.addEventListener("scroll", schedulePageScrollbarUpdate, { passive: true });
  window.addEventListener("resize", schedulePageScrollbarUpdate);
  window.addEventListener("load", schedulePageScrollbarUpdate);
  updatePageScrollbar();
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".field-update-inner, .focus-heading, .metal-card, .closing-content, .presentation-heading, .presentation-outline",
  );
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.12 },
  );

  revealTargets.forEach((target) => {
    target.classList.add("motion-reveal");
    revealObserver.observe(target);
  });
}

if (heroPhotoTrigger) {
  heroPhotoTrigger.addEventListener("click", () => {
    const activeSlide = heroSlides[activeSlideIndex];
    if (activeSlide) {
      openPhotoViewer(activeSlide.src, activeSlide.dataset.caption || "Project photo");
    }
  });
}

previousSlideButton?.addEventListener("click", () => {
  showSlide(activeSlideIndex - 1);
});

nextSlideButton?.addEventListener("click", () => {
  showSlide(activeSlideIndex + 1);
});

document.querySelectorAll(".field-photo-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const source = trigger.dataset.photoSrc;
    const caption = trigger.dataset.photoCaption;
    if (source && caption) {
      openPhotoViewer(source, caption);
    }
  });
});

document.querySelectorAll(".brand-logo-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const logo = trigger.querySelector(".brand-logo");
    if (logo) {
      openPhotoViewer(logo.src, "VA ROVIENG CO.,LTD logo");
    }
  });
});

projectMapTrigger?.addEventListener("click", () => {
  const map = projectMapTrigger.querySelector(".project-map");
  if (map) {
    openPhotoViewer(map.currentSrc || map.src, map.alt);
  }
});

if (photoDialogClose && photoDialog) {
  photoDialogClose.addEventListener("click", () => {
    photoDialog.close();
  });
}

if (photoDialog) {
  photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) {
      photoDialog.close();
    }
  });
}

showSlide(activeSlideIndex);

if (heroSlides.length > 1 && !prefersReducedMotion) {
  window.setInterval(() => {
    if (!document.hidden) {
      showSlide(activeSlideIndex + 1);
    }
  }, 5000);
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
