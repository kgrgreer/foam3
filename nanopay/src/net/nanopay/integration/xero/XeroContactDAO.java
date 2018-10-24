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
    /*
    Info:   Function to update Xero with changed portal information (if connected)
    Input:  x: the context to use DAOs
            obj: The Invoice with the changes to be implemented
    Output: the object after changes are verified or rejected
    */

    // Skip this decorator if the object isn't a Xero Contact
    if ( ! (obj instanceof XeroContact) ) {
      return getDelegate().put_(x, obj);
    }

    // Casts the 'obj' to a Xero Contact and retrieves the old version of that contact if it exists
    DAO         contactDAO = (DAO) x.get("contactDAO");
    XeroContact newContact = (XeroContact) obj;
    XeroContact oldContact = (XeroContact) contactDAO.find(newContact.getId());

    // If there wasn't an entry before then there is nothing to update for xero
    if ( oldContact == null ) {
      newContact.setXeroUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If being called from xero update. Skip calling xero
    if ( newContact.getXeroUpdate() ){
      newContact.setXeroUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If the system is coming from being synced then don't try syncing it again
    if ( oldContact.getDesync() != newContact.getDesync() )
    {
      return getDelegate().put_(x, obj);
    }

    XeroConfig   config       = (XeroConfig) x.get("xeroConfig");
    User         user         = (User) x.get("user");
    DAO          store        = (DAO) x.get("tokenStorageDAO");
    TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
    XeroClient   client       = new XeroClient(config);
    try {
      client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
      List<Contact> xeroContactList = client.getContacts();

      // Find the specific contact in the xero
      for ( int i = 0; i < xeroContactList.size(); i++ ) {
        com.xero.model.Contact xeroContact = xeroContactList.get(i);
        if ( ! xeroContact.getContactID().equals(newContact.getXeroId()) ) {
          continue;
        }

        // update xero information with changed contact info on portal
        xeroContact.setName(newContact.getOrganization());
        xeroContact.setEmailAddress(newContact.getEmail());
        xeroContact.setFirstName(newContact.getFirstName());
        xeroContact.setLastName(newContact.getLastName());
        xeroContactList.add(i, xeroContact);
        break;
      }
      client.updateContact(xeroContactList);
    } catch ( XeroApiException e ) {
      System.out.println(e.getMessage());
      e.printStackTrace();

      // If a xero error is thrown set the Desync flag to show that the user wasn't logged in to xerro at time of change
      // and to update xero at time of resynchronization
      if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
        newContact.setDesync(true);
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
    return getDelegate().put_(x, newContact);
  }
}
