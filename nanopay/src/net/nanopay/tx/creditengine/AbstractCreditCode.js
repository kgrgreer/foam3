/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.creditengine',
  name: 'AbstractCreditCode',
  abstract: true,

  documentation: `A creditCode can create a credit line item on a given transaction or fee.
  It can also execute some logic on consumption, as well as execute some logic on a transaction update.
  It must also be able to calculate savings it applied to a given transaction.
  All creditCodes at minimum must be tied to a spid, have a UUID, and a name.`,

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    },
    {
      name: 'id',
      class: 'String',
      javaFactory: `return java.util.UUID.randomUUID().toString();`,
    },
    {
      class: 'String',
      name: 'name',
      javaFactory: `
        return getClass().getSimpleName();
      `,
    }
  ],

  methods: [
    {
      name: 'createOnTransaction',
      args: [
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.CreditLineItem',
      javaCode: `
        /* can be overwritten by extending class */
        return null;
      `,
      documentation: 'Create a credit line item based on the transaction as a whole'
    },
    {
      name: 'totalSaved',
      args: [
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Long',
      javaCode: `
      /* needs to be overwritten by extending class */
        return -1;
      `,
      documentation: 'calculates how much this promo has saved on this transaction'
    },
    {
      name: 'createOnFee',
      args: [
        {
          name: 'fli',
          type: 'net.nanopay.tx.FeeLineItem'
        }
      ],
      type: 'net.nanopay.tx.CreditLineItem',
      javaCode: `
       /* can be overwritten by extending class */
        return null;
      `,
      documentation: 'Create a credit line item based on a other credit line item'
    },
    {
      name: 'consume',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        //nop
      `,
      documentation: 'When the Credit code is consumed on final submission of transaction increment its usage count'
    },
    {
      name: 'onUpdate',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        //nop
      `,
      documentation: 'On a successful update to the transaction, '
    },
  ]

});
