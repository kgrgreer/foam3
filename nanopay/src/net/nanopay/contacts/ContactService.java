package net.nanopay.contacts;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.admin.model.ComplianceStatus;
import static foam.mlang.MLang.*;

public class ContactService
  extends    ContextAwareSupport
  implements ContactServiceInterface, NanoService {
  protected DAO userDAO;

  @Override
  public boolean checkExistingUser(X x, String email) throws RuntimeException {
    ArraySink select = (ArraySink) userDAO.where(EQ(User.EMAIL, email)).select(new ArraySink());

    if ( select.getArray().size() > 0 ) {
      return true;
    }
    return false;
  }

  @Override
  public void start() {
    userDAO   = (DAO) getX().get("userDAO");
  }

}
