const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);

        const createScene = async function () {
            const scene = new BABYLON.Scene(engine);
            scene.gravity= new BABYLON.Vector3(0, -0.9, 0);
            scene.collisionsEnabled = true;
            // Kamera dasar
        //material collision
            const colliderMat = new BABYLON.StandardMaterial("colliderMat", scene);
            colliderMat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1);
            colliderMat.alpha = 0; // transparan biar kelihatan collidernya
            
    const ground = BABYLON.MeshBuilder.CreateGround("ground1", { width: 8.5, height: 50 }, scene);
    ground.position = new BABYLON.Vector3(1.8, 0.09, 0.5);
    ground.checkCollisions = true;
    ground.material = colliderMat;
// Kamera biasa (tanpa XR)
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 2, 0), scene);
        camera.attachControl(canvas, true);
        camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
        camera.checkCollisions = true;
        camera.speed = 0.2;

        camera.keysUp.push(87);  // W
        camera.keysDown.push(83); // S
        camera.keysLeft.push(65); // A
        camera.keysRight.push(68); // D    
            let xr = null;
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

      // === Gerakan Joystick (hanya aktif jika XR berhasil) ===

            // --- Setup XR (PERBAIKAN DI SINI) ---

            // Mengganti VRExperience dengan XRExperience
            
            
            // box collision
            

            // ground collision
            
            // --- Pembuatan UI ---

            
            return scene;
    
        };

        // Render loop
        createScene().then((scene) => {
            engine.runRenderLoop(function () {
                if (scene) {
                    scene.render();
                }
            });
        });

        // Resize canvas saat jendela diubah ukurannya
        window.addEventListener("resize", function () {
            engine.resize();
        });
        
