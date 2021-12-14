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
      name: 'frequency',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['Day', 'Day'],
          ['Week', 'Week'],
          ['Month', 'Month'],
          ['Year', 'Year']
        ]
      },
      gridColumns: 6,
      updateVisibility: function(repeat) {
        if ( repeat < 1 ) {
          return foam.u2.DisplayMode.DISABLED};
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      name: 'dayOfWeek',
      label: 'On',
      //will be replaced by multiselect dayofweek view
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['Monday', 'Monday'],
          ['Tuesday', 'Tuesday'],
          ['Wednesday', 'Wednesday'],
          ['Thursday', 'Thursday'],
          ['Friday', 'Friday']
        ]
      },
      updateVisibility: function(frequency) {
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
      updateVisibility: function(frequency) {
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
          [1, 1],
          [2, 2]
        ]
      },
      updateVisibility: function(monthlyChoice, frequency) {
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
          ['First', 'First'],
          ['Second', 'Second'],
          ['Third', 'Third'],
          ['Before Last', 'Before Last'],
          ['Last', 'Last']
        ]
      },
      gridColumns: 6,
      updateVisibility: function(monthlyChoice, frequency ) {
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
          ['Monday', 'Monday'],
          ['Tuesday', 'Tuesday'],
          ['Wednesday', 'Wednesday'],
          ['Thursday', 'Thursday'],
          ['Friday', 'Friday'],
          ['Weekday', 'Weekday']
        ]
      },
      gridColumns: 6,
      updateVisibility: function(monthlyChoice, frequency) {
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
          ['Never', 'Never'],
          ['On', 'On'],
          ['After', 'After']
        ]
      },
      gridColumns: 6,
      updateVisibility: function(repeat) {
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
      updateVisibility: function(ends) {
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
      updateVisibility: function(ends) {
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
  ]
});
