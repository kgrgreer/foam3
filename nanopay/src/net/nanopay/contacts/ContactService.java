package net.nanopay.contacts;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.contacts.ContactStatus;
import java.util.List;
import static foam.mlang.MLang.*;

public class ContactService
  extends    ContextAwareSupport
  implements ContactServiceInterface, NanoService {
  protected DAO userDAO;

  @Override
  public boolean checkExistingContact(X x, String email, boolean isContact) throws RuntimeException {
    ArraySink select = (ArraySink) userDAO.where(EQ(User.EMAIL, email)).select(new ArraySink());

    if ( ! isContact ) {
      if ( select.getArray().size() > 0 ) {
        return true;
      }
    } else {
      DAO contactDAO = (DAO) x.get("localContactDAO");
      List<Contact> contactList = ((ArraySink) contactDAO.where(EQ(User.EMAIL, email)).select(new ArraySink())).getArray();

      for (Contact contact : contactList) {
        if (ContactStatus.READY.equals(contact.getSignUpStatus())) {
          return true;
        }
      }
    }

    return false;
  }

  @Override
  public void start() {
    userDAO   = (DAO) getX().get("userDAO");
  }

}
