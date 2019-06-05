package nanopay.src.net.nanopay.payment;

import foam.core.X;
import foam.dao.DAO;

public class PayrollDAOTest extends foam.nanos.test.Test {
  DAO payrollDAO;

  public void runTest(X x) {
    payrollDAO = (DAO) x.get("payrollDAO");
    test(payrollDAO != null, "payrollDAO has been configured.");
  }
}
