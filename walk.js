export default async function initXRMovement(scene, camera, ground) {
  try {
    // Buat XR Experience
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground],
      disableTeleportation: true, // cegah teleport bawaan sebagian
    });

    const fm = xr.baseExperience.featuresManager;

    // 🔧 Matikan semua teleport feature kalau ada
    try {
      const teleport = fm.getEnabledFeature(BABYLON.WebXRFeatureName.TELEPORTATION);
      if (teleport) {
        teleport.detach();
        console.log("🚫 Teleport feature dimatikan sepenuhnya.");
      }
    } catch (err) {
      console.warn("Teleport feature tidak aktif sejak awal:", err);
    }

    // 🧍 Kamera XR (tinggi manusia)
    const xrCamera = xr.baseExperience.camera;
    xrCamera.position.y = 1.7;
    xrCamera.checkCollisions = true;
    xrCamera.applyGravity = true;
    xrCamera.ellipsoid = new BABYLON.Vector3(0.5, 1.7, 0.5);

    // 🎮 Aktifkan locomotion halus (tanpa teleport)
    fm.enableFeature(
      BABYLON.WebXRFeatureName.MOVEMENT,
      "latest",
      {
        xrInput: xr.input,
        movementSpeed: 0.08,
        rotationSpeed: 0.1,
        useThumbstickForMovement: true,
        disableTeleportOnThumbstick: true,
        movementControls: ["left-xr-standard-thumbstick", "right-xr-standard-thumbstick"],
        rotationControls: ["left-xr-standard-thumbstick"],
        applyGravity: true,
        checkCollisions: true,
        ellipsoid: new BABYLON.Vector3(0.5, 1.7, 0.5),
      }
    );

    console.log("✅ XR locomotion aktif tanpa teleport");

    return xr;

  } catch (e) {
    console.warn("⚠️ Gagal mengaktifkan WebXR, fallback ke kamera biasa:", e);

    scene.activeCamera = camera;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.speed = 0.3;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1.7, 0.5);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 1.7, 0);

    return null;
  }
}
