package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.nanos.auth.Address;
import foam.nanos.auth.Country;
import foam.nanos.auth.User;

import foam.nanos.logger.Logger;
import net.nanopay.model.Currency;

import net.nanopay.account.DigitalAccount;

import java.util.List;

public class CreateDefaultDigitalAccountOnUserCreateDAO
  extends ProxyDAO
{
  public CreateDefaultDigitalAccountOnUserCreateDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // putting the user first so the Id is correct when looking for accounts.
    User user = (User) super.put_(x, obj);
    DigitalAccount.findDefault(getX(), user, null);
    return user;
  }
}
