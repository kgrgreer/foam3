/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'BenchmarkResultReportingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `send benchmark results to remote server.`,

  javaImports: [
    'foam.box.SessionClientBox',
    'foam.box.socket.SocketClientBox',
    'foam.box.socket.SocketServer',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
  ],

  properties: [
    {
      documentation: 'Long-term session token for session login',
      name: 'sessionId',
      class: 'String'
    },
    {
      documentation: 'Address of remote server',
      name: 'host',
      class: 'String'
    },
    {
      documentation: 'Port of remote server',
      name: 'port',
      class: 'Int',
      value: 8443,
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      var result = getDelegate().put_(x, obj);
      if ( SafetyUtil.isEmpty(getSessionId()) ||
           SafetyUtil.isEmpty(getHost()) ) {
        return result;
      }
      DAO dao = new ClientDAO.Builder(x)
        .setOf(BenchmarkResult.getOwnClassInfo())
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(getSessionId())
          .setDelegate(new SocketClientBox.Builder(x)
            .setHost(getHost())
            .setPort(getPort() + SocketServer.PORT_OFFSET)
            .setServiceName("benchmarkResultDAO")
            .build())
          .build())
        .build();
      dao.put(obj);

      return result;
      `
    }
  ]
});
