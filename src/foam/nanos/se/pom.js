foam.POM({
  name: "se",
  files: [
    { name: "SystemEvent",
      flags: "js|java" },
    { name: "SystemEventAgent",
      flags: "js|java" },
    { name: "SystemEventTask",
      flags: "js|java" },
    { name: "SystemNotification",
      flags: "java|js" },
    { name: "SystemNotificationService",
      flags: "js|java" },
    { name: "SystemNotificationServiceClient",
      flags: "js" },
    { name: "SystemNotificationServiceServer",
      flags: "js|java" },
    { name: "SystemNotificationTask",
      flags: "java|js" },
    { name: "SystemNotificationView",
      flags: "web" },
    { name: "test/EventRecordSystemEventTest",
      flags: "js|java" }
  ]
})
