// ================================
// Inisialisasi Engine & Canvas
// ================================
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// ======================================
// FUNGSI LOGIKA RESET (DIHAPUS DARI GLOBAL, DIMASUKKAN KE DALAM createScene)
// ======================================
const resetableObjects = [];

function performFullReset() {
    console.log("Melakukan Reset Barang...");

    resetableObjects.forEach(item => {
        const mesh = item.mesh;

        // 1. Reset Posisi
        // Gunakan set() untuk menyalin nilai dengan aman
        mesh.position.set(item.position.x, item.position.y, item.position.z);

        // 2. Reset Rotasi
        if (mesh.rotationQuaternion) {
            // Jika objek menggunakan Quaternion (lebih disarankan untuk fisika)
            mesh.rotationQuaternion.set(item.rotation.x, item.rotation.y, item.rotation.z, item.rotation.w);
        } else {
            // Jika objek menggunakan Euler Angles
            mesh.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
        }
        
        // 3. Reset Fisika
        if (mesh.physicsImpostor) {
            // Hentikan semua gerakan
            mesh.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            mesh.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            
            // Sinkronkan kembali posisi Impostor ke posisi mesh
            mesh.physicsImpostor.setDeltaPosition(item.position.subtract(mesh.position));
            if (mesh.rotationQuaternion) {
                 mesh.physicsImpostor.setDeltaRotation(mesh.rotationQuaternion);
            }
        }
    });
}
//======================================
// 3D reset posisi
//======================================
function animateButtonPress(buttonMesh) {
    const originalY = buttonMesh.position.y;
    // Nilai ini menentukan seberapa jauh tombol masuk.
const pressDistance = -0.04; 
const originalZ = buttonMesh.position.z; // <-- Simpan posisi Z awal

// 1. Animasi Tekan (Maju)
BABYLON.Animation.CreateAndStartAnimation(
    "pressAnim", 
    buttonMesh, 
    "position.z", // <-- GANTI DARI "position.y" MENJADI "position.z"
    30, 
    5, 
    originalZ, // <-- Gunakan Z awal
    originalZ + pressDistance, 
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
    new BABYLON.CubicEase()
);

// 2. Animasi Kembali 
setTimeout(() => {
    BABYLON.Animation.CreateAndStartAnimation(
        "releaseAnim", 
        buttonMesh, 
        "position.z", // <-- GANTI DARI "position.y" MENJADI "position.z"
        30, 
        15, 
        originalZ + pressDistance, 
        originalZ, // <-- Kembali ke Z awal
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.ElasticEase(0.5, 0.8)
    );
}, 100);
};

function createResetButton(scene, resetCallback, animateCallback) {
    // === 1. BASIS TOMBOL (Bagian statis) ===
    const buttonBase = BABYLON.MeshBuilder.CreateBox("resetBase", { size: 0.5, depth: 0.1 }, scene);
    buttonBase.position = new BABYLON.Vector3(-15.5, 2, 28.2); // Contoh lokasi di dekat UI
    buttonBase.material = new BABYLON.StandardMaterial("baseMat", scene);
    buttonBase.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // === 2. PLUNGER TOMBOL (Bagian yang ditekan) ===
    const resetButtonPlunger = BABYLON.MeshBuilder.CreateCylinder("resetButtonPlunger", { diameter: 0.4, height: 0.15 }, scene);
    // Posisikan sedikit di atas basis
    resetButtonPlunger.position = new BABYLON.Vector3(
        buttonBase.position.x, 
        buttonBase.position.y, 
        buttonBase.position.z + -0.05
    );
    resetButtonPlunger.rotation.y = buttonBase.rotation.y;

    resetButtonPlunger.rotation.y = Math.PI / 2; // Rotasi 90 derajat di sumbu Y (horizontal)
    resetButtonPlunger.rotation.x = 0;           // Rotasi di sumbu X
    resetButtonPlunger.rotation.z = Math.PI / 2;           // Rotasi di sumbu Z
    
    resetButtonPlunger.material = new BABYLON.StandardMaterial("plungerMat", scene);
    resetButtonPlunger.material.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1); // Merah

    // === 3. INTERAKSI MENGGUNAKAN ACTION MANAGER ===
    resetButtonPlunger.actionManager = new BABYLON.ActionManager(scene);

    // Tambahkan Aksi: Saat tombol di-klik (pointer pick)
    resetButtonPlunger.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger, 
            function (evt) {
                // Panggil fungsi reset dan animasi
                animateCallback(resetButtonPlunger);
                resetCallback();
            }
        )
    );
    
    return { buttonBase, resetButtonPlunger };
}
//=====================================
// Tombol Lobby
//=====================================

