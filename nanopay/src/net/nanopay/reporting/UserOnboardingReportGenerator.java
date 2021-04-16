package net.nanopay.reporting;

import foam.nanos.auth.User;

import javax.annotation.Nonnull;

public abstract class UserOnboardingReportGenerator extends ReportGenerator {

  @Override
  protected Object getSourceId(@Nonnull Object src) {
    var user = (User) src;
    return user.getId();
  }

}
