package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import net.nanopay.model.Business;
import net.nanopay.sme.onboarding.BusinessOnboarding;
import net.nanopay.sme.onboarding.OnboardingStatus;
import net.nanopay.sme.onboarding.USBusinessOnboarding;

import static foam.mlang.MLang.*;

/**
 * DAO decorator to update related BusinessOnboarding and USBusinessOnboarding
 * records of the business.
 *
 * When a signing officer submits business onboarding, the status of related
 * onboardings of the other users belong to the same business will be updated
 * to SUBMITTED.
 *
 * Otherwise (eg. when onboarding is SAVED or in DRAFT), no change to the
 * related onboardings should be triggered.
 */
public class UpdateOnboardingDAO extends ProxyDAO {
  public UpdateOnboardingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) {
      throw new RuntimeException("Cannot put null.");
    }

    long businessId = (long) obj.getProperty("businessId");
    var localBusinessDAO  = (DAO) x.get("localBusinessDAO");
    var business = (Business) localBusinessDAO.find(businessId);

    if ( business == null ) {
      throw new RuntimeException("Business doesn't exist");
    }

    long userId = (long) obj.getProperty("userId");
    var sink = new ArraySink();

    selectBusinessOnboarding(x, sink, businessId, userId);
    selectUsBusinessOnboarding(x, sink, businessId, userId);

    for ( var onboarding : sink.getArray() ) {
      var updated = maybeUpdate((FObject) onboarding, obj);
      if ( ! updated.equals(onboarding) ) {
        getDelegate().put_(x, updated);
      }
    }

    return getDelegate().put_(x, obj);
  }

  private void selectBusinessOnboarding(
    X x, Sink sink, long businessId, long userId
  ) {
    var dao = (DAO) x.get("businessOnboardingDAO");
    dao.where(
      AND(
        EQ(BusinessOnboarding.BUSINESS_ID, businessId),
        NEQ(BusinessOnboarding.USER_ID, userId)
      )
    ).select(sink);
  }

  private void selectUsBusinessOnboarding(
    X x, Sink sink, long businessId, long userId
  ) {
    var dao = (DAO) x.get("uSBusinessOnboardingDAO");
    dao.where(
      AND(
        EQ(USBusinessOnboarding.BUSINESS_ID, businessId),
        NEQ(USBusinessOnboarding.USER_ID, userId)
      )
    ).select(sink);
  }

  private FObject maybeUpdate(FObject obj, FObject newObj) {
    var newStatus = (OnboardingStatus) newObj.getProperty("status");
    if ( newStatus != OnboardingStatus.SUBMITTED ) {
      return obj;
    }

    var updated             = (FObject) newObj.fclone();
    var isSigningOfficer    = (boolean) obj.getProperty("signingOfficer");
    var signingOfficerEmail = isSigningOfficer ? null :
      (String) obj.getProperty("signingOfficerEmail");

    updated.setProperty("userId", obj.getProperty("userId"));
    updated.setProperty("signingOfficer", isSigningOfficer);
    updated.setProperty("signingOfficerEmail", signingOfficerEmail);
    return updated;
  }
}
