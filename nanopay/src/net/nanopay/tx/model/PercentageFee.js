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
    function calculateAmount(transactionAmount) { return transactionAmount * this.percentage; }
  ]
});
