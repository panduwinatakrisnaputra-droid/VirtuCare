const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.gravity= new BABYLON.Vector3(0, -0.9, 0);
    scene.collisionsEnabled = true;
    
    // Setup Kamera dan Model
    const colliderMat = new BABYLON.StandardMaterial("colliderMat", scene);
    colliderMat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1);
    colliderMat.alpha = 0; 
            
    const ground = BABYLON.MeshBuilder.CreateGround("ground1", { width: 8.5, height: 50 }, scene);
    ground.position = new BABYLON.Vector3(1.8, 0.09, 0.5);
    ground.checkCollisions = true;
    ground.material = colliderMat;

    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 2, 0), scene);
    camera.attachControl(canvas, true);
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    camera.checkCollisions = true;
    camera.speed = 0.2;
    camera.keysUp.push(87); camera.keysDown.push(83); camera.keysLeft.push(65); camera.keysRight.push(68); 

    let xr = null;
    
    // Loading Model (Kode disederhanakan)
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "RUANGAN FIX.glb", scene 
    ).then((result) => {
        if (result.meshes.length > 0) {
            result.meshes[0].position = new BABYLON.Vector3(-2, 0, 8.5);
            result.meshes[0].scaling = new BABYLON.Vector3(-0.5, 0.5, 0.5);
            result.meshes[0].getChildMeshes().forEach(mesh => { 
                mesh.checkCollisions = true;
             });
        }
    }).catch((error) => { console.error("Gagal memuat model:", error); });
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "Avatar_Virtucare.glb", scene 
    ).then((result) => {
        if (result.meshes.length > 0) {
            result.meshes[0].position = new BABYLON.Vector3(0, .7, 2.7);
            result.meshes[0].scaling = new BABYLON.Vector3(.3, .3, .3);
            result.meshes[0].rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
            result.meshes[0].getChildMeshes().forEach(mesh => { 
                mesh.checkCollisions = true;
             });
        }
    }).catch((error) => { console.error("Gagal memuat model:", error); });
    // Setup XR (Kode disederhanakan)
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
            movementSpeed: 0,
            rotationSpeed: 0.1,
            movementControls: [],
            rotationControls: ["right-xr-standard-thumbstick"],
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
    
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // --- VARIABEL KONTROL UI DAN ANIMASI ---
    let currentState=1;
    let dialogTitle; // Judul terpisah (Halo, Calon Dokter!)
    let dialogBody; // Teks isi
    let lanjutButton;
    let finalButtonsContainer;
    let charIndex = 0;
    let isTyping = false;
    let currentTextTarget = "";
    let typeObserver=null;
    const TYPING_SPEED=3;

    // --- DATA TEKS DIPISAH ---
    const TAHAP_1_JUDUL = "Halo, Calon Dokter!";
    const TAHAP_1_BODY = "Kenalkan! aku PUKIMAK! Selamat datang di VirtuCare, sebuah dunia virtual yang dirancang untuk membawa lebih dekat dengan pengalaman medis yang sesungguhnya.";
    const TAHAP_2_BODY = "Saat ini, Anda berada di lobi VirtuCare, titik awal sebelum memulai pelatihan. Setiap interaksi dan setiap langkah yang diambil akan membawa semakin dekat menuju profesionalisme seorang tenaga medis.";
    const TAHAP_3_TEXT_FULL = "Siap melakukan simulasi?";
    const TAHAP_4_BODY = "Baik, karena belum siap melakukan simulasi, akan saya antarkan ke ruang showcase pengenalan alat medis dulu!";
    const TAHAP_5_BODY = "Baik, karena kamu sudah siap untuk melakukan simulasi, akan saya antarkan ke ruang pemeriksaan!";
    // --- FUNGSI TYPEWRITER EFFECT DENGAN CALLBACK ---
    function typeWriterEffect(targetText, textBlock, scene, onComplete = () => {}) {
        if (isTyping) {
            if (typeObserver) {
                scene.onBeforeRenderObservable.remove(typeObserver);
            }
        }
        
        isTyping = true;
        charIndex = 0;
        currentTextTarget = targetText;
        textBlock.text = ""; 

        // Nonaktifkan tombol Lanjut saat mengetik
        lanjutButton.isHitTestVisible = false;

        typeObserver = scene.onBeforeRenderObservable.add(() => {
            if (isTyping && charIndex <= currentTextTarget.length) {
                // Perbaikan: Menggunakan properti frameId
                if (scene.getEngine().frameId % TYPING_SPEED === 0) { 
                     textBlock.text = currentTextTarget.substring(0, charIndex);
                     charIndex++;
                }
            } else if (isTyping) {
                // Selesai mengetik
                textBlock.text = currentTextTarget;
                isTyping = false;
                
                scene.onBeforeRenderObservable.remove(typeObserver);
                typeObserver = null;
                
                // Panggil callback setelah selesai
                onComplete(); 
            }
        });
    }

    // --- PEMBUATAN UI ---
    
    // 1. Buat Mesh (Plane)
    const uiPlane = BABYLON.MeshBuilder.CreatePlane("uiPlane", scene);
    uiPlane.position = new BABYLON.Vector3(0, 2.8, 2.5);
    uiPlane.rotation.x = -.2;
    uiPlane.scaling.scaleInPlace(3);

    // 2. Buat AdvancedDynamicTexture
    const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(uiPlane, 3000, 3000);
            
    // 3. Buat Panel Utama
    const mainPanel = new BABYLON.GUI.Rectangle("mainPanel");
    mainPanel.widthInPixels = 2000;
    mainPanel.heightInPixels = 1300;
    mainPanel.background = "rgba(20, 50, 130, 0.5)";
    mainPanel.cornerRadius = 50;
    mainPanel.thickness = 10;
    mainPanel.color = "white";
    adt.addControl(mainPanel);

    // 5. Buat StackPanel
    const stackPanel = new BABYLON.GUI.StackPanel("buttonStack");
    stackPanel.widthInPixels = 1800;
    stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    mainPanel.addControl(stackPanel);

    // 5A. Text Block untuk Judul (Dibuat Bold dan Kuning)
    dialogTitle = new BABYLON.GUI.TextBlock("dialogTitle", "");
    dialogTitle.color = "#FFD700"; // Kuning Emas
    dialogTitle.heightInPixels = 150;
    dialogTitle.fontSizeInPixels = 90;
    dialogTitle.fontStyle = "bold"; 
    dialogTitle.textWrapping = true;
    dialogTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    dialogTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    stackPanel.addControl(dialogTitle);

    // 5B. Text Block untuk Isi
    dialogBody = new BABYLON.GUI.TextBlock("dialogBody", "");
    dialogBody.color = "white";
    dialogBody.heightInPixels = 500; 
    dialogBody.fontSizeInPixels = 70;
    dialogBody.paddingBottomInPixels = 10;
    dialogBody.textWrapping = true;
    dialogBody.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    dialogBody.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    stackPanel.addControl(dialogBody); 
    
    // 6. Buat Tombol "Lanjut"
    lanjutButton = BABYLON.GUI.Button.CreateSimpleButton("lanjut", "Lanjut");
    lanjutButton.widthInPixels = 500;
    lanjutButton.heightInPixels = 150;
    lanjutButton.background = "#5CB85C";
    lanjutButton.color = "white";
    lanjutButton.fontSizeInPixels = 50;
    lanjutButton.cornerRadius = 20;
    lanjutButton.paddingTopInPixels = 20;
    lanjutButton.thickness = 3;
    lanjutButton.onPointerClickObservable.add(handleLanjutClick);
    stackPanel.addControl(lanjutButton);

    // 7. Buat Container Tombol Akhir (Sembunyikan di awal)
    finalButtonsContainer = new BABYLON.GUI.StackPanel("finalButtonsContainer");
    finalButtonsContainer.isVertical = false;
    finalButtonsContainer.heightInPixels = 150;
    finalButtonsContainer.isVisible = false; 
    finalButtonsContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    finalButtonsContainer.spacing = 50;
    stackPanel.addControl(finalButtonsContainer);

    // Fungsi helper untuk membuat tombol
    const createFinalButton = (name, text, color, onClickHandler) => {
        const button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.widthInPixels = 500;
        button.heightInPixels = 100;
        button.background = color;
        button.color = "white";
        button.fontSizeInPixels = 40;
        button.cornerRadius = 20;
        button.thickness = 3;
        button.onPointerClickObservable.add(onClickHandler);
        return button;
    };
    const goToShowcase = () => {
        window.location.href = "showcase.html";
    };
    const goToPemeriksaan = () => {
        window.location.href = "pemeriksaan.html";
    };
    // Handler untuk tombol di Tahap 3
    const onSiapClick = () => { 
        console.log("Memulai Simulasi..."); 
        currentState = 5;
        finalButtonsContainer.isVisible = false; 
    
    // **BARU:** Kembalikan pengaturan TextBlock ke ukuran default untuk teks panjang
        dialogTitle.text = ""; // Kosongkan Judul
        dialogTitle.heightInPixels = 0; // Sembunyikan Judul
        dialogBody.heightInPixels = 700;
        dialogBody.fontSizeInPixels = 70;
    
    // **BARU:** Animasi teks baru, lalu navigasi setelah selesai
    typeWriterEffect(TAHAP_5_BODY, dialogBody, scene, () => {
        // Callback: Setelah TAHAP 4 selesai diketik, baru navigasi.
        setTimeout(() => {
            goToPemeriksaan();
        },1000)
        
    });  
    };
    const onBelumSiapClick = () => { 
        console.log("Belum siap diklik!"); 
        currentState = 4;
    
    // **BARU:** Sembunyikan container tombol akhir
    finalButtonsContainer.isVisible = false; 
    
    // **BARU:** Kembalikan pengaturan TextBlock ke ukuran default untuk teks panjang
    dialogTitle.text = ""; // Kosongkan Judul
    dialogTitle.heightInPixels = 0; // Sembunyikan Judul
    dialogBody.heightInPixels = 700;
    dialogBody.fontSizeInPixels = 70;
    
    // **BARU:** Animasi teks baru, lalu navigasi setelah selesai
    typeWriterEffect(TAHAP_4_BODY, dialogBody, scene, () => {
        // Callback: Setelah TAHAP 4 selesai diketik, baru navigasi.
        setTimeout(() => {
            goToShowcase();
        },1000)
        
    }); 
    };
    const onKeluarClick = () => { 
        console.log("Keluar diklik!"); 
        if (xr && xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            xr.baseExperience.exitXRAsync(); 
        }
    };

    // Buat dan tambahkan tombol akhir ke container
    const startButton = createFinalButton("start", "Siap!!", "#5CB85C", onSiapClick);
    const toolsButton = createFinalButton("tools", "Belum siap", "#428BCA", onBelumSiapClick);
    const exitButton = createFinalButton("exit", "Keluar", "#D9534F", onKeluarClick);

    finalButtonsContainer.addControl(startButton);
    finalButtonsContainer.addControl(toolsButton);
    finalButtonsContainer.addControl(exitButton);


    // --- FUNGSI LOGIKA PERGANTIAN TAHAP (HANDLE KLIK) ---
    function handleLanjutClick() {
        if (isTyping) return;
        currentState++;
        
        if (currentState === 2) {
            // TAHAP 2: Ganti teks di dialogBody dan animasikan
            dialogTitle.text = ""; // Kosongkan Judul
            dialogBody.heightInPixels = 700; // Beri ruang penuh pada Body
            dialogBody.fontSizeInPixels = 70;
            
            typeWriterEffect(TAHAP_2_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true; // Aktifkan tombol setelah Body selesai
            });

        } else if (currentState === 3) {
            // TAHAP 3: Teks simulasi
            dialogBody.heightInPixels = 300;
            dialogBody.paddingBottomInPixels = 50;
            dialogBody.fontSizeInPixels = 90;
            
            typeWriterEffect(TAHAP_3_TEXT_FULL, dialogBody, scene, () => {
                // Setelah Tahap 3 selesai, ganti tombol
                lanjutButton.isVisible = false;
                finalButtonsContainer.isVisible = true;
                // Tombol akhir sudah aktif secara default
            });
        }
    }
    
    // 7. --- Membuat UI Dapat Di-"Grab" (Digeser) ---
    const grabBehavior = new BABYLON.SixDofDragBehavior();
    grabBehavior.allowMultiPointer = true;
    uiPlane.addBehavior(grabBehavior);
    
    // === MULAI ANIMASI PERTAMA DI SINI (TAHAP 1) ===
    // Animasi Judul DULU, lalu Body
    typeWriterEffect(TAHAP_1_JUDUL, dialogTitle, scene, () => {
        // Callback: Setelah Judul selesai diketik
        typeWriterEffect(TAHAP_1_BODY, dialogBody, scene, () => {
            // Callback: Setelah Body selesai diketik
            lanjutButton.isHitTestVisible = true; // Aktifkan tombol Lanjut
        });
    }); 

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

