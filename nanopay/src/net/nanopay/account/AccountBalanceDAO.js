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
  name: 'AccountBalanceDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Adds balances to accounts',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.ProxySink'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        Account account = (Account) getDelegate().find_(x, id);
        if ( account == null ) {
          return account;
        }
        BalanceService bs = (BalanceService) x.get("balanceService");
        long bal = bs.findBalance_(x, account);
        if ( bal != 0 ) {
          account = (Account) account.fclone();
          account.setBalance(bal);
        }
        return account;
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink refinedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              Account account = (Account) obj;
              BalanceService bs = (BalanceService) x.get("balanceService");
              long bal = bs.findBalance_(x, account);
              if ( bal != 0 ) {
                account = (Account) account.fclone();
                account.setBalance(bal);
              }
              super.put(account, sub);
            }
          };
          return ((ProxySink) super.select_(x, refinedSink, skip, limit, order, predicate)).getDelegate();
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    }
  ]
});
