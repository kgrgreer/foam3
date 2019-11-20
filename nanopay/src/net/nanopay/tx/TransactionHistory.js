foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionHistory',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionHistoryItem',
      name: 'history'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  public static void addHistory(X x, Transaction transaction, String history) {
    DAO historyDAO = (DAO) x.get("transactionHistoryDAO");
    TransactionHistory transactionHistory = (TransactionHistory) historyDAO.find(transaction.getId());

    if ( transactionHistory == null ) {
      transactionHistory = new TransactionHistory.Builder(x).setId(transaction.getId()).build();
    }

    transactionHistory = (TransactionHistory) transactionHistory.fclone();
    ArrayList temp = new ArrayList(Arrays.asList(transactionHistory.getHistory()));
    temp.add(new TransactionHistoryItem.Builder(x).setTime(new Date()).setHistoryMessage(history).build());
    transactionHistory.setHistory((TransactionHistoryItem[]) temp.toArray(new TransactionHistoryItem[temp.size()]));

    historyDAO.inX(x).put(transactionHistory);
  }
        `);
      }
    }]
  });
