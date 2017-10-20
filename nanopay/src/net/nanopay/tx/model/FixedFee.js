foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'FixedFee',
  implements: ['net.nanopay.tx.model.Fee'],

  properties: [
    {
      class: 'Currency',
      name: 'amount'
    }
  ],

  methods: [
    {
      name: 'getFee',
      code: function getFee(transactionAmount) {
        return this.amount;
      }
    },
    {
      name: 'getTotalAmount',
      code: function getTotalAmount(transactionAmount) {
        return this.getFee(transactionAmount) + transactionAmount;
      }
    }
  ]
});
