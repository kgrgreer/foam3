foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'PercentageFee',
  implements: ['net.nanopay.tx.model.Fee'],

  properties: [
    {
      class: 'Double',
      name: 'percentage'
    }
  ],

  methods: [
    {
      name: 'getFee',
      code: function getFee(transactionAmount) {
        return transactionAmount * this.percentage;
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
