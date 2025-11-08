// vr-hands.js
export async function setupVRHands(scene, grabbableMeshes = [], ground = null) {
  // --- Aktifkan VR / WebXR ---
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: ground ? [ground] : []
  });

  // --- Log controller & tangan yang muncul ---
  xr.input.onControllerAddedObservable.add(controller => {
    console.log("Controller connected:", controller.inputSource.handedness);

    // Untuk model tangan default (Oculus Quest, dsb)
    if (controller.motionController) {
      controller.motionController.onModelLoadedObservable.add(model => {
        model.meshes.forEach(m => m.scaling.scaleInPlace(1.2)); // sedikit perbesar tangan
      });
    }

    // --- Sistem Grab & Release ---
    let grabbedMesh = null;

    controller.onMotionControllerInitObservable.add(motionController => {
      const squeeze = motionController.getComponent("xr-standard-squeeze");

      squeeze.onButtonStateChangedObservable.add(() => {
        if (squeeze.changes.pressed && squeeze.pressed) {
          // Cari objek terdekat untuk di-grab
          const pick = scene.pickWithRay(controller.getForwardRay(0.5), mesh =>
            grabbableMeshes.includes(mesh)
          );
          if (pick && pick.pickedMesh) {
            grabbedMesh = pick.pickedMesh;
            grabbedMesh.setParent(controller.grip);
          }
        } else if (squeeze.changes.pressed && !squeeze.pressed && grabbedMesh) {
          // Lepaskan
          grabbedMesh.setParent(null);
          grabbedMesh = null;
        }
      });
    });
  });

  return xr;
}
