package net.nanopay.retail;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.Email;
import net.nanopay.retail.model.P2PTxnRequest;
import net.nanopay.retail.model.P2PTxnRequestStatus;
import java.util.Date;

public class NewP2PTxnRequestDAO
  extends ProxyDAO
{
  public NewP2PTxnRequestDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    P2PTxnRequest request = (P2PTxnRequest) obj;

    if ( ! isNewRequest(request) ) {
      return getDelegate().put_(x, obj);
    }

    checkValidRequest(x, request);

    P2PTxnRequest requestClone = (P2PTxnRequest) obj.fclone();

    // always set status to Pending.
    requestClone.setStatus(P2PTxnRequestStatus.PENDING);

    // set date
    requestClone.setDateRequested(new Date());

    return getDelegate().put_(x, (FObject) requestClone);
  }

  private boolean isNewRequest(P2PTxnRequest request) {
    return this.find_(getX(), request) == null;
  }

  private void checkValidRequest(X x,P2PTxnRequest request)
  throws RuntimeException {
    User currentUser = (User) x.get("user");

    // check if the requestor's email is current user's email
    if ( ! request.getRequestorEmail().equals(currentUser.getEmail()) ) {
      throw new RuntimeException("Current user is not the requestor.");
    }

    // check if the user is not requesting himself
    if ( request.getRequesteeEmail().equals(currentUser.getEmail()) ) {
      throw new RuntimeException("Cannot request money from yourself.");
    }

    // check if requestee's email is valid
    if ( ! Email.isValid(request.getRequesteeEmail()) ) {
      throw new RuntimeException("Requestee's Email is invalid");
    }

    // valid amount
    if ( request.getAmount() <= 0 ) {
      throw new RuntimeException("Invalid amount provided for the request.");
    }
  }
}
