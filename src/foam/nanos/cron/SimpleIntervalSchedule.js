/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'SimpleIntervalSchedule',

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  messages: [
    { name: 'START_DATE_ERROR', message: 'Start Date must be after today' },
    { name: 'ENDS_ON_ERROR', message: 'End Date must be after start date' },
    { name: 'INVALID_DATE_ERROR', message: 'Please provide the date' }
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
      name: 'startDate',
      validateObj: function(startDate) {
        if ( ! startDate ) return this.INVALID_DATE_ERROR;
        // check against current date
        if ( startDate <= new Date() ) return this.START_DATE_ERROR;
      }
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
      },
      validateObj: function(endsOn) {
        if ( ! endsOn ) return this.INVALID_DATE_ERROR;
        // check against start date
        if ( endsOn <= this.startDate ) return this.ENDS_ON_ERROR;
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
      code: function() {
        //TODO:
        return new Date();
      },
      javaCode:`
        //TODO:
        return new java.util.Date();
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
    }
  ]
});
