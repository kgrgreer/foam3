
foam.ENUM({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'DateFrequency',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'glang'
    }
  ],

  values: [
    {
      name: 'DAILY',
      label: 'Daily',
      glang: {
        class: 'foam.glang.EndOfDay'
      }
    },
    {
      name: 'WEEKLY',
      label: 'Weekly',
      glang: {
        class: 'foam.glang.EndOfWeek'
      }
    },
    {
      name: 'MONTHLY',
      label: 'Monthly',
      glang: {
        class: 'foam.glang.EndOfMonth'
      }
    },
    {
      name: 'QUARTERLY',
      label: 'Quarterly',
      glang: {
        class: 'foam.glang.EndOfQuarter'
      }
    },
    {
      name: 'ANNUALLY',
      label: 'Annually',
      glang: {
        class: 'foam.glang.EndOfYear'
      }
    },
  ]
});