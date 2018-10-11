package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

public class KotakReversalProcessor implements ContextAgent {

  @Override
  public void execute(X x) {

    DAO    transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO    bankAccountDAO = (DAO) x.get("localAccountDAO");
    DAO    userDAO        = (DAO) x.get("localUserDAO");
    Logger logger         = (Logger) x.get("logger");

    transactionDAO
      .where(AND(
        INSTANCE_OF(KotakCOTransaction.class),
        EQ(Transaction.STATUS, TransactionStatus.CANCELLED)
      )).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          KotakCOTransaction kotakCOTxn = (KotakCOTransaction) ((KotakCOTransaction) obj).fclone();
          User payee = (User) userDAO.find(EQ(User.ID, kotakCOTxn.getPayee().getId()));

          SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

          // todo: check it's B2B or P2P
          Boolean isP2P = true;
          ReversalRequest reversalRequest = new ReversalRequest();

          // todo: use uuid or transactionID?
          // should be a unique 16 character reference?
          // String reversalMessageId = UUID.randomUUID().toString();
          // paymentRequest.setMessageId(reversalMessageId);
          reversalRequest.setReqId(kotakCOTxn.getId());

          // todo: NANOPAY? need confirm with kotak
          reversalRequest.setMsgSrc("NANOPAY");

          // todo: provided by kotak
          reversalRequest.setClientCode("TEMPTEST1");

          reversalRequest.setMsgId(kotakCOTxn.getPaymentMessageId());


          if ( isP2P ) {
            reversalRequest.setDatePost(kotakCOTxn.getSentDate());
          } else {
            // B2B
            if ( kotakCOTxn.getInvoiceId() != 0 ) {
              DAO     invoiceDAO = (DAO) x.get("invoiceDAO");
              Invoice invoice    = (Invoice) invoiceDAO.find(kotakCOTxn.getInvoiceId());
              reversalRequest.setDatePost(formatter.format(invoice.getIssueDate()));
            }
          }

          // send request to kotak, assume get the response
          ReversalResponse reversalResponse = new ReversalResponse();
          kotakCOTxn.setReversalStatusCode(reversalResponse.getStatusCode());
          kotakCOTxn.setReversalStatusDesc(reversalResponse.getStatusDesc());
          kotakCOTxn.setUTRNumber(reversalResponse.getUTR());

          transactionDAO.put(kotakCOTxn);
        } catch (Exception e) {
          logger.error(e);
        }
      }
    });
  }
}
