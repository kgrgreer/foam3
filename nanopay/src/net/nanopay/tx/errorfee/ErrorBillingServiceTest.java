/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.tx.errorfee;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import java.util.Date;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.ChargedTo;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.EQ;

public class ErrorBillingServiceTest extends Test {
  
  protected ErrorBilling errorBillingService;
  protected X x_;
  DigitalAccount senderAcc, receiverAcc;
  User sender, receiver;

  @Override
  public void runTest(X x) {
    x_ = x;
    createAccounts();
    testErrorBilling();
  }

  public void createAccounts() {
    sender = new User();
    sender.setEmail("errorbillingsender@nanopay.net");
    sender = (User) sender.fclone();
    sender.setEmailVerified(true);
    sender.setFirstName("ErrorBilling");
    sender.setLastName("Sender");
    sender.setSpid("nanopay");
    sender = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender)).fclone();
    senderAcc = new DigitalAccount();
    senderAcc.setDenomination("CAD");
    senderAcc.setOwner(sender.getId());
    senderAcc.setBalance(100000);
    ((DAO) x_.get("localAccountDAO")).put(senderAcc);

    receiver = new User();
    receiver.setFirstName("ErrorBilling");
    receiver.setLastName("Receiver");
    receiver.setEmail("errorbillingreceiver@nanopay.net");
    receiver.setEmailVerified(true);
    receiver.setSpid("nanopay");
    receiver = (User) (((DAO) x_.get("localUserDAO")).put_(x_, receiver)).fclone();
    receiverAcc = new DigitalAccount();
    receiverAcc.setDenomination("CAD");
    receiverAcc.setOwner(receiver.getId());
    receiverAcc.setBalance(100000);
    ((DAO) x_.get("localAccountDAO")).put(receiverAcc);
  }

  public void testErrorBilling() {
    MDAO transactionMDAO = new MDAO(Transaction.getOwnClassInfo());
    x_ = x_.put("localTransactionDAO", transactionMDAO);

    ChainSummary chainSummary = new ChainSummary();
    chainSummary.setSummary("Test Failed Summary Transaction");
    chainSummary.setStatus(TransactionStatus.FAILED);
    chainSummary.setCategory("Error Billing Test");
    chainSummary.setErrorCode(901);
    chainSummary.setErrorInfo("Error Billing Test");

    SummaryTransaction txn = new SummaryTransaction();
    txn.setId("12345");
    txn.setAmount(10000);
    txn.setSourceAccount(senderAcc.getId());
    txn.setDestinationAccount(receiverAcc.getId());
    txn.setStatus(TransactionStatus.FAILED);
    txn.setChainSummary(chainSummary);
    txn.setLastStatusChange(new Date());
    txn = (SummaryTransaction) (((DAO) x_.get("localTransactionDAO")).put(txn)).fclone();

    MDAO errorFeeMDAO = new MDAO(ErrorFee.getOwnClassInfo());
    x_ = x_.put("localErrorFeeDAO", errorFeeMDAO);

    ErrorFee errorFee = new ErrorFee();
    errorFee.setId("12345");
    errorFee.setErrorCode(901);
    errorFee.setAmount(3000);
    errorFee.setCurrency("CAD");
    errorFee.setChargedTo(ChargedTo.PAYEE);
    errorFee = (ErrorFee) ((DAO) x_.get("localErrorFeeDAO")).put(errorFee).fclone();

    errorBillingService = (ErrorBilling) x_.get("errorBillingService");
    ErrorCharge errorCharge = errorBillingService.getErrorCharge(x_, txn.getId());
    test(errorCharge != null, "Error charge successfully created from failed transaction");
    test(errorCharge.getErrorCode() == errorFee.getErrorCode(), "Error charge has correct error code");

    ErrorChargeFee[] fees = errorCharge.getFees();
    for ( int i = 0; i < fees.length; i++ ) {
      ErrorChargeFee chargeFee = fees[i];
      test( chargeFee.getAmount() == errorFee.getAmount(), "Error charge fee has correct amount");
    }
  }
}
