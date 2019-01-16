foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Transfer',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance'
  ],

  properties: [
    {
      name: 'description',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'Long'
    },
    {
      name: 'account',
      class: 'Reference',
      of: 'net.nanopay.account.Account'
    },
    {
      documentation: 'Time transfer was applied. Also reverse transfers are only displayed if they have been executed.',
      name: 'executed',
      class: 'DateTime',
    },
    {
      documentation: 'Control which Transfers are visible in customer facing views.  Some transfers such as Reversals, or internal Digital account transfers are not meant to be visible to the customer.',
      name: 'visible',
      class: 'Boolean',
      value: false,
      hidden: true
    }
  ],

  methods: [

    {
      name: 'validate',
      javaReturns: 'void',
      javaCode: `
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'balance',
          of: 'Balance'
        }
      ],
      javaReturns: 'void',
      javaCode: `
      balance.setBalance(balance.getBalance() + getAmount());
      `
    },
    {
      name: 'getLock',
      javaReturns: 'Object',
      javaCode: `
        return String.valueOf(getAccount()).intern();
      `
    }
  ]
});
