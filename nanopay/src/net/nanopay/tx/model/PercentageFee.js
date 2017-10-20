foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'PercentageFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Double',
      name: 'percentage'
    }
  ],

  methods: [
    function getFee(transactionAmount) {
      return this.percentage * transactionAmount;
    },
    function getTotalAmount(transactionAmount) {
      return getFee(transactionAmount) + transactionAmount;
    }
  ]
});
