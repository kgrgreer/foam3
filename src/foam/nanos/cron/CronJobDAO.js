/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronJobDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Remove disabled cron jobs',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'cronDAO',
      class: 'String',
      visibility: 'HIDDEN',
      value: 'cronDAO',
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Cron cron = (Cron) obj;
      if ( ! cron.getEnabled() ) {
        getDelegate().remove_(x, obj);
        ((DAO) x.get(getCronDAO())).put_(x, cron.fclone());
        return cron;
      } else {
        return getDelegate().put_(x, obj);
      }
      `
    }
  ]
});
