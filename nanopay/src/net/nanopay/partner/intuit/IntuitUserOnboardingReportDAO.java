package net.nanopay.partner.intuit;

import foam.core.X;
import foam.dao.DAO;
import net.nanopay.reporting.UserOnboardingReportDAO;

public class IntuitUserOnboardingReportDAO extends UserOnboardingReportDAO {

  public IntuitUserOnboardingReportDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  protected String getGenerator() {
    return "intuitUserOnboardingReportGenerator";
  }

}