// ================================
// Fungsi utama: Membuat Scene
// ================================
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.95);

    // Misal pakai CannonJS
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    // Aktifkan sistem fisika dari file physics.js
    // Catatan: Pastikan file physics.js sudah dimuat di HTML Anda
    // await enablePhysics(scene); // Dikomentari, asumsikan sudah ada di skrip yang dimuat

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
    }).catch((error) => { console.error("Gagal memuat model:", error); });

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

    const mejaCollision1= BABYLON.MeshBuilder.CreateBox("mejaCollision", {height: 0.7, width: 2, depth: 0.7}, scene);
    mejaCollision1.position = new BABYLON.Vector3(-17, 1, 27.5);
    mejaCollision1.isVisible = false;
    mejaCollision1.physicsImpostor = new BABYLON.PhysicsImpostor(
        mejaCollision1,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.2 },
        scene
    );

    // Hapus deklarasi `initialPositions` yang lama (atau gunakan `resetableObjects` global)
    // const initialPositions = []; // Dihapus/diganti

    // ================================
    // Muat GLB dengan physics
    // ================================
    BABYLON.SceneLoader.ImportMesh("", "assets/", "pasien.glb", scene, function (meshes) {
        const rootMesh = meshes[0];
        // Pastikan objek pasien tidak ikut di-reset jika tidak dimaksudkan untuk bergerak
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

    // Invisible interaction points
    const chestTarget = BABYLON.MeshBuilder.CreateSphere("tChest", { diameter: 0.3 }, scene);
    chestTarget.position = new BABYLON.Vector3(-14.6, 1.3, 27);
    chestTarget.isVisible = false;

    const headTarget = BABYLON.MeshBuilder.CreateSphere("tHead", { diameter: 0.3 }, scene);
    headTarget.position = new BABYLON.Vector3(-14.6, 1.3, 27.5);
    headTarget.isVisible = false;

    const armTarget = BABYLON.MeshBuilder.CreateSphere("tArm", { diameter: 0.25 }, scene);
    armTarget.position = new BABYLON.Vector3(-14.1, 1.3, 26.7);
    armTarget.isVisible = false;

    // Stethoscope
    BABYLON.SceneLoader.ImportMesh("", "assets/", "stethoscope.glb", scene, function (meshes) {
        const rootMesh = meshes[0];
        rootMesh.position = new BABYLON.Vector3(-17, 1.5, 27.5);
        rootMesh.scaling = new BABYLON.Vector3(0.0015, 0.0015, 0.0015);
        // Penting: Objek bergerak (mass > 0) harus memiliki rotationQuaternion
        rootMesh.rotationQuaternion = rootMesh.rotation.toQuaternion(); 
        rootMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            rootMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 1, restitution: 0.4 },
            scene
        );
        // Simpan posisi awal ke array global `resetableObjects`
        resetableObjects.push({ mesh: rootMesh, position: rootMesh.position.clone(), rotation: rootMesh.rotationQuaternion.clone() });
    });
    
    // Tensimeter
    BABYLON.SceneLoader.ImportMesh("", "assets/", "tensimeter.glb", scene, function (meshes) {
        const rootMesh = meshes[0];
        rootMesh.position = new BABYLON.Vector3(-17.5, 1.5, 27.5);
        rootMesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
        // Atur rotasi di awal, lalu konversi ke Quaternion
        rootMesh.rotation = new BABYLON.Vector3(80, 160, 0); 
        rootMesh.rotationQuaternion = rootMesh.rotation.toQuaternion();
        rootMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            rootMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 1, restitution: 0.4 },
            scene
        );
        resetableObjects.push({ mesh: rootMesh, position: rootMesh.position.clone(), rotation: rootMesh.rotationQuaternion.clone() });
    });

    // Thermometer
    BABYLON.SceneLoader.ImportMesh("", "assets/", "thermometer.glb", scene, function (meshes) {
        const rootMesh = meshes[0];
        rootMesh.position = new BABYLON.Vector3(-16.3, 1.5, 27.5);
        rootMesh.scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);
        rootMesh.rotation = new BABYLON.Vector3(80, 160, 0);
        rootMesh.rotationQuaternion = rootMesh.rotation.toQuaternion();
        rootMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            rootMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 1, restitution: 0.4 },
            scene
        );
        resetableObjects.push({ mesh: rootMesh, position: rootMesh.position.clone(), rotation: rootMesh.rotationQuaternion.clone() });
        rootMesh.applyGravity = true;
    });

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

    // ===========================================
    // 📢 INTEGRASI TOMBOL RESET 3D DI SINI 📢
    // ===========================================
    createResetButton(scene, performFullReset, animateButtonPress);
    
    // HAPUS Tombol Reset UI yang lama
    // document.getElementById("resetButton").addEventListener("click", ...); // Dihapus

    // =====================================
    // UI & TYPEWRITER (Kode yang sama)
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
    const TAHAP_7_BODY = "Langkah 4: Berikan tindakan medis berupa pemasangan infus cairan elektrolit.";
    const TAHAP_8_BODY = "Pasien mengalami hipotensi ringan akibat kelelahan dan kurangnya asupan makanan. Tindakan yang diberikan adalah pemasangan infus cairan elektrolit untuk membantu menstabilkan tekanan darah pasien.";
    const TAHAP_9_BODY = "Simulasi selesai. Anda telah berhasil menangani pasien dengan kondisi hipotensi ringan.";

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

    const goToLobby = () => (window.location.href = "index.html");

    // STATE MACHINE
    function handleLanjutClick() {
        if (isTyping) return;
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
                
            });
        }
        if (currentState === 9) {
            dialogTitle.text = "";
            typeWriterEffect(TAHAP_9_BODY, dialogBody, scene, () => {
                lanjutButton.isHitTestVisible = true;
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

    
    return scene;
};

// ================================
// Jalankan Scene
// ================================
createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());