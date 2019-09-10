
foam.ENUM({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'DateFrequency',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'startExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'endExpr'
    },
    {
      class: 'Int',
      name: 'numDataPoints'
    }
  ],

  values: [
    {
      name: 'DAILY',
      label: 'Daily',
      startExpr: {
        class: 'foam.glang.StartOfDay'
      },
      endExpr: {
        class: 'foam.glang.EndOfDay'
      },
      numDataPoints: 7
    },
    {
      name: 'WEEKLY',
      label: 'Weekly',
      startExpr: {
        class: 'foam.glang.StartOfWeek'
      },
      endExpr: {
        class: 'foam.glang.EndOfWeek'
      },
      numDataPoints: 4
    },
    {
      name: 'MONTHLY',
      label: 'Monthly',
      startExpr: {
        class: 'foam.glang.StartOfMonth'
      },
      endExpr: {
        class: 'foam.glang.EndOfMonth'
      },
      numDataPoints: 4
    },
    {
      name: 'QUARTERLY',
      label: 'Quarterly',
      startExpr: {
        class: 'foam.glang.StartOfQuarter'
      },
      endExpr: {
        class: 'foam.glang.EndOfQuarter'
      },
      numDataPoints: 4
    },
    {
      name: 'ANNUALLY',
      label: 'Annually',
      startExpr: {
        class: 'foam.glang.StartOfYear'
      },
      endExpr: {
        class: 'foam.glang.EndOfYear'
      },
      numDataPoints: 6
    },
  ]
});