package net.nanopay.account;


import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.*;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import java.util.ArrayList;

import static foam.mlang.MLang.*;


public class DigitalAccountInfoPopulateDAO
  extends ProxyDAO {

  public DigitalAccountInfoPopulateDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  // Collects data from the account, transaction, user and balance DAO and formats and sets the data for the DigitalAccountInfo Model
  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {

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
      digitalInfo.setOwner(user.label());

      try{
        digitalInfo.setTransactionsRecieved(((Count)recievedCount.getGroups().get(account.getId())).getValue());
      } catch(Exception e) {
        System.out.println("TRANSACTION COUNT RECIEVED ERROR:" + e);
        digitalInfo.setTransactionsRecieved(0);
      }
      try{
        digitalInfo.setTransactionsSent(((Count)sentCount.getGroups().get(account.getId())).getValue());
      } catch(Exception e) {
        System.out.println("TRANSACTION COUNT SENT ERROR:" + e);
        digitalInfo.setTransactionsSent(0);
      }

      try{
        digitalInfo.setTransactionsSumRecieved(((Sum)recievedSum.getGroups().get(account.getId())).getValue());
      } catch(Exception e) {
        System.out.println("TRANSACTION SUM RECIEVED ERROR:" + e);
        digitalInfo.setTransactionsSumRecieved(0);
      }
      try{
        digitalInfo.setTransactionsSumSent(((Sum)sentSum.getGroups().get(account.getId())).getValue());
      } catch(Exception e) {
        System.out.println("TRANSACTION SUM SENT ERROR:" + e);
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
  }
}
