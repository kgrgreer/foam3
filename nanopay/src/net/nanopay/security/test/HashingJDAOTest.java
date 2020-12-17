package net.nanopay.security.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.GUIDDAO;
import foam.dao.EasyDAO;
import foam.dao.java.JDAO;
import foam.dao.MDAO;
import static foam.mlang.MLang.COUNT;
import foam.mlang.sink.Count;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.security.HashingJDAO;
import net.nanopay.security.HashingJournal;

public class HashingJDAOTest
  extends foam.nanos.test.Test
{
  public DAO getDAO(X x) {
    DAO mdao = new foam.dao.MDAO(net.nanopay.security.test.HashingJDAOTestModel.getOwnClassInfo());
    JDAO jdao = new net.nanopay.security.HashingJDAO.Builder(x)
      .setOf(net.nanopay.security.test.HashingJDAOTestModel.getOwnClassInfo())
      .setDelegate(mdao)
      .build();
    jdao.setJournal(new net.nanopay.security.HashingJournal.Builder(x)
                    .setFilename("hashingJDAOTests")
                    .setDigestRequired(true)
                    .setCreateFile(false)
                    .setMessageDigest(new net.nanopay.security.MessageDigest.Builder(x)
                                      .setAlgorithm("SHA-256")
                                      .setRollDigests(true)
                                      .build())
                    .build());
    jdao.getJournal().replay(x, mdao);
    DAO dao = new GUIDDAO(jdao);
    return dao.inX(x);
  }

  public void runTest(X y) {
    X x = y;
    User user = new User.Builder(x)
      .setId(9999999)
      .setFirstName("test")
      .setLastName("test")
      .setLastModified(new java.util.Date())
      .build();
    Subject subject = new Subject.Builder(x)
      .setUser(user)
      .build();
    x = x.put("subject", subject);

    test(testPutDelta(x), "Updating object writes successfully");
  }

  protected boolean testPutDelta(X x) {
    var hdao = getDAO(x);

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
    var count = (Count) hdao.select(COUNT());
    test(1 == count.getValue(), "Verify number of entries (put), expecting 1, found "+count.getValue());

    var dao2 = getDAO(x);

    count = (Count) dao2.select(COUNT());
    test(1 == count.getValue(), "Verify number of entries (replay), expecting 1, found "+count.getValue());

    if ( count.getValue() > 0 ) {
      var sink = ((ArraySink) dao2.select(new ArraySink())).getArray();
      return model.compareTo(sink.get(0)) == 0;
    }
    return false;
  }
}
