foam.CLASS({
  package: 'net.nanopay.account',
  name: 'LoanAccount',
  extends: 'net.nanopay.account.Account',
  documentation: 'Base class/model of all LoanAccounts',

  javaImports: [
    'net.nanopay.account.Account'

  ],

  properties: [
    {
      class: 'Double',
      name: 'rate',
      documentation: 'The interest rate for the loan'
    },
    {
      name: 'lenderAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account where the loan $ are lent from'
    },
  ],
  methods:[

  ]

})
