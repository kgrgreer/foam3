/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er.test',
  name: 'EventRecordTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test EventRecord generates alarm and notification',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.er.EventRecord',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.email.EmailMessage',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      DAO erDAO = (DAO) x.get("eventRecordDAO");
      String s = "EventRecordTest";

      EventRecord er = new EventRecord();
      er.setEvent(s);
      er.setCode(s);
      er.setMessage(s);
      er.setPartner(s);
      er.setSeverity(LogLevel.ERROR);
      er = (EventRecord) erDAO.put_(x, er);

      Thread.sleep(3000);

      // test for alarm
      Alarm alarm = (Alarm) ((DAO) x.get("localAlarmDAO")).find(EQ(Alarm.NAME, er.toSummary()));
      test( alarm != null, "alarm exists");
      test ( alarm.getIsActive(), "Alarm active");

      er = new EventRecord();
      er.setEvent(s);
      er.setCode(s);
      er.setMessage(s);
      er.setPartner(s);
      er.setSeverity(LogLevel.INFO);
      er = (EventRecord) erDAO.put_(x, er);

      Thread.sleep(1000);

      alarm = (Alarm) ((DAO) x.get("localAlarmDAO")).find(EQ(Alarm.NAME, er.toSummary()));
      test( alarm != null, "alarm exists");
      test ( ! alarm.getIsActive(), "Alarm cleared");

      // notification will generate email
      DAO emailMessageDAO = (DAO) x.get("emailMessageDAO");
      List<EmailMessage> emailMessages = (List) ((ArraySink) emailMessageDAO.select(new ArraySink())).getArray();
      EmailMessage message = null;
      for ( EmailMessage msg : emailMessages ) {
        if ( msg.getSubject().contains("EventRecordTest") ) {
          message = msg;
          break;
        }
      }
      test( message != null, "email subject contains expected text: EventRecordTest == ["+message.getSubject()+"]");
      `
    }
  ]
});
