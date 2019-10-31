package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.accounting.quickbooks.model.QuickbooksContact;
import net.nanopay.accounting.xero.model.XeroContact;

import static foam.mlang.MLang.*;

public class CheckContactTransDAO extends ProxyDAO {
  public DAO transactionDAO_;

  public CheckContactTransDAO(X x, DAO delegate) {
    super(x, delegate);
    transactionDAO_ = ((DAO) x.get("localTransactionDAO")).inX(x);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Contact contact = (Contact) obj;

    return super.remove_(x, obj);
  }
}
