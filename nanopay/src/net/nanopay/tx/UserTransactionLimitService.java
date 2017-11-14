package net.nanopay.tx;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import net.nanopay.model.Broker;
import net.nanopay.tx.UserTransactionLimitInterface;
import net.nanopay.tx.model.TransactionLimit;
import net.nanopay.tx.model.TransactionLimitTimeFrame;
import net.nanopay.tx.model.TransactionLimitType;
import java.util.List;

public class UserTransactionLimitService extends ContextAwareSupport implements UserTransactionLimitInterface {
  protected DAO userDAO_;
  protected DAO transactionLimitDAO_;
  protected DAO brokerDAO_;

  // Constants used to get the predefined limit values from the Transaction limits(through the property name)
  protected static final String DEFAULT_USER_TRANSACTION_LIMIT = "default_user";
  protected static final String DEFAULT_BROKER_TRANSACTION_LIMIT = "default_broker";

  @Override
  public TransactionLimit getLimit(long userId, TransactionLimitTimeFrame timeFrame, TransactionLimitType type) throws RuntimeException {
    User user = (User) userDAO_.find(userId);

    if ( user == null ) {
      throw new RuntimeException("User not found.");
    }

    for ( TransactionLimit userLimit : (TransactionLimit[]) user.getTransactionLimits() ) {
      if ( userLimit.getType() == type && userLimit.getTimeFrame() == timeFrame ) {
        return userLimit;
      }
    }
    String limitName = DEFAULT_USER_TRANSACTION_LIMIT;
    if ( isBroker(userId) ) {
      limitName = DEFAULT_BROKER_TRANSACTION_LIMIT;
    }
    Sink sink = new ListSink();
    sink = transactionLimitDAO_.where(AND( EQ(limitName, TransactionLimit.NAME),
                                       EQ(type, TransactionLimit.TYPE),
                                       EQ(timeFrame, TransactionLimit.TIME_FRAME) )
                                  ).limit(1).select(sink);

    List list = ((ListSink) sink).getData();
    if ( list == null || list.size() == 0 ) {
      throw new RuntimeException("Transaction Limit not found.");
    }

    return (TransactionLimit) list.get(0);
  }

  // Checking whether user is a Broker
  private boolean isBroker(long userId) {
    Sink count = new Count();
    count = brokerDAO_.where(EQ(userId, Broker.USER_ID)).limit(1).select(count);

    return ( ( (Count) count).getValue() > 0 ) ? true : false;
  }

  @Override
  public void start() {
    userDAO_ = (DAO) getX().get("localUserDAO");
    transactionLimitDAO_ = (DAO) getX().get("transactionLimitDAO");
    brokerDAO_ = (DAO) getX().get("brokerDAO");
  }
}
