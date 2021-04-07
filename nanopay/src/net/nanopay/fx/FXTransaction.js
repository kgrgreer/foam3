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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Base class of Exchange Rate Transactions.
Stores all Exchange Rate info.`,

  implements: [
    'net.nanopay.tx.AcceptAware',
    'net.nanopay.tx.ValueMovementTransaction'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Foreign Exchange';
      },
      javaFactory: `
        return "Foreign Exchange";
      `
    },
    {
      name: 'fxRate',
      class: 'Double',
      section: 'transactionInformation',
      order: 200,
      gridColumns: 6,
      visibility: 'RO',
      view: function (_, X) {
        return {
          class: 'foam.u2.TextField',
          mode: foam.u2.DisplayMode.RO,
          data$: this.fxRate.map(fx => { return fx != 1 ? 'Rate: ' + fx : 'No Fx'; })
        };
      }
    },
    {
      name: 'fxQuoteId',
      class: 'String',
      aliases: [ 'fxQuoteCode' ],
      section: 'transactionInformation',
      order: 205,
      gridColumns: 6
    },
    {
      name: 'fxFees',
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.FeesFields',
      section: 'transactionInformation',
      order: 210,
      gridColumns: 6
    },
    {
      name: 'fxExpiry',
      class: 'DateTime',
      section: 'transactionInformation',
      order: 220,
      gridColumns: 6
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false,
      section: 'transactionInformation',
      order: 225,
      gridColumns: 6
    },
    {
      name: 'paymentMethod',
      class: 'String',
      section: 'transactionInformation',
      order: 260,
      gridColumns: 6
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        super.validate(x);
/*
        User sourceOwner = findSourceAccount(x).findOwner(x);
        if ( sourceOwner instanceof Business
          && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED)
        ) {
          throw new RuntimeException("Sender needs to pass business compliance.");
        }

        User destinationOwner = findDestinationAccount(x).findOwner(x);
        if ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
          // We throw when the destination account owner failed compliance however
          // we obligate to not expose the fact that the user failed compliance.
          throw new RuntimeException("Receiver needs to pass compliance.");
        } Not needed in liquid Ablii specific validations need to be moved to rules. */
      `
    },
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
/* nop */
`
},
  ]
});
