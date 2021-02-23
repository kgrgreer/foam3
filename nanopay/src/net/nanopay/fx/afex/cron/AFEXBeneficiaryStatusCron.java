package net.nanopay.fx.afex.cron;

import static foam.mlang.MLang.EQ;

import java.util.List;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.fx.afex.AFEXBeneficiary;
import net.nanopay.fx.afex.AFEXBeneficiaryComplianceTransaction;
import net.nanopay.fx.afex.AFEXUser;
import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.fx.afex.FindBeneficiaryResponse;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class AFEXBeneficiaryStatusCron implements ContextAgent {
  private DAO afexBeneficiaryDAO;
  private Logger logger;
  private DAO afexUserDAO;
  private AFEXServiceProvider afexServiceProvider;
  private DAO txnDAO;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    afexBeneficiaryDAO = (DAO) x.get("afexBeneficiaryDAO");
    afexUserDAO = (DAO) x.get("afexUserDAO");
    afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    txnDAO = (DAO) x.get("localTransactionDAO");

    ArraySink sink = (ArraySink) afexBeneficiaryDAO.where(EQ(AFEXBeneficiary.STATUS, "Pending")).select(new ArraySink());
    List<AFEXBeneficiary> pendingBeneficiaries = sink.getArray();
    for (AFEXBeneficiary beneficiary : pendingBeneficiaries) {
      AFEXUser afexUser =  (AFEXUser) afexUserDAO.find(EQ(AFEXUser.USER, beneficiary.getOwner()));
      if ( afexUser != null ) {
        User user = User.findUser(x, afexUser.getUser());
        FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(beneficiary.getContact(),afexUser.getApiKey(), user.getSpid());
        if ( beneficiaryResponse != null ) {
          if ( beneficiaryResponse.getStatus().equals("Approved") ) {
            AFEXBeneficiary obj = (AFEXBeneficiary) beneficiary.fclone();
            obj.setStatus(beneficiaryResponse.getStatus());
            afexBeneficiaryDAO.put(obj);

            // find all pending AFEX compliance transactions and complete them
            ArraySink txnSink = new ArraySink();
            txnDAO.where(EQ(AFEXBeneficiaryComplianceTransaction.BENEFICIARY_ID, beneficiary.getId())).select(txnSink);
            List<Transaction> txnList = txnSink.getArray();

            for ( Transaction txn : txnList ) {
              txn = (Transaction) txn.fclone();
              txn.setStatus(TransactionStatus.COMPLETED);
              txnDAO.put(txn);
            }
          } else {
            AFEXBeneficiary obj = (AFEXBeneficiary) beneficiary.fclone();
            obj.setStatus(beneficiaryResponse.getStatus());
            afexBeneficiaryDAO.put(obj);
          }
        }
      }
    }
  }
}
