/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
    { name: "SystemNotificationInlineBorder",
      flags: "web" },
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
    { name: "MessageTask",
      flags: "js|java" },
    { name: "test/EventRecordSystemEventTest",
      flags: "js|java" },
    { name: "test/SystemEventSystemNotificationThemeTest",
      flags: "js|java" }
  ]
})
