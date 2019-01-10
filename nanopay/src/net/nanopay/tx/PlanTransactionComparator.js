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
      javaType: 'PlanComparator[]',
      javaFactory: `
        return new PlanComparator[0];
      `
    }
  ],

  methods: [
    {
      name: 'compare',
      javaType: 'int',
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
      javaType: 'net.nanopay.tx.PlanComparator'
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
