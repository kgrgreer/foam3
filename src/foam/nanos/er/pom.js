/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "er",
  files: [
    { name: "EventRecord",
      flags: "js|java" },
    { name: "EventRecordAlarmRuleAction",
      flags: "js|java" },
    { name: "EventRecordCitationView",
      flags: "js" },
    { name: "EventRecordDAO",
      flags: "js|java" },
    { name: "EventRecordResponseDAO",
      flags: "js|java" },
    { name: "EventRecordNotificationRuleAction",
      flags: "js|java" },
    { name: "EventRecordSystemEventRuleAction",
      flags: "js|java" },
    { name: "EventRecordResponse",
      flags: "js|java" },
    { name: "test/EventRecordTest",
      flags: "js|java" }
  ]
})
