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
    { name: 'INVALID_DATE_ERROR', message: 'Please provide the date' },
    { name: 'MAX_DATE_ERROR', message: 'Date cannot be after maximum date' }
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate',
      validateObj: function(startDate) {
        if ( ! startDate ) return this.INVALID_DATE_ERROR;

        // check against max date : set max date 350 years in the future
        const maxDate = new Date(Date.now() + 1000 * 3600 * 24 * 365 * 350);
        const df = maxDate.getFullYear() + '/' + (maxDate.getMonth() + 1) + '/' + maxDate.getDate();
        if ( startDate > maxDate ) return this.MAX_DATE_ERROR + ' [' + df + ']';

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
          this.frequency = 'Day';
          this.ends = 'Never';
        }
      }
    },
    {
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
      },
      validateObj: function(endsOn) {
        if ( ! endsOn ) return this.INVALID_DATE_ERROR;

        // check against max date : set max date 350 years in the future
        const maxDate = new Date(Date.now() + 1000 * 3600 * 24 * 365 * 350);
        const df = maxDate.getFullYear() + '/' + (maxDate.getMonth() + 1) + '/' + maxDate.getDate();
        if ( endsOn > maxDate ) return this.MAX_DATE_ERROR + ' [' + df + ']';

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
        if ( ends != 'After' )
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
        return this.ends + ' ' + ( this.ends == 'On' ? this.ENDS_ON.format(this.endsOn) : this.endsAfter )
      }
    }
  ]
});
