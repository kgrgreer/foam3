/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email.test',
  name: 'MockSMTPAgentTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test cron job and rate limit logic.  Set the mock service in the context, enable cron job, create email messages, test only x of y are SENT in some time window',

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.DirectAgency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sequence',
    'foam.nanos.auth.Subject',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailServiceConfig',
    'foam.nanos.notification.email.Status',
    'foam.nanos.script.Script',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ'
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
      MockSMTPAgent agent = (MockSMTPAgent) x.get("smtpAgent");

      x = x.put("emailMessageDAO", new foam.dao.MDAO(EmailMessage.getOwnClassInfo()));
      // keep date order to test delivery order
      List<Date> dates = new ArrayList();
      int send = 20;

      // create email messages
      DAO emailMessageDAO = (DAO) x.get("emailMessageDAO");
      for ( int i = 0; i < send; i++ ) {
        EmailMessage msg = new EmailMessage();
        msg.setId(String.valueOf(i));
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

      // enable service
      EmailServiceConfig config = agent.findId(x);
      config = (EmailServiceConfig) config.fclone();
      config.setEnabled(true);
      ((DAO) x.get("emailServiceConfigDAO")).put(config);

      // test only x messages processed in 1s.
      long rate = config.getRateLimit();

      long startTime = System.currentTimeMillis();
      agent.execute(x);

      List<EmailMessage> sent = ((ArraySink) emailMessageDAO.where(
        EQ(EmailMessage.STATUS, Status.SENT)
      )
      .orderBy(EmailMessage.SENT_DATE)
      .select(new ArraySink())).getArray();

      int c = sent.size();
      test ( c <= rate, "Sufficient sent "+c+" <= "+rate);

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
