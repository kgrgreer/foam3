/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Transfer',
  documentation: 'describes: what amount is added to which account (internal)',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'foam.util.SafetyUtil',
    'foam.core.ValidationException'
  ],

  javaImplements: [
    'java.lang.Comparable'
  ],

  properties: [
    {
      name: 'amount',
      class: 'Long'
    },
    {
      name: 'account',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      targetDAOKey: 'localAccountDAO'
    },
    {
      documentation: 'Time transfer was applied. Also reverse transfers are only displayed if they have been executed.',
      name: 'executed',
      class: 'DateTime',
    },
    {
      name: 'stage',
      class: 'Long',
      documentation: 'The transaction stage at which to execute this transfer',
      value: 0
    }
  ],

  methods: [
    {
      name: 'validate',
      /*args: [
        { name: 'x', type: 'Context'}
      ],*/
      type: 'Void',
      javaCode: `
        if ( getAmount() == 0 )
          throw new ValidationException("Transfer has no amount set");
        if ( SafetyUtil.isEmpty(getAccount()) )
          throw new ValidationException("No account specified on Transfer");

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
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public Transfer(String account, long amount) {
            setAmount(amount);
            setAccount(account);
          }
          public Transfer(String account, long amount, long stage) {
            setAmount(amount);
            setAccount(account);
            setStage(stage);
          }
        `);
      }
    }
  ]
});
