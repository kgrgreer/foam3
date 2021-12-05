/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.medusa.test',
  name: 'MedusaTestObjectDIGBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.session.Session',
    'foam.nanos.dig.DIG'
  ],

  properties: [
    {
      name: 'setupUrl',
      class: 'String',
      value: 'https://hera:8443'
    },
    {
      name: 'setupSessionId',
      class: 'String',
      value: '2c2d88af-cba8-9549-05e9-18be400a0aed'
    },
    {
      documentation: 'single load-balancer url, or many for manual psuedo load-balancing',
      name: 'urls',
      class: 'StringArray',
      javaFactory: 'return new String[] { "https://moosehead:4444" };'
    },
    {
      name: 'sessionId',
      class: 'String',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'connectionTimeout',
      class: 'Long',
      units: 'ms',
      value: 20000
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'requestTimeout',
      class: 'Long',
      units: 'ms',
      value: 20000
    }
  ],

  javaCode: `
  protected int lastServerIndex_ = 0;
  String userName_ = this.getClass().getSimpleName();
  String spid_ = "benchmark";
  User user_;
  `,

  methods: [
    {
      name: 'getNextServerIndex',
      args: 'Context x',
      javaType: 'int',
      synchronized: true,
      javaCode: `
      lastServerIndex_ = (lastServerIndex_ + 1) % getUrls().length;
      return lastServerIndex_;
      `
    },
    {
      name: 'setup',
      javaCode: `
      DIG dig = new DIG.Builder(x)
        .setNSpecName("serviceProviderDAO")
        .setPostURL(getSetupUrl())
        .setSessionId(getSetupSessionId())
        .setConnectionTimeout(getConnectionTimeout())
        .setRequestTimeout(getRequestTimeout())
        .build();

      ServiceProvider sp = new ServiceProvider();
      sp.setId(spid_);
      sp.setDescription(spid_+" Spid");
      dig.put(x, sp);

      dig.setNSpecName("userDAO");
      // User user = (User) dig.select(x, 0L, 1L, "userName="+userName_);
      User user = (User) dig.select(x, 0L, 1L, "email="+userName_+"@benchmarktest.net");
      if ( user == null ) {
        user = new User();
        user.setUserName(userName_);
        user.setFirstName(userName_);
        user.setLastName("Benchmark");
        user.setEmail(userName_+"@benchmarktest.net");
        user.setEmailVerified(true);
        user.setSpid(spid_);
        user.setGroup("sme");
        user_ = (User) dig.put(x, user);
      } else {
        user_ = user;
      }

      dig.setNSpecName("sessionDAO");
      Session session = (Session) dig.put(x, new Session.Builder(x).setUserId(user_.getId()).build());
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

      dig.put(x, new MedusaTestObject());
      `
    },
    {
      name: 'teardown',
      javaCode: `
      DIG dig = new DIG.Builder(x)
        .setNSpecName("userDAO")
        .setPostURL(getSetupUrl())
        .setSessionId(getSetupSessionId())
        .setConnectionTimeout(getConnectionTimeout())
        .setRequestTimeout(getRequestTimeout())
        .build();

      dig.remove(x, user_.getId());

      dig.setNSpecName("serviceProviderDAO");
      dig.remove(x, spid_);
      `
    }
  ]
});
