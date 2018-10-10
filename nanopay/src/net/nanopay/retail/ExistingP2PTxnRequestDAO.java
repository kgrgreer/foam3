package net.nanopay.retail;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.retail.model.P2PTxnRequest;
import net.nanopay.retail.model.P2PTxnRequestStatus;
import net.nanopay.tx.RetailTransaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static foam.mlang.MLang.EQ;
import static net.nanopay.retail.utils.P2PTxnRequestUtils.*;

public class ExistingP2PTxnRequestDAO
  extends ProxyDAO
{

  public static final List<P2PTxnRequestStatus> REQUESTEE_OPERATIONS = Collections.unmodifiableList(
    Arrays.asList(P2PTxnRequestStatus.ACCEPTED,
    P2PTxnRequestStatus.DECLINED));

  public static final List<P2PTxnRequestStatus> REQUESTOR_OPERATIONS = Collections.unmodifiableList(
    Arrays.asList(P2PTxnRequestStatus.CANCELLED));

  public ExistingP2PTxnRequestDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    P2PTxnRequest request = (P2PTxnRequest) obj;

    P2PTxnRequest existingRequest = getExistingRequest(request);

    // is a new request
    if ( existingRequest == null ) {
      return getDelegate().put_(x, obj);
    }
    
    validateOperationOnRequest(x, request, existingRequest);

    if ( ! checkReadOnlyFields(request, existingRequest) ) {
      throw new RuntimeException("Unable to update the request.");
    }

    if ( request.getStatus().equals(P2PTxnRequestStatus.ACCEPTED) ) {
      acceptRequest(x, request);
    }

    // request was updated here: update lastUpdated
    request.setLastUpdated(new Date());

    return getDelegate().put_(x, obj);
  }

  private P2PTxnRequest getExistingRequest(P2PTxnRequest request) {
    return (P2PTxnRequest) this.find_(getX(), request);
  }

  private void validateOperationOnRequest(X x, P2PTxnRequest request, P2PTxnRequest existingRequest)
      throws RuntimeException {
    // check who is updating the request
    User currentUser = getCurrentUser(x);

    // if old status not pending, then invalid operation.
    if ( ! existingRequest.getStatus().equals(P2PTxnRequestStatus.PENDING) ) {
      throw new RuntimeException("Invalid operation on the request.");
    }

    // current user is requestee
    if ( currentUser.getEmail().equals(request.getRequesteeEmail()) ) {
      if ( ! REQUESTEE_OPERATIONS.contains(request.getStatus()) ) {
        throw new RuntimeException("Requestee can't perform this action");
      }
    }
    // current user is requestor
    else if ( currentUser.getEmail().equals(request.getRequestorEmail()) ) {
      if ( ! REQUESTOR_OPERATIONS.contains(request.getStatus()) ) {
        throw new RuntimeException("Requestor can't perform this action.");
      }
    }
    // current user is not associated with the request
    else {
      throw new RuntimeException("Invalid Operation on request.");
    }
  }

  private boolean checkReadOnlyFields(P2PTxnRequest request, P2PTxnRequest existingRequest) {
    // check if the readonly fields (all fields but the status) are not changed.
    return request.getId() == existingRequest.getId() &&
      request.getRequesteeEmail().equals(existingRequest.getRequesteeEmail()) &&
      request.getRequestorEmail().equals(existingRequest.getRequestorEmail()) &&
      request.getAmount() == existingRequest.getAmount() &&
      request.getMessage().equals(existingRequest.getMessage()) &&
      request.getLastUpdated().equals(existingRequest.getLastUpdated()) &&
      request.getDateRequested().equals(existingRequest.getDateRequested());
  }

  private void acceptRequest(X x, P2PTxnRequest request) {
    User requestee = getUserByEmail(x, request.getRequesteeEmail());
    User requestor = getUserByEmail(x, request.getRequestorEmail());
    processTxn(requestee, requestor, request.getAmount(), request.getMessage());

    // if not partners, make partners!
    if ( ! isPartner(x, requestee, requestor) ) {
      requestee.getPartners(x).add(requestor);
    }
  }

  private void processTxn(User requestee, User requestor, long amount, String message) {
    RetailTransaction txn  = new RetailTransaction.Builder(getX())
      .setPayerId(requestee.getId())
      .setPayeeId(requestor.getId())
      .setNotes(message)
      .setAmount(amount)
      .setStatus(TransactionStatus.PENDING)
      .build();

    DAO txnDAO = (DAO) getX().get("localTransactionDAO");
    txnDAO.put(txn);
  }
}
