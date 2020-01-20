/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
// This service expects an account ID to be passed as a long, and returns a balance as a long.
package net.nanopay.account;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.account.*;
import foam.util.SafetyUtil;
import foam.mlang.MLang;

import java.util.ArrayList;
import java.util.List;

import net.nanopay.fx.ExchangeRateService;


public class BalanceService
  extends ContextAwareSupport
  implements  net.nanopay.account.BalanceServiceInterface {

  private DAO balanceDAO_ = null;
  private DAO accountDAO_ = null;
  private ExchangeRateService exchangeRateService_ = null;

  protected DAO getBalanceDAO() {
    if (balanceDAO_ == null) balanceDAO_ = (DAO) getX().get("balanceDAO");

    return balanceDAO_;
  }
  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) accountDAO_ = (DAO) getX().get("accountDAO");

    return accountDAO_;
  }
  protected ExchangeRateService getExchangeRateService() {
    if ( exchangeRateService_ == null ) exchangeRateService_ = (ExchangeRateService) getX().get("exchangeRateService");

    return exchangeRateService_;
  }

  @Override
  public long findBalance(X x, long id) throws RuntimeException {
    Account account = (Account) getAccountDAO().find(id);
    return findBalance_(x, account);
  }
  protected long findBalance_(X x, Account account){
    long balance = 0;

    if (account instanceof SecuritiesAccount ) {
      //TODO: check cache for balance
      List subAccounts =  ((ArraySink) account.getSubAccounts(getX()).select(new ArraySink())).getArray();
      for ( Object obj : subAccounts ) {
        SecurityAccount secAccount = (SecurityAccount) obj;
        balance += getExchangeRateService().exchange(secAccount.getDenomination(), account.getDenomination(), secAccount.findBalance(getX()));
      }
      // TODO: can we ttl cache balance to reduce calculations?
      return balance;
    }

    if (account instanceof AggregateAccount ) {
      //TODO: check cache for balance
      ArrayList children = (ArrayList) ((ArraySink) account.getChildren(getX()).select(new ArraySink())).getArray();
      for (Object child : children) {
        if (! (child instanceof AggregateAccount) )
          for (Object a : ((ArrayList) ((ArraySink) ((Account) child).getChildren(getX()).select(new ArraySink())).getArray()))
            children.add(a);
        long accBal = findBalance_(x, (Account) child);
        if (child instanceof AggregateAccount) {
          // TODO: ttl cache the balance.
          // something like myCache.cache(child,accBal)
        }
        balance += getExchangeRateService().exchange(((Account) child).getDenomination(), account.getDenomination(), accBal);
      }
      return balance;
    }
    return (getBalanceDAO().find(account.getId())) == null ? 0 : (((Balance) getBalanceDAO().find(account.getId())).getBalance());
  }



}
