package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.Contact;
import com.xero.model.InvoiceStatus;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.integration.xero.model.XeroContact;

import java.math.BigDecimal;
import java.util.Calendar;
import java.util.List;

public class XeroContactDAO
  extends ProxyDAO {
  protected DAO userDAO_;

  public XeroContactDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if (!(obj instanceof XeroContact)) {
      return getDelegate().put_(x, obj);
    }

    DAO         contactDAO = (DAO) x.get("contactDAO");
    XeroContact newContact = (XeroContact) obj;
    XeroContact oldContact = (XeroContact) contactDAO.find(newContact.getId());

    if ( oldContact == null ) {
      return getDelegate().put_(x, obj);
    }
    if ( oldContact.getDesync() != newContact.getDesync() )
    {
      return getDelegate().put_(x, obj);
    }
    User         user         = (User) x.get("user");
    DAO          store        = (DAO) x.get("tokenStorageDAO");
    TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
    XeroConfig   config       = new XeroConfig();
    XeroClient   client       = new XeroClient(config);
    try {
      client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
      List<Contact> xeroContactList = client.getContacts();
      for ( int i = 0; i < xeroContactList.size(); i++ ) {
        com.xero.model.Contact xeroContact = xeroContactList.get(i);
        if ( ! xeroContact.getContactID().equals(newContact.getXeroId()) ) {
          continue;
        }
        xeroContact.setName(newContact.getOrganization());
        xeroContact.setEmailAddress(newContact.getEmail());
        xeroContact.setFirstName(newContact.getFirstName());
        xeroContact.setLastName(newContact.getLastName());

        xeroContactList.add(i, xeroContact);
        break;
      }
      client.updateContact(xeroContactList);
    } catch (XeroApiException e) {
      if (e.getMessage().contains("token_rejected")) {
        newContact.setDesync(true);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return getDelegate().put_(x, newContact);
  }
}
