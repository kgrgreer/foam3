/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccountInfoPopulateDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.*',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'TRANS_COUNT_RECIEVED_ERROR_MSG', message: 'TRANSACTION COUNT RECIEVED ERROR: ' },
    { name: 'TRANS_COUNT_SENT_ERROR_MSG', message: 'TRANSACTION COUNT SENT ERROR: ' },
    { name: 'TRANS_SUM_RECIEVED_ERROR_MSG', message: 'TRANSACTION SUM RECIEVED ERROR: ' },
    { name: 'TRANS_SUM_SENT_ERROR_MSG', message: 'TRANSACTION SUM SENT ERROR:' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DigitalAccountInfoPopulateDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }  
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'select_',
      documentation: 'Collects data from the account, transaction, user and balance DAO and formats and sets the data for the DigitalAccountInfo Model',
      javaCode: `
        DAO                 userDAO        = (DAO) x.get("localUserDAO");
        DAO                 accountDAO     = (DAO) x.get("accountDAO");
        DAO                 transactionDAO = (DAO) x.get("localTransactionDAO");

        // Grabs all Digital Accounts
        ArraySink           accountDAOSink = (ArraySink) accountDAO.where(
          EQ(Account.TYPE, "DigitalAccount"))
          .select_(x, new ArraySink(), skip, limit, order, predicate);
        ArrayList<Account>  accountList    = (ArrayList) accountDAOSink.getArray();
        User                user;

        if ( sink == null ){
          sink = new ArraySink();
        }

        GroupBy sentSum = (GroupBy) transactionDAO.select(GROUP_BY(Transaction.SOURCE_ACCOUNT,SUM(Transaction.AMOUNT)));
        GroupBy recievedSum =  (GroupBy) transactionDAO.select(GROUP_BY(Transaction.DESTINATION_ACCOUNT,SUM(Transaction.AMOUNT)));
        GroupBy sentCount = (GroupBy) transactionDAO.select(GROUP_BY(Transaction.SOURCE_ACCOUNT,COUNT()));
        GroupBy recievedCount =  (GroupBy) transactionDAO.select(GROUP_BY(Transaction.DESTINATION_ACCOUNT,COUNT()));

        // Walk through the list of digital accounts and create a new new Info Model for each
        for ( Account account : accountList ) {
          user            = (User) userDAO.find(account.getOwner());

          //Create the object and load the data into it
          DigitalAccountInfo digitalInfo = new DigitalAccountInfo();
          digitalInfo.setAccountId(account.getId());
          digitalInfo.setOwner(user.toSummary());

          try{
            digitalInfo.setTransactionsRecieved(((Count)recievedCount.getGroups().get(account.getId())).getValue());
          } catch(Exception e) {
            ((Logger) x.get("logger")).error(TRANS_COUNT_RECIEVED_ERROR_MSG, e);
            digitalInfo.setTransactionsRecieved(0);
          }
          try{
            digitalInfo.setTransactionsSent(((Count)sentCount.getGroups().get(account.getId())).getValue());
          } catch(Exception e) {
            ((Logger) x.get("logger")).error(TRANS_COUNT_SENT_ERROR_MSG, e);
            digitalInfo.setTransactionsSent(0);
          }

          try{
            digitalInfo.setTransactionsSumRecieved(((Sum)recievedSum.getGroups().get(account.getId())).getValue());
          } catch(Exception e) {
            ((Logger) x.get("logger")).error(TRANS_SUM_RECIEVED_ERROR_MSG, e);
            digitalInfo.setTransactionsSumRecieved(0);
          }
          try{
            digitalInfo.setTransactionsSumSent(((Sum)sentSum.getGroups().get(account.getId())).getValue());
          } catch(Exception e) {
            ((Logger) x.get("logger")).error(TRANS_SUM_SENT_ERROR_MSG, e);
            digitalInfo.setTransactionsSumSent(0);
          }

          try {
            digitalInfo.setBalance((Long) account.findBalance(x));
          }
          catch ( Exception e )
          {
            digitalInfo.setBalance(0);
          }

          digitalInfo.setCurrency(account.getDenomination());
          sink.put(digitalInfo, null);
        }
        return sink;
      `
    }
  ]
});

