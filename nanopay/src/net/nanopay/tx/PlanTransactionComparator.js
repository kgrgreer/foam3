/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
          int result = comparator.compare(o1, o2);
          if (result != 0) return result;
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
