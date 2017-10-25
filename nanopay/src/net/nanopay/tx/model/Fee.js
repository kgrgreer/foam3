foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Fee',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.FeeType',
      name: 'type'
    }
  ],

  methods: [
    function getFee(transactionAmount) {
      return 0;
    },
    function getTotalAmount(transactionAmount) {
      return getFee(transactionAmount) + transactionAmount;
    }
  ]
 });