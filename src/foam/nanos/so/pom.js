/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "so",
  files: [
    { name: "SystemOutage",
      flags: "js|java" },
    { name: "SystemOutageAgent",
      flags: "js|java" },
    { name: "SystemOutageTask",
      flags: "js|java" },
    { name: "task/SystemOutageTaskInitPredicate",
      flags: "js|java" },
    { name: "task/SystemOutageTaskInitRuleAction",
      flags: "js|java" },
    { name: "task/PauseComplianceTransactionTask",
      flags: "js|java" },
    { name: "task/PauseComplianceTransactionRuleAction",
      flags: "js|java" },
    { name: "task/TaskRemovedPredicate",
      flags: "js|java" },
    { name: "task/CleanUpTaskRuleAction",
      flags: "js|java" },
    { name: "SystemNotification",
      flags: "java|js" },
    { name: "SystemNotificationBorder",
      flags: "web" },
    { name: "SystemNotificationService",
      flags: "js|java" },
    { name: "SystemNotificationServiceClient",
      flags: "js" },
    { name: "SystemNotificationServiceServer",
      flags: "js|java" },
    { name: "SystemNotificationTask",
      flags: "java|js" },
    { name: "MessageTask",
      flags: "js|java" },
    { name: "test/EventRecordSystemOutageTest",
      flags: "js|java" },
    { name: "test/SystemOutageSystemNotificationThemeTest",
      flags: "js|java" }
  ]
})
