/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronDashboardCard',
  extends: 'foam.dashboard.view.DashboardCard',
  documentation: 'widget that shows running or recently running crons',

  properties: [
    {
      name: 'dao',
      value: 'cronJobDAO'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.cron.Cron',
      name: 'records'
    }
  ]
});
