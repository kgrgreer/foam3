foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionRecord',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'transactionId'
    },
    {
      class: 'String',
      name: 'record'
    },
    {
      class: 'Date',
      name: 'time'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  public static void addRecord(X x, Transaction transaction, String record) {
    DAO dao = (DAO) x.get("transactionRecordDAO");

    TransactionRecord transactionRecord = new TransactionRecord.Builder(x)
      .setTransactionId(transaction.getId())
      .setTime(new Date())
      .setRecord(record)
      .build();

    dao.inX(x).put(transactionRecord);
  }
        `);
      }
    }]
  });
