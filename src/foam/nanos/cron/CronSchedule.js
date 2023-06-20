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

  documentation: `
    Schedule for periodic tasks.
    * time of day - hour, minute, second
    * months of year
    * days of month
    * week of month
    * days of week
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.nanos.logger.Loggers',
    'foam.time.TimeZone',
    'java.time.*',
    'java.time.temporal.*',
    'java.util.Date'
  ],

  requires: [
    'foam.time.DayOfWeek',
    'foam.u2.ControllerMode'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.time.TimeZone',
      name: 'timeZone',
      order: 0,
      value: 'Africa/Abidjan' // UTC/GMT
    },
    {
      class: 'Int',
      name: 'second',
      value: 0,
      min: 0,
      max: 59,
      order: 1,
      documentation: `Second to execute the script.
           Ranges from 0 - 59. -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'minute',
      value: -1,
      min: -1,
      max: 59,
      order: 2,
      documentation: `Minute to execute script.
          Ranges from 0 - 59. -1 for wildcard`
    },
    {
      class: 'Int',
      name: 'hour',
      order: 3,
      value: -1,
      min: -1,
      max: 23,
      documentation: `Hour to execute script.
          Ranges from 0 - 23. -1 for wildcard`
    },
    {
      class: 'FObjectArray',
      of: 'foam.time.MonthOfYear',
      name: 'monthsOfYear',
      order: 4,
      javaFactory: 'return new foam.time.MonthOfYear[] {};',
      javaPreSet: 'java.util.Arrays.sort(val);',
      view: { class: 'foam.time.MonthOfYearView' },
      documentation: 'Months to execute script',
    },
    {
      // first , second , third ...
      // TODO: getNextWeekOfMonth incomplete.
      class: 'Int',
      name: 'weekOfMonth',
      hidden: true,
      value: 0,
      order: 5,
      min: 0,
      max: 5,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices: [[0, '--'], [1, 'First'], [2, 'Second'], [3, 'Third'], [4, 'Before Last'], [5, 'Last']]
        }
      },
      visibility: function(daysOfMonth) {
        if ( daysOfMonth.length > 0 )
          return foam.u2.DisplayMode.HIDDEN;
        if ( this.ControllerMode.EDIT )
          return foam.u2.DisplayMode.RW;
        return foam.u2.DisplayMode.RO;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.time.DayOfWeek',
      name: 'daysOfWeek',
      order: 6,
      javaFactory: 'return new foam.time.DayOfWeek[] {};',
      javaPreSet: 'java.util.Arrays.sort(val);',
      view: { class: 'foam.u2.view.DayOfWeekView' },
      visibility: function(daysOfMonth) {
        if ( daysOfMonth.length > 0 )
          return foam.u2.DisplayMode.HIDDEN;
        if ( this.ControllerMode.EDIT )
          return foam.u2.DisplayMode.RW;
        return foam.u2.DisplayMode.RO;
      }
    },
    {
      class: 'Array',
      of: 'Long',
      name: 'daysOfMonth',
      order: 6,
      javaFactory: 'return new Long[] {};',
      javaPreSet: 'java.util.Arrays.sort(val);',
      view: { class: 'foam.u2.view.DayOfMonthView' },
      visibility: function(daysOfWeek, weekOfMonth) {
        if ( weekOfMonth > 0 ||
             daysOfWeek.length > 0 )
          return foam.u2.DisplayMode.HIDDEN;
        if ( this.ControllerMode.EDIT )
          return foam.u2.DisplayMode.RW;
        else
          return foam.u2.DisplayMode.RO;
      }
    }
  ],

  methods: [
    {
      name: 'getNextScheduledTime',
      args: 'X x, java.util.Date from',
      type: 'Date',
      javaCode: `
      var zone = getTimeZoneId(x);

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

      if ( getMonthsOfYear().length > 0 ) {
        time = getNextMonthOfYear(x, zone, last, time);
      }
      if ( getDaysOfMonth().length > 0 ) {
        time = getNextDayOfMonth(x, zone, last, time);
      } else {
        // These two require coordination.
        // if ( getWeekOfMonth() > -1 ) {
        //   time = getNextWeekOfMonth(x, zone,last, time);
        // }
        if ( getDaysOfWeek().length > 0 ) {
          time = getNextDayOfWeek(x, zone, last, time);
        }
      }
      return Date.from(time.atZone(zone).toInstant());
      `
    },
    {
      name: 'getTimeZoneId',
      args: 'X x',
      javaType: 'java.time.ZoneId',
      javaCode: `
      var zone = ZoneId.systemDefault();
      if ( ! foam.util.SafetyUtil.isEmpty(getTimeZone()) ) {
        TimeZone timeZone = (TimeZone) ((DAO) x.get("timeZoneDAO")).find(OR(EQ(TimeZone.ID, getTimeZone()), EQ(TimeZone.DISPLAY_NAME, getTimeZone())));
        if ( timeZone == null ) {
          Loggers.logger(x, this).error("TimeZone not found", getTimeZone());
        }
        zone = ZoneId.of(timeZone.getId());
      }
      return zone;
      `
    },
    {
      name: 'getNextMonthOfYear',
      args: 'X x, ZoneId zone, LocalDateTime last, LocalDateTime time',
      javaType: 'java.time.LocalDateTime',
      javaCode: `
      boolean adjusted = false;
      while ( ! adjusted ) {
        for ( foam.time.MonthOfYear m : getMonthsOfYear() ) {
          int month = m.getOrdinal();
          if ( month == time.getMonth().getValue() &&
               time.isAfter(last) ) {
            adjusted = true;
            break;
          }
          // schedule change to earlier in year
          if ( month < time.getMonth().getValue() ) {
            LocalDateTime temp = time.withMonth(month);
            if ( temp.isAfter(last) ) {
              time = temp;
              adjusted = true;
              break;
            }
          }

          if ( month > time.getMonth().getValue() ) {
            time = time.withMonth(month);
            adjusted = true;
            break;
          }
        }
        if ( ! adjusted ) {
          // bump year
          time = time.with(TemporalAdjusters.firstDayOfNextYear());
        }
      }
      return time;
      `
    },
    {
      name: 'getNextDayOfMonth',
      args: 'X x, ZoneId zone, LocalDateTime last, LocalDateTime time',
      javaType: 'java.time.LocalDateTime',
      javaCode: `
      boolean adjusted = false;
      while ( ! adjusted ) {
        for ( Object d : getDaysOfMonth() ) {
          long day = ((Long)d).longValue();
          if ( day == time.getDayOfMonth() &&
               time.isAfter(last) ) {
            adjusted = true;
            break;
          }
          if ( day < time.getDayOfMonth() ) {
            LocalDateTime temp = time.with(ChronoField.DAY_OF_MONTH, day);
            if ( temp.isAfter(last) ) {
              time = temp;
              adjusted = true;
              break;
            }
          }
          if ( day > time.getDayOfMonth() ) {
            int lastDayOfMonth = time.with(TemporalAdjusters.lastDayOfMonth()).getDayOfMonth();
            if ( day > lastDayOfMonth ) {
              if ( lastDayOfMonth > time.getDayOfMonth() ) {
                time = time.with(TemporalAdjusters.lastDayOfMonth());
              } else {
                time = time.with(TemporalAdjusters.firstDayOfNextMonth());
                time = time.plusDays((int)getDaysOfMonth()[0] - 1);
              }
            } else {
              time = time.plusDays(day - time.getDayOfMonth());
            }
            adjusted = true;
            break;
          }
        }
        if ( ! adjusted ) {
          // bump month
          time = time.with(TemporalAdjusters.firstDayOfNextMonth());
        }
      }
      return time;
    `
    },
    {
      name: 'getNextWeekOfMonth',
      args: 'X x, ZoneId zone, LocalDateTime last, LocalDateTime time',
      javaType: 'java.time.LocalDateTime',
      javaCode: `
      return time;
      `
    },
    {
      name: 'getNextDayOfWeek',
      args: 'X x, ZoneId zone, LocalDateTime last, LocalDateTime time',
      javaType: 'java.time.LocalDateTime',
      javaCode: `
      boolean adjusted = false;
      for ( foam.time.DayOfWeek d : getDaysOfWeek() ) {
        int day = d.getOrdinal();
        if ( day == time.getDayOfWeek().getValue() &&
             time.isAfter(last) ) {
          adjusted = true;
          break;
        }
        // schedule change to earlier in week
        if ( day < time.getDayOfWeek().getValue() ) {
          LocalDateTime temp = time.with(ChronoField.DAY_OF_WEEK, day);
          if ( temp.isAfter(last) ) {
            time = temp;
            adjusted = true;
            break;
          }
        }

        if ( day > time.getDayOfWeek().getValue() ) {
          time = time.with(TemporalAdjusters.nextOrSame(DayOfWeek.of(day)));
          adjusted = true;
          break;
        }
      }
      if ( ! adjusted ) {
        // bump week
        time = time.with(TemporalAdjusters.next(DayOfWeek.of(((foam.time.DayOfWeek)getDaysOfWeek()[0]).getOrdinal())));
      }
      return time;
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
