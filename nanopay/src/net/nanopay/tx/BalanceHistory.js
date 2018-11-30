foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BalanceHistory',

  documemtation: 'Model to be added to transaction reference data for displaying balance before and after transaction.',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'Long',
      name: 'accountId'
    },
    {
      class: 'Long',
      name: 'balanceBefore'
    },
    {
      class: 'Long',
      name: 'balanceAfter'
    },
    {
      class: 'DateTime',
      name: 'created',
      factory: function() { return new Date(); }
    }
  ]

});
