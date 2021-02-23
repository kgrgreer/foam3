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
  name: 'PlanCostComparator',

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
          return Long.compare(plan1.getTotalPlanCost(), plan2.getTotalPlanCost());
        }
        return 0;
      `
    },
  ]

});
