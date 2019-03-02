foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanTransactionComparator',

  documentation: ``,

  implements: [
    'net.nanopay.tx.PlanComparator'
  ],

  javaImports: [
    'net.nanopay.tx.PlanComparator'
  ],

  properties: [
    {
      class: 'FObjectArray',
      name: 'planComparators',
      of: 'net.nanopay.tx.PlanComparator',
      factory: function() {
        return [];
      },
      type: 'net.nanopay.tx.PlanComparator[]',
      javaFactory: `
        return new PlanComparator[0];
      `
    }
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
        for ( PlanComparator comparator : getPlanComparators() ) {
            return comparator.compare(o1, o2);
        }
        return 0;
`
},
{
  name: 'add',
  code: function add(planComparator) {
    this.planComparators.push(planComparator);
  },
  args: [
    {
      name: 'planComparator',
      type: 'net.nanopay.tx.PlanComparator'
    }
  ],
  javaCode: `
    PlanComparator[] comparators = getPlanComparators();
    synchronized (comparators) {
      PlanComparator[] replacement = new PlanComparator[comparators.length + 1];
      System.arraycopy(comparators, 0, replacement, 0, comparators.length);
      replacement[comparators.length] = planComparator;
      setPlanComparators(replacement);
    }
  `
},
  ]
});
