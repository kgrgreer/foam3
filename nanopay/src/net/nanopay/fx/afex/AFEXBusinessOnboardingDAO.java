package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.logger.Logger;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.model.Business;


/**
 * This DAO would onboard user as a client on AFEX by calling AFEX API and then c
 * reates AFEXUser if the owner of the account has the required permission 
 */
public class AFEXBusinessOnboardingDAO
    extends ProxyDAO {

  public AFEXBusinessOnboardingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( !(obj instanceof Business) ) {
      return getDelegate().put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");
    logger.debug(this.getClass().getSimpleName(), "put", obj);

    Business business = (Business) getDelegate().put_(x, obj);
    if ( business.getCompliance().equals(ComplianceStatus.PASSED) ) {
      AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
      afexServiceProvider.onboardBusiness(business);
    }

    return business;
  }

}
