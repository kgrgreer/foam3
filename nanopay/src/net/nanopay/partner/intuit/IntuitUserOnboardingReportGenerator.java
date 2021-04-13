package net.nanopay.partner.intuit;

import foam.core.X;
import foam.nanos.auth.User;
import net.nanopay.reporting.UserOnboardingReport;
import net.nanopay.reporting.UserOnboardingReportGenerator;

public class IntuitUserOnboardingReportGenerator implements UserOnboardingReportGenerator {

  @Override
  public UserOnboardingReport generateReport(X x, User user) {
    if ( user == null ) {
      return null;
    }

    var cor = new UserOnboardingReport();
    cor.setFirstName(user.getFirstName());
    cor.setLastName(user.getLastName());
    cor.setUserId(user.getId());
    cor.setOnboardingDate(user.getCreated());

    return cor;
  }

}
