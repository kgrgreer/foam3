package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;

import java.util.ArrayList;
import java.util.List;

import net.nanopay.fx.afex.*;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class AFEXBeneficiaryStatusCron implements ContextAgent {
  private DAO afexBeneficiaryDAO;
  private Logger logger;
  private DAO afexBusinessDAO;
  private AFEXServiceProvider afexServiceProvider;
  private DAO txnDAO;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    afexBeneficiaryDAO = (DAO) x.get("afexBeneficiaryDAO");
    afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
    afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    txnDAO = (DAO) x.get("localTransactionDAO");

    ArraySink sink = (ArraySink) afexBeneficiaryDAO.where(EQ(AFEXBeneficiary.STATUS, "Pending")).select(new ArraySink());
    List<AFEXBeneficiary> pendingBeneficiaries = sink.getArray();
    System.out.println("Pending beneficiaries size is: " + pendingBeneficiaries.size());
    for (AFEXBeneficiary beneficiary : pendingBeneficiaries) {
      AFEXBusiness afexBusiness =  (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, beneficiary.getOwner()));
      if ( afexBusiness != null ) {
        FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(beneficiary.getContact(),afexBusiness.getApiKey());
        if ( beneficiaryResponse != null ) {
          if ( beneficiaryResponse.getStatus().equals("Approved") ) {
            AFEXBeneficiary obj = (AFEXBeneficiary) beneficiary.fclone();
            obj.setStatus("Active");
            afexBeneficiaryDAO.put(obj);

            // find all pending AFEX compliance transactions and complete them
            ArraySink txnSink = new ArraySink();
            txnDAO.where(EQ(AFEXBeneficiaryComplianceTransaction.BENEFICIARY_ID, beneficiary.getId())).select(txnSink);
            List<Transaction> txnList = txnSink.getArray();

            for ( Transaction txn : txnList ) {
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
