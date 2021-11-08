/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SessionClientDAO',
  extends: 'foam.dao.ProxyDAO',
  javaGenerateConvenienceConstructor: false,
  javaGenerateDefaultConstructor: false,

  documentation: `Support for calling DAO web services with explicit session id.
use:
c = foam.dao.SessionClientDAO.create({
  serviceName: 'languageDAO',
  sessionId: 'E7A01D59-E35C-47E1-A5A6-9EA81D5BCDAD'
}, x);

a = await c.select();
console.log('a', a && a.array);
// or
c.select().then(function(a1) {
  console.log('a1', a1 && a1.array);
});
`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.box.HTTPAuthorizationType',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil'
  ],

  imports: [
    'sessionID as jsSessionID'
  ],

  exports: [
    'sessionId as sessionID'
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox',
    'foam.box.HTTPAuthorizationType',
    'foam.dao.ClientDAO'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String'
    },
    {
      documentation: 'Session token / BEARER token',
      name: 'sessionId',
      class: 'String',
      factory: function() { return this.jsSessionID || localStorage.defaultSession; }
    }
  ],

  javaCode: `
  public SessionClientDAO() {
  }

  public SessionClientDAO(X x, String serviceName) {
    setX(x);
    setServiceName(serviceName);
    setSessionId(x.get(Session.class).getId());
    init();
  }
  public SessionClientDAO(X x, String serviceName, String sessionId) {
    setX(x);
    setServiceName(serviceName);
    setSessionId(sessionId);
    init();
  }
  `,

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();

        var box = this.HTTPBox.create({
          authorizationType: this.HTTPAuthorizationType.BEARER,
          url: 'service/'+this.serviceName
        });

        box = this.SessionClientBox.create({
          delegate: box
        });

        this.delegate = this.ClientDAO.create({
          name: this.serviceName,
          of: this.__subContext__[this.serviceName].of,
          delegate: box
        });
      },
      javaCode: `
      X x = getX();
      ProxyDAO proxy = (ProxyDAO) x.get(getServiceName());
      setDelegate(new ClientDAO.Builder(x)
        .setOf(proxy.getOf())
        .setDelegate(new SessionClientBox.Builder(x)
        .setSessionID(getSessionId())
        .setDelegate(new HTTPBox.Builder(x)
          .setAuthorizationType(HTTPAuthorizationType.BEARER)
          .setSessionID(getSessionId())
          .setUrl("service/"+getServiceName())
          .build())
        .build())
        .build());
      `
    }
  ]
});
