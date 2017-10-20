foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'FixedFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Currency',
      name: 'fixedFee'
    }
  ],

  methods: [
    function getFee(transactionAmount) {
      return this.fixedFee;
    },
    function getTotalAmount(transactionAmount) {
      return getFee(transactionAmount) + transactionAmount;
    }
  ]
});
