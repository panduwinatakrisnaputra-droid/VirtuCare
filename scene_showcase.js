// scene_showcase.js

// 1. Bungkus semua dalam fungsi ini
async function createShowcaseScene(scene, engine, xr) {
    
    // 5. Buat array aset
    const assets = [];

    // HAPUS: const canvas = ...
    // HAPUS: const engine = ...
    // HAPUS: const createScene = ...
    // (scene, engine, xr sekarang adalah parameter)
    
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.95);

    // Aktifkan sistem fisika dari file physics.js
    await enablePhysics(scene); // Ini akan mengaktifkan fisika pada 'scene'
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0); // Pastikan gravitasi di-set jika enablePhysics tidak melakukannya

    // ================================
    // Buat ground (lantai dunia)
    // ================================
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    ground.checkCollisions = true;
    ground.position.y = 0.12;
    ground.isVisible = false;
    assets.push(ground); // Lacak

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
    assets.push(light); // Lacak

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 1;
    assets.push(dirLight); // Lacak

    // ================================
    // 4. HAPUS 'const camera = ...'
    // ================================
    
    // ================================
    // Tambahkan Model Ruangan + Collision
    // ================================
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "ruang_periksa.glb", scene 
    ).then((result) => {
        if (result.meshes.length > 0) {
            result.meshes[0].position = new BABYLON.Vector3(-7, 0, 8);
            result.meshes[0].scaling = new BABYLON.Vector3(-0.5, 0.5, 0.5);
            result.meshes[0].getChildMeshes().forEach(mesh => { 
                mesh.checkCollisions = true;
                });
            assets.push(result.meshes[0]); // Lacak
        }
    }).catch((error) => { console.error("Gagal memuat model:", error); });
      
    // ================================
    // 3. HAPUS 'let xr = null;'
    // 3. HAPUS 'try { xr = await scene.createDefaultXRExperienceAsync(... }'
    // 'xr' sudah disediakan oleh main.js
    // ================================
    
    // Cek jika tidak di XR, pastikan kamera desktop punya gravitasi
    if (!xr || xr.baseExperience.state === BABYLON.WebXRState.NOT_IN_XR) {
        if (scene.activeCamera.getClassName() === "UniversalCamera") {
             scene.activeCamera.applyGravity = true;
             scene.activeCamera.checkCollisions = true;
        }
    }

    // ================================================================
    // === MULAI KODE BARU: PEMUATAN ITEM & UI ===
    // ================================================================

    // 1. Database Item (Tidak berubah)
     const itemDatabase = [
          {
              id: "meshPerban",
              file: "perban.glb",
              title: "Perban",
              description: "Digunakan untuk membalut luka agar tetap bersih.",
              pos: new BABYLON.Vector3(0, 2, 7.8),
              scale: new BABYLON.Vector3(0.03, 0.03, 0.03),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.4, height: 0.4, depth: 0.4 },
              visualOffset: { x: 0, y: -0.2, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshOximeter",
              file: "oximeter.glb",
              title: "Pulse Oximeter",
              description: "Alat untuk mengukur saturasi oksigen dalam darah (SpO2).",
              pos: new BABYLON.Vector3(-17, 2, 9.7),
              scale: new BABYLON.Vector3(0.13, 0.13, 0.13),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.3, height: 0.3, depth: 0.5 },
              visualOffset: { x: 0, y: -0.15, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshGunting",
              file: "gunting medis.glb",
              title: "Gunting Medis",
              description: "Gunting steril untuk keperluan medis.",
              pos: new BABYLON.Vector3(-17, 2, 11.7),
              scale: new BABYLON.Vector3(0.015, 0.015, 0.015),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.2, height: 0.1, depth: 0.5 },
              visualOffset: { x: 0, y: -0.05, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshReflexHammer",
              file: "reflex hammer.glb",
              title: "Reflex Hammer",
              description: "Palu untuk menguji refleks tendon.",
              pos: new BABYLON.Vector3(-17, 2, 13.8),
              scale: new BABYLON.Vector3(3, 3, 3),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.2, height: 0.1, depth: 0.6 },
              visualOffset: { x: 0, y: -0.05, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshStethoscope",
              file: "stethoscope.glb",
              title: "Stetoskop",
              description: "Alat untuk mendengarkan suara internal tubuh.",
              pos: new BABYLON.Vector3(-17, 2, 15.6),
              scale: new BABYLON.Vector3(0.0015, 0.0015, 0.0015),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.4, height: 0.3, depth: 0.4 },
              visualOffset: { x: 0, y: -0.15, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshKasa",
              file: "kasa.glb",
              title: "Kain Kasa",
              description: "Kain steril untuk membersihkan atau menutup luka.",
              pos: new BABYLON.Vector3(-13, 2, 7.8),
              scale: new BABYLON.Vector3(5, 5, 5),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.4, height: 0.4, depth: 0.4 },
              visualOffset: { x: 0, y: -0.2, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshSuntik",
              file: "suntik.glb",
              title: "Alat Suntik (Syringe)",
              description: "Digunakan untuk menyuntikkan cairan ke dalam tubuh.",
              pos: new BABYLON.Vector3(-13, 2, 9.9),
              scale: new BABYLON.Vector3(0.001, 0.001, 0.001),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.1, height: 0.1, depth: 0.7 },
              visualOffset: { x: 0, y: -0.05, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshThermometer",
              file: "thermometer.glb",
              title: "Termometer",
              description: "Alat pengukur suhu tubuh.",
              pos: new BABYLON.Vector3(-13, 2, 11.7),
              scale: new BABYLON.Vector3(0.25, 0.25, 0.25),
              rotation: new BABYLON.Vector3(80, 160, 0),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.1, height: 0.1, depth: 0.5 },
              visualOffset: { x: 0, y: -0.05, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshTensimeter",
              file: "tensimeter.glb",
              title: "Tensimeter",
              description: "Alat pengukur tekanan darah.",
              pos: new BABYLON.Vector3(-13, 2, 13.8),
              scale: new BABYLON.Vector3(0.3, 0.3, 0.3),
              rotation: new BABYLON.Vector3(-75, -35, -80),
              physics: { mass: 1, restitution: 0.4 },
              physicsBox: { width: 0.4, height: 0.3, depth: 0.4 },
              visualOffset: { x: 0, y: -0.15, z: 0 } // y = -height / 2 (Sesuaikan!)
          },
          {
              id: "meshTiangInfus",
              file: "TIANG INFUS.glb",
              title: "Tiang Infus",
              description: "Tiang untuk menggantung kantung infus.",
              pos: new BABYLON.Vector3(-11, 0.1, 5.4),
              scale: new BABYLON.Vector3(0.04, 0.04, 0.04),
              physics: null, 
              physicsBox: null,
              visualOffset: { x: 0, y: 0, z: 0 } // Tidak perlu offset
          }
      ];

    // 2. Fungsi Helper untuk Memuat Model (Tidak berubah)
    async function loadItem(itemData) {
        const isGrabbable=itemData.id!=="meshTiangInfus";
          // Jika tidak ada data fisika, muat seperti biasa
          if (!itemData.physics || !itemData.physicsBox) {
              try {
                  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", itemData.file, scene);
                  const rootMesh = result.meshes[0];
                  rootMesh.name = itemData.id;
                  if (itemData.id === "meshTiangInfus") {
           console.log("--- DEBUG LOAD ITEM ---");
           console.log("Nama disetel ke:", rootMesh.name);
           console.log("Tipe Class:", rootMesh.getClassName());
           console.log("result.meshes[0]:", result.meshes[0]);
         }
                  if (isGrabbable){
                      rootMesh.isPickable=true;
                      rootMesh.metadata = { isGrabbable: true, itemData: itemData };
                  }
                  rootMesh.position = itemData.pos;
                  rootMesh.scaling = itemData.scale;
                  if (itemData.rotation) {
                      rootMesh.rotation = new BABYLON.Vector3(
                          BABYLON.Tools.ToRadians(itemData.rotation.x),
                          BABYLON.Tools.ToRadians(itemData.rotation.y),
                          BABYLON.Tools.ToRadians(itemData.rotation.z)
                      );
                  }
                  return rootMesh;
              } catch (e) {
                  console.error(`Gagal memuat item (non-fisika) ${itemData.file}:`, e);
                  return null;
              }
          }

          // --- Proses untuk Item DENGAN Fisika ---

          // 1. Buat Kotak Fisika (Wrapper)
          const physicsWrapper = BABYLON.MeshBuilder.CreateBox(`wrapper_${itemData.id}`, {
              width: itemData.physicsBox.width,
              height: itemData.physicsBox.height,
              depth: itemData.physicsBox.depth
          }, scene);

          // 2. Atur posisi Wrapper (TANPA ROTASI)
          physicsWrapper.position = itemData.pos;
          
          // Atur 'true' untuk melihat kotak fisika saat debugging
          physicsWrapper.isVisible = false; 

          // 3. Beri nama ID ke Wrapper (untuk UI link)
          physicsWrapper.name = itemData.id;

          if (isGrabbable){
              physicsWrapper.isPickable=true;
              physicsWrapper.metadata={
                isGrabbable:true,
                itemData:itemData
              };
          }

          // 4. Terapkan Fisika ke Wrapper
          physicsWrapper.physicsImpostor = new BABYLON.PhysicsImpostor(
              physicsWrapper,
              BABYLON.PhysicsImpostor.BoxImpostor, 
              itemData.physics, 
              scene
          );

          // 5. Muat Model GLB
          try {
              const result = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", itemData.file, scene);
              const rootMesh = result.meshes[0];

              // 6. Jadikan GLB sebagai anak dari Wrapper
              rootMesh.parent = physicsWrapper;
              
              // 7. Atur skala GLB
              rootMesh.scaling = itemData.scale;
              
              // 8. Atur posisi GLB *RELATIF* terhadap wrapper menggunakan offset manual
              rootMesh.position = new BABYLON.Vector3(
                  itemData.visualOffset.x,
                  itemData.visualOffset.y,
                  itemData.visualOffset.z
              );

              // 9. Terapkan rotasi ke model visual, BUKAN ke wrapper
              if (itemData.rotation) {
                  rootMesh.rotation = new BABYLON.Vector3(
                      BABYLON.Tools.ToRadians(itemData.rotation.x),
                      BABYLON.Tools.ToRadians(itemData.rotation.y),
                      BABYLON.Tools.ToRadians(itemData.rotation.z)
                  );
              }
              
          } catch (e) {
              console.error(`Gagal memuat item (fisika) ${itemData.file}:`, e);
          }

          // 10. Kembalikan Wrapper
          return physicsWrapper;
      }

    // 3. Jalankan Pemuatan (await)
    console.log("Memulai memuat semua item...");
    const loadPromises = itemDatabase.map(async (item) => {
        const loadedItem = await loadItem(item);
        if (loadedItem) {
            assets.push(loadedItem); // Lacak setiap item yang dimuat
        }
    });
    await Promise.all(loadPromises);
    console.log("✅ Semua 10 item berhasil dimuat.");
    
    // 4. Buat Kanvas dan Panel UI (Shared)
    const infoPlane = BABYLON.MeshBuilder.CreatePlane("infoPlane", {width: 1, height: 0.6}, scene);
    infoPlane.position = new BABYLON.Vector3(0, 0, 1.5); 
    infoPlane.isVisible = false; 
    assets.push(infoPlane); // Lacak

    // Tautkan panel ke kamera
    if (xr && xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
        infoPlane.parent = xr.input.xrCamera;
    } else {
        infoPlane.parent = scene.activeCamera; // Tautkan ke kamera aktif
    }
    
    // ... (Sisa kode pembuatan infoPanel, infoTitle, infoDesc, closeButton)
    const adtPanel = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(infoPlane);
    const infoPanel = new BABYLON.GUI.Rectangle("infoPanel");
    infoPanel.widthInPixels = 1000;
      infoPanel.heightInPixels = 600;
      infoPanel.cornerRadius = 50;
      infoPanel.color = "white";
      infoPanel.thickness = 10;
      infoPanel.background = "rgba(0, 0, 0, 0.8)";
    adtPanel.addControl(infoPanel);
    const infoTitle = new BABYLON.GUI.TextBlock("infoTitle");
    infoTitle.text = "Judul Benda";
      infoTitle.color = "white";
      infoTitle.fontSize = 50; // Font lebih besar untuk VR
      infoTitle.fontWeight = "bold";
      infoTitle.paddingTopInPixels = 30;
      infoTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    infoPanel.addControl(infoTitle);
    const infoDesc = new BABYLON.GUI.TextBlock("infoDesc");
    infoDesc.text = "Ini adalah deskripsi default...";
      infoDesc.color = "white";
      infoDesc.fontSize = 40; // Font lebih besar
      infoDesc.textWrapping = true;
      infoDesc.paddingTopInPixels = 150;
      infoDesc.paddingLeftInPixels = 40;
      infoDesc.paddingRightInPixels = 40;
      infoDesc.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    infoPanel.addControl(infoDesc);
    const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeBtn", "Tutup");
    closeButton.widthInPixels = 300;
      closeButton.heightInPixels = 100;
      closeButton.color = "white";
      closeButton.background = "grey";
      closeButton.fontSize = 40;
      closeButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      closeButton.paddingBottomInPixels = 30;
    infoPanel.addControl(closeButton);
    
    closeButton.onPointerClickObservable.add(() => {
        infoPlane.isVisible = false;
    });

    // 5. Fungsi Helper untuk Tampilkan Info (Tidak berubah)
    function showInfo(itemData) {
        // ... (Salin fungsi showInfo)
        infoTitle.text = itemData.title;
        infoDesc.text = itemData.description;
        infoPlane.isVisible = true;
    }

    // 6. Loop untuk Membuat Tombol Tautan 3D
    console.log("Memulai pembuatan UI tombol 3D...");
    itemDatabase.forEach(item => {
     // 1. Dapatkan NODE INDUK (WAJIB GANTI KE GETNODEBYNAME)
     const targetNode = scene.getNodeByName(item.id); // <-- INI DIA BIANG KEROKNYA

     // 2. Cek node (SEKARANG AKAN SUKSES UNTUK TIANG INFUS)
     if (targetNode) {
       
       // 3. Buat Tombol "i" 3D (sebagai plane kecil)
       const buttonPlane = BABYLON.MeshBuilder.CreatePlane(`btn_plane_${item.id}`, {size: 0.15}, scene);
        if (item.id === "meshTiangInfus") {
       console.log("--- DEBUG BAGIAN 6 ---");
       console.log("Mencari node dgn nama:", item.id);
       console.log("Hasil pencarian (targetNode):", targetNode);
     }
       // 4. Tautkan tombol ke 'targetNode'
       buttonPlane.parent = targetNode;

       // 5. Posisikan di atas PUSAT Bounding Box (Lebih Akurat)
       const boundingBox = targetNode.getHierarchyBoundingVectors(true); 
       const parentWorldPos = targetNode.getAbsolutePosition();

       const center_X_world = (boundingBox.min.x + boundingBox.max.x) / 2;
       const center_Z_world = (boundingBox.min.z + boundingBox.max.z) / 2;
       const top_Y_world = boundingBox.max.y;

       const relative_X = center_X_world - parentWorldPos.x;
       const relative_Y = top_Y_world - parentWorldPos.y;
       const relative_Z = center_Z_world - parentWorldPos.z;

       buttonPlane.position = new BABYLON.Vector3(
         relative_X,
         relative_Y + 0.3, // 0.3 meter di atas titik tertinggi
         relative_Z
       );

       // 6. Buat tombol "i" 3D
       let adtButton = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(buttonPlane);
       let btn = BABYLON.GUI.Button.CreateSimpleButton(`btn_gui_${item.id}`, "i");
       btn.widthInPixels = 800;
       btn.heightInPixels = 800;
       btn.cornerRadius = 500;
       btn.color = "white";
       btn.thickness = 8;
       btn.background = "blue";
       btn.fontSize = 400;
       adtButton.addControl(btn);
       
       // 7. Buat tombol selalu menghadap kamera
       buttonPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

       // 8. Tambahkan aksi klik
       btn.onPointerClickObservable.add(() => {
         showInfo(item);
       });
     } else {
       console.warn(`!!! GAGAL MENEMUKAN NODE UNTUK UI: "${item.id}" !!!`);
     }
   });

    // === KODE COLLISION BOX ASLI ===
    const mejaCollision1 = BABYLON.MeshBuilder.CreateBox("mejaCollision", {height: 1.6, width: 0.7, depth: 10}, scene);
    mejaCollision1.position = new BABYLON.Vector3(-17, 0.5, 12);
    mejaCollision1.isVisible = false;
    mejaCollision1.physicsImpostor = new BABYLON.PhysicsImpostor(mejaCollision1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    assets.push(mejaCollision1); // Lacak

    const mejaCollision2 = BABYLON.MeshBuilder.CreateBox("mejaCollision", {height: 1.6, width: 0.7, depth: 10}, scene);
    mejaCollision2.position = new BABYLON.Vector3(-13, 0.5, 12);
    mejaCollision2.isVisible = false;
    mejaCollision2.physicsImpostor = new BABYLON.PhysicsImpostor(mejaCollision2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    assets.push(mejaCollision2); // Lacak

    const infuscollision = BABYLON.MeshBuilder.CreateBox("infuscollision", {height: 5, width: 1.4, depth: 1}, scene);
    infuscollision.position = new BABYLON.Vector3(-13.1, 0, 5.5);
    infuscollision.isVisible = false;
    infuscollision.checkCollisions = true;
    assets.push(infuscollision); // Lacak

    setupVRInput(xr, scene); // Fungsi ini dari interactions.js
    const maskotPivot = await initMaskotAI(scene); // Fungsi ini dari mascotAI.js
    if (maskotPivot) {
        assets.push(maskotPivot); // Lacak pivot maskot
    }
    console.log("Maskot pivot berhasil dimuat:", maskotPivot);

    // --- (Sisa kode UI maskot, typewriter, panel konfirmasi, dll.)
    // ... (Semua variabel ini: currentState, dialogTitle, dll. disalin ke sini)
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
   const TAHAP_1_JUDUL = "Selamat Datang di Showcase VirtuCare!";
    const TAHAP_1_BODY = "Di sepanjang perjalanan, Anda akan menemukan berbagai alat medis yang menampilkan informasi dari setiap alat. Gunakan kesempatan ini untuk mengamati dan mengenali setiap alat yang dipamerkan.";
    const TAHAP_2_BODY = "Setelah kamu mengenal alat-alat ini, bersiaplah untuk memasuki simulasi praktik.Di sana, kamu akan diuji untuk menerapkan apa yang telah kamu pelajari dalam situasi yang menyerupai dunia nyata. Jika ada yang ditanyakan, jangan ragu untuk bertanya kepada aku ya!!";
    const TAHAP_3_TEXT_FULL = "Siap melakukan simulasi?";
    const TAHAP_4_BODY = "Baik, karena belum siap melakukan simulasi, silahkan menunggu sampai kamu siap untuk melakukan simulasi.";
    const TAHAP_5_BODY = "Baik, karena kamu sudah siap untuk melakukan simulasi, akan saya antarkan ke ruang pemeriksaan!";
    
    // --- FUNGSI TYPEWRITER EFFECT (TETAP SAMA) ---
    function typeWriterEffect(targetText, textBlock, scene, onComplete = () => {}) {
    // ... (Tidak ada perubahan di sini, sama seperti kode Anda)
    if (isTyping) {
        if (typeObserver) {
            scene.onBeforeRenderObservable.remove(typeObserver);
        }
    }
    isTyping = true;
    charIndex = 0;
    currentTextTarget = targetText;
    textBlock.text = ""; 
    if (lanjutButton) {
        lanjutButton.isHitTestVisible = false;
    }
    typeObserver = scene.onBeforeRenderObservable.add(() => {
        if (isTyping && charIndex <= currentTextTarget.length) {
            if (scene.getEngine().frameId % TYPING_SPEED === 0) { 
                textBlock.text = currentTextTarget.substring(0, charIndex);
                charIndex++;
            }
        } else if (isTyping) {
            textBlock.text = currentTextTarget;
            isTyping = false;
            scene.onBeforeRenderObservable.remove(typeObserver);
            typeObserver = null;
            onComplete(); 
        }
    });
}
    // --- PEMBUATAN UI ---
    const uiPlane = BABYLON.MeshBuilder.CreatePlane("uiPlane", scene);
    uiPlane.parent = maskotPivot;
    // ... (properti uiPlane)
    uiPlane.position = new BABYLON.Vector3(0, 2.2, 0); 
    uiPlane.rotation.x = -.5;
    uiPlane.rotation.y = -3.2;
    uiPlane.scaling.scaleInPlace(3);
    uiPlane.isVisible = true; 
    assets.push(uiPlane); // Lacak
    
    // ... (Sisa kode pembuatan ADT, mainPanel, stackPanel, dialogTitle, dialogBody, lanjutButton)
    const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(uiPlane, 3000, 3000);
    // ...
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

// 5A. Text Block untuk Judul
dialogTitle = new BABYLON.GUI.TextBlock("dialogTitle", "");
dialogTitle.color = "#FFD700"; 
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
    // --- MEMBUAT PLANE DAN ADT KEDUA UNTUK KONFIRMASI ---
    const uiPlaneConfirmation = BABYLON.MeshBuilder.CreatePlane("uiPlaneConfirmation", scene);
    // ... (properti uiPlaneConfirmation)
    uiPlaneConfirmation.position = new BABYLON.Vector3(0, 2, 11); 
    uiPlaneConfirmation.scaling.scaleInPlace(3);
    uiPlaneConfirmation.isVisible = false; 
    assets.push(uiPlaneConfirmation); // Lacak
    
    // ... (Sisa kode pembuatan adtConfirmation, confirmationPanel, confirmationStack, confirmationTitle, finalButtonsContainer)
    const adtConfirmation = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(uiPlaneConfirmation, 3000, 3000);
    // ...
    const confirmationPanel = new BABYLON.GUI.Rectangle("confirmationPanel");
confirmationPanel.widthInPixels = 1800; // Sedikit lebih ramping
confirmationPanel.heightInPixels = 700; // Lebih pendek
confirmationPanel.background = "rgba(50, 20, 130, 0.6)"; // Warna sedikit beda
confirmationPanel.cornerRadius = 50;
confirmationPanel.thickness = 10;
confirmationPanel.color = "white";
// --- DIMODIFIKASI --- Tambahkan ke ADT KEDUA
adtConfirmation.addControl(confirmationPanel);

// Buat StackPanel untuk confirmationPanel
const confirmationStack = new BABYLON.GUI.StackPanel("confirmationStack");
confirmationStack.widthInPixels = 1600;
confirmationStack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
confirmationPanel.addControl(confirmationStack);

// TextBlock untuk pertanyaan konfirmasi
const confirmationTitle = new BABYLON.GUI.TextBlock("confirmationTitle", "");
confirmationTitle.color = "white";
confirmationTitle.heightInPixels = 300;
confirmationTitle.fontSizeInPixels = 90;
confirmationTitle.paddingBottomInPixels = 50;
confirmationTitle.textWrapping = true;
confirmationTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
confirmationTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
confirmationStack.addControl(confirmationTitle);

// 7. Buat Container Tombol Akhir
finalButtonsContainer = new BABYLON.GUI.StackPanel("finalButtonsContainer");
finalButtonsContainer.isVertical = false;
finalButtonsContainer.heightInPixels = 150;
finalButtonsContainer.isVisible = true; 
finalButtonsContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
finalButtonsContainer.spacing = 50;
confirmationStack.addControl(finalButtonsContainer);
    // --- FUNGSI HELPER TOMBOL (Tidak Berubah) ---
    const createFinalButton = (name, text, color, onClickHandler) => {
        // ... (Salin fungsi createFinalButton)
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

    // HAPUS: const goToShowcase = () => { ... };
    
    // BARU: Fungsi 'goToSimulasi' sekarang memuat scene lain... tapi file 'simulasi.html'
    // tidak ada. Kita asumsikan ini akan memuat 'menu' lagi sebagai contoh.
    const goToSimulasi = () => {
        // INI JUGA HARUS DIUBAH
        // Seharusnya ini memanggil fungsi dari main.js
        // Untuk saat ini, kita biarkan, tapi ini akan menyebabkan 'freeze' lagi.
        window.location.href = "simulasi.html"; 
        
        // REKOMENDASI: Seharusnya ini memanggil fungsi callback
        // seperti 'onStartCallback' di menu, misalnya:
        // onStartSimulasiCallback(); 
    };

    // --- HANDLER TOMBOL AKHIR (Logika Diperbarui) ---
    const onSiapClick = () => { 
        // ... (Salin fungsi onSiapClick)
        // Perhatikan 'goToSimulasi()' di dalamnya.
        console.log("Memulai Simulasi..."); 
        currentState = 5;
        finalButtonsContainer.isVisible = false;
        confirmationTitle.heightInPixels = 500; // Beri ruang lebih
        confirmationTitle.fontSizeInPixels = 70; // Samakan font-size dgn dialogBody
        confirmationTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        typeWriterEffect(TAHAP_5_BODY, confirmationTitle, scene, () => {
            setTimeout(() => {
                goToSimulasi(); // <-- INI MASALAH BERIKUTNYA
            }, 1000);
        });   
    };
    
    const onBelumSiapClick = () => { 
        console.log("Belum siap diklik!"); 
        currentState = 4;
        // 1. Sembunyikan container tombol
        finalButtonsContainer.isVisible = false; 
        
        // 2. Ubah style teks agar muat untuk pesan panjang
        confirmationTitle.heightInPixels = 500;
        confirmationTitle.fontSizeInPixels = 70;
        confirmationTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        
        // 3. Ketik pesan TAHAP_4_BODY ("Baik, karena belum siap...")
        typeWriterEffect(TAHAP_4_BODY, confirmationTitle, scene, () => {
            
            // 4. (CALLBACK 1) Setelah pesan TAHAP 4 selesai:
            //    Tunggu 2 detik agar pesan bisa dibaca
            setTimeout(() => {
                
                // 5. Kembalikan style teks ke style pertanyaan awal
                confirmationTitle.heightInPixels = 300;
                confirmationTitle.fontSizeInPixels = 90;
                confirmationTitle.paddingBottomInPixels = 50; // Kembalikan padding
                confirmationTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

                // 6. Ketik ulang pertanyaan TAHAP_3_TEXT_FULL ("Siap simulasi?")
                typeWriterEffect(TAHAP_3_TEXT_FULL, confirmationTitle, scene, () => {
                    
                    // 7. (CALLBACK 2) Setelah pertanyaan selesai diketik ulang:
                    currentState = 3; // Kembalikan state ke 3 (tahap konfirmasi)
                    finalButtonsContainer.isVisible = true; // Munculkan lagi tombolnya
                });

            }, 2000);
        });
    };
        
    const onKeluarClick = () => { 
        console.log("Keluar diklik!");
        if (typeof xr !== 'undefined' && xr && xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            xr.baseExperience.exitXRAsync(); 
        }
    };

    // ... (Kode pembuatan startButton, toolsButton, exitButton)
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
        // TAHAP 2: (Logika tetap sama, masih di mainPanel)
        dialogTitle.text = ""; 
        dialogBody.heightInPixels = 700;
        dialogBody.fontSizeInPixels = 70;
        
        typeWriterEffect(TAHAP_2_BODY, dialogBody, scene, () => {
            lanjutButton.isHitTestVisible = true; 
        });

    } else if (currentState === 3) {
        // TAHAP 3: Tampilkan panel konfirmasi
        
        // 1. --- DIMODIFIKASI --- Sembunyikan MESH utama
        uiPlane.isVisible = false;
        
        // 2. --- DIMODIFIKASI --- Tampilkan MESH konfirmasi
        uiPlaneConfirmation.isVisible = true;
        
        // 3. Jalankan typewriter di textblock konfirmasi (confirmationTitle)
        typeWriterEffect(TAHAP_3_TEXT_FULL, confirmationTitle, scene, () => {
            // Selesai
        });
    }
    }
    
    // --- Membuat UI Dapat Di-"Grab" (Digeser) ---
    const grabBehavior = new BABYLON.PointerDragBehavior();
    grabBehavior.allowMultiPointer = false;
    uiPlane.addBehavior(grabBehavior);

    const grabBehavior2 = new BABYLON.SixDofDragBehavior();
    grabBehavior2.allowMultiPointer = true;
    uiPlaneConfirmation.addBehavior(grabBehavior2);

    
    // === MULAI ANIMASI PERTAMA DI SINI (TAHAP 1) ===
    typeWriterEffect(TAHAP_1_JUDUL, dialogTitle, scene, () => {
         typeWriterEffect(TAHAP_1_BODY, dialogBody, scene, () => {
        lanjutButton.isHitTestVisible = true;
    });
    });      
      
    // HAPUS: return scene;
    
    // 7. Kembalikan array aset
    return assets;
    
    // HAPUS: // <-- Akhir dari createScene
    // HAPUS: createScene().then(...)
    // HAPUS: engine.runRenderLoop(...)
    // HAPUS: window.addEventListener("resize", ...)
}