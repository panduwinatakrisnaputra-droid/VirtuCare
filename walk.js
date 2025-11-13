try {
        xr = await scene.createDefaultXRExperienceAsync({
          floorMeshes: [ground],
          disableTeleportation: true,
          cameraOptions:{
            checkCollisions: true,
            applyGravity: true,
            ellipsoid: new BABYLON.Vector3(0.5, 1, 0.5)
          }
        });
        console.log("✅ WebXR aktif");
        const xrCamera = xr.baseExperience.camera;
        xrCamera.position.y = 1;
        xrCamera.applyGravity = true;
        xrCamera.checkCollisions = true;

        xr.baseExperience.featuresManager.enableFeature(
          BABYLON.WebXRFeatureName.MOVEMENT,
          "latest",
          {
            xrInput: xr.input,
            movementSpeed: 0.1,
            rotationSpeed: 0.1,
            movementControls: ["right-xr-standard-thumbstick"],
            rotationControls: ["left-xr-standard-thumbstick"],
            useThumbstickForMovement: true,
            disableTeleportOnThumbstick: true,
            checkCollisions: true,
            applyGravity: true,
            ellipsoid: new BABYLON.Vector3(0.5, 1, 0.5)
          }
        );
      } catch (e) {
        console.warn("⚠️ WebXR tidak didukung, pakai mode biasa:", e);
        scene.activeCamera = camera;
        camera.applyGravity = true;
        camera.checkCollisions = true;
        
      }
      console.log("WebXR state: ", xr.baseExperience.state);
      console.log("Current Camera: ", scene.activeCamera);
