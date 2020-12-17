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
  package: 'net.nanopay.tx.fee',
  name: 'Rate',

  documentation: 'Rate for fee line items',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'formula',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.fee.Fee',
      name: 'feeId'
    }
  ],

  methods: [
    {
      name: 'getValue',
      type: 'Double',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      javaCode: 'return ((Number) getFormula().f(obj)).doubleValue();'
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public Rate(Fee fee) {
            setName(fee.getName());
            setFormula(fee.getFormula());
            setFeeId(fee.getId());
          }
        `);
      }
    }
  ]
});
