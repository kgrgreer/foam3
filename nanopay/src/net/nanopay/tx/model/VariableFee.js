foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'VariableFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Double',
      name: 'percentage'
    },
    {
      class: 'Long',
      name: 'fixedFee'
    },
    {
      class: 'Long',
      name: 'fixedFeeLimit'
    }
  ],

  methods: [
    function getFee(transactionAmount) {
      if ( transactionAmount < fixedFeeLimit ) {
        return this.percentage * transactionAmount;
      }
      return this.fixedFee;
    },
    function getTotalAmount(transactionAmount) {
      return getFee(transactionAmount) + transactionAmount;
    }
  ]
});
