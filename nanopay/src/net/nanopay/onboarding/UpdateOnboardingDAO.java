package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;
import net.nanopay.sme.onboarding.BusinessOnboarding;
import net.nanopay.sme.onboarding.USBusinessOnboarding;
import net.nanopay.sme.onboarding.OnboardingStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
 * When Onboarding object is updated, this decorator is called to update(copy)
 * all the existing onboardings under the same BusinessId by iterating.
 */

public class UpdateOnboardingDAO extends ProxyDAO {
  private DAO localBusinessDAO_;
  private DAO businessOnboardingDAO_;
  private DAO uSBusinessOnboardingDAO_;
  private BusinessOnboarding businessOnboarding;
  private BusinessOnboarding newBusinessOnboardingClone;
  private USBusinessOnboarding uSBusinessOnboarding;
  private USBusinessOnboarding newUSBusinessOnboardingClone;
  private long businessId;

  public UpdateOnboardingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    localBusinessDAO_ = (DAO) x.get("localBusinessDAO");
    businessOnboardingDAO_ = (DAO) x.get("businessOnboardingDAO");
    uSBusinessOnboardingDAO_ = (DAO) x.get("uSBusinessOnboardingDAO");
    businessId = 0;
    businessOnboarding = null;
    uSBusinessOnboarding = null;

    if ( obj == null ) {
      throw new RuntimeException("Cannot put null.");
    }

    // copy newly updated onboarding object
    if ( obj instanceof BusinessOnboarding ) {
      businessOnboarding = (BusinessOnboarding) obj;
      businessId = businessOnboarding.getBusinessId();

      newBusinessOnboardingClone = (BusinessOnboarding) businessOnboarding.fclone();
    } else if ( obj instanceof USBusinessOnboarding ) {
      uSBusinessOnboarding = (USBusinessOnboarding) obj;
      businessId = uSBusinessOnboarding.getBusinessId();

      newUSBusinessOnboardingClone = (USBusinessOnboarding) uSBusinessOnboarding.fclone();
    }

    if ( businessId != 0 ) {
      Business business = (Business) localBusinessDAO_.find(businessId);
      if ( business == null ) {
        throw new RuntimeException("Business doesn't exist");
      }

      // look up the existing onboarding objects under the same businessId
      ArraySink businessOnBoardingSink = (ArraySink) businessOnboardingDAO_.where(
        AND(
          EQ(BusinessOnboarding.BUSINESS_ID, businessId)
        )).select(new ArraySink());
      uSBusinessOnboardingDAO_.where(
        AND(
          EQ(USBusinessOnboarding.BUSINESS_ID, businessId)
        )).select(businessOnBoardingSink);

      java.util.List<Object> onboardings = businessOnBoardingSink.getArray();

      try {
        Object onboarding = null;
        for ( int i = 0; i < onboardings.size(); i++ ) {
          onboarding = onboardings.get(i);

          if ( onboarding instanceof BusinessOnboarding ) {
            BusinessOnboarding oldOnboarding = (BusinessOnboarding) onboarding;
            BusinessOnboarding oldOnboardingClone = (BusinessOnboarding) oldOnboarding.fclone();

            oldOnboarding = newBusinessOnboardingClone; // copy old to new onboarding
            oldOnboarding.setUserId(oldOnboardingClone.getUserId());

            if ( oldOnboardingClone.getSigningOfficer() ) {
              oldOnboarding.setSigningOfficer(true);
              oldOnboarding.setSigningOfficerEmail(null);
            } else {
              oldOnboarding.setSigningOfficer(false);
              oldOnboarding.setSigningOfficerEmail(oldOnboardingClone.getSigningOfficerEmail());
            }

            if ( oldOnboardingClone.getStatus() != OnboardingStatus.SUBMITTED
              && newBusinessOnboardingClone.getStatus() == OnboardingStatus.SUBMITTED ) {
              oldOnboarding.setStatus(OnboardingStatus.SUBMITTED);
            } else {
              oldOnboarding.setStatus(oldOnboardingClone.getStatus());
            }

            getDelegate().put_(x, oldOnboarding);
          } else if ( onboarding instanceof USBusinessOnboarding ) {
            USBusinessOnboarding oldUSOnboarding = (USBusinessOnboarding) onboarding;
            USBusinessOnboarding oldUSOnboardingClone = (USBusinessOnboarding) oldUSOnboarding.fclone();

            oldUSOnboarding = newUSBusinessOnboardingClone; // copy of onboarding
            oldUSOnboarding.setUserId(oldUSOnboardingClone.getUserId());

            if ( oldUSOnboardingClone.getSigningOfficer() ) {
              oldUSOnboarding.setSigningOfficer(true);
              oldUSOnboarding.setSigningOfficerEmail(null);
            } else {
              oldUSOnboarding.setSigningOfficer(false);
              oldUSOnboarding.setSigningOfficerEmail(oldUSOnboardingClone.getSigningOfficerEmail());
            }

            if ( oldUSOnboardingClone.getStatus() != OnboardingStatus.SUBMITTED
              && newUSBusinessOnboardingClone.getStatus() == OnboardingStatus.SUBMITTED ) {
              oldUSOnboarding.setStatus(OnboardingStatus.SUBMITTED);
            } else {
              oldUSOnboarding.setStatus(oldUSOnboardingClone.getStatus());
            }

            getDelegate().put_(x, oldUSOnboarding);
          }
        }
      } catch ( Throwable t ) {
        throw new RuntimeException(t);
      }
    }

    return getDelegate().put_(x, obj);
  }
}
