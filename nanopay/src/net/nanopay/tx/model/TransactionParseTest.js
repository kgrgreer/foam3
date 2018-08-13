foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionParseTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        foam.lib.json.JSONParser parser = x.create(foam.lib.json.JSONParser.class);

        // test parsing transaction with number ID
        Transaction t1 = (Transaction)
          parser.parseString("{\\"class\\":\\"net.nanopay.tx.model.Transaction\\",\\"id\\":1}", Transaction.class);
        test("1".equals(t1.getId()), "Transaction with number id of 1 is parsed successfully");

        // test parsing transaction with String id
        Transaction t2 = (Transaction)
          parser.parseString("{\\"class\\":\\"net.nanopay.tx.model.Transaction\\",\\"id\\":\\"hello\\"}", Transaction.class);
        test("hello".equals(t2.getId()), "Transaction with string id of \\"hello\\" is parsed successfully");
      `
    }
  ]
});
