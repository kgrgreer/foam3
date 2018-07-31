package net.nanopay.account;


import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.SUM;
import static foam.mlang.MLang.OR;

import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import java.util.ArrayList;

public class DigitalAccountInfoPopluateDAO
  extends ProxyDAO {

  public DigitalAccountInfoPopluateDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {

    DAO                 userDAO        = (DAO) x.get("localUserDAO");
    DAO                 accountDAO     = (DAO) x.get("accountDAO");
    DAO                 transactionDAO = (DAO) x.get("localTransactionDAO");
    ArraySink           accountDAOSink = (ArraySink)(accountDAO.where(
      EQ(Account.TYPE, "DigitalAccount"))).select(new ArraySink());
    ArrayList<Account>  accountList    = (ArrayList) accountDAOSink.getArray();
    User                user;
    DAO                 accountsTranDAO;
    Sum                 sumSent;
    Sum                 sumRecieved;
    int                 listSent;
    int                 listRecieved;

    if ( sink == null ){
      sink = new ArraySink();
    }
    for ( Account account: accountList ) {
      user            = (User) userDAO.find(account.getOwner());
      accountsTranDAO = transactionDAO.where(
        OR(
          EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
          EQ(Transaction.SOURCE_ACCOUNT, account.getId()
          )));
      sumSent         = (Sum) accountsTranDAO.where(
        EQ(Transaction.SOURCE_ACCOUNT, account.getId())).select(SUM(Transaction.AMOUNT));
      sumRecieved     = (Sum) accountsTranDAO.where(
        EQ(Transaction.DESTINATION_ACCOUNT, account.getId())).select(SUM(Transaction.AMOUNT));
      listSent        = ((ArraySink)  accountsTranDAO.where(
        EQ(Transaction.SOURCE_ACCOUNT, account.getId())).select( new ArraySink() )).getArray().size();
      listRecieved    = ((ArraySink)  accountsTranDAO.where(
        EQ(Transaction.DESTINATION_ACCOUNT, account.getId())).select( new ArraySink() )).getArray().size();
      DigitalAccountInfo digitalInfo = new DigitalAccountInfo();
      digitalInfo.setAccountId(account.getId());
      digitalInfo.setOwner(user.getFirstName()+" "+user.getLastName());
      try {
        digitalInfo.setBalance((Long)account.findBalance(x));
      }
      catch( Exception e )
      {
        digitalInfo.setBalance(0);
      }
      digitalInfo.setTransactionsRecieved(Long.valueOf(listRecieved));
      digitalInfo.setTransactionsSent(Long.valueOf(listSent));
      digitalInfo.setTransactionsSumRecieved(sumRecieved.getValue());
      digitalInfo.setTransactionsSumSent(sumSent.getValue());
      digitalInfo.setCurrency(account.getDenomination());

      sink.put(digitalInfo, null);
    }

    return sink;

  }
}
