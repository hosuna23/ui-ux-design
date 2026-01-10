/* -------------------------------------------
   Portfolio & UI interactions (fixed for Swup/external links)
------------------------------------------- */

/************************************************
  OPEN showcase frames in a new tab (resilient)
************************************************/

/* ===== PRODUCTION HARDENING: force external links to bypass Swup ===== */
(function () {
  function isExternal(href) {
    try {
      const u = new URL(href, window.location.href);
      return u.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  function tagExternalLinks(ctx = document) {
    ctx.querySelectorAll('a[href^="http"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (isExternal(href)) {
        // Ensure these never get hijacked by Swup or other handlers
        a.setAttribute("data-no-swup", "");
        if (!a.hasAttribute("rel"))
          a.setAttribute("rel", "noopener noreferrer");
        if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
      }
    });
  }

  // 1) Tag on load and after Swup swaps
  document.addEventListener("DOMContentLoaded", () => tagExternalLinks());
  document.addEventListener("swup:contentReplaced", () => tagExternalLinks());

  // 2) Global click guard — last line of defense
  document.addEventListener(
    "click",
    (e) => {
      const anchor = e.target.closest('a[href]:not([data-no-guard="true"])');
      if (!anchor) return;

      // respect modifier clicks (open new tab/window) and middle-click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1)
        return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return; // hash links unchanged

      if (isExternal(href)) {
        e.preventDefault();
        e.stopImmediatePropagation(); // beat Swup/other delegates
        window.open(
          href,
          anchor.getAttribute("target") || "_blank",
          "noopener,noreferrer"
        );
      }
    },
    { capture: true } // capture ensures we run before delegated handlers
  );
})();

function killDragOnCTAs(ctx = document) {
  ctx.querySelectorAll(".mil-portfolio-slider .mil-button").forEach((btn) => {
    // Ensure the button itself never starts a drag
    btn.setAttribute("draggable", "false");

    // Stop events from reaching Swiper (so no slide on press/drag)
    ["pointerdown", "mousedown", "touchstart", "dragstart"].forEach((ev) => {
      btn.addEventListener(
        ev,
        (e) => {
          e.stopPropagation();
        },
        { passive: true }
      );
    });
  });
}
document.addEventListener("DOMContentLoaded", () => killDragOnCTAs());
document.addEventListener("swup:contentReplaced", () => killDragOnCTAs());

function openFrame(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Single delegated click handler that survives Swup swaps
document.addEventListener("click", (e) => {
  const frame = e.target.closest(".clickable-frame");
  if (!frame) return;
  if (e.target.closest(".mil-zoom-btn")) return; // ignore zoom controls
  openFrame(frame.getAttribute("data-link"));
});

// Keyboard support (Enter / Space)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const frame = e.target.closest(".clickable-frame");
  if (!frame) return;
  e.preventDefault();
  openFrame(frame.getAttribute("data-link"));
});

// Accessibility/UX hints for frames (no event bindings here)
function enhanceClickableFrames(ctx = document) {
  ctx.querySelectorAll(".clickable-frame").forEach((el) => {
    el.style.cursor = "pointer";
    if (!el.hasAttribute("role")) el.setAttribute("role", "link");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
  });
}
document.addEventListener("DOMContentLoaded", () => enhanceClickableFrames());
document.addEventListener("swup:contentReplaced", () =>
  enhanceClickableFrames()
);

/* ============================================
   Utilities for internal/external link handling
=============================================== */
function isExternal(href) {
  try {
    const u = new URL(href, window.location.href);
    return u.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function enhanceExternalLinks(ctx = document) {
  ctx.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (isExternal(a.getAttribute("href"))) {
      // Safety: ensure noopener/noreferrer on external targets
      if (!a.hasAttribute("rel")) a.setAttribute("rel", "noopener noreferrer");
      // Don’t force target if author specified otherwise, but default to _blank
      if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
    }
  });
}
document.addEventListener("DOMContentLoaded", () => enhanceExternalLinks());
document.addEventListener("swup:contentReplaced", () => enhanceExternalLinks());

