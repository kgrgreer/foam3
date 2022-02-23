/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Logger decorator which adds static properties to each log message`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.dao.NullDAO',
    'foam.log.LogLevel',
    'foam.mlang.predicate.*',
    'foam.mlang.Expr',
    'static foam.mlang.MLang.TRUE',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'hostname',
      class: 'String',
      javaFactory: `
      String hostname = System.getProperty("hostname", "localhost");
      if ( "localhost".equals(hostname) ) {
        hostname = System.getProperty("user.name");
      }
      return hostname;
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage lm = (LogMessage) obj;
      lm.getCreated();
      lm.setHostname(getHostname());
      Subject subject = (Subject) x.get("subject");
      if( subject != null ) {
        User user = subject.getUser();
        if ( user != null ) {
          lm.setCreatedBy(user.getId());
        }
        User realUser = subject.getRealUser();
        if ( realUser != null ) {
          lm.setCreatedByAgent(realUser.getId());
        }
      }
      return getDelegate().put_(x, lm);
      `
    }
  ]
});
