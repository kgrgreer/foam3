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
  name: 'BulkTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  javaImports: [
    'foam.core.ValidationException',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'explicitCI',
      documentation: `
        When true, planners will add a Cash-In Transaction,
        rather than rely on liquidity or manual Cash-In to fund the appropriate
        Digital account.
      `,
      value: true
    },
    {
      class: 'Boolean',
      name: 'explicitCO',
      documentation: `
        When true, planners will add a Cash-Out Transaction,
        rather than leave Cash-Out to be dealt with via Liquidity.
      `,
      value: false
    },
    {
      name: 'children',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      transient: true,
      visibility: 'HIDDEN'
    }
  ],
  methods: [
    {
      name: `validateAmounts`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
        if ( getAmount() < 0) {
          throw new ValidationException("Amount cannot be negative");
        }

        if ( getDestinationAmount() < 0) {
          throw new ValidationException("Destination amount cannot be negative");
        }

      `
    }
  ]
});
