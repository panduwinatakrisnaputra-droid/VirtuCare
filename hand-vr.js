const xrHelper = scene.createDefaultXRExperienceAsync({
  handSupportOptions: {
    // options you want to change
  },
});
const featureManager = xrHelper.baseExperience.featuresManager;

featureManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", {
  xrInput: xrHelper.input,
  // other options
});
