/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
// This service expects values to be passed as a long, and takes into account that precision may vary.
package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.core.Currency;
import foam.core.Unit;
import foam.dao.DAO;
import foam.util.SafetyUtil;
import net.nanopay.exchangeable.Security;


public class ExchangeRateService
  extends ContextAwareSupport
implements  ExchangeRateServiceInterface {

  private DAO exchangeRateDAO_ = null;
  private DAO currencyDAO_ = null;
  private DAO securitiesDAO_ = null;
  private DAO securityPriceDAO_ = null;

  protected DAO getExchangeRateDAO() {
    if ( exchangeRateDAO_ == null ) exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");

    return exchangeRateDAO_;
  }
  protected DAO getSecurityPriceDAO() {
    if ( securityPriceDAO_ == null ) securityPriceDAO_ = (DAO) getX().get("securityPriceDAO");
    return securityPriceDAO_;
  }
  protected DAO getCurrencyDAO() {
    if ( currencyDAO_ == null ) currencyDAO_ = (DAO) getX().get("currencyDAO");

    return currencyDAO_;
  }
  protected DAO getSecuritiesDAO() {
    if ( securitiesDAO_ == null ) securitiesDAO_ = (DAO) getX().get("securitiesDAO");

    return securitiesDAO_;
  }

  @Override
  public long exchange(String u1, String u2, long amount) throws RuntimeException {
    return (long) Math.floor(amount * getRate(u1,u2));
  }

  public double getRate(String u1, String u2) {
    Unit unit1 = findUnit(u1);
    Unit unit2 = findUnit(u2);
    double rate;
    try {
      rate = getFromDAOs(unit1, unit2);
    }
    catch(Exception e) {
      try {
        rate = 1 / getFromDAOs(unit2, unit1);
      }
      catch(Exception e2) {
        try {
          if (SafetyUtil.equals(u1,"USD") || SafetyUtil.equals(u2,"USD")) throw new RuntimeException("No rate found");
          double r1 = getRate(u1, "USD");
          double r2 = getRate("USD", u2);
          rate = r1 * r2;
        }
        catch(Exception e3){
          throw e;
        }
      }
    }
    return (rate / Math.pow(10,unit1.getPrecision())) * Math.pow(10,unit2.getPrecision());
  }

  protected double getFromDAOs(Unit u1, Unit u2) {
    double rate = 0;
    if (u1 instanceof Currency) {
      if ( u2 instanceof Currency) {
        ExchangeRateId id = new ExchangeRateId();
        id.setFromCurrency(u1.getId());
        id.setToCurrency(u2.getId());
        ExchangeRate er = (ExchangeRate) getExchangeRateDAO().find(id);
        if (er != null) {
          return er.getRate();
        }
        throw new RuntimeException("Rate Not Found for: "+u1 + " and "+ u2);
      }
      if ( u2 instanceof Security ) {
        SecurityPriceId id = new SecurityPriceId();
        id.setSecurity(u2.getId());
        id.setCurrency(u1.getId());
        SecurityPrice sp = (SecurityPrice) getSecurityPriceDAO().find(id);
        if (sp != null) {
          return sp.getPrice();
        }
        throw new RuntimeException("Rate Not Found for: "+u2 + " and "+ u1);
      }

    }
    if (u1 instanceof Security) {
      if (u2 instanceof Currency) {
        SecurityPriceId id = new SecurityPriceId();
        id.setSecurity(u1.getId());
        id.setCurrency(u2.getId());
        SecurityPrice sp = (SecurityPrice) getSecurityPriceDAO().find(id);
        if (sp != null) {
          return sp.getPrice();
        }
        throw new RuntimeException("Rate Not Found for: "+u1 + " and "+ u2);
      }
      if (u2 instanceof Security) {
        throw new RuntimeException("Security to Security not supported for: "+u1 + " and "+ u2);
      }
    }
    return rate;
  }

  protected Unit findUnit(String s) {
    Object s1 = getCurrencyDAO().find(s);
    if (s1 == null)
      s1 = getSecuritiesDAO().find(s);
    if (s1 == null)
      throw new RuntimeException("Neither currency nor Security of "+ s1 + " was found.");
    return (Unit) s1;
  }

}
