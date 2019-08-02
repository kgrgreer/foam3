
foam.ENUM({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'DateFrequency',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'glang'
    },
    {
      class: 'Int',
      name: 'timeFactor'
    }
  ],

  values: [
    {
      name: 'DAILY',
      label: 'Daily',
      glang: {
        class: 'foam.glang.EndOfDay'
      },
      timeFactor: 7
    },
    {
      name: 'WEEKLY',
      label: 'Weekly',
      glang: {
        class: 'foam.glang.EndOfWeek'
      },
      timeFactor: 4
    },
    {
      name: 'MONTHLY',
      label: 'Monthly',
      glang: {
        class: 'foam.glang.EndOfMonth'
      },
      timeFactor: 4
    },
    {
      name: 'QUARTERLY',
      label: 'Quarterly',
      glang: {
        class: 'foam.glang.EndOfQuarter'
      },
      timeFactor: 4
    },
    {
      name: 'ANNUALLY',
      label: 'Annually',
      glang: {
        class: 'foam.glang.EndOfYear'
      },
      timeFactor: 6
    },
  ]
});