foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'FixedFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Currency',
      name: 'amount'
    }
  ],

  methods: [
    function calculateAmount(transactionAmount) { return this.amount; }
  ]
});
