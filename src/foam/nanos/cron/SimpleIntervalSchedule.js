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
      class: 'Int',
      name: 'dayOfMonth',
      label: '',
      //will be replaced by multiselect dayofmonth view
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          1,
          2
        ]
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
        int repeatEvery = getRepeat();
        LocalDate startDate = getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate nextDate = LocalDate.now();
        if ( startDate.isAfter(nextDate) ) {
          return getStartDate();
        }
        switch (getFrequency()) {
          case "Day":
            nextDate = nextDate.plusDays(repeatEvery);
            break;
          case "Week":
            nextDate = nextDate.plusWeeks(getRepeat());
            LocalDate minDate = nextDate;
            String[] days = getDayOfWeek();
            nextDate = nextDate.with(TemporalAdjusters.next(getWeekday(days[0])));
            for ( int i=1; i < days.length; i++ ) {
              LocalDate date = nextDate.with(getWeekday(days[i]));
              if ( date.isAfter(minDate) && date.isBefore(nextDate) ) {
                nextDate = date;
              }
            }
            break;
          case "Month":
            nextDate = nextDate.plusMonths(repeatEvery);
            if ( getMonthlyChoice() == 2 ) {
              nextDate = nextDate.withDayOfMonth(getDayOfMonth());
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
            break;
          case "Year":
            nextDate = nextDate.plusYears(repeatEvery);
            break;
        }
        return Date.from(nextDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
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
    }
  ]
});
