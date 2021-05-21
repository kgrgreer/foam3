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
  name: 'LineItemFee',

  implements: ['foam.nanos.auth.EnabledAware'],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'forType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.lineItemTypeDAO,
          objToChoice: function(o) {
            return [o.id, o.name];
          }
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.LineItemAmount',
      name: 'amount',
      factory: function() {
        return net.nanopay.tx.LineItemAmount.create();
      },
      javaFactory: `
      return new net.nanopay.tx.LineItemAmount();
      `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'feeType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.lineItemTypeDAO,
          objToChoice: function(o) {
            return [o.id, o.name];
          }
        });
      }
   },
    {
      class: 'Boolean',
      name: 'refundable',
      value: false
    }
  ],

  methods: [
    {
      name: 'getFeeAmount',
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: `
      if ( this.getAmount().getType() == LineItemAmountType.TOTAL ) {
        return this.getAmount().getValue();
      } else {
        return Math.round(this.getAmount().getValue() / 100.0 * transactionAmount);
      }
      `,
      // swiftCode: ' return fixedFee ',
      code: function() {
        if ( this.amount.type == LineItemAmountType.TOTAL ) {
          return this.amount.value;
        } else {
          return this.amount.value/100 * transactionAmount;
        }
      }
    }
  ]
});
