/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'TimeoutDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.nanos.auth.EnabledAware' ],

  // TODO: configuration per spid, model, or other SLA metrics
  documentation: `Reject MedusaEntry if it hasn't been processed in an appropriate amount of time.`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'globalTimeout',
      class: 'Long',
      units: 'ms',
      value: 30000
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      MedusaEntry entry = (MedusaEntry) obj;
      if ( getEnabled() &&
           entry.getLastModified() == null && // not yet saved the first time.
           entry.getCreated() != null &&
           System.currentTimeMillis() - entry.getCreated().getTime() > getGlobalTimeout() ) {
        throw new MedusaEntryTimeoutException();
      }
      return getDelegate().put_(x, obj);
      `
    }
  ]
});
