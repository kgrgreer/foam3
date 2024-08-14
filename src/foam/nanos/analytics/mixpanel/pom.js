foam.POM({
  name: "mixpanel",

  javaDependencies: [
    'com.mixpanel:mixpanel-java:1.5.2'
  ],

  files: [
    { name: "MixpanelService",                        flags: "java" },
    { name: "AddMixpanelUserProperty",                flags: "js|java" },
    { name: "CreateMixpanelProfileAction",            flags: "js|java" },
    { name: "MixpanelAnalyticEventAction",            flags: "js|java" }
  ]
});
