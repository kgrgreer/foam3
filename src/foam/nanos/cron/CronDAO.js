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
    'foam.dao.Sink',
    'foam.util.SafetyUtil'
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
      Cron cron = (Cron) getDelegate().put_(x, obj);
      if ( cron.getEnabled() ) {
        Cron job = (Cron) cron.fclone();
        job.clearReattemptRequested();
        job.clearReattempts();
        job.setScheduledTime(job.getNextScheduledTime(x));
        ((DAO) x.get(getCronJobDAO())).put_(x, job);
      } else {
        ((DAO) x.get(getCronJobDAO())).remove_(x, cron);
      }
      return cron;
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
