package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.Transaction;

public class DuplicateTransactionCheckDAO extends ProxyDAO {
  public DuplicateTransactionCheckDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  synchronized public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction oldTxn = (Transaction) getDelegate().find(obj);
    Transaction curTxn = (Transaction) obj;
    if ( oldTxn != null ) {
      if ( oldTxn.getStatus().equals(TransactionStatus.COMPLETED) || oldTxn.getStatus().equals(TransactionStatus.DECLINED) ) {
        throw new RuntimeException("Unable to update Transaction, if transaction status is accept or decline");
      }
      if ( compareTransactions(oldTxn, curTxn) != 0 ) {
        throw new RuntimeException("Unable to update Transaction");
      }
    }
    return super.put_(x, obj);
  }

  /*
  For the transaction update we only accept transaction status and invoice change. Other change was not be accepted
   */
  public int compareTransactions(Transaction oldtxn, Transaction curtxn) {
    if ( oldtxn == null || curtxn == null )
      return - 1;
    Transaction temp = (Transaction) curtxn.deepClone();
    temp.setStatus(oldtxn.getStatus());
    temp.setInvoiceId(oldtxn.getInvoiceId());
    //temp.setCicoStatus(oldtxn.getCicoStatus());
    temp.setDate(oldtxn.getDate());
    temp.setPayerName(oldtxn.getPayerName());
    temp.setPayeeName(oldtxn.getPayeeName());
    temp.setDeviceId(oldtxn.getDeviceId());
    temp.setReferenceNumber(oldtxn.getReferenceNumber());
    temp.setNotes(oldtxn.getNotes());
    temp.setChallenge(oldtxn.getChallenge());
    temp.setProviderId(oldtxn.getProviderId());
    temp.setBrokerId(oldtxn.getBrokerId());

    temp.setPadType(oldtxn.getPadType());
    temp.setTxnCode(oldtxn.getTxnCode());
    temp.setSettlementDate(oldtxn.getSettlementDate());
    temp.setConfirmationLineNumber(oldtxn.getConfirmationLineNumber());
    temp.setDescription(oldtxn.getDescription());
    temp.setReturnCode(oldtxn.getReturnCode());
    temp.setReturnDate(oldtxn.getReturnDate());
    temp.setReturnType(oldtxn.getReturnType());

    return oldtxn.compareTo(temp);
  }
}
