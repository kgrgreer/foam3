/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CopyOnWriteDAOJsTest',
  extends: 'foam.nanos.test.Test',
  flags: ['js'],

  properties: [
    {
      name: 'code',
      value: (fn => `await (${fn.toString().split('\n').join('')})();`)(async () => {
        const ArrayDAO = foam.dao.ArrayDAO;
        const COWDAO = foam.dao.CopyOnWriteDAO;
        const MDAO = foam.dao.MDAO;
        const IdentifiedStringHolder = foam.test.IdentifiedStringHolder;

        const sourceDAO = MDAO.create({ of: 'foam.test.IdentifiedStringHolder' });
        await sourceDAO.put(IdentifiedStringHolder.create({ id: 'a', value: 'original' }));

        const copyDAO = ArrayDAO.create();

        const cowDAO = COWDAO.create({ copyDAO, delegate: sourceDAO });

        let results = (await cowDAO.select()).array;
        test(results.length === 1, 'COWDAO initial size should match delegate');
        test(results[0].value === 'original', 'COWDAO should contain delegate objects')

        await cowDAO.put(IdentifiedStringHolder.create({ id: 'b', value: 'new' }));
        results = (await cowDAO.select()).array;
        test(results.length === 2, 'COWDAO size should increase when putting new objects');

        await cowDAO.put(IdentifiedStringHolder.create({ id: 'a', value: 'updated' }));
        results = (await cowDAO.select()).array;
        test(results.length === 2, 'COWDAO size should not increase when updating objects');

        const data = results.map(v => v.id + '.' + v.value)
        test(data.includes('a.updated') && data.includes('b.new'),
          'COWDAO should contain correct data')

        cowDAO.remove(IdentifiedStringHolder.create({ id: 'a' }));
        results = (await cowDAO.select()).array;
        test(results.length === 1, 'COWDAO should track deletions against source DAO');

        const cowDAONoRetro = COWDAO.create({
          copyDAO: ArrayDAO.create(), delegate: sourceDAO, enableRetroRemove: false });
        
        await cowDAONoRetro.remove(IdentifiedStringHolder.create({ id: 'c' }));
        await sourceDAO.put(IdentifiedStringHolder.create({ id: 'c', value: 'future' }));
        results = (await cowDAONoRetro.select()).array;
        test(results.length === 2, 'Expected behaviour when enableRetroRemove=false')

        const cowDAOAllowRetro = COWDAO.create({
          copyDAO: ArrayDAO.create(), delegate: sourceDAO, enableRetroRemove: true });
        await cowDAOAllowRetro.remove(IdentifiedStringHolder.create({ id: 'd' }));
        await sourceDAO.put(IdentifiedStringHolder.create({ id: 'd', value: 'future' }));
        results = (await cowDAOAllowRetro.select()).array;
        test(results.length === 2, 'Expected behaviour when enableRetroRemove=true')
      }),
    }
  ]
});

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
