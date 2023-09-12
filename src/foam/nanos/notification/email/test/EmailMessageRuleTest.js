/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email.test',
  name: 'EmailMessageRuleTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailConfig',
    'foam.nanos.notification.email.EmailTemplate',
    'foam.nanos.notification.email.Status',
    'java.util.HashMap',
    'java.util.Map'
  ],

  javaCode: `
  String spid_ = "email";
  User user_ = null;
  EmailTemplate template_ = null;
  String subject_ = "Test Email";
  String subjectTemplate_ = "Subject: {{subject}}";
  String subjectResolved_ = "Subject: "+subject_;
  `,

  methods: [
    {
      description: '',
      name: 'setup',
      args: 'X x',
      javaCode: `
    // Create spid, user, group, emailTemplate, emailConfig
    ServiceProvider sp = new ServiceProvider();
    sp.setId(spid_);
    sp.setDescription(spid_+" Spid");
    ((DAO) x.get("serviceProviderDAO")).put_(x, sp);

    Group group = new Group();
    group.setId(spid_+"-test");
    group = (Group) ((DAO) x.get("groupDAO")).put_(x, group);

    Address address = new Address(x);
    address.setCountryId("CA");
    address.setRegionId("CA-ON");
    address.setPostalCode("X1X 1X1");
    address.setCity("Bounce");
    address.setStreetNumber("1");
    address.setStreetName("Email");

    User user = new User(x);
    user.setFirstName("email");
    user.setLastName("test");
    user.setUserName(user.getFirstName()+user.getLastName());
    user.setEmail(user.getUserName()+"@example.com");
    user.setEmailVerified(true);
    user.setSpid(spid_);
    user.setGroup(group.getId());
    user.setAddress(address);
    user.setLifecycleState(LifecycleState.ACTIVE);
    user_ = (User) ((DAO) x.get("userDAO")).put_(x, user);

    EmailTemplate template = new EmailTemplate();
    template.setId(spid_);
    template.setName(spid_);
    template.setSpid(spid_);
    // template.setGroup(spid_);
    template.setSubject(subjectTemplate_);
    template.setBody("Body: {{arg1}}");
    template_ = (EmailTemplate) ((DAO) x.get("emailTemplateDAO")).put(template);

    EmailConfig config = new EmailConfig();
    config.setSpid(spid_);
    config.setFrom("noreply@example.com");
    config.setDisplayName("Example");
    config.setReplyTo("noreply@example.com");
    ((DAO) x.get("emailConfigDAO")).put(config);
      `
    },
    {
      description: '',
      name: 'runTest',
      javaCode: `
    setup(x);
    DAO dao = (DAO) x.get("emailMessageDAO");
    HashMap args = new HashMap();
    args.put("template", template_.getId());
    args.put("subject", subject_);
    args.put("args1", "args1");
    EmailMessage msg = new EmailMessage(x, user_.getId(), args);
    msg.setTo(new String[] { "another@example.com" });
    msg = (EmailMessage) dao.put(msg);
    test(msg!=null, "EmailMessage created: "+msg.getId());
    msg = (EmailMessage) dao.find(msg.getId());
    test(msg!=null, "EmailMessage found: "+msg.getId());
    test(msg.getStatus() == Status.UNSENT, "EmailMessage status==UNSENT: "+msg.getStatus());
    test(subjectResolved_.equals(msg.getSubject()), "EmailMessage subject=="+subjectResolved_+": "+msg.getSubject());

    msg = new EmailMessage();
    msg.setSubject(subjectResolved_);
    msg.setBody("Body: args1");
    msg.setUser(user_.getId());
    msg.setTo(new String[] { "another@example.com" });
    args = new HashMap();
    args.put("template", template_.getId());
    msg.setTemplateArguments(args);
    msg = (EmailMessage) ((DAO) x.get("emailMessageDAO")).put(msg);
    test(msg!=null, "EmailsUtility(2) found: "+msg.getId());
    test(msg.getStatus() == Status.UNSENT, "EmailsUtility(2) status==UNSENT: "+msg.getStatus());
    test(subjectResolved_.equals(msg.getSubject()), "EmailsUtility(2) subject=="+subjectResolved_+": "+msg.getSubject());

    args = new HashMap();
    args.put("subject", subject_);
    args.put("args1", "args1");
    args.put("template", template_.getId());
    EmailMessage msg3 = new EmailMessage();
    msg3.setTo(new String[] { "another@example.com" });
    msg3.setUser(user_.getId());
    msg3.setTemplateArguments(args);
    msg3 = (EmailMessage) ((DAO) x.get("emailMessageDAO")).put(msg3);
    test(msg3 != null, "EmailsUtility(3) found: "+msg3.getId());
    test(msg3.getStatus() == Status.UNSENT, "EmailsUtility(3) status==UNSENT: "+msg.getStatus());
    test(subjectResolved_.equals(msg3.getSubject()), "EmailsUtility(3) subject=="+subjectResolved_+": "+msg3.getSubject());
    String[] to = msg3.getTo();
    test(to != null && to[0].equals("another@example.com"), "EmailsUtility(3) to[0]==another@example.com");
       `
    // },
    // {
    //   description: '',
    //   name: 'teardown',
    //   args: 'X x',
    //   javaCode: `
    //   `
    }
  ]
});
