/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'NextDate',

  implements: [
    'foam.nanos.cron.NextDateService'
  ],

  javaImports: [
    'java.util.Date'
  ],

  methods: [
    {
      name: 'getNextDate',
      javaCode: `
        return schedule.getNextScheduledTime(x,new Date());
      `
    },
    {
      name: 'getNextDates',
      javaCode: `
        return schedule.calculateNextDates(x,n);
      `
    }
  ]
});
