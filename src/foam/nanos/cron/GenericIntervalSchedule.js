/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'GenericIntervalSchedule',

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate'
    },
    {
      name: 'repeat',
      label: 'Repeat Every',
      class: 'Int',
      gridColumns: 6
    },
    {
      name: 'frequency',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ ['Day', 'Day'], ['Week', 'Week'], ['Month', 'Month'], ['Year', 'Year'] ]
      },
      gridColumns: 6
    },
    {
      name: 'dayOfWeek',
      label: 'On',
      //will be replaced by multiselect dayofweek view
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ ['Monday', 'Monday'], ['Tuesday', 'Tuesday'], ['Wednesday', 'Wednesday'], ['Thursday', 'Thursday'], ['Friday', 'Friday'] ]
      }
    },
    {
      name: 'dayOfMonth',
      label: '',
      //will be replaced by multiselect dayofmonth view
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ [1, 1] , [2, 2] ]
      }
    },
    {
      name: 'ends',
      label: 'Ends',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ ['Never', 'Never'], ['On', 'On'], ['After', 'After']]
      }
    },
    {
      name: 'endsOnDate',
      class: 'Date',
      label: ''
    },
    {
      name: 'endsOnAfter',
      class: 'Int',
      label: ''
    },
    {
      name: 'monthlyChoice',
      label: '',
      view: {
       class: 'foam.u2.view.RadioView',
       choices: ['On The...', 'Each'],
       isHorizontal: true
      }
    },
    {
    //first , second , third ...
      name: 'vagueFreq',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ ['First', 'First'], ['Second', 'Second'], ['Third', 'Third'], ['Before Last', 'Before Last'], ['Last', 'Last'] ]
      }
    },
    {
      name: 'expandedDayOfWeek',
      label: '',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ ['Monday', 'Monday'], ['Tuesday', 'Tuesday'], ['Wednesday', 'Wednesday'], ['Thursday', 'Thursday'], ['Friday', 'Friday'], ['Weekday', 'Weekday'] ]
      }
    },
    {
      class: 'FObjectProperty',
      name: 'scheduledObject'
    }
  ],
  methods: [
    {
      name: 'getNextScheduledTime',
      code: function() {
        //TODO:
      },
      javaCode:`
        //TODO:
        return new java.util.Date();
      `
    },
  ]
});
