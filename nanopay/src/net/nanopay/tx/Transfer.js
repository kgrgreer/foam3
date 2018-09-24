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
    }
  ],

  methods: [

    {
      name: 'validate',
      javaReturns: 'void',
      javaCode: `
        if ( getAmount() == 0 ) throw new RuntimeException("Zero transfer disallowed.");
      `
    },
    {
      name: 'validateBalance',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'balance',
          of: 'Balance'
        }
      ],
      javaReturns: 'void',
      javaCode: `
      Account account = findAccount(x);
      if ( account == null ) {
        throw new RuntimeException("Unknown account: " + getAccount());
      }
      account.validateAmount(x, balance, getAmount());
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
