foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanCostComparator',

  documentation: ``,

  implements: ['net.nanopay.tx.PlanComparator'],

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

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
        if ( o1 instanceof Transaction &&  o2 instanceof Transaction ) {
          Transaction plan1 = (Transaction) o1;
          Transaction plan2 = (Transaction) o2;
          return plan1.getCost().compareTo(plan2.getCost());
        }
        return 0;
      `
    },
  ]

});
