package net.nanopay.test.api.DAOSecurityTest;

import foam.core.X;

import java.util.ArrayList;
import java.util.List;

public class DAOSecurityTestSelect extends DAOSecurityTest {

  @Override
  public void runTest(X x) {
    List<String> ignores = new ArrayList<>();
    testAllDAOs(x, TEST_SELECT, "select", ignores);
  }

}
