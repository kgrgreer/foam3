/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Keep cron job execution dao in sync',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers'
  ],

  properties: [
    {
      name: 'cronJobDAO',
      class: 'String',
      visibility: 'HIDDEN',
      value: 'localCronJobDAO',
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Cron cron = (Cron) obj;
      cron.clearReattemptRequested();
      cron.clearReattempts();
      try {
        cron.setScheduledTime(cron.getNextScheduledTime(x));
      } catch (Throwable t) {
        if ( cron.getEnabled() ) {
          Loggers.logger(x, this).error("Failed calculating NextScheduledTime", cron.getId(), t.getMessage());
          throw new RuntimeException(t);
        } else {
          Loggers.logger(x, this).debug("Failed calculating NextScheduledTime", cron.getId(), t.getMessage());
        }
      }
      if ( cron.getEnabled() ) {
        ((DAO) x.get(getCronJobDAO())).put_(x, cron);
      } else {
        ((DAO) x.get(getCronJobDAO())).remove_(x, cron);
      }
      return getDelegate().put_(x, cron);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      ((DAO) x.get(getCronJobDAO())).remove_(x, obj);
      return getDelegate().remove_(x, obj);
      `
    }
  ]
});
