foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Transfer',

  javaImports: [
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
    }
  ],

  methods: [
    {
      name: 'validate',
      javaReturns: 'void',
      args: [
        {
          name: 'balance',
          of: 'Balance'
        }
      ],
      javaCode: `
      if ( getAmount() < 0 ) {
        if ( -getAmount() > balance.getBalance() ) {
          throw new RuntimeException("Insufficient balance in account " + getAccount());
        }
      }
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
