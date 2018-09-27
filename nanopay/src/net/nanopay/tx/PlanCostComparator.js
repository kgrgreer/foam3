foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanCostComparator',

  documentation: ``,

  implements: ['net.nanopay.tx.PlanComparator'],

  methods: [
    {
      name: 'compare',
      javaReturns: 'int',
      args: [
        {
          name: 'o1',
          javaType: 'Object'
        },
        {
          name: 'o2',
          javaType: 'Object'
        }
      ],
      javaCode: `
        if ( o1 instanceof TransactionPlan &&  o2 instanceof TransactionPlan ) {
          TransactionPlan plan1 = (TransactionPlan) o1;
          TransactionPlan plan2 = (TransactionPlan) o2;
          return ((Long)plan1.getCost()).compareTo((Long)plan2.getCost());
        }
        return 0;
`
    },
  ]

});
