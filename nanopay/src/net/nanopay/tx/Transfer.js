foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Transfer',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'foam.util.SafetyUtil'
  ],

  javaImplements: [
    'java.lang.Comparable'
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
      type: 'Void',
      javaCode: `
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        }
      ],
      type: 'Void',
      javaCode: `
      balance.setBalance(balance.getBalance() + getAmount());
      `
    },
    {
      name: 'getLock',
      type: 'Any',
      javaCode: `
        return String.valueOf(getAccount()).intern();
      `
    },
    {
      name: 'compareTo',
      type: 'int',
      args: [{ name: 't', type: 'net.nanopay.tx.Transfer'}],
      javaCode: `
        return SafetyUtil.compare(getAccount(),t.getAccount());
      `
    }
  ]
});
