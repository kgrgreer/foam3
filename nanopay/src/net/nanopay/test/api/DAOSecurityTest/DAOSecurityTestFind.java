package net.nanopay.test.api.DAOSecurityTest;

import foam.core.X;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DAOSecurityTestFind extends DAOSecurityTest {
  private static final List<String> FIND_IGNORES = new ArrayList<>();

  public DAOSecurityTestFind() {
    super();
    FIND_IGNORES.add("userCapabilityJunctionDAO"); // TODO: Review
  }

  private static final String TEST_FIND = "{\n" +
      "\t\"class\":\"foam.box.Message\",\n" +
      "\t\"attributes\":{\n" +
      "\t\t\"replyBox\":{\n" +
      "\t\t\t\"class\":\"foam.box.HTTPReplyBox\"\n" +
      "\t\t},\n" +
      "\t\t\"sessionId\":\"6d2df1a2-982e-4537-9fcd-randomabc123\"\n" +
      "\t},\n" +
      "\t\"object\":{\n" +
      "\t\t\"class\":\"foam.box.RPCMessage\",\n" +
      "\t\t\"name\":\"find\",\n" +
      "\t\t\"args\":[\n" +
      "\t\t\tnull,\n" +
      "\t\t\t0\n" +
      "\t\t],\n" +
      "\t\t\"attributes\":{}\n" +
      "\t}\n" +
      "}";

  @Override
  public void runTest(X x) {
      testAllDAOs(x, TEST_FIND, "find", Stream.concat(FIND_IGNORES.stream(), GLOBAL_IGNORES.stream()).collect(Collectors.toList()));
  }
}
