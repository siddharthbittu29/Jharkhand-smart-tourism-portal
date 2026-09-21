(() => {
  "use strict";

  /*
   * ============================================================
   * JHARKHAND TOURISM
   * 360° HERITAGE VIEWER
   * ============================================================
   *
   * Features:
   *  - True spherical 360° panorama
   *  - Drag left / right
   *  - Drag up / down
   *  - Mouse wheel zoom
   *  - Touch drag
   *  - Pinch zoom
   *  - Keyboard navigation
   *  - Direction controls
   *  - Zoom controls
   *  - Center/reset
   *  - Auto rotation
   *  - Multiple destinations
   *  - Day / Night
   *  - Narration
   *  - Fullscreen
   *
   * IMPORTANT:
   * Pointer / wheel events are registered on the stage,
   * not on the Three.js renderer before it exists.
   * ============================================================
   */

  const openBtn =
    document.getElementById("vrOpenBtn");

  const modal =
    document.getElementById("vrModal");

  const closeBtn =
    document.getElementById("vrCloseBtn");

  const stage =
    document.getElementById("vrStage");

  const dayBtn =
    document.getElementById("vrDay");

  const nightBtn =
    document.getElementById("vrNight");

  const narrationBtn =
    document.getElementById("vrNarration");

  const audio =
    document.getElementById("vrAudio");

  if (
    !openBtn ||
    !modal ||
    !stage
  ) {
    console.error(
      "360° viewer: required elements are missing."
    );

    return;
  }

  /* ============================================================
     DESTINATIONS
  ============================================================ */

  const destinations = [
    {
      id: "netarhat",
      name: "Netarhat",
      district: "Latehar",
      panorama:
        "/smart/images/netarhat-360.png"
    },

    {
      id: "patratu",
      name: "Patratu Valley",
      district: "Ramgarh",
      panorama:
        "/smart/images/patratu-360.png"
    },

    {
      id: "hundru",
      name: "Hundru Falls",
      district: "Ranchi",
      panorama:
        "/smart/images/Hundru-360.png"
    },

    {
      id: "betla",
      name: "Betla National Park",
      district: "Latehar",
      panorama:
        "/smart/images/national-park-360.png"
    },

    {
      id: "deoghar",
      name: "Deoghar",
      district: "Deoghar",
      panorama:
        "/smart/images/deoghar-360.png"
    },

    {
      id: "hazaribagh",
      name: "Hazaribagh",
      district: "Hazaribagh",
      panorama:
        "/smart/images/hazaribagh-360.png"
    }
  ];

  /* ============================================================
     STATE
  ============================================================ */

  let currentDestination =
    destinations[0];

  let scene = null;

  let camera = null;

  let renderer = null;

  let sphere = null;

  let sphereMaterial = null;

  let textureLoader = null;

  let currentTexture = null;

  let initialized = false;

  let viewerOpen = false;

  let animationFrame = null;

  let lastFrameTime =
    performance.now();

  let autoRotate = true;

  let yaw = 0;

  let pitch = 0;

  let fieldOfView = 72;

  let dragging = false;

  let pointerStartX = 0;

  let pointerStartY = 0;

  let startYaw = 0;

  let startPitch = 0;

  const pointers = new Map();

  let pinchStartDistance = null;

  let pinchStartFov = fieldOfView;

  let previousFocus = null;

  let narrationPlaying = false;

  /* ============================================================
     HELPER
  ============================================================ */

  const qs = (
    selector,
    scope = document
  ) =>
    scope.querySelector(
      selector
    );

  const isControlElement =
    (target) => {
      if (!target) {
        return false;
      }

      return Boolean(
        target.closest(
          ".vr-direction-controls, " +
          ".vr-zoom-controls, " +
          ".vr-controls, " +
          ".vr-place-navigation, " +
          ".vr-place-select, " +
          ".vr-close, " +
          "button, select, input, audio"
        )
      );
    };

  /* ============================================================
     PANORAMA MOUNT
  ============================================================ */

  let panoramaMount =
    document.getElementById(
      "vrPanoramaMount"
    );

  if (!panoramaMount) {
    panoramaMount =
      document.createElement(
        "div"
      );

    panoramaMount.id =
      "vrPanoramaMount";

    panoramaMount.className =
      "vr-panorama-mount";

    stage.appendChild(
      panoramaMount
    );
  }

  /* ============================================================
     DESTINATION NAVIGATION
  ============================================================ */

  let placeNavigation =
    modal.querySelector(
      ".vr-place-navigation"
    );

  if (!placeNavigation) {
    placeNavigation =
      document.createElement(
        "div"
      );

    placeNavigation.className =
      "vr-place-navigation";

    placeNavigation.innerHTML = `
      <div class="vr-place-selector-wrap">

        <label
          class="vr-place-label"
          for="vrPlaceSelect"
        >
          Explore destination
        </label>

        <select
          id="vrPlaceSelect"
          class="vr-place-select"
        ></select>

      </div>

      <div class="vr-place-info">

        <strong id="vrPlaceName">
          Netarhat
        </strong>

        <span id="vrPlaceDistrict">
          Latehar
        </span>

      </div>
    `;

    const stageWrap =
      modal.querySelector(
        ".vr-stage-wrap"
      );

    if (stageWrap) {
      stageWrap.before(
        placeNavigation
      );
    }
  }

  const placeSelect =
    document.getElementById(
      "vrPlaceSelect"
    );

  const placeName =
    document.getElementById(
      "vrPlaceName"
    );

  const placeDistrict =
    document.getElementById(
      "vrPlaceDistrict"
    );

  /* ============================================================
     POPULATE DESTINATIONS
  ============================================================ */

  const populateDestinations =
    () => {
      if (!placeSelect) {
        return;
      }

      placeSelect.innerHTML =
        "";

      destinations.forEach(
        (destination) => {
          const option =
            document.createElement(
              "option"
            );

          option.value =
            destination.id;

          option.textContent =
            destination.name;

          placeSelect.appendChild(
            option
          );
        }
      );

      placeSelect.value =
        currentDestination.id;
    };

  populateDestinations();

  /* ============================================================
     UPDATE DESTINATION INFO
  ============================================================ */

  const updateDestinationInfo =
    () => {
      if (placeName) {
        placeName.textContent =
          currentDestination.name;
      }

      if (placeDistrict) {
        placeDistrict.textContent =
          currentDestination.district;
      }

      if (placeSelect) {
        placeSelect.value =
          currentDestination.id;
      }
    };

  updateDestinationInfo();

  /* ============================================================
     STATUS ELEMENTS
  ============================================================ */

  const loader =
    qs(
      ".vr-loader",
      stage
    );

  const badge =
    qs(
      ".vr-360badge",
      stage
    );

  const hint =
    qs(
      ".vr-hint",
      stage
    );

  if (badge) {
    badge.textContent =
      "360°";
  }

  if (hint) {
    hint.textContent =
      "Drag left / right / up / down • Scroll or pinch to zoom";
  }

  /* ============================================================
     THREE.JS
  ============================================================ */

  const THREE =
    window.THREE;

  if (!THREE) {
    console.error(
      "360° viewer: THREE is not available."
    );

    if (loader) {
      loader.textContent =
        "3D viewer library is unavailable.";
    }

    return;
  }

  /* ============================================================
     RESIZE
  ============================================================ */

  const resize =
    () => {
      if (
        !renderer ||
        !camera
      ) {
        return;
      }

      const width =
        Math.max(
          1,
          stage.clientWidth
        );

      const height =
        Math.max(
          1,
          stage.clientHeight
        );

      camera.aspect =
        width /
        height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height,
        false
      );
    };

  /* ============================================================
     UPDATE CAMERA
  ============================================================ */

  const updateCamera =
    () => {
      if (
        !camera
      ) {
        return;
      }

      const yawRadians =
        THREE.MathUtils.degToRad(
          yaw
        );

      const pitchRadians =
        THREE.MathUtils.degToRad(
          pitch
        );

      const target =
        new THREE.Vector3(
          0,
          0,
          0
        );

      target.x =
        Math.cos(
          pitchRadians
        ) *
        Math.sin(
          yawRadians
        );

      target.y =
        Math.sin(
          pitchRadians
        );

      target.z =
        Math.cos(
          pitchRadians
        ) *
        Math.cos(
          yawRadians
        );

      camera.lookAt(
        target
      );

      camera.fov =
        fieldOfView;

      camera.updateProjectionMatrix();
    };

  /* ============================================================
     RENDER
  ============================================================ */

  const render =
    () => {
      if (
        !renderer ||
        !scene ||
        !camera
      ) {
        return;
      }

      updateCamera();

      renderer.render(
        scene,
        camera
      );
    };

  /* ============================================================
     RESET VIEW
  ============================================================ */

  const resetView =
    () => {
      yaw = 0;

      pitch = 0;

      fieldOfView =
        72;

      render();
    };

  /* ============================================================
     INITIALIZE THREE
  ============================================================ */

  const initializeThree =
    () => {
      if (initialized) {
        return true;
      }

      try {
        scene =
          new THREE.Scene();

        camera =
          new THREE.PerspectiveCamera(
            fieldOfView,
            Math.max(
              1,
              stage.clientWidth
            ) /
              Math.max(
                1,
                stage.clientHeight
              ),
            0.1,
            2000
          );

        camera.position.set(
          0,
          0,
          0.01
        );

        renderer =
          new THREE.WebGLRenderer({
            antialias:
              true,

            alpha:
              false
          });

        renderer.setPixelRatio(
          Math.min(
            window.devicePixelRatio ||
              1,
            2
          )
        );

        renderer.setSize(
          Math.max(
            1,
            stage.clientWidth
          ),
          Math.max(
            1,
            stage.clientHeight
          ),
          false
        );

        renderer.setClearColor(
          0x06150e,
          1
        );

        renderer.domElement.className =
          "vr-three-canvas";

        renderer.domElement.setAttribute(
          "role",
          "img"
        );

        renderer.domElement.setAttribute(
          "aria-label",
          "Interactive 360 degree panorama"
        );

        panoramaMount.innerHTML =
          "";

        panoramaMount.appendChild(
          renderer.domElement
        );

        /*
         * Sphere is inverted so the camera
         * sits inside the panorama.
         */
        const geometry =
          new THREE.SphereGeometry(
            100,
            128,
            96
          );

        geometry.scale(
          -1,
          1,
          1
        );

        sphereMaterial =
          new THREE.MeshBasicMaterial({
            color:
              0xffffff
          });

        sphere =
          new THREE.Mesh(
            geometry,
            sphereMaterial
          );

        scene.add(
          sphere
        );

        textureLoader =
          new THREE.TextureLoader();

        initialized =
          true;

        resize();

        render();

        return true;
      } catch (error) {
        console.error(
          "360° Three.js initialization failed:",
          error
        );

        if (loader) {
          loader.textContent =
            "Unable to initialize 360° viewer.";
        }

        return false;
      }
    };

  /* ============================================================
     LOAD PANORAMA
  ============================================================ */

  const loadPanorama =
    (
      destination
    ) => {
      if (
        !textureLoader ||
        !sphereMaterial
      ) {
        return;
      }

      if (loader) {
        loader.textContent =
          `Loading ${destination.name}…`;

        loader.style.display =
          "block";
      }

      textureLoader.load(
        destination.panorama,

        (texture) => {
          if (
            currentTexture
          ) {
            currentTexture.dispose();
          }

          currentTexture =
            texture;

          /*
           * Correct color handling for
           * photographic panorama assets.
           */
          if (
            "colorSpace" in
            texture
          ) {
            texture.colorSpace =
              THREE.SRGBColorSpace;
          }

          texture.minFilter =
            THREE.LinearFilter;

          texture.magFilter =
            THREE.LinearFilter;

          texture.generateMipmaps =
            true;

          sphereMaterial.map =
            texture;

          sphereMaterial.needsUpdate =
            true;

          resetView();

          if (loader) {
            loader.style.display =
              "none";
          }

          console.log(
            "360° panorama loaded:",
            destination.name,
            destination.panorama
          );
        },

        undefined,

        (error) => {
          console.error(
            "360° image failed:",
            destination.name,
            destination.panorama,
            error
          );

          if (loader) {
            loader.textContent =
              `Could not load ${destination.name} panorama`;
            loader.style.display =
              "block";
          }
        }
      );
    };

  /* ============================================================
     DESTINATION SWITCH
  ============================================================ */

  const switchDestination =
    (
      id
    ) => {
      const destination =
        destinations.find(
          (item) =>
            item.id === id
        );

      if (!destination) {
        return;
      }

      currentDestination =
        destination;

      updateDestinationInfo();

      if (!initialized) {
        if (
          initializeThree()
        ) {
          loadPanorama(
            currentDestination
          );
        }

        return;
      }

      loadPanorama(
        currentDestination
      );
    };

  placeSelect?.addEventListener(
    "change",
    () => {
      switchDestination(
        placeSelect.value
      );
    }
  );

  /* ============================================================
     POINTER DOWN
  ============================================================ */

  stage.addEventListener(
    "pointerdown",
    (event) => {
      if (
        !viewerOpen ||
        isControlElement(
          event.target
        )
      ) {
        return;
      }

      pointers.set(
        event.pointerId,
        {
          x:
            event.clientX,

          y:
            event.clientY
        }
      );

      stage.setPointerCapture?.(
        event.pointerId
      );

      if (
        pointers.size === 1
      ) {
        dragging =
          true;

        pointerStartX =
          event.clientX;

        pointerStartY =
          event.clientY;

        startYaw =
          yaw;

        startPitch =
          pitch;
      }

      if (
        pointers.size === 2
      ) {
        dragging =
          false;

        pinchStartDistance =
          getPointerDistance();

        pinchStartFov =
          fieldOfView;
      }
    }
  );

  /* ============================================================
     POINTER MOVE
  ============================================================ */

  stage.addEventListener(
    "pointermove",
    (event) => {
      if (
        !viewerOpen ||
        !pointers.has(
          event.pointerId
        )
      ) {
        return;
      }

      pointers.set(
        event.pointerId,
        {
          x:
            event.clientX,

          y:
            event.clientY
        }
      );

      /*
       * PINCH ZOOM
       */
      if (
        pointers.size === 2
      ) {
        const distance =
          getPointerDistance();

        if (
          distance &&
          pinchStartDistance
        ) {
          const delta =
            pinchStartDistance -
            distance;

          fieldOfView =
            Math.max(
              35,
              Math.min(
                95,
                pinchStartFov +
                  delta *
                    0.05
              )
            );

          render();
        }

        return;
      }

      /*
       * DRAG
       */
      if (
        !dragging
      ) {
        return;
      }

      const deltaX =
        event.clientX -
        pointerStartX;

      const deltaY =
        event.clientY -
        pointerStartY;

      yaw =
        startYaw +
        deltaX *
          0.22;

      pitch =
        startPitch -
        deltaY *
          0.18;

      pitch =
        Math.max(
          -82,
          Math.min(
            82,
            pitch
          )
        );

      render();
    }
  );

  /* ============================================================
     POINTER END
  ============================================================ */

  const endPointer =
    (event) => {
      pointers.delete(
        event.pointerId
      );

      if (
        pointers.size === 0
      ) {
        dragging =
          false;

        pinchStartDistance =
          null;
      }

      if (
        pointers.size === 1
      ) {
        const remaining =
          Array.from(
            pointers.values()
          )[0];

        pointerStartX =
          remaining.x;

        pointerStartY =
          remaining.y;

        startYaw =
          yaw;

        startPitch =
          pitch;

        dragging =
          true;

        pinchStartDistance =
          null;
      }
    };

  stage.addEventListener(
    "pointerup",
    endPointer
  );

  stage.addEventListener(
    "pointercancel",
    endPointer
  );

  /* ============================================================
     WHEEL ZOOM
  ============================================================ */

  stage.addEventListener(
    "wheel",
    (event) => {
      if (
        !viewerOpen ||
        isControlElement(
          event.target
        )
      ) {
        return;
      }

      event.preventDefault();

      fieldOfView +=
        event.deltaY *
        0.045;

      fieldOfView =
        Math.max(
          35,
          Math.min(
            95,
            fieldOfView
          )
        );

      render();
    },
    {
      passive:
        false
    }
  );

  /* ============================================================
     GET PINCH DISTANCE
  ============================================================ */

  function getPointerDistance() {
    const values =
      Array.from(
        pointers.values()
      );

    if (
      values.length <
      2
    ) {
      return null;
    }

    const dx =
      values[0].x -
      values[1].x;

    const dy =
      values[0].y -
      values[1].y;

    return Math.sqrt(
      dx * dx +
      dy * dy
    );
  }

  /* ============================================================
     DIRECTION CONTROLS
  ============================================================ */

  let directionControls =
    stage.querySelector(
      ".vr-direction-controls"
    );

  if (!directionControls) {
    directionControls =
      document.createElement(
        "div"
      );

    directionControls.className =
      "vr-direction-controls";

    directionControls.innerHTML = `
      <button
        type="button"
        class="vr-direction-btn"
        data-direction="up"
        aria-label="Look up"
      >
        ↑
      </button>

      <div class="vr-direction-row">

        <button
          type="button"
          class="vr-direction-btn"
          data-direction="left"
          aria-label="Look left"
        >
          ←
        </button>

        <button
          type="button"
          class="vr-direction-btn vr-center"
          data-direction="center"
          aria-label="Center view"
        >
          ●
        </button>

        <button
          type="button"
          class="vr-direction-btn"
          data-direction="right"
          aria-label="Look right"
        >
          →
        </button>

      </div>

      <button
        type="button"
        class="vr-direction-btn"
        data-direction="down"
        aria-label="Look down"
      >
        ↓
      </button>
    `;

    stage.appendChild(
      directionControls
    );
  }

  directionControls.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-direction]"
        );

      if (!button) {
        return;
      }

      const direction =
        button.dataset.direction;

      const horizontal =
        10;

      const vertical =
        7;

      if (
        direction ===
        "left"
      ) {
        yaw -=
          horizontal;
      }

      if (
        direction ===
        "right"
      ) {
        yaw +=
          horizontal;
      }

      if (
        direction ===
        "up"
      ) {
        pitch =
          Math.min(
            82,
            pitch +
              vertical
          );
      }

      if (
        direction ===
        "down"
      ) {
        pitch =
          Math.max(
            -82,
            pitch -
              vertical
          );
      }

      if (
        direction ===
        "center"
      ) {
        resetView();
        return;
      }

      render();
    }
  );

  /* ============================================================
     ZOOM CONTROLS
  ============================================================ */

  let zoomControls =
    stage.querySelector(
      ".vr-zoom-controls"
    );

  if (!zoomControls) {
    zoomControls =
      document.createElement(
        "div"
      );

    zoomControls.className =
      "vr-zoom-controls";

    zoomControls.innerHTML = `
      <button
        type="button"
        class="vr-zoom-btn"
        data-zoom="in"
        aria-label="Zoom in"
      >
        +
      </button>

      <button
        type="button"
        class="vr-zoom-btn"
        data-zoom="out"
        aria-label="Zoom out"
      >
        −
      </button>
    `;

    stage.appendChild(
      zoomControls
    );
  }

  zoomControls.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-zoom]"
        );

      if (!button) {
        return;
      }

      if (
        button.dataset.zoom ===
        "in"
      ) {
        fieldOfView -=
          7;
      } else {
        fieldOfView +=
          7;
      }

      fieldOfView =
        Math.max(
          35,
          Math.min(
            95,
            fieldOfView
          )
        );

      render();
    }
  );

  /* ============================================================
     AUTO ROTATE BUTTON
  ============================================================ */

  let autoButton =
    document.getElementById(
      "vrAutoRotate"
    );

  if (!autoButton) {
    autoButton =
      document.createElement(
        "button"
      );

    autoButton.id =
      "vrAutoRotate";

    autoButton.type =
      "button";

    autoButton.className =
      "vr-btn";

    const controls =
      modal.querySelector(
        ".vr-controls"
      );

    controls?.appendChild(
      autoButton
    );
  }

  const updateAutoButton =
    () => {
      autoButton.classList.toggle(
        "active",
        autoRotate
      );

      autoButton.setAttribute(
        "aria-pressed",
        String(autoRotate)
      );

      autoButton.textContent =
        autoRotate
          ? "Auto Rotate: On"
          : "Auto Rotate: Off";
    };

  autoButton.addEventListener(
    "click",
    () => {
      autoRotate =
        !autoRotate;

      updateAutoButton();
    }
  );

  updateAutoButton();

  /* ============================================================
     ANIMATION LOOP
  ============================================================ */

  const animate =
    (time) => {
      const delta =
        Math.min(
          50,
          time -
            lastFrameTime
        );

      lastFrameTime =
        time;

      if (
        viewerOpen &&
        autoRotate &&
        !dragging
      ) {
        yaw +=
          delta *
          0.003;
      }

      render();

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

  const startAnimation =
    () => {
      if (
        animationFrame
      ) {
        cancelAnimationFrame(
          animationFrame
        );
      }

      lastFrameTime =
        performance.now();

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

  /* ============================================================
     DAY / NIGHT
  ============================================================ */

  dayBtn?.addEventListener(
    "click",
    () => {
      stage.classList.remove(
        "is-night"
      );

      dayBtn.classList.add(
        "active"
      );

      nightBtn?.classList.remove(
        "active"
      );

      dayBtn.setAttribute(
        "aria-pressed",
        "true"
      );

      nightBtn?.setAttribute(
        "aria-pressed",
        "false"
      );
    }
  );

  nightBtn?.addEventListener(
    "click",
    () => {
      stage.classList.add(
        "is-night"
      );

      nightBtn.classList.add(
        "active"
      );

      dayBtn?.classList.remove(
        "active"
      );

      nightBtn.setAttribute(
        "aria-pressed",
        "true"
      );

      dayBtn?.setAttribute(
        "aria-pressed",
        "false"
      );
    }
  );

  /* ============================================================
     NARRATION
  ============================================================ */

  narrationBtn?.addEventListener(
    "click",
    async () => {
      if (!audio) {
        return;
      }

      if (!narrationPlaying) {
        try {
          await audio.play();

          narrationPlaying =
            true;

          narrationBtn.classList.add(
            "active"
          );

          narrationBtn.textContent =
            "Pause Narration";
        } catch (error) {
          console.warn(
            "Narration could not start:",
            error
          );
        }

        return;
      }

      audio.pause();

      narrationPlaying =
        false;

      narrationBtn.classList.remove(
        "active"
      );

      narrationBtn.textContent =
        "Cultural Narration";
    }
  );

  audio?.addEventListener(
    "ended",
    () => {
      narrationPlaying =
        false;

      narrationBtn?.classList.remove(
        "active"
      );

      if (narrationBtn) {
        narrationBtn.textContent =
          "Cultural Narration";
      }
    }
  );

  /* ============================================================
     FULLSCREEN
  ============================================================ */

  let fullscreenButton =
    document.getElementById(
      "vrFullscreen"
    );

  if (!fullscreenButton) {
    fullscreenButton =
      document.createElement(
        "button"
      );

    fullscreenButton.id =
      "vrFullscreen";

    fullscreenButton.type =
      "button";

    fullscreenButton.className =
      "vr-btn";

    fullscreenButton.textContent =
      "Fullscreen";

    const controls =
      modal.querySelector(
        ".vr-controls"
      );

    controls?.appendChild(
      fullscreenButton
    );
  }

  fullscreenButton.addEventListener(
    "click",
    async () => {
      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();

          return;
        }

        await modal.requestFullscreen();
      } catch (error) {
        console.warn(
          "Fullscreen unavailable:",
          error
        );
      }
    }
  );

  /* ============================================================
     OPEN VIEWER
  ============================================================ */

  const openViewer =
    () => {
      previousFocus =
        document.activeElement;

      modal.hidden =
        false;

      viewerOpen =
        true;

      document.body.classList.add(
        "vr-modal-open"
      );

      openBtn.setAttribute(
        "aria-expanded",
        "true"
      );

      if (
        !initializeThree()
      ) {
        return;
      }

      /*
       * Load the currently selected
       * panorama on first open.
       */
      if (
        !sphereMaterial.map
      ) {
        loadPanorama(
          currentDestination
        );
      }

      resize();

      startAnimation();

      window.setTimeout(
        () => {
          closeBtn?.focus();
        },
        80
      );
    };

  openBtn.addEventListener(
    "click",
    openViewer
  );

  /* ============================================================
     CLOSE VIEWER
  ============================================================ */

  const closeViewer =
    () => {
      modal.hidden =
        true;

      viewerOpen =
        false;

      document.body.classList.remove(
        "vr-modal-open"
      );

      openBtn.setAttribute(
        "aria-expanded",
        "false"
      );

      dragging =
        false;

      pointers.clear();

      if (audio) {
        audio.pause();

        audio.currentTime =
          0;
      }

      narrationPlaying =
        false;

      narrationBtn?.classList.remove(
        "active"
      );

      if (narrationBtn) {
        narrationBtn.textContent =
          "Cultural Narration";
      }

      previousFocus?.focus?.();
    };

  closeBtn?.addEventListener(
    "click",
    closeViewer
  );

  modal.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest?.(
          "[data-close]"
        )
      ) {
        closeViewer();
      }
    }
  );

  /* ============================================================
     ESCAPE
  ============================================================ */

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        !viewerOpen ||
        modal.hidden
      ) {
        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
        closeViewer();

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        yaw -=
          8;

        render();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        yaw +=
          8;

        render();
      }

      if (
        event.key ===
        "ArrowUp"
      ) {
        pitch =
          Math.min(
            82,
            pitch + 6
          );

        render();
      }

      if (
        event.key ===
        "ArrowDown"
      ) {
        pitch =
          Math.max(
            -82,
            pitch - 6
          );

        render();
      }

      if (
        event.key ===
        "+"
      ) {
        fieldOfView =
          Math.max(
            35,
            fieldOfView - 6
          );

        render();
      }

      if (
        event.key ===
        "-"
      ) {
        fieldOfView =
          Math.min(
            95,
            fieldOfView + 6
          );

        render();
      }

      if (
        event.key ===
        "r"
      ) {
        resetView();
      }
    }
  );

  /* ============================================================
     RESIZE LISTENER
  ============================================================ */

  window.addEventListener(
    "resize",
    resize
  );

})();