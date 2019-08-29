package net.nanopay.test.api.DAOSecurityTest;

import foam.core.X;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DAOSecurityTestSelect extends DAOSecurityTest {
  protected static final List<String> SELECT_IGNORES = new ArrayList<>();

  DAOSecurityTestSelect() {

  }

  private static final String TEST_SELECT = "{\n" +
    "\t\"class\":\"foam.box.Message\",\n" +
    "\t\"attributes\":{\n" +
    "\t\t\"replyBox\":{\n" +
    "\t\t\t\"class\":\"foam.box.HTTPReplyBox\"\n" +
    "\t\t},\n" +
    "\t\t\"sessionId\":\"6d2df1a2-982e-4537-9fcd-randomabc123\"\n" +
    "\t},\n" +
    "\t\"object\":{\n" +
    "\t\t\"class\":\"foam.box.RPCMessage\",\n" +
    "\t\t\"name\":\"select\",\n" +
    "\t\t\"args\":[\n" +
    "\t\t\tnull,\n" +
    "\t\t\t{\n" +
    "\t\t\t\t\"class\":\"foam.dao.ArraySink\"\n" +
    "\t\t\t},\n" +
    "\t\t\t0,\n" +
    "\t\t\t10,\n" +
    "\t\t\tnull,\n" +
    "\t\t\tnull\n" +
    "\t\t],\n" +
    "\t\t\"attributes\":{}\n" +
    "\t}\n" +
    "}";

  @Override
  public void runTest(X x) {
    List<String> ignores = new ArrayList<>();
    testAllDAOs(x, TEST_SELECT, "select", Stream.concat(SELECT_IGNORES.stream(), GLOBAL_IGNORES.stream()).collect(Collectors.toList()));
  }

}
