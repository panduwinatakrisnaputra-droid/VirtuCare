
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
    let thermometerMesh = null;
    let tensimeterMesh = null;
    let stethoscopeMesh = null;

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
// Tampilkan 3 Gambar PNG sebagai Billboard
// ================================

function createPngBillboard(name, filename, position, size, scene) {
    // 1. Buat bidang 3D (Plane)
    const plane = BABYLON.MeshBuilder.CreatePlane(name, { width: size, height: size * 0.75 }, scene);
    plane.position = position;
    // plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL; // Opsional: membuat bidang selalu menghadap kamera

    // 2. Buat Material Baru
    const material = new BABYLON.StandardMaterial(name + "Mat", scene);
    
    // 3. Muat Tekstur dari file PNG
    const texture = new BABYLON.Texture("assets/" + filename, scene);
    material.diffuseTexture = texture;
    material.diffuseTexture.hasAlpha = true; // Penting jika gambar Anda memiliki transparansi
    material.backFaceCulling = false; // Agar gambar terlihat dari kedua sisi

    // Membuat gambar memancarkan cahaya sendiri agar terlihat terang
    material.emissiveColor = new BABYLON.Color3(1, 1, 1); // Warna putih penuh untuk kecerahan maksimal

    // 4. Aplikasikan Material ke Plane
    plane.material = material;
    return plane;
}

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

    const StethoText = new BABYLON.GUI.TextBlock("StethoText", ""); 
    StethoText.fontSize = 40;
    StethoText.color = "maroon";
    StethoText.isVisible = false;
    advancedTexture.addControl(StethoText);

    const tensiText = new BABYLON.GUI.TextBlock("tensiText", ""); 
    tensiText.fontSize = 40;
    tensiText.color = "cyan";
    tensiText.isVisible = false;
    advancedTexture.addControl(tensiText);

    // --- Efek Suara ---
    // Pastikan path audio/ sudah benar
    const beepSound = new BABYLON.Sound("beep", "audio/beep.mp3", scene, null, { loop: false, volume: 1 }); 
    const heartbeatSound = new BABYLON.Sound("heartbeat", "audio/detak jantung.mp3", scene, null, { loop: true, volume: 1 });
    
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
    StethoText.linkWithMesh(chestTarget);
    StethoText.linkOffsetY = -100;

    // Aktifkan Action Manager untuk semua target
    headTarget.actionManager = new BABYLON.ActionManager(scene);
    chestTarget.actionManager = new BABYLON.ActionManager(scene);
    armTarget.actionManager = new BABYLON.ActionManager(scene);

    let isProcessing = false;
    let isHeartbeatPlaying = false;
    
    // ===================================================
    // Muat GLB dengan "Wrapper" Fisika
    // ===================================================

    const itemPhysicsSize = 0.2; // 20cm
    const itemPhysicsMass = 0.01; // Massa ringan
    const startY = 2.0; // Ketinggian awal item

    /**
     * Fungsi Helper untuk memuat item grabbable dengan wrapper fisika
     */
    function createGrabbableItem(name, glbFile, position, scaling, rotation) {
        // 1. Buat Wrapper Box (yang akan kena fisika)
        const wrapper = BABYLON.MeshBuilder.CreateBox(name + "Wrapper", {
            size: itemPhysicsSize 
        }, scene);
        wrapper.position = position; 
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
            rootMesh.position = new BABYLON.Vector3(0, 0, 0); 
            rootMesh.scaling = scaling;
            if (rotation) {
                rootMesh.rotation = rotation; 
            }
        });
        
        return wrapper; 
    }
    
    
    // --- Gunakan helper untuk memuat dan menangkap semua item ---
    
    stethoscopeMesh = createGrabbableItem("stethoscope", "stethoscope.glb", 
        new BABYLON.Vector3(-17, startY, 27.5), 
        new BABYLON.Vector3(0.0015, 0.0015, 0.0015)
    );
    

    thermometerMesh = createGrabbableItem("thermometer", "thermometer.glb", 
        new BABYLON.Vector3(-16.3, startY, 27.5), 
        new BABYLON.Vector3(0.25, 0.25, 0.25),
        new BABYLON.Vector3(80, 160, 0)
    );

    tensimeterMesh = createGrabbableItem("tensimeter", "tensimeter.glb", 
        new BABYLON.Vector3(-17.5, startY, 27.5), 
        new BABYLON.Vector3(0.3, 0.3, 0.3),
        new BABYLON.Vector3(-110, 160, 100)
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
    // Logic Interaksi 
    // =====================================

    // 1. Termometer ke Kepala (Beep Suhu)
    headTarget.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: thermometerMesh }, 
            function () {
                if (!isProcessing) {
                    isProcessing = true;
                    // Jeda 1 detik sebelum beep dan menampilkan hasil
                    setTimeout(() => {
                        beepSound.play(); // 🔊 SUARA BEEP
                        const temperature = (36.4).toFixed(1);
                        tempText.text = `${temperature}°C`;
                        tempText.isVisible = true;
                        // Tambahkan gambar 1
                        createPngBillboard(
                            "image1", 
                            "SuhuTubuh.png", 
                            new BABYLON.Vector3(-17.5, 2.5, 28.15), // Posisi di samping meja
                            1, // Ukuran lebar bidang
                            scene
                        );
                        setTimeout(() => {
                            tempText.isVisible = false;
                            isProcessing = false;
                        }, 2000);
                        
                    }, 1000);
                }
            }
        )
    );
    
    // 2. Stetoskop ke Dada (Heartbeat Sound)
    chestTarget.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: stethoscopeMesh }, 
            function () {
                if (!isProcessing && !isHeartbeatPlaying) {
                    isProcessing = true;
                    
                    // Jeda 1 detik sebelum suara dimulai
                    setTimeout(() => {
                        const BPM = (50).toFixed(1);
                        StethoText.text = `${BPM} BPM`;
                        StethoText.isVisible = true;
                        // Tambahkan gambar 2
                        createPngBillboard(
                            "image2", 
                            "DetakJantung.png", 
                            new BABYLON.Vector3(-17, 2, 28.15), 
                            1, 
                            scene
                        );

                        setTimeout(() => {
                            StethoText.isVisible = false;
                            isProcessing = false;
                        }, 2000);
                    }, 1000);
                }
            }
        )
    );

    // 3. Tensimeter ke Lengan Kanan (Tekanan Darah)
    armTarget.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: tensimeterMesh }, 
            function () {
                if (!isProcessing) {
                    isProcessing = true;
                    setTimeout(() => {
                        const systolic = Math.floor(90);
                        const diastolic = Math.floor(60);
                        tensiText.text = `${systolic}/${diastolic} mmHg`;
                        tensiText.isVisible = true;
                        // Tambahkan gambar 3
                        createPngBillboard(
                            "image3", 
                            "TekananDarah.png", 
                            new BABYLON.Vector3(-16.5, 2.5, 28.15), 
                            1, 
                            scene
                        );

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
        
        // **PERBAIKAN SUARA:** Buka kunci Audio Context pada klik pertama
        if (currentState === 1) { 
            if (engine.audioEngine && !engine.audioEngine.isUnlocked) {
                engine.audioEngine.unlock();
                console.log("Audio Context unlocked on first click.");
            }
        }

        currentState++;

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
                     window.location.href = "index.html"; // Navigasi kembali
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
    
    
    // Pemanggilan fungsi grabLogic (didefinisikan di grabLogic.js)
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
