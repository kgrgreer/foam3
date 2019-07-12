package net.nanopay.test.api.DAOSecurityTest;

import foam.core.X;

import java.util.ArrayList;
import java.util.List;

public class DAOSecurityTestFind extends DAOSecurityTest {

    @Override
    public void runTest(X x) {
        List<String> ignores = new ArrayList<>();
        testAllDAOs(x, TEST_FIND, "find", ignores);
    }

}
