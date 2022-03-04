/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'SimpleIntervalSchedule',

  javaImports: [
    'foam.nanos.cron.MonthlyChoice',
    'foam.nanos.cron.ScheduleEnd',
    'foam.time.TimeUnit',
    'java.time.DayOfWeek',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.time.temporal.ChronoUnit',
    'java.time.temporal.TemporalAdjusters',
    'java.util.Date'
  ],

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  requires: [
    'foam.time.DayOfWeek',
    'foam.time.TimeUnit',
    'foam.nanos.cron.MonthlyChoice',
    'foam.nanos.cron.ScheduleEnd',
    'foam.nanos.cron.SymbolicFrequency'
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate'
    },
    {
      class: 'Int',
      name: 'repeat',
      label: 'Repeat Every',
      gridColumns: 6,
      min: 0,
      postSet: function(_, n) {
        if ( n === 0 ) {
          this.frequency = this.Frequency.DAY;
          this.ends = this.ScheduleEnd.NEVER;
        }
      }
    },
    {
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      name: 'frequency',
      label: '',
      gridColumns: 6,
      visibility: function(repeat) {
        if ( repeat < 1 ) {
          return foam.u2.DisplayMode.DISABLED};
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.time.DayOfWeek',
      name: 'dayOfWeek',
      label: 'On',
      view: {
        class: 'foam.u2.view.DayOfWeekView',
      },
      visibility: function(frequency) {
        if ( frequency != this.TimeUnit.WEEK )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.cron.MonthlyChoice',
      name: 'monthlyChoice',
      label: '',
      view: function(_, X) {
        return {
          isHorizontal: true,
          class: 'foam.u2.view.RadioEnumView'
        };
      },
      visibility: function(frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Array',
      of: 'Int',
      name: 'dayOfMonth',
      label: '',
      view: {
        class: 'foam.u2.view.DayOfMonthView'
      },
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != this.MonthlyChoice.EACH )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      // first , second , third ...
      class: 'Enum',
      of: 'foam.nanos.cron.SymbolicFrequency',
      name: 'symbolicFrequency',
      label: '',
      gridColumns: 6,
      visibility: function(monthlyChoice, frequency ) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice !=  this.MonthlyChoice.ON_THE )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Enum',
      of: 'foam.time.DayOfWeek',
      name: 'expandedDayOfWeek',
      label: '',
      gridColumns: 6,
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != this.MonthlyChoice.ON_THE )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.cron.ScheduleEnd',
      name: 'ends',
      label: 'Ends',
      gridColumns: 6,
      visibility: function(repeat) {
        if ( repeat < 1 ) {
          return foam.u2.DisplayMode.HIDDEN};
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Date',
      name: 'endsOn',
      label: 'End Date',
      gridColumns: 6,
      visibility: function(ends) {
        if ( ends != this.ScheduleEnd.ON )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Int',
      name: 'endsAfter',
      label: '',
      gridColumns: 6,
      min: 1,
      visibility: function(ends) {
        if ( ends != this.ScheduleEnd.AFTER )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    }
  ],
  methods: [
    {
      name: 'getNextScheduledTime',
      javaCode: `
        LocalDate startDate = getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate endsOn = getEndsOn() == null ? null : getEndsOn().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate nextDate = startDate;

        // Check if schedule has ended
        if ( getEnds() == ScheduleEnd.AFTER && getEndsAfter() == 0 || getEnds() == ScheduleEnd.ON && ! LocalDate.now().isBefore(endsOn) ) {
          return null;
        }

        switch (getFrequency()) {
          case DAY:
            nextDate = calculateNextDay(x, nextDate, false);
            break;
          case WEEK:
            nextDate = calculateNextWeek(x, nextDate, false, startDate);
            break;
          case MONTH:
            nextDate = calculateNextMonth(x, nextDate, false, startDate);
            break;
          case YEAR:
            nextDate = calculateNextYear(x, nextDate, false);
            break;
        }

        // check if next schedulable date is before the schedule's end date if one exists
        if ( nextDate == null || getEnds() == ScheduleEnd.ON && ! nextDate.isBefore(endsOn) ) {
          return null;
        }

        return Date.from(nextDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
      `
    },
    {
      name: 'calculateNextDay',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusDays(getRepeat());
        } 
        if ( ! nextDate.isAfter(LocalDate.now()) ) {
          return calculateNextDay(x, nextDate, true);
        }
        return nextDate;
      `
    },
    {
      name: 'calculateNextWeek',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusWeeks(getRepeat());
        }
        LocalDate minDate = getStartOfWeek(x,nextDate).minusDays(1);
        LocalDate endOfWeek = getEndOfWeek(x,minDate);
        foam.time.DayOfWeek[] days = getDayOfWeek();
        if ( days.length == 0 ) {
          return null;
        }
        nextDate = minDate.with(TemporalAdjusters.next(getWeekday(days[0])));
        for ( int i=1; i < days.length; i++ ) {
          LocalDate temp = minDate.with(TemporalAdjusters.next(getWeekday(days[i])));
          if ( temp.isAfter(LocalDate.now()) && ( temp.isBefore(nextDate) || ! nextDate.isAfter(LocalDate.now())) ) {
            nextDate = temp;
          }
        }
        if ( nextDate.isAfter(startDate) && nextDate.isAfter(LocalDate.now()) && ! nextDate.isAfter(endOfWeek) ) {
          return nextDate;
        } else {
          return calculateNextWeek(x, endOfWeek, true, startDate);
        }
      `
    },
    {
      name: 'calculateNextMonth',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusMonths(getRepeat());
        }
        LocalDate start = nextDate.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate end = nextDate.with(TemporalAdjusters.lastDayOfMonth());

        if ( getMonthlyChoice() == MonthlyChoice.EACH ) {
          nextDate = LocalDate.now();

          for ( Object day : getDayOfMonth() ) {
            LocalDate temp = start.plusDays(((long)day)-1);
            if ( temp.isAfter(LocalDate.now()) && ( temp.isBefore(nextDate) || ! nextDate.isAfter(LocalDate.now())) ) {
              nextDate = temp;
            }
          }
        } else {
          switch (getSymbolicFrequency()) {
            case FIRST:
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(1,getWeekday(getExpandedDayOfWeek())));
              break;
            case SECOND:
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(2,getWeekday(getExpandedDayOfWeek())));
              break;
            case THIRD:
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(3,getWeekday(getExpandedDayOfWeek())));
              break;
            case BEFORE_LAST:
              nextDate = nextDate.with(TemporalAdjusters.lastInMonth(getWeekday(getExpandedDayOfWeek())));
              nextDate = nextDate.minusDays(7);
              break;
            case LAST:
              nextDate = nextDate.with(TemporalAdjusters.lastInMonth(getWeekday(getExpandedDayOfWeek())));
              break;
          }
        }
        if ( nextDate.isAfter(startDate) && nextDate.isAfter(LocalDate.now()) && ! nextDate.isAfter(end) ) {
          return nextDate;
        }
        return calculateNextMonth(x, start, true, startDate);
      `
    },
    {
      name: 'calculateNextYear',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusYears(getRepeat());
        }
        if ( ! nextDate.isAfter(LocalDate.now() )) {
          return calculateNextYear(x, nextDate, true);
        }
        return nextDate;
      `
    },

    // helper methods to get formatted frequency/start/end fields
    // todo implement properly
    {
      name: 'getFrequency',
      code: function() {
        return 'every ' + this.repeat + ' ' + this.frequency;
      }
    },
    {
      name: 'getStartDate',
      code: function() {
        return this.START_DATE.format(this.startDate);
      }
    },
    {
      name: 'getEndDate',
      code: function() {
        return this.ends + ' ' + ( this.ends == this.ScheduleEnd.ON ? this.ENDS_ON.format(this.endsOn) : this.endsAfter )
      }
    },
    {
      name: 'getWeekday',
      type: 'DayOfWeek',
      args: [
        {
          type: 'foam.time.DayOfWeek',
          name: 'day'
        }
      ],
      javaCode: `
        if ( day == foam.time.DayOfWeek.MONDAY ) {
          return DayOfWeek.MONDAY;
        } else if ( day == foam.time.DayOfWeek.TUESDAY ) {
          return DayOfWeek.TUESDAY;
        } else if ( day == foam.time.DayOfWeek.WEDNESDAY ) {
          return DayOfWeek.WEDNESDAY;
        } else if ( day == foam.time.DayOfWeek.THURSDAY ) {
          return DayOfWeek.THURSDAY;
        } else if ( day == foam.time.DayOfWeek.FRIDAY ) {
          return DayOfWeek.FRIDAY;
        } else if ( day == foam.time.DayOfWeek.SATURDAY ) {
          return DayOfWeek.SATURDAY;
        }else {
          return DayOfWeek.SUNDAY;
        }
      `
    },
    {
      name: 'postExecution',
      javaCode: `
        int endsAfter = getEndsAfter();
        if ( endsAfter > 0 ) {
          setEndsAfter(--endsAfter);
        }
      `
    },
    {
      name: 'getEndOfWeek',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'date',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        // Todo change end of week based off country 
        return date.with(TemporalAdjusters.next(DayOfWeek.SATURDAY));
      `
    },
    {
      name: 'getStartOfWeek',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'date',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        // Todo change start of week based off country 
        return date.minusWeeks(1).with(TemporalAdjusters.next(DayOfWeek.SUNDAY));
      `
    }
  ]
});
