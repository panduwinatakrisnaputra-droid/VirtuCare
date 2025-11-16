// ======================================
// PENTING: Anda harus memastikan file ini dimuat setelah babylon.js, 
// babylonjs.loaders.js, babylonjs.gui.js, babylonjs.materials.js, 
// dan cannon.js di HTML Anda.
// Anda juga perlu mendefinisikan fungsi setupGrabLogic di file lain atau di sini.
// Karena setupGrabLogic tidak ada, saya asumsikan ia berada di file lain.
// ======================================

// ================================
// Inisialisasi Engine & Canvas
// ================================
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// ================================
// Fungsi utama: Membuat Scene
// ================================
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.95);

    // --- VARIABEL UNTUK ITEM INTERAKSI (DIALIHKAN KE SCOPE LOKAL) ---
    // Variabel ini akan menampung referensi ke Wrapper Mesh yang sebenarnya.
    let thermometerMesh = null;
    let tensimeterMesh = null;

    // Misal pakai CannonJS
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    // ================================
    // Buat ground (lantai dunia)
    // ================================
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    ground.checkCollisions = true;
    ground.position.y = 0;

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
    );

    // ================================
    // Cahaya dan Arah
    // ================================
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 1;

    // ================================
    // Kamera sebagai "Player"
    // ================================
    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(-15, 2, 20), scene);
    camera.attachControl(canvas, true);
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    camera.checkCollisions = true;
    camera.speed = 0.2;
    camera.keysUp.push(87); camera.keysDown.push(83);
    camera.keysLeft.push(65); camera.keysRight.push(68);

    let xr = null;

    // ================================
    // Tambahkan Model + Collision
    // ================================
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "ruang_periksa.glb", scene
    ).then((result) => {
        if (result.meshes.length > 0) {
            result.meshes[0].position = new BABYLON.Vector3(-22.5, 0, 8);
            result.meshes[0].scaling = new BABYLON.Vector3(-0.5, 0.5, 0.5);
            result.meshes[0].getChildMeshes().forEach(mesh => {
                mesh.checkCollisions = true;
            });
        }
    }).catch((error) => { console.error("Gagal memuat model ruangan:", error); });

    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "Avatar_Virtucare.glb", scene)
        .then((result) => {
            const root = result.meshes[0];
            root.position = new BABYLON.Vector3(-19, 0.5, 28);
            root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
            root.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
            root.getChildMeshes().forEach((m) => { m.checkCollisions = true; });
        })
        .catch((e) => console.error("Gagal load Avatar:", e));

    // ================================
    // Aktifkan VR / XR Mode
    // ================================
    try {
        xr = await scene.createDefaultXRExperienceAsync({
            floorMeshes: [ground],
            disableTeleportation: true,
            cameraOptions:{
                checkCollisions: true,
                applyGravity: true,
                ellipsoid: new BABYLON.Vector3(0.5, 2, 0.5)
            }
        });
        console.log("✅ WebXR aktif");

        const xrCamera = xr.baseExperience.camera;
        xrCamera.position.y = 4;
        xrCamera.applyGravity = true;
        xrCamera.checkCollisions = true;

        xr.baseExperience.featuresManager.enableFeature(
            BABYLON.WebXRFeatureName.MOVEMENT,
            "latest",
            {
                xrInput: xr.input,
                movementSpeed: 0.1,
                rotationSpeed: 0.2,
                movementControls: ["left-xr-standard-thumbstick"],
                rotationControls: ["right-xr-standard-thumbstick"],
                useThumbstickForMovement: true,
                disableTeleportOnThumbstick: true,
                checkCollisions: true,
                applyGravity: true,
                ellipsoid: new BABYLON.Vector3(0.5, 2, 0.5)
            }
        );
    } catch (e) {
        console.warn("⚠️ WebXR tidak didukung:", e);
        xr = null;
        scene.activeCamera = camera;
        camera.applyGravity = true;
        camera.checkCollisions = true;
    }

    if (xr && xr.baseExperience) {
        console.log("WebXR state:", xr.baseExperience.state);
    } else {
        console.warn("WebXR tidak aktif");
    }

    const mejaCollision1= BABYLON.MeshBuilder.CreateBox("mejaCollision", {height: 0.5, width: 2, depth: 0.7}, scene);
    mejaCollision1.position = new BABYLON.Vector3(-17, 1, 27.5);
    mejaCollision1.isVisible = false;
    mejaCollision1.physicsImpostor = new BABYLON.PhysicsImpostor(
        mejaCollision1,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.2 },
        scene
    );

    // Pasien
    BABYLON.SceneLoader.ImportMesh("", "assets/", "pasien.glb", scene, function (meshes) {
        const rootMesh = meshes[0];
        rootMesh.position = new BABYLON.Vector3(-14.7, 1.2, 25.5);
        rootMesh.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
        rootMesh.rotation = new BABYLON.Vector3(3 * Math.PI / 2, 0, 3.2);
        rootMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            rootMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.4 }, // Mass 0 berarti statis
            scene
        );
    });

    // --- Pembuatan GUI Tampilan Pengukuran ---
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const tempText = new BABYLON.GUI.TextBlock("tempText", "");
    tempText.fontSize = 40;
    tempText.color = "yellow";
    tempText.isVisible = false;
    advancedTexture.addControl(tempText);

    const tensiText = new BABYLON.GUI.TextBlock("tensiText", ""); // Ubah nama id agar unik
    tensiText.fontSize = 40;
    tensiText.color = "cyan";
    tensiText.isVisible = false;
    advancedTexture.addControl(tensiText);

    // --- Efek Suara ---
    const beepSound = new BABYLON.Sound("beep", "audio/beep.mp3", scene, null, { loop: false, volume: 0.5 });
    const heartbeatSound = new BABYLON.Sound("heartbeat", "audio/detak jantung.mp3", scene, null, { loop: true, volume: 0.6 });
    
    // Invisible interaction points
    const chestTarget = BABYLON.MeshBuilder.CreateSphere("tChest", { diameter: 0.2 }, scene);
    chestTarget.position = new BABYLON.Vector3(-14.6, 1.3, 27);
    chestTarget.isVisible = false;

    const headTarget = BABYLON.MeshBuilder.CreateSphere("tHead", { diameter: 0.2 }, scene);
    headTarget.position = new BABYLON.Vector3(-14.6, 1.25, 27.5);
    headTarget.isVisible = false;

    const armTarget = BABYLON.MeshBuilder.CreateSphere("tArm", { diameter: 0.2 }, scene);
    armTarget.position = new BABYLON.Vector3(-14.25, 1.2, 27);
    armTarget.isVisible = false;

    // Tautkan GUI ke Target
    tempText.linkWithMesh(headTarget);
    tempText.linkOffsetY = -100;
    tensiText.linkWithMesh(armTarget);
    tensiText.linkOffsetY = -100;

    // Aktifkan Action Manager untuk semua target
    headTarget.actionManager = new BABYLON.ActionManager(scene);
    chestTarget.actionManager = new BABYLON.ActionManager(scene);
    armTarget.actionManager = new BABYLON.ActionManager(scene);

    let isProcessing = false;
    let isHeartbeatPlaying = false;
    
    // ===================================================
    // [PERBAIKAN TOTAL] Muat GLB dengan "Wrapper" Fisika
    // ===================================================

    // Tentukan ukuran box fisika (sesuaikan jika perlu)
    const itemPhysicsSize = 0.2; // 20cm
    const itemPhysicsMass = 0.01; // Massa ringan
    const startY = 2.0; // Ketinggian awal item

    /**
     * Fungsi Helper untuk memuat item grabbable dengan wrapper fisika
     * @returns {BABYLON.Mesh} Wrapper Mesh yang berisi PhysicsImpostor
     */
    function createGrabbableItem(name, glbFile, position, scaling, rotation) {
        // 1. Buat Wrapper Box (yang akan kena fisika)
        const wrapper = BABYLON.MeshBuilder.CreateBox(name + "Wrapper", {
            size: itemPhysicsSize // Ukuran box fisika
        }, scene);
        wrapper.position = position; // Posisi di dunia
        wrapper.isVisible = false; // Sembunyikan box fisika

        // 2. Tambahkan metadata ke WRAPPER
        wrapper.metadata = {
            isGrabbable: true,
            itemData: { title: name }
        };

        // 3. Tambahkan fisika ke WRAPPER
        wrapper.physicsImpostor = new BABYLON.PhysicsImpostor(
            wrapper,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: itemPhysicsMass, restitution: 0.4 },
            scene
        );

        // 4. Muat model GLB
        BABYLON.SceneLoader.ImportMesh("", "assets/", glbFile, scene, function (meshes) {
            const rootMesh = meshes[0];
            
            // 5. Parent-kan GLB ke WRAPPER
            rootMesh.setParent(wrapper);
            
            // 6. Atur posisi/skala/rotasi GLB RELATIF ke wrapper
            rootMesh.position = new BABYLON.Vector3(0, 0, 0); // Selalu (0,0,0) relatif ke parent
            rootMesh.scaling = scaling;
            if (rotation) {
                // Di sini Anda mungkin ingin menggunakan rotationQuaternion jika rotasinya kompleks
                // Untuk contoh ini, kita asumsikan Vector3 rotation
                rootMesh.rotation = rotation; 
            }
        });
        
        return wrapper; // <-- PENTING: Mengembalikan mesh yang benar
    }
    
    // --- Gunakan helper untuk memuat dan menangkap semua item ---
    
    createGrabbableItem("stethoscope", "stethoscope.glb", 
        new BABYLON.Vector3(-17, startY, 27.5), 
        new BABYLON.Vector3(0.0015, 0.0015, 0.0015)
    );
    

    // TANGKAP MESH TERMOMETER YANG BENAR
    thermometerMesh = createGrabbableItem("thermometer", "thermometer.glb", 
        new BABYLON.Vector3(-16.3, startY, 27.5), 
        new BABYLON.Vector3(0.25, 0.25, 0.25),
        new BABYLON.Vector3(80, 160, 0) // Rotasi
    );

    // TANGKAP MESH TENSIMETER YANG BENAR
    tensimeterMesh = createGrabbableItem("tensimeter", "tensimeter.glb", 
        new BABYLON.Vector3(-17.5, startY, 27.5), 
        new BABYLON.Vector3(0.3, 0.3, 0.3),
        new BABYLON.Vector3(-110, 160, 100) // Rotasi
    );

    // Infus (Static, mass 0)
    BABYLON.SceneLoader.ImportMesh("", "assets/", "infus.glb", scene, function (meshes) {
        const rootMesh = meshes[0];
        rootMesh.position = new BABYLON.Vector3(-11, 0.1, 27.5);
        rootMesh.scaling = new BABYLON.Vector3(0.04, 0.04, 0.04);
        rootMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            rootMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.4 },
            scene
        );
    });

    // =====================================
    // Logic Interaksi (Sudah diperbaiki)
    // =====================================

    // 1. Termometer ke Kepala (Suhu)
    headTarget.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            // **MENGGUNAKAN thermometerMesh YANG SUDAH TERDEFINISI**
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: thermometerMesh }, 
            function () {
                if (!isProcessing) {
                    isProcessing = true;
                    
                    // Jeda 1 detik (1000 ms)
                    setTimeout(() => {
                        beepSound.play();
                        const temperature = (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1);
                        tempText.text = `${temperature}°C`;
                        tempText.isVisible = true;

                        setTimeout(() => {
                            tempText.isVisible = false;
                            isProcessing = false;
                        }, 2000);
                        
                    }, 1000);
                }
            }
        )
    );
    
    // 2. Termometer ke Dada (Detak Jantung)
    chestTarget.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            // **MENGGUNAKAN thermometerMesh YANG SUDAH TERDEFINISI**
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: thermometerMesh }, 
            function () {
                if (!isProcessing && !isHeartbeatPlaying) {
                    isProcessing = true;
                    
                    // Jeda 1 detik (1000 ms)
                    setTimeout(() => {
                        heartbeatSound.play();
                        isHeartbeatPlaying = true;
                        isProcessing = false;
                        
                        // Berhenti setelah 3 detik
                        setTimeout(() => {
                            heartbeatSound.stop();
                            isHeartbeatPlaying = false;
                        }, 3000);
                        
                    }, 1000);
                }
            }
        )
    );

    // 3. Tensimeter ke Lengan Kanan (Tekanan Darah)
    armTarget.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            // **MENGGUNAKAN tensimeterMesh YANG SUDAH TERDEFINISI**
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: tensimeterMesh }, 
            function () {
                if (!isProcessing) {
                    isProcessing = true;
                    
                    // Jeda 1 detik (1000 ms)
                    setTimeout(() => {
                        const systolic = Math.floor(Math.random() * (130 - 100) + 100);
                        const diastolic = Math.floor(Math.random() * (85 - 65) + 65);
                        tensiText.text = `${systolic}/${diastolic} mmHg`;
                        tensiText.isVisible = true;

                        setTimeout(() => {
                            tensiText.isVisible = false;
                            isProcessing = false;
                        }, 2000);

                    }, 1000);
                }
            }
        )
    );

    // =====================================
    // UI & TYPEWRITER 
    // =====================================
    let currentState = 1;
    let dialogTitle;
    let dialogBody;
    let lanjutButton;
    let finalButtonsContainer;
    let charIndex = 0;
    let isTyping = false;
    let currentTextTarget = "";
    let typeObserver = null;
    const TYPING_SPEED = 3;

    // TEKS
    const TAHAP_1_JUDUL = "Halo, Calon Dokter!";
    const TAHAP_1_BODY = "Selamat Datang di Simulasi Pemeriksaan Pasien";
    const TAHAP_2_BODY = "Pasien baru saja datang ke ruang pemeriksaan dengan keluhan pusing dan lemas setelah berdiri lama. Lakukan pemeriksaan dasar untuk mengetahui penyebab keluhan pasien.";
    const TAHAP_3_JUDUL = "SIMULASI";
    const TAHAP_3_BODY = "AYO SIMULASI!!!";
    const TAHAP_4_BODY = "Langkah 1: Periksa detak jantung dan paru pasien menggunakan stetoskop";
    const TAHAP_5_BODY = "Langkah 2: Lanjutkan pemeriksaan tekanan darah menggunakan tensimeter digital.";
    const TAHAP_6_BODY = "Langkah 3: Pastikan pasien tidak mengalami infeksi dengan memeriksa suhu tubuh menggunakan termometer digital.";
    const TAHAP_7_BODY = "Pasien mengalami hipotensi ringan akibat kelelahan dan kurangnya asupan makanan. Tindakan yang diberikan adalah pemasangan infus cairan elektrolit untuk membantu menstabilkan tekanan darah pasien.";
    const TAHAP_8_BODY = "Simulasi selesai. Anda telah berhasil menangani pasien dengan kondisi hipotensi ringan.";

    // TYPEWRITER
    function typeWriterEffect(targetText, textBlock, scene, onComplete = () => {}) {
        if (isTyping && typeObserver) {
            scene.onBeforeRenderObservable.remove(typeObserver);
        }
        isTyping = true;
        charIndex = 0;
        currentTextTarget = targetText;
        textBlock.text = "";
        lanjutButton.isHitTestVisible = false;

        typeObserver = scene.onBeforeRenderObservable.add(() => {
            if (charIndex <= currentTextTarget.length) {
                if (scene.getEngine().frameId % TYPING_SPEED === 0) {
                    textBlock.text = currentTextTarget.substring(0, charIndex);
                    charIndex++;
                }
            } else {
                isTyping = false;
                scene.onBeforeRenderObservable.remove(typeObserver);
                typeObserver = null;
                onComplete();
            }
        });
    }

    // UI PLANE
    const uiPlane = BABYLON.MeshBuilder.CreatePlane("uiPlane", scene);
    uiPlane.position = new BABYLON.Vector3(-19, 3, 28);
    uiPlane.rotation.x = -0.2;
    uiPlane.scaling.scaleInPlace(4);

    const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
        uiPlane,
        3000,
        3000
    );

    // PANEL
    const mainPanel = new BABYLON.GUI.Rectangle("mainPanel");
    mainPanel.widthInPixels = 1920;
    mainPanel.heightInPixels = 1080;
    mainPanel.background = "rgba(20, 50, 130, 0.5)";
    mainPanel.cornerRadius = 50;
    mainPanel.thickness = 10;
    mainPanel.color = "white";
    adt.addControl(mainPanel);

    const stackPanel = new BABYLON.GUI.StackPanel();
    stackPanel.widthInPixels = 1800;
    mainPanel.addControl(stackPanel);

    dialogTitle = new BABYLON.GUI.TextBlock();
    dialogTitle.color = "#FFD700";
    dialogTitle.fontSizeInPixels = 90;
    dialogTitle.fontStyle = "bold";
    dialogTitle.heightInPixels = 150;
    dialogTitle.textWrapping = true;
    stackPanel.addControl(dialogTitle);

    dialogBody = new BABYLON.GUI.TextBlock();
    dialogBody.color = "white";
    dialogBody.fontSizeInPixels = 70;
    dialogBody.heightInPixels = 500;
    dialogBody.textWrapping = true;
    stackPanel.addControl(dialogBody);

    lanjutButton = BABYLON.GUI.Button.CreateSimpleButton("lanjut", "Lanjut");
    lanjutButton.widthInPixels = 500;
    lanjutButton.heightInPixels = 150;
    lanjutButton.background = "#5CB85C";
    lanjutButton.color = "white";
    lanjutButton.fontSizeInPixels = 50;
    lanjutButton.onPointerClickObservable.add(handleLanjutClick);
    stackPanel.addControl(lanjutButton);

    finalButtonsContainer = new BABYLON.GUI.StackPanel();
    finalButtonsContainer.isVertical = false;
    finalButtonsContainer.spacing = 50;
    finalButtonsContainer.isVisible = false;
    stackPanel.addControl(finalButtonsContainer);

    // STATE MACHINE
    function handleLanjutClick() {
        if (isTyping) return;
        currentState++;

        // State Machine logic... (dibiarkan seperti semula)
        if (currentState === 2) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_2_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true;
            });
        }
        if (currentState === 3) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_3_JUDUL, dialogTitle, scene, () => {
                typeWriterEffect(TAHAP_3_BODY, dialogBody, scene, () => {
                    lanjutButton.isHitTestVisible = true;
                });
            });
        }
        if (currentState === 4) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_4_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true;
            });
        }
        if (currentState === 5) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_5_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true;
            });
        }
        if (currentState === 6) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_6_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true;
            });
        }
        if (currentState === 7) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_7_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true;
            });
        }
        if (currentState === 8) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_8_BODY, dialogBody, scene, () => {
                 lanjutButton.textBlock.text = "Selesai";
                lanjutButton.isHitTestVisible = true;
                lanjutButton.onPointerClickObservable.clear(); // Hapus listener lama
                lanjutButton.onPointerClickObservable.add(() => {
                     // Logika setelah selesai
                     window.location.href = "index.html";
                     // Lakukan navigasi atau reset di sini
                     // window.location.href = "index.html";
                });
            });
        }
    }

    const grabBehavior = new BABYLON.SixDofDragBehavior();
    grabBehavior.allowMultiPointer = true;
    uiPlane.addBehavior(grabBehavior);

    typeWriterEffect(TAHAP_1_JUDUL, dialogTitle, scene, () => {
        typeWriterEffect(TAHAP_1_BODY, dialogBody, scene, () => {
            lanjutButton.isHitTestVisible = true;
        });
    });
    
    // Asumsi fungsi ini ada di file lain atau didefinisikan sebelumnya
    // setupGrabLogic(scene, xr); 

    setupGrabLogic(scene, xr);

    return scene;
};

// ================================
// Jalankan Scene
// ================================
createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());

// ======================================
// Catatan: Jika Anda belum mendefinisikan setupGrabLogic, Anda 
// akan mendapatkan error. Anda bisa menghapus baris pemanggilan 
// setupGrabLogic(scene, xr); jika belum siap.
// ======================================

