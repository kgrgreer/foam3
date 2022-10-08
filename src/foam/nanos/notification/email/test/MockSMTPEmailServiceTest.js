/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email.test',
  name: 'MockSMTPEmailServiceTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test cron job and rate limit logic.  Set the mock service in the context, enable cron job, create email messages, test only x of y are SENT in some time window',

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.DirectAgency',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sequence',
    'foam.nanos.auth.Subject',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.Status',
    'foam.nanos.script.Script',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List'
  ],

  properties: [
    {
      name: 'rateLimit',
      class: 'Long',
      value: 2
    },
  ],

  methods: [
    {
      name: 'setUp',
      args: 'X x',
      javaCode: `
      `
    },
    {
      name: 'runTest',
      javaCode: `
      // install mock service
      MockSMTPEmailService service = new MockSMTPEmailService(x);
      service.setRateLimit(getRateLimit());
      x = x.put("email", service);
      x = x.put("emailMessageDAO", new foam.dao.MDAO(EmailMessage.getOwnClassInfo()));
      // keep date order to test delivery order
      List<Date> dates = new ArrayList();
      int send = 20;

      // create email messages
      DAO emailMessageDAO = (DAO) x.get("emailMessageDAO");
      for ( int i = 0; i < send; i++ ) {
        EmailMessage msg = new EmailMessage();
        msg.setId(i);
        msg.setUser(1L); // system
        msg.setFrom("noreply@test.com");
        msg.setTo(new String[] { "test@test.com" });
        msg.setSubject(String.valueOf(i));
        msg.setBody(String.valueOf(i));
        msg.setStatus(Status.UNSENT);
        Date d = new Date();
        dates.add(d);
        msg.setCreated(d);
        try {
          Thread.currentThread().sleep(1000L);
        } catch (InterruptedException e) {
          // nop
        }
        emailMessageDAO.put(msg);
      }

      // note time, acquire and execute cron job
      final Script script = (Script) ((DAO) x.get("cronDAO")).find("Email Service");
      test( script != null, "Script found");

      // test only x messages processed in 1s.
      long window = 1000L; // 1 second
      long rate = getRateLimit();

      long startTime = System.currentTimeMillis();
      new DirectAgency().schedule(x, new ContextAgent() {
          public void execute(X x) {
            script.runScript(x);
          }
        }, "MockSMTPEmailServiceTest.cron", window
      );

      try {
        Thread.currentThread().sleep(window * 2);
      } catch (InterruptedException e) {
        // nop
      }
      Count count = new Count();
      emailMessageDAO.where(
        EQ(EmailMessage.STATUS, Status.SENT)
      )
      .select(count);

      long time = System.currentTimeMillis() - startTime;
      long seconds = time/window;
      long c = (Long) count.getValue();
      test ( c >= rate, "Sufficient sent "+c+" >= "+rate);
      test ( c <= rate * seconds, "Throttled. sent:"+c+",seconds:"+seconds);

      try {
        Thread.currentThread().sleep(window * (send / rate));
      } catch (InterruptedException e) {
        // nop
      }
      List<EmailMessage> sent = ((ArraySink) emailMessageDAO.where(
        EQ(EmailMessage.STATUS, Status.SENT)
      )
      .orderBy(EmailMessage.SENT_DATE)
      .select(new ArraySink())).getArray();

      test ( sent.size() == send, "All sent");

      // test order
      boolean passed = true;
      for ( EmailMessage message : sent ) {
        int order = Integer.parseInt(message.getSubject());
        Date orderDate = dates.get(order);
        if ( orderDate.compareTo(message.getCreated()) != 0 ) {
          passed = false;
          break;
        }
      }
      test ( passed, "Expected date order");
      `
    }
  ]
});
