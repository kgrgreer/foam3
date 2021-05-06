package net.nanopay.fx.afex.cron;

import foam.mlang.predicate.Predicate;
import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import net.nanopay.fx.afex.AFEXFundingTransaction;
import net.nanopay.fx.afex.AFEXFundingBalance;
import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.model.TransactionStatus;
import static foam.mlang.MLang.*;

public class AFEXFundingCron implements ContextAgent {
  private DAO transactionDAO;

  @Override
  public void execute(X x) {
    transactionDAO = (DAO) x.get("localTransactionDAO");
    AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");
    transactionDAO
      .where(
            AND(new Predicate[] {
                EQ(Transaction.STATUS, TransactionStatus.PENDING),
                INSTANCE_OF(AFEXFundingTransaction.class),
                EQ(AFEXFundingTransaction.FUNDING_BALANCE_INITIATED, true)
              })
            )
      .select( new AbstractSink() {

      public void put(Object o, Detachable d) {
        AFEXFundingTransaction txn = (AFEXFundingTransaction) ((FObject) o).fclone();

        AFEXFundingBalance response = afexService.getFundingBalance(x, txn.findDestinationAccount(x).getOwner(), txn.getSourceCurrency());
        if ( response != null ) {
          txn.setAccountId(response.getAccountId());
          txn.setFundingBalanceId(response.getFundingBalanceId());
          txn.setStatus(TransactionStatus.SENT);
          txn.getTransactionEvents(x).put_(x, new TransactionEvent("Funding balance created."));
          transactionDAO.put(txn);
        }
      }
    });
  }
}


