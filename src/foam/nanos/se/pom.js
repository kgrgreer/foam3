foam.POM({
  name: "se",
  files: [
    { name: "BannerView",
      flags: "web" },
    { name: "BannerData",
      flags: "java|js" },
    { name: "BannerTask",
      flags: "java|js" },
    { name: "SystemEvent",
      flags: "js|java" },
    { name: "SystemEventAgent",
      flags: "js|java" },
    // { name: "SystemEventServiceClient",
    //   flags: "js" }
    // { name: "SystemEventService",
    //   flags: "js|java" }
    // { name: "SystemEventServiceServer",
    //   flags: "js|java" }
    { name: "SystemEventTask",
      flags: "js|java" }
  ]
})
