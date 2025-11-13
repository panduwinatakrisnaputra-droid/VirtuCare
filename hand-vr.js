// Pastikan kamu sudah punya scene Babylon.js dan engine sebelumnya
// Contoh: const scene = new BABYLON.Scene(engine);

async function createXRExperience(scene) {
  // Buat pengalaman XR dasar
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [scene.getMeshByName("ground")], // jika ada ground
  });

  const xrInput = xr.input; // akses input dari kontroler

  // ==== Tambahkan event listener untuk kontroler VR ====
  xrInput.onControllerAddedObservable.add((controller) => {
    console.log("Kontroler terdeteksi:", controller.inputSource.handedness);

    // Buat bola kecil untuk menandai posisi tangan
    const pointerSphere = BABYLON.MeshBuilder.CreateSphere(
      "pointer-" + controller.inputSource.handedness,
      { diameter: 0.05 },
      scene
    );
    pointerSphere.material = new BABYLON.StandardMaterial("pointerMat", scene);
    pointerSphere.material.emissiveColor = new BABYLON.Color3(0, 1, 1);

    // Update posisi bola mengikuti tangan
    controller.onMotionControllerInitObservable.add((motionController) => {
      const grip = motionController.rootMesh;
      scene.onBeforeRenderObservable.add(() => {
        pointerSphere.position.copyFrom(grip.position);
      });

      // Deteksi trigger (ambil/lepas)
      const trigger = motionController.getComponent("xr-standard-trigger");
      if (trigger) {
        trigger.onButtonStateChangedObservable.add(() => {
          if (trigger.pressed) {
            grabObject(scene, grip);
          } else {
            releaseObject(scene);
          }
        });
      }

      // Deteksi squeeze (bisa digunakan untuk interaksi lain)
      const squeeze = motionController.getComponent("xr-standard-squeeze");
      if (squeeze) {
        squeeze.onButtonStateChangedObservable.add(() => {
          if (squeeze.pressed) {
            console.log("Squeeze ditekan");
          }
        });
      }
    });
  });

  console.log("XR Ready ✅");
  return xr;
}

// === Fungsi Grab dan Release sederhana ===
let grabbedObject = null;

function grabObject(scene, grip) {
  const pick = scene.pickWithRay(new BABYLON.Ray(grip.position, grip.forward, 0.2));

  if (pick && pick.pickedMesh && pick.pickedMesh.name !== "ground") {
    grabbedObject = pick.pickedMesh;
    grabbedObject.setParent(grip);
    console.log("Ambil:", grabbedObject.name);
  }
}

function releaseObject(scene) {
  if (grabbedObject) {
    grabbedObject.setParent(null);
    console.log("Lepas:", grabbedObject.name);
    grabbedObject = null;
  }
}

// === Contoh inisialisasi Scene dan panggil XR ===
window.addEventListener("DOMContentLoaded", async function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  // Kamera & cahaya
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 3,
    5,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Ground & objek contoh
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
  const box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.3 }, scene);
  box.position.y = 0.15;

  await createXRExperience(scene);

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
});
