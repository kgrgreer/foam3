foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Fee',

  methods: [
    function getFee(transactionAmount) {
      return 0;
    },
    function getTotalAmount(transactionAmount) {
      return getFee(transactionAmount) + transactionAmount;
    }
  ]
 });