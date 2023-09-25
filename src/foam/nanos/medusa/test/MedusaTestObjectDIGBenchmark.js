/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.medusa.test',
  name: 'MedusaTestObjectDIGBenchmark',
  extends: 'foam.nanos.dig.bench.DIGBenchmark',

  implements: [
    'foam.nanos.medusa.Clusterable'
  ],

  javaImports: [
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',
    'foam.nanos.dig.DIG'
  ],

  javaCode: `
  String userName_ = this.getClass().getSimpleName();
  String spid_ = "benchmark";
  User user_;
  `,

  methods: [
    {
      name: 'setup',
      javaCode: `
      DIG dig = new DIG(x, "serviceProviderDAO", this);

      ServiceProvider sp = (ServiceProvider) dig.find(spid_);
      if ( sp == null ) {
        sp = new ServiceProvider();
        sp.setId(spid_);
        sp.setDescription(spid_+" Spid");
        sp = (ServiceProvider) dig.put(sp);
      }

      dig.setNSpecName("userDAO");
      User user = (User) dig.query_(x, 0L, 1L, "userName="+userName_);
      if ( user == null ) {
        user = new User();
        user.setUserName(userName_);
        user.setFirstName(userName_);
        user.setLastName("Benchmark");
        user.setEmail(userName_+"@benchmarktest.net");
        user.setEmailVerified(true);
        user.setSpid(spid_);
        user.setGroup("sme");
        user_ = (User) dig.put(user);
      } else if ( user.getLifecycleState() == LifecycleState.DELETED ) {
        user = (User) user.fclone();
        user.setLifecycleState(LifecycleState.ACTIVE);
        user = (User) dig.put(user);
      }
      user_ = user;

      dig.setNSpecName("sessionDAO");
      Session session = (Session) dig.put(new Session.Builder(x).setUserId(user_.getId()).build());
      setSessionId(session.getId());
      `
    },
    {
      name: 'execute',
      javaCode: `
      DIG dig = new DIG.Builder(x)
        .setNSpecName("medusaTestObjectDAO")
        .setPostURL(getUrls()[getNextServerIndex(x)])
        .setSessionId(getSessionId())
        .setConnectionTimeout(getConnectionTimeout())
        .setRequestTimeout(getRequestTimeout())
        .build();

      dig.put(new MedusaTestObject());
      `
    },
    {
      name: 'teardown',
      javaCode: `
      DIG dig = new DIG(x, "userDAO", this);

      dig.remove(user_.getId());

      // dig.setNSpecName("serviceProviderDAO");
      // dig.remove(spid_);
      `
    }
  ]
});
