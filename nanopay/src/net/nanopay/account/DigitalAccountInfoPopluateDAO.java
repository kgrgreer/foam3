package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.INSTANCE_OF;

import static foam.mlang.MLang.EQ;

import foam.mlang.MLang;
import foam.mlang.sink.Sum;
import foam.nanos.auth.Address;
import foam.nanos.auth.Country;
import foam.nanos.auth.User;

import foam.nanos.logger.Logger;
import net.nanopay.model.Currency;

import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.TransactionDAO;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;
import java.util.List;

public class DigitalAccountInfoPopluateDAO
  extends ProxyDAO {

  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {

    DAO                 userDAO        = (DAO) x.get("localUserDAO");
    DAO                 accountDAO     = (DAO) x.get("accountDAO");
    ArraySink           accountDAOSink = (ArraySink)( (DAO) accountDAO.where( INSTANCE_OF(DigitalAccount.class) ) ).select();
    DAO                 transactionDAO = (DAO) x.get("localTransactionDAO");
    ArrayList<Account>  accountList    = (ArrayList) accountDAOSink.getArray();
    DAO                 sentDAO;
    DAO                 recievedDAO;
    User                user ;
    for (Account account:accountList) {
          user         = (User) userDAO.find(account.getOwner());
          sentDAO      = transactionDAO.where(EQ(Transaction.DESTINATION_ACCOUNT, account.getId()));
          recievedDAO  = transactionDAO.where(EQ(Transaction.SOURCE_ACCOUNT, account.getId()));
      Sum sumSent      = (Sum) sentDAO.select(new Sum());
      Sum recievedSent = (Sum) recievedDAO.select(new Sum());
      int listSent     = ((ArraySink)  sentDAO.select( new ArraySink() )).getArray().size();
      int listRecieved = ((ArraySink)  recievedDAO.select( new ArraySink() )).getArray().size();

      digitalInfo.setAccountId(""+account.getId());
      digitalInfo.setOwner(user.getFirstName()+" "+user.getLastName());
      digitalInfo.setBalance(""+((Balance)account.findBalance(x)).getBalance());
       sumSent.getValue();
    }

    return super.select_(null, sink, skip, limit, order, predicate);

  }
}
