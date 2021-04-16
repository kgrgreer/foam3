package net.nanopay.partner.intuit;

import foam.core.X;
import foam.nanos.auth.User;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.CrunchService;
import net.nanopay.reporting.UserOnboardingReport;
import net.nanopay.reporting.UserOnboardingReportGenerator;

import javax.annotation.Nonnull;
import java.util.Calendar;

public class IntuitUserOnboardingReportGenerator extends UserOnboardingReportGenerator {

  @Override
  public UserOnboardingReport generate(X x, @Nonnull Object src, Object[] args) {
    var user = (User) src;
    var crunchService = (CrunchService) x.get("crunchService");

    var cor = new UserOnboardingReport();
    cor = new UserOnboardingReport();

    cor.setCreated(Calendar.getInstance().getTime());
    cor.setLastModified(Calendar.getInstance().getTime());

    cor.setFirstName(user.getFirstName());
    cor.setLastName(user.getLastName());
    cor.setUserId(user.getId());
    cor.setBusiness(user.getBusinessName());

    // Only use these
    // all businesses, intuit-sme, intuit-business-sme

    cor.setBusinessReceiving(crunchService.getJunctionFor(x, "18DD6F03-998F-4A21-8938-358183151F96", user, user ).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setBusinessSending(crunchService.getJunctionFor(x, "56D2D946-6085-4EC3-8572-04A17225F86A", user, user ).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setUserSendingUnder1000(crunchService.getJunctionFor(x, "F3DCAF53-D48B-4FA5-9667-6A6EC58C54FD", user, user).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setUserSendingOver1000(crunchService.getJunctionFor(x, "1F0B39AD-934E-462E-A608-D590D1081298", user, user).getStatus() == CapabilityJunctionStatus.GRANTED);

    // Onboarding Submission Date
    // Compliance Date

    cor.setApprovalDate(user.getDateCompliancePassed());
    if ( user.getAddress() != null )
      cor.setCity(user.getAddress().getCity());

    return cor;
  }

}
