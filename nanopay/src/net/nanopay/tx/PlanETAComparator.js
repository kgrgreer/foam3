foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanETAComparator',

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
        if ( o1 instanceof PlanTransaction &&  o2 instanceof PlanTransaction ) {
          PlanTransaction plan1 = (PlanTransaction) o1;
          PlanTransaction plan2 = (PlanTransaction) o2;
          return ((Long)plan1.getEta()).compareTo((Long)plan2.getEta());
        }
        return 0;
`
    },
  ]

});
