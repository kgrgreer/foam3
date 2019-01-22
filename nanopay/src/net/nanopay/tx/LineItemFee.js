foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LineItemFee',

  implements: ['foam.nanos.auth.EnabledAware'],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: foam.u2.Visibility.RO
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
          javaType: 'long',
          swiftType: 'Int',
        }
      ],
      javaReturns: 'long',
      swiftReturns: 'Int',
      javaCode: `
      if ( this.getAmount().getType() == LineItemAmountType.TOTAL ) {
        return this.getAmount().getValue();
      } else {
        return ((Double) (this.getAmount().getValue()/100.0 * transactionAmount)).longValue();
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
