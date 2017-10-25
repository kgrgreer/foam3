foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'InformationalFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Long',
      name: 'amount'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.FeeType',
      name: 'type',
      factory: function() { return net.nanopay.tx.model.FeeType.INFORMATIONAL; },
      javaFactory: `return net.nanopay.tx.model.FeeType.INFORMATIONAL;`
    }
  ],

  methods: [
    function getFee(transactionAmount) {
      return this.amount;
    },
    function getTotalAmount(transactionAmount) {
      return getFee(transactionAmount) + transactionAmount;
    }
  ]
});
