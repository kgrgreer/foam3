package net.nanopay.onboarding;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.sme.onboarding.BusinessOnboarding;
import net.nanopay.sme.onboarding.USBusinessOnboarding;
import net.nanopay.sme.onboarding.OnboardingStatus;

import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;

/**
 * When an external or internal user is about to join via invitation,
 * its onboarding object is copied from the inviter's one.
 */

public class CreateOnboardingCloneService {
  private DAO businessOnboardingDAO;
  private DAO uSBusinessOnboardingDAO;

  public CreateOnboardingCloneService(X x) {
    businessOnboardingDAO = (DAO) x.get("businessOnboardingDAO");
    uSBusinessOnboardingDAO = (DAO) x.get("uSBusinessOnboardingDAO");
  }

  public List getSourceOnboarding(Long businessId) {
    ArraySink businessOnBoardingSink = (ArraySink) businessOnboardingDAO.where(
      AND(
        EQ(BusinessOnboarding.BUSINESS_ID, businessId)
      )).select(new ArraySink());
    uSBusinessOnboardingDAO.where(
      AND(
        EQ(USBusinessOnboarding.BUSINESS_ID, businessId)
      )).select(businessOnBoardingSink);

    List<Object> onboardings = businessOnBoardingSink.getArray();

    return onboardings;
  }

  public void putOnboardingClone(X x, List<Object> onboardings, Long userId) {
    Object onboarding = onboardings.get(0);

    if ( onboarding instanceof BusinessOnboarding ) {
      BusinessOnboarding businessOnboardingClone = (BusinessOnboarding) ((BusinessOnboarding) onboarding).fclone();

      businessOnboardingClone.setSigningOfficer(false);
      businessOnboardingClone.setSigningOfficerEmail(null);
      businessOnboardingClone.setUserId(userId);
      businessOnboardingClone.setStatus(OnboardingStatus.DRAFT);

      businessOnboardingDAO.put_(x, businessOnboardingClone);
    } else if ( onboarding instanceof USBusinessOnboarding ) {
      USBusinessOnboarding uSBusinessOnboardingClone = (USBusinessOnboarding) ((USBusinessOnboarding) onboarding).fclone();

      uSBusinessOnboardingClone.setSigningOfficer(false);
      uSBusinessOnboardingClone.setSigningOfficerEmail(null);
      uSBusinessOnboardingClone.setUserId(userId);
      uSBusinessOnboardingClone.setStatus(OnboardingStatus.DRAFT);

      uSBusinessOnboardingDAO.put_(x, uSBusinessOnboardingClone);
    }
  }
}
