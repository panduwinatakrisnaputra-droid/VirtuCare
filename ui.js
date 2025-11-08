const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
const scene = new BABYLON.Scene(engine);

            // Kamera dasar
const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1.6, 0), scene);
camera.setTarget(new BABYLON.Vector3(0, 1.6, 3));
camera.attachControl(canvas, true);

            // Lampu dasar
const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.8;

BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "RUANGAN FIX.glb", scene).then((result) => {
    result.meshes[0].position = new BABYLON.Vector3(0, 0, 0);
    
})
            // --- Setup XR (PERBAIKAN DI SINI) ---
            // Mengganti VRExperience dengan XRExperience
const xrHelper = await scene.createDefaultXRExperienceAsync({
    createDeviceOrientationCamera: false
});

            // --- Pembuatan UI ---

            // 1. Buat Mesh (Plane)
const uiPlane = BABYLON.MeshBuilder.CreatePlane("uiPlane", { width: 1, height: 1.2 }, scene);
uiPlane.position = new BABYLON.Vector3(0, 1.6, 2.5);
uiPlane.scaling.scaleInPlace(0.8); 

            // 2. Buat AdvancedDynamicTexture
const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(uiPlane);
            
            // 3. Buat Panel Utama
const mainPanel = new BABYLON.GUI.Rectangle("mainPanel");
mainPanel.widthInPixels = 1024;
mainPanel.heightInPixels = 1228;
mainPanel.background = "rgba(20, 50, 130, 0.75)";
mainPanel.cornerRadius = 30;
mainPanel.thickness = 4;
mainPanel.color = "white";
adt.addControl(mainPanel);

            // 4. Buat Ikon Palang Merah
const crossIcon = new BABYLON.GUI.Rectangle("crossIcon");
crossIcon.widthInPixels = 120;
crossIcon.heightInPixels = 120;
crossIcon.background = "#D9534F";
crossIcon.thickness = 0;
crossIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
crossIcon.positionZ=50;
crossIcon.paddingTopInPixels = 50;
mainPanel.addControl(crossIcon);

const vRect = new BABYLON.GUI.Rectangle();
vRect.widthInPixels = 30;
vRect.heightInPixels = 100;
vRect.background = "white";
vRect.thickness = 0;
crossIcon.addControl(vRect);
            
const hRect = new BABYLON.GUI.Rectangle();
hRect.widthInPixels = 100;
hRect.heightInPixels = 30;
hRect.background = "white";
hRect.thickness = 0;
crossIcon.addControl(hRect);

            // 5. Buat StackPanel
const stackPanel = new BABYLON.GUI.StackPanel("buttonStack");
stackPanel.width = "85%";
stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
stackPanel.paddingTopInPixels = 150;
mainPanel.addControl(stackPanel);

            // Fungsi helper untuk membuat tombol
const createButton = (name, text, color) => {
const button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
button.width = "100%";
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
            if (xrHelper.baseExperience.state === BABYLON.WebXRState.IN_XR) {
                xrHelper.baseExperience.exitXRAsync(); // API baru untuk keluar XR
                }
            }
        });
        return button;
    };

            // 6. Buat 3 Tombol
            const startButton = createButton("start", "Mulai Simulasi", "#5CB85C");
            const toolsButton = createButton("tools", "Alat Kesehatan", "#428BCA");
            const exitButton = createButton("exit", "Keluar", "#D9534F");

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