foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DVPTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account'
  ],

  documentation: 'Used solely to present a summary of LineItems for Securities DVP Transactions',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourcePaymentAccount',
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationPaymentAccount',
      required: true
    },
    {
      class: 'String',
      name: 'paymentDenomination',
      required: true
    }
  ]
});
