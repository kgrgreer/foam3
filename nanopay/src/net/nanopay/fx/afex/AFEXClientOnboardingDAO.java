package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.logger.Logger;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;



/**
 * This DAO would onboard user as a client on AFEX by calling AFEX API and then c
 * reates AFEXUser if the owner of the account has the required permission 
 */
public class AFEXClientOnboardingDAO
    extends ProxyDAO {

  public AFEXClientOnboardingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( !(obj instanceof BankAccount) ) {
      return getDelegate().put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");
    logger.debug(this.getClass().getSimpleName(), "put", obj);

    BankAccount bankAccount = (BankAccount) getDelegate().put_(x, obj);
    if ( bankAccount.getStatus() == BankAccountStatus.VERIFIED ) {
      AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
      afexServiceProvider.onboardBusiness(bankAccount);
    }

    return bankAccount;
  }

}
