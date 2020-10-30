package net.nanopay.security.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.EasyDAO;
import net.nanopay.security.HashingJDAO;

public class HashingJDAOTest
  extends foam.nanos.test.Test
{

  public void runTest(X x) {
    test(testPutDelta(x), "Updating object writes successfully");
  }

  protected boolean testPutDelta(X x) {
    var hdao = (EasyDAO) x.get("hashingJDAOTestDAO");
    var model = new HashingJDAOTestModel();

    model = (HashingJDAOTestModel) hdao.put(model);

    var elements = new HashingJDAOTestElement[] {
      new HashingJDAOTestElement.Builder(x)
        .setName("element1")
        .build()
    };

    model.setElements(elements);

    hdao.put(model);

    elements = new HashingJDAOTestElement[] {
      new HashingJDAOTestElement.Builder(x)
        .setName("element1")
        .build(),
      new HashingJDAOTestElement.Builder(x)
        .setName("element2")
        .build(),
    };

    model.setElements(elements);

    hdao.put(model);

    ((HashingJDAO)hdao.getInnerDAO()).getJournal().replay(x, hdao);

    var sink = ((ArraySink) hdao.select(new ArraySink())).getArray();
    return model.compareTo(sink.get(0)) == 0;
  }
}
