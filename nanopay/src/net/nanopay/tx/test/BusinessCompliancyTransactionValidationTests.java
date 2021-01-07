package net.nanopay.tx.test;

import foam.core.X;
import foam.core.ValidationException;
import foam.dao.DAO;
import net.nanopay.account.DigitalAccount;
import net.nanopay.model.Business;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.planner.TransactionPlan;
import net.nanopay.tx.planner.UnableToPlanException;

public class BusinessCompliancyTransactionValidationTests
  extends foam.nanos.test.Test
{

  public void runTest(X x) {
    var localUserDAO = (DAO) x.get("localUserDAO");
    var localTransactionPlannerDAO = (DAO) x.get("localTransactionPlannerDAO");

    // Create business users.
    localUserDAO.where(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, "businesscheckcompliance1337@nanopay.net")).removeAll();
    var payer = new net.nanopay.model.Business();
    payer.setEmail("businesscheckcompliance1337@nanopay.net");
    payer.setEmailVerified(true);
    payer.setBusinessName("testPayerBusinessName");
    payer.setCompliance(net.nanopay.admin.model.ComplianceStatus.REQUESTED);
    payer = (Business) localUserDAO.put_(x, payer).fclone();

    localUserDAO.where(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, "businesscheckcompliance1338@nanopay.net")).removeAll();
    var payee = new net.nanopay.model.Business();
    payee.setEmail("businesscheckcompliance1338@nanopay.net");
    payee.setEmailVerified(true);
    payee.setBusinessName("testPayeeBusinessName");
    payee.setCompliance(net.nanopay.admin.model.ComplianceStatus.NOTREQUESTED);
    payee = (Business) localUserDAO.put_(x, payee).fclone();

    DigitalAccount sender = TransactionTestUtil.RetrieveDigitalAccount(x, payer, "CAD");
    DigitalAccount receiver = TransactionTestUtil.RetrieveDigitalAccount(x, payee,"CAD", sender);
    Transaction txn = new net.nanopay.tx.model.Transaction();
    txn.setPayerId(payer.getId());
    txn.setSourceAccount(sender.getId());
    txn.setPayeeId(payee.getId());
    txn.setDestinationAccount(receiver.getId());
    txn.setAmount(100);

    // Test 1 - Sender needs to pass business compliance
    var threw = false;
    var message = "";
    try {
      var quote = (TransactionQuote) localTransactionPlannerDAO.put_(x, txn);
      try {
        var quoteR = localTransactionPlannerDAO.put_(x, quote.getPlan());
        test(false , "validation unexpectantly successful");
      } catch (ValidationException e) {
        test( e.getMessage().equals("Sender needs to pass business compliance."), "Unable to put if sender business user hasn't passed compliance.");
      }
    } catch (UnableToPlanException e) {
      test(false , e.getClass().getSimpleName() + " " + e.getMessage());
    }

    // Test 2 - Sender passes compliance
    payer.setCompliance(net.nanopay.admin.model.ComplianceStatus.PASSED);
    payer = (Business) localUserDAO.put_(x, payer).fclone();
    try {
      var quote = (TransactionQuote) localTransactionPlannerDAO.put_(x, txn.fclone());
      try {
        var quoteR = localTransactionPlannerDAO.put_(x, quote.getPlan());
        test(quoteR != null , "validation successful");
      } catch (ValidationException e) {
        test(false, "validation unexpectantly failed: "+e.getMessage());
      }
    } catch (UnableToPlanException e) {
      test(false , e.getClass().getSimpleName() + " " + e.getMessage() + " " +e.getCause());
    }

    // Test 3 - Receiver failed compliance
    payee.setCompliance(net.nanopay.admin.model.ComplianceStatus.FAILED);
    payee = (Business) localUserDAO.put_(x, payee).fclone();
    try {
      var quote = (TransactionQuote) localTransactionPlannerDAO.put_(x, txn.fclone());
      try {
        var quoteR = localTransactionPlannerDAO.put_(x, quote.getPlan());
        test(false , "validation unexpectantly successful");
      } catch (ValidationException e) {
        test( e.getMessage().equals("Receiver needs to pass compliance."), "Unable to put if receiver user failed compliance.");
      }
    } catch (UnableToPlanException e) {
      test(false , e.getClass().getSimpleName() + " " + e.getMessage());
    }
  }
}
