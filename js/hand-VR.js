// tangan-vr.js
// Modul A-Frame untuk tangan VR (grab, release, highlight, physics support)

// Pastikan sudah include aframe, super-hands, dan (opsional) aframe-physics-system di HTML

AFRAME.registerComponent("tangan-vr", {
  schema: {
    color: { type: "color", default: "#FFF" },
    showHelper: { type: "boolean", default: false },
  },

  init: function () {
    const el = this.el;
    const handSide = el.getAttribute("id").includes("left") ? "left" : "right";

    // Setup controller dan super-hands
    el.setAttribute("hand-controls", `hand: ${handSide}; handModelStyle: lowPoly; color: ${this.data.color}`);
    el.setAttribute("super-hands", "");
    el.setAttribute("stretchable", "");
    el.setAttribute("tool", "");

    // Collider bantu
    if (this.data.showHelper) {
      el.insertAdjacentHTML("beforeend", `<a-sphere radius="0.04" color="${this.data.color}" opacity="0.3"></a-sphere>`);
    } else {
      el.insertAdjacentHTML("beforeend", `<a-sphere radius="0.04" visible="false"></a-sphere>`);
    }

    // Event grab/release
    el.addEventListener("grab-start", (evt) => this.onGrab(evt));
    el.addEventListener("grab-end", (evt) => this.onRelease(evt));

    // Simpel highlight sistem (poll jarak)
    this.highlightInterval = setInterval(() => this.highlightNearby(), 200);
  },

  remove: function () {
    clearInterval(this.highlightInterval);
  },

  onGrab: function (evt) {
    const grabbed = evt.detail.grabbedEl;
    if (grabbed) {
      grabbed.setAttribute("material", "emissive", "#fff");
      grabbed.setAttribute("material", "emissiveIntensity", "0.5");
    }
  },

  onRelease: function (evt) {
    const released = evt.detail.releasedEl;
    if (released) {
      released.removeAttribute("material", "emissive");
      released.removeAttribute("material", "emissiveIntensity");
    }
  },

  highlightNearby: function () {
    const handPos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(handPos);

    document.querySelectorAll(".grabbable").forEach((o) => {
      const objPos = new THREE.Vector3();
      o.object3D.getWorldPosition(objPos);
      const dist = handPos.distanceTo(objPos);
      if (dist < 0.35) {
        o.setAttribute("material", "opacity", 0.7);
        o.setAttribute("material", "transparent", true);
      } else {
        o.setAttribute("material", "opacity", 1);
        o.setAttribute("material", "transparent", false);
      }
    });
  },
});
