package net.nanopay.cico.spi.alterna;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.cico.model.EFTReturnRecord;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;

import java.util.List;

import static foam.mlang.MLang.*;

public class EFTReturnFileProcessor {

  public void process(X x) {

    EFTReturnFileFetcher eftReturnFileFetcher = new EFTReturnFileFetcher();
    List<FObject> list = eftReturnFileFetcher.downloadFile();

    DAO transactionDao = (DAO)x.get("localTransactionDAO");

    for ( int i = 0; i < list.size(); i++ ) {
      //System.out.println(list.get(i));

      EFTReturnRecord item = (EFTReturnRecord) list.get(i);

//      Transaction tran = (Transaction)transactionDao.find(AND(
//        EQ(Transaction.AMOUNT, item.getAmount()),
//        EQ(Transaction.REFERENCE_NUMBER, item.getExternalReference()),
//        OR(
//          EQ(Transaction.TYPE, TransactionType.CASHIN),
//          EQ(Transaction.TYPE,TransactionType.CASHOUT))
//        )
//      );

      Transaction tran = (Transaction) transactionDao.find(EQ(Transaction.ID, item.getTransactionID()));

      if ( tran != null ) {
        System.out.println("matched transaction found");
        tran.setReturnCode(item.getReturnCode());
        tran.setReturnDate(item.getReturnDate());

        if ( item.getReturnCode().equals("900") ) {
          tran.setReturnType("Reject");
        } else {
          tran.setReturnType("Return");
        }

        if ( tran.getCicoStatus() == TransactionStatus.PENDING ) {
          tran.setCicoStatus(TransactionStatus.DECLINED);
          sendEmail(x, "Transaction was rejected or returned by the system", "transaction id: " + tran.getId());
        } else if ( tran.getCicoStatus() == TransactionStatus.ACCEPTED && tran.getReturnType().equals("Return") ) {
          sendEmail(x, "Transaction was returned outside of the 3 business day return period", "transaction id: " + tran.getId());
        }

        transactionDao.put(tran);
      }
    }
  }

  public void sendEmail(X x, String subject, String content) {
    EmailService emailService = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{"zac@nanopay.net"});
    message.setSubject(subject);
    message.setBody(content);
    emailService.sendEmail(message);
  }
}