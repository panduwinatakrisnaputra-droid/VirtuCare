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

    BABYLON.SceneLoader.ImportMeshAsync(
                "",                 // Nama mesh (biarkan "" untuk impor semua)
                "assets/",          // Path (folder) ke file model
                "ruang_periksa.glb",   // Nama file model
                scene               // Scene target
            ).then((result) => {
                // Model berhasil dimuat. 'result.meshes' adalah array
                // berisi semua mesh yang ada di dalam file glTF.
                
                // 'result.meshes[0]' biasanya adalah root node dari model
                if (result.meshes.length > 0) {
                    console.log("Model berhasil dimuat!");
                    // Contoh: Mengatur posisi model pertama
                    result.meshes[0].position = new BABYLON.Vector3(-2, 0, 7);
                    result.meshes[0].scaling = new BABYLON.Vector3(-0.5, 0.5, 0.4);
                    result.meshes[0].getChildMeshes().forEach(mesh => {
                        mesh.checkCollisions = true;
                    });
                }

            }).catch((error) => {
                console.error("Gagal memuat model:", error);
            });
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
            useThumbstickForMovement: false,
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
      

            // Lampu dasar
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.8;

            // --- Setup XR (PERBAIKAN DI SINI) ---

            // Mengganti VRExperience dengan XRExperience
            
            
            // box collision
            

            // ground collision
            
            // --- Pembuatan UI ---

            // 1. Buat Mesh (Plane)
            const uiPlane = BABYLON.MeshBuilder.CreatePlane("uiPlane", scene);
            uiPlane.position = new BABYLON.Vector3(0, 1.6, 2.5);
            uiPlane.scaling.scaleInPlace(3);

            // 2. Buat AdvancedDynamicTexture
            const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(uiPlane, 3000, 3000);
            
            // 3. Buat Panel Utama
            const mainPanel = new BABYLON.GUI.Rectangle("mainPanel");
            mainPanel.widthInPixels = 2000;
            mainPanel.heightInPixels = 900;
            mainPanel.background = "rgba(20, 50, 130, 0.5)";
            mainPanel.cornerRadius = 50;
            mainPanel.thickness = 10;
            mainPanel.color = "white";
            adt.addControl(mainPanel);

            // 4. Buat Ikon Palang Merah
            

            // 5. Buat StackPanel
            const stackPanel = new BABYLON.GUI.StackPanel("buttonStack");
            stackPanel.widthInPixels = 900;
            stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            mainPanel.addControl(stackPanel);

            // Fungsi helper untuk membuat tombol
            const createButton = (name, text, color) => {
                const button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
                button.widthInPixels = 500;
                button.heightInPixels = 150;
                button.background = color;
                button.color = "white";
                button.fontSizeInPixels = 50;
                button.cornerRadius = 20;
                button.paddingTopInPixels = 20;
                button.thickness = 3;

                // Event handler saat tombol diklik
                button.onPointerClickObservable.add(() => {
                    console.log(text + " diklik!");
                    if (name === "exit") {
                        // --- Logika Keluar (PERBAIKAN DI SINI) ---
                        // Cek apakah sedang dalam mode XR, lalu keluar
                        if (xr&&xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
                            xr.baseExperience.exitXRAsync(); // API baru untuk keluar XR
                        }
                    }
                    if (name==="start"){
                        // --- Logika Mulai (PERBAIKAN DI SINI) ---
                        // Masuk ke mode XR
                        window.location.href = "lain.html"; // API baru untuk masuk XR
                    }
                    if (name==="tools"){
                        window.location.href = "showcase.html";
                    }
                });
                return button;
            };

            // 6. Buat 3 Tombol
            const startButton = createButton("start", "Siap!!", "#5CB85C");
            const toolsButton = createButton("tools", "Belum siap", "#428BCA");
            const exitButton = createButton("exit", "Keluar", "#D9534F");

            const textintro1= new BABYLON.GUI.TextBlock("textintro1", "Selamat datang Calon Dokter Muda!");
            textintro1.color = "white";
            textintro1.heightInPixels =90;
            textintro1.fontSizeInPixels = 50;
            textintro1.paddingBottomInPixels = 30;
            textintro1.textWrapping = true;
            const textintro2= new BABYLON.GUI.TextBlock("textintro1", "Siap melakukan simulasi?");
            textintro2.color = "white";
            textintro2.heightInPixels =100;
            textintro2.fontSizeInPixels = 50;
            textintro2.paddingBottomInPixels = 30;
            textintro2.textWrapping = true;

            stackPanel.addControl(textintro1);
            stackPanel.addControl(textintro2);
            stackPanel.addControl(startButton);
            stackPanel.addControl(toolsButton);
            stackPanel.addControl(exitButton);

            // 7. --- Membuat UI Dapat Di-"Grab" (Digeser) ---
            const grabBehavior = new BABYLON.SixDofDragBehavior();
            grabBehavior.allowMultiPointer = true;
            uiPlane.addBehavior(grabBehavior);

            
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
        


