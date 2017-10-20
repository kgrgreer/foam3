foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Fee',

  methods: [
    function getFee(transactionAmount) {
      return 0;
    },
    function getTotalAmount(transactionAmount) {
      return transactionAmount;
    }
  ]
 });

// foam.INTERFACE({
//   package: 'net.nanopay.tx.model',
//   name: 'Fee',

//   methods: [
//     {
//       name: 'getFee',
//       javaReturns: 'long',
//       returns: 'Promise',
//       javaThrows: [ 'java.lang.RuntimeException' ],
//       args: [
//         {
//           name: 'transactionAmount',
//           javaType: 'long'
//         }
//       ]
//     },
//     {
//       name: 'getTotalAmount',
//       javaReturns: 'long',
//       returns: 'Promise',
//       javaThrows: [ 'java.lang.RuntimeException' ],
//       args: [
//         {
//           name: 'transactionAmount',
//           javaType: 'long'
//         }
//       ]
//     }
//   ]
// });