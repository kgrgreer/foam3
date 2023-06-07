/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronSchedule',
  implements: [
    'foam.nanos.cron.Schedule'
  ],

  javaImports: [
    'foam.core.X',
    'java.time.LocalDate',
    'java.time.LocalDateTime',
    'java.time.DayOfWeek',
    'java.time.ZoneId',
    'java.time.temporal.TemporalAdjusters',
    'java.util.Date'
  ],

  documentation: `
    Schedule for periodic tasks.
  `,

  properties: [
    {
      class: 'Int',
      name: 'minute',
      value: -1,
      documentation: `Minute to execute script.
          Ranges from 0 - 59. -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'hour',
      value: -1,
      documentation: `Hour to execute script.
          Ranges from 0 - 23. -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'dayOfMonth',
      value: -1,
      documentation: `Day of Month to execute script.
          Ranges from 1 - 31. -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'month',
      value: -1,
      documentation: `Month to execute script.
          Ranges from 1 - 12. -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'dayOfWeek',
      value: -1,
      documentation: `Day of week to execute script.
          Ranges from 1 - 7, where 1 is Monday (matches java time dayofweek). -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'second',
      value: 0,
      documentation: `Second to execute the script.
           Ranges from 0 - 59. -1 for wildcard`
    },
    {
      class: 'Reference',
      of: 'foam.time.TimeZone',
      name: 'timezone'
    }
  ],

  methods: [
    {
      name: 'getNextScheduledTime',
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
      type: 'Date',
      javaCode: `
var zone = ZoneId.systemDefault();
if ( ! foam.util.SafetyUtil.isEmpty(getTimezone()) ) {
  zone = ZoneId.of(getTimezone());
}

LocalDateTime last = null;
if ( from == null ) {
  last = LocalDate.now(zone).atStartOfDay();
} else {
  last = LocalDateTime.ofInstant(from.toInstant(), zone);
}
var time = last;

// test if component needs to be bumped to the next hour, minute,...
if ( getHour() > -1 ) {
  if ( time.getHour() >= getHour() &&
       ! time.isAfter(last) ) {
    time = time.plusDays(1);
  }
  time = time.withHour(getHour());
}
if ( getMinute() > -1 ) {
  if ( time.getMinute() >= getMinute() &&
       ! time.isAfter(last) ) {
    time = time.plusHours(1);
  }
  time = time.withMinute(getMinute());
}
if ( getSecond() > -1 ) {
  if ( time.getSecond() >= getSecond() &&
       ! time.isAfter(last) ) {
    time = time.plusMinutes(1);
  }
  time = time.withSecond(getSecond());
}
if ( getMonth() > -1 ) {
  if ( time.getMonthValue() >= getMonth() &&
       ! time.isAfter(last) ) {
    time = time.plusYears(1);
  }
  time = time.withMonth(getMonth() - 1);
}
if ( getDayOfMonth() > -1 ) {
  if ( time.getDayOfMonth() >= getDayOfMonth() &&
       ! time.isAfter(last) ) {
    time = time.plusMonths(1);
  }
  // handle 28, 30, 31 days of month.
  if ( getDayOfMonth() <= time.toLocalDate().lengthOfMonth() ) {
    time = time.withDayOfMonth(getDayOfMonth());
  } else {
    time = time.with(TemporalAdjusters.lastDayOfMonth());
  }
} else if ( getDayOfWeek() > -1 ) {
  DayOfWeek dow = DayOfWeek.of(getDayOfWeek());
  if ( time.getDayOfWeek().getValue() >= dow.getValue() &&
       ! time.isAfter(last) ) {
    time = time.with(TemporalAdjusters.next(dow));
  }
}
return Date.from(time.atZone(zone).toInstant());
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
