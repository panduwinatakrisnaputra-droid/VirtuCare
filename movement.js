// =======================================
// movement.js - VR Smooth Locomotion (Joystick)
// =======================================

export async function enableMovement(scene, xr) {
  console.log("🎮 VR Joystick Movement aktif");

  const xrCamera = xr.baseExperience.camera;

  // Kecepatan jalan
  const moveSpeed = 0.05;

  // Update tiap frame
  scene.onBeforeRenderObservable.add(() => {
    xr.input.controllers.forEach((controller) => {
      if (!controller || !controller.motionController) return;

      // Ambil joystick kiri (thumbstick)
      const thumbstick = controller.motionController.getComponent("xr-standard-thumbstick");
      if (!thumbstick) return;

      const x = thumbstick.axes.x; // kiri-kanan
      const y = thumbstick.axes.y; // depan-belakang

      if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
        // Arah kamera (biar jalan ke arah pandangan)
        const forward = xrCamera.getDirection(BABYLON.Vector3.Forward());
        const right = xrCamera.getDirection(BABYLON.Vector3.Right());

        // Kita hanya pakai arah horizontal (tidak naik-turun)
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();

        // Perpindahan posisi
        const move = forward.scale(-y * moveSpeed).add(right.scale(x * moveSpeed));
        xrCamera.position.addInPlace(move);
      }
    });
  });
}