$(function () {
  "use strict";

  /***************************
    swup
    - FIX: Only intercept internal (same-origin) paths, hash links, or explicit data-swup links
  ***************************/
  const options = {
    containers: ["#swupMain", "#swupMenu"],
    animateHistoryBrowsing: true,
    // FIXED SELECTOR:
    //  - internal paths: a[href^="/"]
    //  - hash/anchor links: a[href^="#"]
    //  - explicit opt-in: a[data-swup]
    //  (External links are excluded automatically)
    linkSelector:
      'a[href^="/"], a[href^="#"], a[data-swup]:not([data-no-swup])',
    animationSelector: '[class="mil-main-transition"]',
  };
  const swup = new Swup(options);

  /***************************
    register gsap plugins
  ***************************/
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /***************************
    color variables
  ***************************/
  var accent = "rgba(255, 152, 0, 1)";
  var dark = "#000";
  var light = "#fff";

  /***************************
    PRELOADER
  ***************************/
  var timeline = gsap.timeline();

  timeline.to(".mil-preloader-animation", { opacity: 1 });

  timeline.fromTo(
    ".mil-animation-1 .mil-h3",
    { y: "30px", opacity: 0 },
    { y: "0px", opacity: 1, stagger: 0.4 }
  );

  timeline.to(".mil-animation-1 .mil-h3", { opacity: 0, y: "-30" }, "+=.3");

  timeline.fromTo(
    ".mil-reveal-box",
    0.1,
    { opacity: 0 },
    { opacity: 1, x: "-30" }
  );
  timeline.to(".mil-reveal-box", 0.45, { width: "100%", x: 0 }, "+=.1");
  timeline.to(".mil-reveal-box", { right: "0" });
  timeline.to(".mil-reveal-box", 0.3, { width: "0%" });

  timeline.fromTo(
    ".mil-animation-2 .mil-h3",
    { opacity: 0 },
    { opacity: 1 },
    "-=.5"
  );
  timeline.to(
    ".mil-animation-2 .mil-h3",
    0.6,
    { opacity: 0, y: "-30" },
    "+=.5"
  );

  timeline.to(".mil-preloader", 0.8, { opacity: 0, ease: "sine" }, "+=.2");

  timeline.fromTo(
    ".mil-up",
    0.8,
    { opacity: 0, y: 40, scale: 0.98, ease: "sine" },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      onComplete: function () {
        $(".mil-preloader").addClass("mil-hidden");
      },
    },
    "-=1"
  );

  /***************************
    Anchor scroll (hash links)
  ***************************/
  $(document).on("click", 'a[href^="#"]', function (event) {
    // If Swup is managing the hash link, let smooth scroll handle it
    event.preventDefault();
    var target = $($.attr(this, "href"));
    if (!target.length) return;
    var offset = $(window).width() < 1200 ? 90 : 0;
    $("html, body").animate({ scrollTop: target.offset().top - offset }, 400);
  });

  /***************************
    Append clones
  ***************************/
  $(document).ready(function () {
    $(".mil-arrow").clone().appendTo(".mil-arrow-place");
    $(".mil-dodecahedron").clone().appendTo(".mil-animation");
    $(".mil-lines").clone().appendTo(".mil-lines-place");
    $(".mil-main-menu ul li.mil-active > a")
      .clone()
      .appendTo(".mil-current-page");
  });

  /***************************
    Accordion
  ***************************/
  let groups = gsap.utils.toArray(".mil-accordion-group");
  let menus = gsap.utils.toArray(".mil-accordion-menu");
  let menuToggles = groups.map(createAnimation);

  menus.forEach((menu) => {
    menu.addEventListener("click", () => toggleMenu(menu));
  });

  function toggleMenu(clickedMenu) {
    menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
  }

  function createAnimation(element) {
    let menu = element.querySelector(".mil-accordion-menu");
    let box = element.querySelector(".mil-accordion-content");
    let symbol = element.querySelector(".mil-symbol");
    let minusElement = element.querySelector(".mil-minus");
    let plusElement = element.querySelector(".mil-plus");

    gsap.set(box, { height: "auto" });

    let animation = gsap
      .timeline()
      .from(box, { height: 0, duration: 0.4, ease: "sine" })
      .from(minusElement, { duration: 0.4, autoAlpha: 0, ease: "none" }, 0)
      .to(plusElement, { duration: 0.4, autoAlpha: 0, ease: "none" }, 0)
      .to(symbol, { background: accent, ease: "none" }, 0)
      .reverse();

    return function (clickedMenu) {
      if (clickedMenu === menu) animation.reversed(!animation.reversed());
      else animation.reverse();
    };
  }

  /***************************
    Back to top
  ***************************/
  const btt = document.querySelector(".mil-back-to-top .mil-link");
  gsap.set(btt, { x: -30, opacity: 0 });
  gsap.to(btt, {
    x: 0,
    opacity: 1,
    ease: "sine",
    scrollTrigger: {
      trigger: "body",
      start: "top -40%",
      end: "top -40%",
      toggleActions: "play none reverse none",
    },
  });

  /***************************
    Cursor
  ***************************/
  const cursor = document.querySelector(".mil-ball");
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  document.addEventListener("pointermove", movecursor);
  function movecursor(e) {
    gsap.to(cursor, {
      duration: 0.6,
      ease: "sine",
      x: e.clientX,
      y: e.clientY,
    });
  }

  $(".mil-drag, .mil-more, .mil-choose")
    .mouseover(function () {
      gsap.to($(cursor), 0.2, {
        width: 90,
        height: 90,
        opacity: 1,
        ease: "sine",
      });
    })
    .mouseleave(function () {
      gsap.to($(cursor), 0.2, {
        width: 20,
        height: 20,
        opacity: 0.1,
        ease: "sine",
      });
    });

  $(".mil-accent-cursor")
    .mouseover(function () {
      gsap.to($(cursor), 0.2, { background: accent, ease: "sine" });
      $(cursor).addClass("mil-accent");
    })
    .mouseleave(function () {
      gsap.to($(cursor), 0.2, { background: dark, ease: "sine" });
      $(cursor).removeClass("mil-accent");
    });

  $(".mil-drag")
    .mouseover(function () {
      gsap.to($(".mil-ball .mil-icon-1"), 0.2, { scale: "1", ease: "sine" });
    })
    .mouseleave(function () {
      gsap.to($(".mil-ball .mil-icon-1"), 0.2, { scale: "0", ease: "sine" });
    });

  $(".mil-more")
    .mouseover(function () {
      gsap.to($(".mil-ball .mil-more-text"), 0.2, { scale: "1", ease: "sine" });
    })
    .mouseleave(function () {
      gsap.to($(".mil-ball .mil-more-text"), 0.2, { scale: "0", ease: "sine" });
    });

  $(".mil-choose")
    .mouseover(function () {
      gsap.to($(".mil-ball .mil-choose-text"), 0.2, {
        scale: "1",
        ease: "sine",
      });
    })
    .mouseleave(function () {
      gsap.to($(".mil-ball .mil-choose-text"), 0.2, {
        scale: "0",
        ease: "sine",
      });
    });

  $(
    'a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input , textarea, .mil-accordion-menu'
  )
    .mouseover(function () {
      gsap.to($(cursor), 0.2, { scale: 0, ease: "sine" });
      gsap.to($(".mil-ball svg"), 0.2, { scale: 0 });
    })
    .mouseleave(function () {
      gsap.to($(cursor), 0.2, { scale: 1, ease: "sine" });
      gsap.to($(".mil-ball svg"), 0.2, { scale: 1 });
    });

  $("body")
    .mousedown(function () {
      gsap.to($(cursor), 0.2, { scale: 0.1, ease: "sine" });
    })
    .mouseup(function () {
      gsap.to($(cursor), 0.2, { scale: 1, ease: "sine" });
    });

  /**************************************************************
    MAIN MENU — Parent opens on first click, navigates on second
    FIX: On second click, use Swup only for internal URLs.
         External links navigate normally (open in new tab).
  **************************************************************/
  function bindMainMenu() {
    $(".mil-main-menu .mil-has-children > a")
      .off("click.menu")
      .on("click.menu", function (e) {
        const $a = $(this);
        const href = $a.attr("href");
        const $li = $a.parent();
        const $submenu = $a.next("ul");

        // No submenu → let it navigate normally
        if ($submenu.length === 0) return;

        const isOpen = $submenu.hasClass("mil-active");

        if (!isOpen) {
          // First click → open submenu (no navigation)
          e.preventDefault();
          e.stopPropagation();

          // Close siblings only
          $li
            .siblings(".mil-has-children")
            .children("a")
            .removeClass("mil-active")
            .end()
            .children("ul")
            .removeClass("mil-active");

          // Open this one
          $a.addClass("mil-active");
          $submenu.addClass("mil-active");
        } else {
          // Second click → navigate appropriately
          e.preventDefault();
          e.stopPropagation();

          if (href && isExternal(href)) {
            // External → normal navigation (open in new tab)
            window.open(href, "_blank", "noopener,noreferrer");
          } else if (href) {
            // Internal → Swup for smooth transition
            swup.navigate(href);
          }
        }
      });
  }
  // Bind once on initial load
  bindMainMenu();

  /***************************
    Progress bar
  ***************************/
  gsap.to(".mil-progress", {
    height: "100%",
    ease: "sine",
    scrollTrigger: { scrub: 0.3 },
  });

  /***************************
    Scroll animations
  ***************************/
  const appearance = document.querySelectorAll(".mil-up");
  appearance.forEach((section) => {
    gsap.fromTo(
      section,
      { opacity: 0, y: 40, scale: 0.98, ease: "sine" },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        scrollTrigger: {
          trigger: section,
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  const scaleImage = document.querySelectorAll(".mil-scale");
  scaleImage.forEach((section) => {
    var value1 = $(section).data("value-1");
    var value2 = $(section).data("value-2");
    gsap.fromTo(
      section,
      { ease: "sine", scale: value1 },
      {
        scale: value2,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  const parallaxImage = document.querySelectorAll(".mil-parallax");
  if ($(window).width() > 960) {
    parallaxImage.forEach((section) => {
      var value1 = $(section).data("value-1");
      var value2 = $(section).data("value-2");
      gsap.fromTo(
        section,
        { ease: "sine", y: value1 },
        {
          y: value2,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

  const rotate = document.querySelectorAll(".mil-rotate");
  rotate.forEach((section) => {
    var value = $(section).data("value");
    gsap.fromTo(
      section,
      { ease: "sine", rotate: 0 },
      {
        rotate: value,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  /***************************
    Fancybox
  ***************************/
  $('[data-fancybox="gallery"]').fancybox({
    buttons: ["slideShow", "zoom", "fullScreen", "close"],
    loop: false,
    protect: true,
  });
  $.fancybox.defaults.hash = false;

  /***************************
    Reviews slider
  ***************************/
  var menu = [
    '<div class="mil-custom-dot mil-slide-1"></div>',
    '<div class="mil-custom-dot mil-slide-2"></div>',
    '<div class="mil-custom-dot mil-slide-3"></div>',
    '<div class="mil-custom-dot mil-slide-4"></div>',
    '<div class="mil-custom-dot mil-slide-5"></div>',
    '<div class="mil-custom-dot mil-slide-6"></div>',
    '<div class="mil-custom-dot mil-slide-7"></div>',
  ];
  var mySwiper = new Swiper(".mil-reviews-slider", {
    pagination: {
      el: ".mil-revi-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + menu[index] + "</span>";
      },
    },
    speed: 800,
    effect: "fade",
    parallax: true,
    navigation: {
      nextEl: ".mil-revi-next",
      prevEl: ".mil-revi-prev",
    },
  });

  /***************************
    Infinite slider
  ***************************/
  var swiper = new Swiper(".mil-infinite-show", {
    slidesPerView: 2,
    spaceBetween: 30,
    speed: 5000,
    autoplay: true,
    autoplay: { delay: 0 },
    loop: true,
    freeMode: true,
    breakpoints: { 992: { slidesPerView: 4 } },
  });

  /***************************
    Portfolio slider
  ***************************/
  var swiper = new Swiper(".mil-portfolio-slider", {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 800,
    parallax: true,
    mousewheel: { enable: true },
    navigation: {
      nextEl: ".mil-portfolio-next",
      prevEl: ".mil-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
  });

  /***************************
    1 item slider
  ***************************/
  var swiper = new Swiper(".mil-1-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    parallax: true,
    navigation: {
      nextEl: ".mil-portfolio-next",
      prevEl: ".mil-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
  });

  /***************************
    2 item slider
  ***************************/
  var swiper = new Swiper(".mil-2-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    parallax: true,
    navigation: {
      nextEl: ".mil-portfolio-next",
      prevEl: ".mil-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
    breakpoints: { 992: { slidesPerView: 2 } },
  });

  /* ------------------------------------------------------------
     REINIT after Swup
  ------------------------------------------------------------ */
  document.addEventListener("swup:contentReplaced", function () {
    $("html, body").animate({ scrollTop: 0 }, 0);

    gsap.to(".mil-progress", {
      height: 0,
      ease: "sine",
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    });

    /***************************
      Close menu on page change
    ***************************/
    $(".mil-menu-btn").removeClass("mil-active");
    $(".mil-menu").removeClass("mil-active");
    $(".mil-menu-frame").removeClass("mil-active");

    /***************************
      Append clones
    ***************************/
    $(document).ready(function () {
      $(
        ".mil-arrow-place .mil-arrow, .mil-animation .mil-dodecahedron, .mil-current-page a"
      ).remove();
      $(".mil-arrow").clone().appendTo(".mil-arrow-place");
      $(".mil-dodecahedron").clone().appendTo(".mil-animation");
      $(".mil-lines").clone().appendTo(".mil-lines-place");
      $(".mil-main-menu ul li.mil-active > a")
        .clone()
        .appendTo(".mil-current-page");
    });

    /***************************
      Rebind cursor hovers
    ***************************/
    $(".mil-drag, .mil-more, .mil-choose")
      .off()
      .mouseover(function () {
        gsap.to($(cursor), 0.2, {
          width: 90,
          height: 90,
          opacity: 1,
          ease: "sine",
        });
      })
      .mouseleave(function () {
        gsap.to($(cursor), 0.2, {
          width: 20,
          height: 20,
          opacity: 0.1,
          ease: "sine",
        });
      });

    $(".mil-accent-cursor")
      .off()
      .mouseover(function () {
        gsap.to($(cursor), 0.2, { background: accent, ease: "sine" });
        $(cursor).addClass("mil-accent");
      })
      .mouseleave(function () {
        gsap.to($(cursor), 0.2, { background: dark, ease: "sine" });
        $(cursor).removeClass("mil-accent");
      });

    $(
      'a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input , textarea, .mil-accordion-menu'
    )
      .off("mouseover mouseleave")
      .mouseover(function () {
        gsap.to($(cursor), 0.2, { scale: 0, ease: "sine" });
        gsap.to($(".mil-ball svg"), 0.2, { scale: 0 });
      })
      .mouseleave(function () {
        gsap.to($(cursor), 0.2, { scale: 1, ease: "sine" });
        gsap.to($(".mil-ball svg"), 0.2, { scale: 1 });
      });

    $("body")
      .off("mousedown mouseup")
      .mousedown(function () {
        gsap.to($(cursor), 0.2, { scale: 0.1, ease: "sine" });
      })
      .mouseup(function () {
        gsap.to($(cursor), 0.2, { scale: 1, ease: "sine" });
      });

    /***************************
      MAIN MENU — rebind with external check
    ***************************/
    bindMainMenu();

    /***************************
      Re-init fancybox
    ***************************/
    $('[data-fancybox="gallery"]').fancybox({
      buttons: ["slideShow", "zoom", "fullScreen", "close"],
      loop: false,
      protect: true,
    });
    $.fancybox.defaults.hash = false;

    /***************************
      Re-init sliders
    ***************************/
    var menu = [
      '<div class="mil-custom-dot mil-slide-1"></div>',
      '<div class="mil-custom-dot mil-slide-2"></div>',
      '<div class="mil-custom-dot mil-slide-3"></div>',
      '<div class="mil-custom-dot mil-slide-4"></div>',
      '<div class="mil-custom-dot mil-slide-5"></div>',
      '<div class="mil-custom-dot mil-slide-6"></div>',
      '<div class="mil-custom-dot mil-slide-7"></div>',
    ];
    new Swiper(".mil-reviews-slider", {
      pagination: {
        el: ".mil-revi-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + menu[index] + "</span>";
        },
      },
      speed: 800,
      effect: "fade",
      parallax: true,
      navigation: { nextEl: ".mil-revi-next", prevEl: ".mil-revi-prev" },
    });

    new Swiper(".mil-infinite-show", {
      slidesPerView: 2,
      spaceBetween: 30,
      speed: 5000,
      autoplay: true,
      autoplay: { delay: 0 },
      loop: true,
      freeMode: true,
      breakpoints: { 992: { slidesPerView: 4 } },
    });

    new Swiper(".mil-portfolio-slider", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 800,
      parallax: true,
      mousewheel: { enable: true },
      navigation: {
        nextEl: ".mil-portfolio-next",
        prevEl: ".mil-portfolio-prev",
      },
      pagination: { el: ".swiper-portfolio-pagination", type: "fraction" },
    });

    new Swiper(".mil-1-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 800,
      parallax: true,
      navigation: {
        nextEl: ".mil-portfolio-next",
        prevEl: ".mil-portfolio-prev",
      },
      pagination: { el: ".swiper-portfolio-pagination", type: "fraction" },
    });

    new Swiper(".mil-2-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 800,
      parallax: true,
      navigation: {
        nextEl: ".mil-portfolio-next",
        prevEl: ".mil-portfolio-prev",
      },
      pagination: { el: ".swiper-portfolio-pagination", type: "fraction" },
      breakpoints: { 992: { slidesPerView: 2 } },
    });

    // Ensure external links stay enhanced after swap
    enhanceExternalLinks(document);
  });

  /***************************
    Menu button
  ***************************/
  $(".mil-menu-btn").on("click", function () {
    $(".mil-menu-btn").toggleClass("mil-active");
    $(".mil-menu").toggleClass("mil-active");
    $(".mil-menu-frame").toggleClass("mil-active");
  });
});
