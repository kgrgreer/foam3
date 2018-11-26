package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.kotak.model.reversal.DetailsType;
import net.nanopay.kotak.model.reversal.HeaderType;
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.text.SimpleDateFormat;
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

          HeaderType requestHeader = new HeaderType();

          String reversalMessageId = UUID.randomUUID().toString();
          requestHeader.setReq_Id(reversalMessageId);
          // todo: NANOPAY? need confirm with kotak
          requestHeader.setMsg_Src("NANOPAY");
          // todo: ClientCode will be provided by kotak
          requestHeader.setClient_Code("TEMPTEST1");
          SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
          requestHeader.setDate_Post(sdf.format(kotakCOTxn.getSentDate()));


          DetailsType details = new DetailsType();
          details.setMsg_Id(new String[]{kotakCOTxn.getKotakMsgId()});

          // transactionDAO.put(kotakCOTxn);
        } catch (Exception e) {
          logger.error(e);
        }
      }
    });

  }
}
