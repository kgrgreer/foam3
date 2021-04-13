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
  package: 'net.nanopay.account',
  name: 'BalanceService',

  implements: [
    'net.nanopay.account.BalanceServiceInterface'
  ],

  javaImports: [
    'foam.core.ContextAwareSupport',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'net.nanopay.account.*',
    'foam.util.SafetyUtil',
    'foam.mlang.MLang',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.fx.ExchangeRateService',
    'foam.dao.ProxySink'
  ],

  methods: [
    {
      name: 'findBalances',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String[]'
        }
      ],
      type: 'long[]',
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        long[] balance = new long[id.length];
        for ( int i=0; i < id.length; i++ ) {
          Account account = (Account) accountDAO.find(id[i]);
          balance[i] = findBalance_(x, account);
        }
        return balance;
      `
    },
    {
      name: 'findBalances_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'account',
          type: 'net.nanopay.account.Account[]'
        }
      ],
      type: 'long[]',
      javaCode: `
        long[] balance = new long[account.length];
        
        for ( int i=0; i<account.length; i++ ) {
          balance[i] = findBalance_(x, account[i]);
        }
        return balance;
      `
    },
    {
      name: 'findBalance',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
      type: 'long',
      javaCode: `
        Account account = (Account) ((DAO) x.get("localAccountDAO")).find(id);
        return findBalance_(x, account);
      `
    },
    {
      name: 'findBalance_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'account',
          type: 'net.nanopay.account.Account'
        }
      ],
      type: 'long',
      javaCode: `
        if ( account == null ) {
          return 0;
        }
        if ( account instanceof BrokerAccount ) {
          return 0;
        }
        long balance = 0;
        ExchangeRateService exchangeRateService = (ExchangeRateService) getX().get("exchangeRateService");
        DAO balanceDAO = (DAO) x.get("balanceDAO");

        if (account instanceof SecuritiesAccount ) {
          //TODO: check cache for balance
          List subAccounts =  ((ArraySink) account.getSubAccounts(getX()).select(new ArraySink())).getArray();
          for ( Object obj : subAccounts ) {
            SecurityAccount secAccount = (SecurityAccount) obj;
            balance += exchangeRateService.exchange(secAccount.getDenomination(), account.getDenomination(), secAccount.findBalance(getX()));
          }
          // TODO: can we ttl cache balance to reduce calculations?
          return balance;
        }

        if (account instanceof AggregateAccount ) {
          //TODO: check cache for balance
          ArrayList children = (ArrayList) ((ArraySink) account.getChildren(getX()).select(new ArraySink())).getArray();
          int index = 0;
          while ( index < children.size() ) {
            Object child = children.get(index);
            if (! (child instanceof AggregateAccount) )
              for (Object a : ((ArrayList) ((ArraySink) ((Account) child).getChildren(getX()).select(new ArraySink())).getArray()))
                children.add(a);
            long accBal = findBalance_(x, (Account) child);
            if (child instanceof AggregateAccount) {
              // TODO: ttl cache the balance.
              // something like myCache.cache(child,accBal)
            }
            balance += exchangeRateService.exchange(((Account) child).getDenomination(), account.getDenomination(), accBal);
            index++;
          }
          return balance;
        }
        return (balanceDAO.find(account.getId())) == null ? 0 : (((Balance) balanceDAO.find(account.getId())).getBalance());
      `
    },
  ]
});
