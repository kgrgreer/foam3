/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'TimeOfDaySchedule',

  documentation: `
    Schedule every day at a specific time.

    For example, to run a task at midnight:
    { time: { hour: 0, minute: 0, second: 0 } }
  `,

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  javaImports: [
    'foam.core.X',
    'java.time.*',
    'static foam.util.DateUtil.*',
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.time.TimeZone',
      name: 'timeZone',
      value: 'GMT'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.TimeHMS',
      name: 'time',
      factory: () => {
        return foam.nanos.cron.TimeHMS.create();
      }
    }
  ],

  methods: [
    {
      name: 'getNextScheduledTime',
      type: 'DateTime',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'from',
          type: 'java.util.Date'
        }
      ],
      javaCode: `
        ZoneId zone = getTimeZoneId(x, getTimeZone());
        LocalDateTime now = dateToLocalDateTime(from, zone);
        LocalDateTime nextTOD = ZonedDateTime.of(now.getYear(), now.getMonthValue(), now.getDayOfMonth(),
          getTime().getHour(), getTime().getMinute(), getTime().getSecond(), 0, zone).toLocalDateTime();
        
        // Increment the date if time now is after scheduled time of day
        if ( now.isAfter(nextTOD) ) {
          nextTOD = nextTOD.plusDays(1);
        }

        return localDateTimeToDate(nextTOD, zone);
      `
    },
    {
      name: 'postExecution',
      javaCode: `
        return;
      `
    }
  ]
});
