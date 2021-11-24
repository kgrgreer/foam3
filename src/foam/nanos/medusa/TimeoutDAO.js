/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'TimeoutDAO',
  extends: 'foam.dao.ProxyDAO',

  // TODO: configuration per spid, model, or other SLA metrics
  documentation: `Reject MedusaEntry if it hasn't been processed in an appropriate amount of time.`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers'
  ],

  properties: [
    {
      name: 'globalTimeout',
      class: 'Long',
      value: 30000
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      MedusaEntry entry = (MedusaEntry) obj;
      Long created = entry.getCreated().getTime();
      if ( entry.getLastModified() == null && // not yet saved the first time.
           System.currentTimeMillis() - created > getGlobalTimeout() ) {
        throw new MedusaEntryTimeoutException();
      }
      return getDelegate().put_(x, obj);
      `
    }
  ]
});
