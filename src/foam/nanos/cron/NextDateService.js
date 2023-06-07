/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.cron',
  name: 'NextDateService',

  skeleton: true,

  documentation: `
    Returns the next date of a given schedule.
  `,

  methods: [
    {
      name: 'getNextDate',
      type: 'Date',
      async: true,
      args: 'Context x, SimpleIntervalSchedule schedule,'
    },
    {
      name: 'getNextDates',
      type: 'Date[]',
      async: true,
      args: 'Context x, SimpleIntervalSchedule schedule, int n'
    },
  ]
});
