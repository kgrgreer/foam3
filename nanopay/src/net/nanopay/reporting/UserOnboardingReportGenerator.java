package net.nanopay.reporting;

import foam.core.X;
import foam.nanos.auth.User;

public interface UserOnboardingReportGenerator {

  UserOnboardingReport generateReport(X x, User user);

}
