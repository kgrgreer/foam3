package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import net.nanopay.model.Business;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.planner.TransactionPlan;

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
    payer.setSpid("nanopay");
    payer = (Business) localUserDAO.put_(x, payer).fclone();

    localUserDAO.where(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, "businesscheckcompliance1338@nanopay.net")).removeAll();
    var payee = new net.nanopay.model.Business();
    payee.setEmail("businesscheckcompliance1338@nanopay.net");
    payee.setEmailVerified(true);
    payee.setBusinessName("testPayeeBusinessName");
    payee.setCompliance(net.nanopay.admin.model.ComplianceStatus.NOTREQUESTED);
    payee.setSpid("nanopay");
    payee = (Business) localUserDAO.put_(x, payee).fclone();

    var txn = new net.nanopay.tx.model.Transaction();
    txn.setPayerId(payer.getId());
    txn.setPayeeId(payee.getId());
    txn.setAmount(100);

    // Test 1 - Sender needs to pass business compliance
    var threw = false;
    var message = "";
    var quote = (TransactionQuote) localTransactionPlannerDAO.put_(x, txn);
    var quoteR = localTransactionPlannerDAO.put_(x, quote.getPlan());
    test(quoteR == null , "validation has failed because null was returned"); //TODO: read an error code, see if expected
    //test( threw && message.equals("Sender needs to pass business compliance."), "Unable to put if sender business user hasn't passed compliance.")

    // Test 2 - Sender passes compliance
    payer.setCompliance(net.nanopay.admin.model.ComplianceStatus.PASSED);
    payer = (Business) localUserDAO.put_(x, payer).fclone();
    quote = (TransactionQuote) localTransactionPlannerDAO.put_(x, txn.fclone());
    quoteR = localTransactionPlannerDAO.put_(x, quote.getPlan());
    test(quoteR != null , "validation has Succeeded because null was not returned");

    // Test 3 - Receiver failed compliance
    payee.setCompliance(net.nanopay.admin.model.ComplianceStatus.FAILED);
    payee = (Business) localUserDAO.put_(x, payee).fclone();
    quote = (TransactionQuote) localTransactionPlannerDAO.put_(x, txn.fclone());
    quoteR = localTransactionPlannerDAO.put_(x, quote.getPlan());
    test(quoteR == null , "validation has failed because null was returned"); //TODO: read an error code, see if expected.
    //test( threw && message.equals("Receiver needs to pass compliance."), "Unable to put if receiver user failed compliance.");
  }
}
