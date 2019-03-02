package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.model.Business;

/**
 * The purpose of this DAO decorator is to set the signUpStatus property on a
 * contact to ACTIVE if the business it refers to has joined the platform.
 */
public class UpdateSignUpStatusDAO extends ProxyDAO {
  public UpdateSignUpStatusDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! (obj instanceof Contact) ) {
      return super.put_(x, obj);
    }

    Contact contact = (Contact) obj;

    if ( ContactStatus.ACTIVE.equals(contact.getSignUpStatus()) ) {
      return super.put_(x, obj);
    }

    if ( contact.getBusinessId() != 0 ) {
      Business business = (Business) getDelegate().inX(x).find(contact.getBusinessId());
      if ( business != null ) {
        contact.setSignUpStatus(ContactStatus.ACTIVE);
      }
    }

    return super.put_(x, contact);
  }
}
