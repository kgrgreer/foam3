foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanETAComparator',

  documentation: ``,

  implements: ['net.nanopay.tx.PlanComparator'],

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'compare',
      type: 'Integer',
      args: [
        {
          name: 'o1',
          type: 'Any'
        },
        {
          name: 'o2',
          type: 'Any'
        }
      ],
      javaCode: `
        if ( o1 instanceof Transaction &&  o2 instanceof Transaction ) {
          Transaction plan1 = (Transaction) o1;
          Transaction plan2 = (Transaction) o2;
          return Long.compare(plan1.getEta(), plan2.getEta());
        }
        return 0;
`
    },
  ]

});
