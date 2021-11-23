/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'AdvIntervalSchedule',
  implements: [
    'foam.nanos.cron.Schedule'
  ],

  javaImports: [
    'foam.core.X',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
  ],

  documentation: `
    Schedule periodically with a minutely,hourly,daily,weekly,monthly,yearly intervals.
  `,

  properties: [
    {
      class: 'DateTime',
      name: 'startDate',
      label: 'Start Date',
      documentation: 'Date of the first scheduled run.',
      order: 1,
      gridColumns: 3
    },
    {
      class: 'Int',
      name: 'intervalModifier',
      documentation: `Modifies the interval,
        example: for ever other week set this to 2 and interval to weekly
      `,
      validationPredicates: [
        {
          args: ['intervalModifier'],
          predicateFactory: function(e) {
            return e.GTE(foam.nanos.cron.AdvIntervalSchedule.INTERVAL_MODIFIER, 1);
          },
          errorString: 'Please enter a number greater than 1.'
        }
      ],
      value: 1,
      order: 2,
      gridColumns: 2
    },
    {
      class: 'String',
      name: 'interval',
      documentation: 'Time between last run and new scheduled date.',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: ['Minutely', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']
      },
      order: 3,
      gridColumns: 2
    }
  ],

  methods: [
    {
      name: 'getNextScheduledTime',
      type: 'Date',
      javaCode: `
        if ( new Date().before(getStartDate()) ) {
          return getStartDate();
        }

        LocalDateTime date = from.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        switch (getInterval()) {
          case "Minutely":
            date = date.plusMinutes(getIntervalModifier());
            break;
          case "Hourly":
            date = date.plusHours(getIntervalModifier());
            break;
          case "Daily":
            date = date.plusDays(getIntervalModifier());
            break;
          case "Weekly":
            date = date.plusWeeks(getIntervalModifier());
            break;
          case "Monthly":
            date = date.plusMonths(getIntervalModifier());
            break;
          case "Yearly":
            date = date.plusYears(getIntervalModifier());
            break;
        }
        return Date.from(date.atZone(ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});
