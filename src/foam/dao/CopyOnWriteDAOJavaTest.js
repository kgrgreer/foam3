/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CopyOnWriteDAOJavaTest',
  extends: 'foam.nanos.test.Test',

  properties: [
    {
      name: 'code',
      value: `
        import foam.dao.ArraySink;
        import foam.dao.MDAO;
        import foam.dao.CopyOnWriteDAO;
        import foam.test.IdentifiedStringHolder;

        sourceDAO = new MDAO(IdentifiedStringHolder.getOwnClassInfo());
        sourceDAO.put(new IdentifiedStringHolder.Builder(x).setId("a").setValue("original").build());

        copyDAO = new MDAO(IdentifiedStringHolder.getOwnClassInfo());
        cowDAO = new CopyOnWriteDAO.Builder(x).setCopyDAO(copyDAO).setDelegate(sourceDAO).build();
        results = ((ArraySink) cowDAO.select()).getArray();
        test(results.size() == 1, "COWDAO initial size should match delegate");
        test(results.get(0).getValue() == "original", "COWDAO should contain delegate objects");

        cowDAO.put(new IdentifiedStringHolder.Builder(x).setId("b").setValue("new").build());
        results = ((ArraySink) cowDAO.select()).getArray();
        test(results.size() == 2, "COWDAO size should increase when putting new objects");

        cowDAO.put(new IdentifiedStringHolder.Builder(x).setId("a").setValue("updated").build());
        results = ((ArraySink) cowDAO.select()).getArray();
        test(results.size() == 2, "COWDAO size should not increase when updating objects");

        cowDAO.remove(new IdentifiedStringHolder.Builder(x).setId("a").build());
        results = ((ArraySink) cowDAO.select()).getArray();
        test(results.size() == 1, "COWDAO should track deletions against source DAO");
      `
    }
  ]
});
