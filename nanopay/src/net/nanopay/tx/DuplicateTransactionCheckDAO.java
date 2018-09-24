package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.Date;

public class DuplicateTransactionCheckDAO
  extends ProxyDAO
{
  protected final Object[] locks_ = new Object[128];

  public DuplicateTransactionCheckDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    for ( int i = 0 ; i < locks_.length ; i++ ) locks_[i] = new Object();
  }

  public Object getLockForDate(Date date) {
    // Id's should be positive, but just to be safe, take the ABS
    return locks_[(int)(Math.abs(date != null ? date.getTime() : 0) % locks_.length)];
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {


    return super.put_(x, obj);
  }

  /*
  For the transaction update we only accept transaction status and invoice change. Other changes will not be accepted
   */
  // FIXME: each TransactionSubClass needs in implement compare for this to work
  public int compareTransactions(Transaction oldtxn, Transaction curtxn) {
    if ( oldtxn == null || curtxn == null ) return - 1;

    Transaction temp = (Transaction) curtxn.deepClone();
    temp.setStatus(oldtxn.getStatus());
    temp.setInvoiceId(oldtxn.getInvoiceId());
    //temp.setCicoStatus(oldtxn.getCicoStatus());
    temp.setLastModified(oldtxn.getLastModified());
    temp.setSourceAccount(oldtxn.getSourceAccount());
    temp.setDestinationAccount(oldtxn.getDestinationAccount());
    //temp.setDeviceId(oldtxn.getDeviceId());
    //temp.setNotes(oldtxn.getNotes()); // REVIEW: commented out during TransactionSubClassRefactor
    //temp.setChallenge(oldtxn.getChallenge()); // REVIEW: commented out during TransactionSubClassRefactor
    //temp.setProviderId(oldtxn.getProviderId());
    //temp.setBrokerId(oldtxn.getBrokerId());

    //temp.setPadType(oldtxn.getPadType()); // REVIEW: commented out during TransactionSubClassRefactor
    //temp.setTxnCode(oldtxn.getTxnCode()); // REVIEW: commented out during TransactionSubClassRefactor
    temp.setProcessDate(oldtxn.getProcessDate());
    temp.setCompletionDate(oldtxn.getCompletionDate());
    //temp.setConfirmationLineNumber(oldtxn.getConfirmationLineNumber());
    //temp.setDescription(oldtxn.getDescription()); // REVIEW: commented out during TransactionSubClassRefactor
    //temp.setReturnCode(oldtxn.getReturnCode());
    //temp.setReturnDate(oldtxn.getReturnDate());
    //temp.setReturnType(oldtxn.getReturnType());

    return oldtxn.compareTo(temp);
  }
}
