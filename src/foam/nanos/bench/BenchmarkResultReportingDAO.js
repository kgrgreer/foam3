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
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      documentation: 'Port of remote server',
      name: 'port',
      class: 'Int',
      javaFactory: 'return foam.net.Port.get(getX(), "SocketServer");'
    },
    {
      name: 'serviceName',
      class: 'String',
      value: 'benchmarkResultServerDAO'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      var result = getDelegate().put_(x, obj);
      if ( SafetyUtil.isEmpty(getSessionId()) ||
           SafetyUtil.isEmpty(getHostname()) ) {
        return result;
      }
      // DAO service = (DAO) x.get(getServiceName());
      // if ( service != null ) {
      //   DAO dao = new ClientDAO.Builder(x)
      //     .setOf(BenchmarkResult.getOwnClassInfo())
      //     .setDelegate(new SessionClientBox.Builder(x)
      //       .setSessionID(getSessionId())
      //       .setDelegate(new SocketClientBox.Builder(x)
      //         .setHost(getHostname())
      //         .setPort(getPort())
      //         .setServiceName(getServiceName())
      //         .build())
      //       .build())
      //     .build();
      //   try {
      //     dao.put(result);
      //   } catch (Throwable t) {
      //     foam.nanos.logger.Loggers.logger(x, this).warning(t);
      //   }
      // }

      return result;
      `
    }
  ]
});
