export default async function initXRMovement(scene, camera, ground) {
  try {
    // Aktifkan XR
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground],
      disableTeleportation: true, // pastikan teleport dimatikan
      optionalFeatures: true
    });

    console.log("✅ WebXR aktif");

    // Akses kamera VR
    const xrCamera = xr.baseExperience.camera;
    xrCamera.position.y = 1.7; // tinggi mata manusia
    xrCamera.checkCollisions = true;
    xrCamera.applyGravity = true;
    xrCamera.ellipsoid = new BABYLON.Vector3(0.5, 1.7, 0.5);

    // Aktifkan fitur locomotion pakai joystick
    xr.baseExperience.featuresManager.enableFeature(
      BABYLON.WebXRFeatureName.MOVEMENT,
      "latest",
      {
        xrInput: xr.input,
        movementSpeed: 0.08, // kecepatan jalan
        rotationSpeed: 0.1,  // kecepatan putar
        useThumbstickForMovement: true,
        disableTeleportOnThumbstick: true, // NON-TELEPORT
        checkCollisions: true,
        applyGravity: true,
        movementControls: ["left-xr-standard-thumbstick", "right-xr-standard-thumbstick"],
        rotationControls: ["left-xr-standard-thumbstick"],
        ellipsoid: new BABYLON.Vector3(0.5, 1.7, 0.5)
      }
    );

    // Logging state XR
    console.log("WebXR Movement Mode: locomotion aktif (tanpa teleport)");

    return xr;
  } catch (e) {
    console.warn("⚠️ WebXR gagal diaktifkan, pakai kamera biasa:", e);

    // Mode fallback: kamera biasa (non-VR)
    scene.activeCamera = camera;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.speed = 0.3;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1.7, 0.5);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 1.7, 0);

    return null;
  }
}
