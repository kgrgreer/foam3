/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'SimpleIntervalSchedule',

  javaImports: [
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
          this.frequency = 'Day';
          this.ends = 'Never';
        }
      }
    },
    {
      class: 'String',
      name: 'frequency',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Day',
          'Week',
          'Month',
          'Year'
        ]
      },
      gridColumns: 6,
      visibility: function(repeat) {
        if ( repeat < 1 ) {
          return foam.u2.DisplayMode.DISABLED};
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Array',
      of: 'String',
      name: 'dayOfWeek',
      label: 'On',
      view: {
        class: 'foam.u2.view.DayOfWeekView',
      },
      visibility: function(frequency) {
        if ( frequency != 'Week' )
           return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Int',
      name: 'monthlyChoice',
      label: '',
      view: {
       class: 'foam.u2.view.RadioView',
       choices: [
         [1, 'On The...'],
         [2, 'Each']
        ],
       isHorizontal: true
      },
      visibility: function(frequency) {
        if ( frequency != 'Month')
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
        class: 'foam.u2.view.DayOfMonthView',
      },
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != 'Month' )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != 2 )
           return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
    //first , second , third ...
    class: 'String',
      name: 'vagueFreq',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'First',
          'Second',
          'Third',
          'Before Last',
          'Last'
        ]
      },
      gridColumns: 6,
      visibility: function(monthlyChoice, frequency ) {
        if ( frequency != 'Month' )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice !=  1 )
           return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'String',
      name: 'expandedDayOfWeek',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Weekday'
        ]
      },
      gridColumns: 6,
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != 'Month' )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != 1 )
           return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'String',
      name: 'ends',
      label: 'Ends',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Never',
          'On',
          'After'
        ]
      },
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
      label: '',
      gridColumns: 6,
      visibility: function(ends) {
        if ( ends != 'On' )
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
        if ( ends != 'After' )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    }
  ],
  methods: [
    {
      name: 'getNextScheduledTime',
      javaCode: `
        LocalDate date = getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return Date.from(calculateNextDate(x, date, false).atStartOfDay(ZoneId.systemDefault()).toInstant());
      `
    },
    {
      name: 'calculateNextDate',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'date',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        }
      ],
      javaCode: `
        LocalDate startDate = getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate endsOn = getEndsOn().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate nextDate = date;

        // Check if schedule duration has been exceeded
        if ( getEnds().equals("After") && getEndsAfter() == 0 || getEnds().equals("On") && ! LocalDate.now().isBefore(endsOn) ) {
          return null;
        }

        if ( startDate.isAfter(nextDate) ) {
          nextDate = startDate;
        }
        switch (getFrequency()) {
          case "Day":
            nextDate = calculateNextDay(x, nextDate, applyWait);
            break;
          case "Week":
            nextDate = calculateNextWeek(x, nextDate, applyWait);
            break;
            case "Month":
            nextDate = calculateNextMonth(x, nextDate, applyWait, startDate);
            break;
          case "Year":
            nextDate = calculateNextYear(x, nextDate, applyWait, startDate);
            break;
        }

        if ( getEnds().equals("On") && ! nextDate.isBefore(endsOn) ) {
          return null;
        }
        return nextDate;
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
        System.out.println("date " + nextDate);
        if ( ! nextDate.isAfter(LocalDate.now()) ) {
          return calculateNextDate(x, nextDate, true);
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
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusWeeks(getRepeat());
          System.out.println("min " + nextDate);
        }
        LocalDate minDate = getStartOfWeek(x,nextDate);
        LocalDate endOfWeek = getEndOfWeek(x,minDate);
        String[] days = getDayOfWeek();
        nextDate = minDate.with(TemporalAdjusters.next(getWeekday(days[0])));
        if ( ! nextDate.isAfter(endOfWeek) ) {
          System.out.println("date " + nextDate);
        } 
        for ( int i=1; i < days.length; i++ ) {
          LocalDate temp = minDate.with(TemporalAdjusters.next(getWeekday(days[i])));
          if ( ! temp.isAfter(endOfWeek) ) {
            System.out.println("date " + temp);
          }
          if ( temp.isAfter(LocalDate.now()) && ( temp.isBefore(nextDate) || ! nextDate.isAfter(LocalDate.now())) ) {
            nextDate = temp;
          }
        }
        if ( nextDate.isAfter(LocalDate.now()) && ! nextDate.isAfter(endOfWeek) ) {
          return nextDate;
        } else {
          return calculateNextDate(x, minDate, true);
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
        if ( getMonthlyChoice() == 2 ) {
          LocalDate start = nextDate.with(TemporalAdjusters.firstDayOfMonth());
          LocalDate end = nextDate.with(TemporalAdjusters.lastDayOfMonth());

          for ( Object day : getDayOfMonth() ) {
            LocalDate temp = start.plusDays(((Long)day)-1);
            if ( temp.isAfter(LocalDate.now()) && ( temp.isBefore(nextDate) || ! nextDate.isAfter(LocalDate.now())) ) {
              nextDate = temp;
            }
          }

          if ( nextDate.isAfter(LocalDate.now()) && ! nextDate.isAfter(end) ) {
            return nextDate;
          } else {
            return calculateNextDate(x, start,true);
          }
        } else {
          switch (getVagueFreq()) {
            case "First":
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(1,getWeekday(getExpandedDayOfWeek())));
              break;
            case "Second":
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(2,getWeekday(getExpandedDayOfWeek())));
              break;
            case "Third":
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(3,getWeekday(getExpandedDayOfWeek())));
              break;
            case "Before Last":
              nextDate = nextDate.with(TemporalAdjusters.lastInMonth(getWeekday(getExpandedDayOfWeek())));
              nextDate = nextDate.minusDays(7);
              break;
            case "Last":
              nextDate = nextDate.with(TemporalAdjusters.lastInMonth(getWeekday(getExpandedDayOfWeek())));
              break;
          }
        }
        System.out.println("date " + nextDate);
        if ( ! nextDate.isAfter(startDate) && ChronoUnit.MONTHS.between(nextDate, startDate) == 0 ) {
          return calculateNextDate(x, nextDate.plusMonths(1), false);
        }
        if ( ! nextDate.isAfter(LocalDate.now()) ) {
          return  calculateNextDate(x, nextDate, true);
        }
        return nextDate;
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
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusYears(getRepeat());
        }
        System.out.println("date " + nextDate);
        if ( startDate.isAfter(LocalDate.now()) ) {
          nextDate = startDate;
        } else if ( ! nextDate.isAfter(LocalDate.now() )) {
          return calculateNextDate(x, nextDate, true);
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
        return this.ends + ' ' + ( this.ends == 'On' ? this.ENDS_ON.format(this.endsOn) : this.endsAfter )
      }
    },
    {
      name: 'getWeekday',
      type: 'DayOfWeek',
      args: [
        {
          type: 'String',
          name: 'day'
        }
      ],
      javaCode: `
        if ( day.equals("Monday") || day.equals("Mon") ) {
          return DayOfWeek.MONDAY;
        } else if ( day.equals("Tuesday") || day.equals("Tue") ) {
          return DayOfWeek.TUESDAY;
        } else if ( day.equals("Wednesday") || day.equals("Wed") ) {
          return DayOfWeek.WEDNESDAY;
        } else if ( day.equals("Thursday") || day.equals("Thur") ) {
          return DayOfWeek.THURSDAY;
        } else if ( day.equals("Friday") || day.equals("Fri") ) {
          return DayOfWeek.FRIDAY;
        } else if ( day.equals("Saturday") || day.equals("Sat") ) {
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
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusYears(getRepeat());
        }
        System.out.println("date " + nextDate);
        if ( startDate.isAfter(LocalDate.now()) ) {
          nextDate = startDate;
        } else if ( ! nextDate.isAfter(LocalDate.now() )) {
          return calculateNextDate(x, nextDate, true);
        }
        return nextDate;
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
        return date.minusWeeks(1).with(TemporalAdjusters.next(DayOfWeek.SUNDAY));
      `
    }
  ]
});
