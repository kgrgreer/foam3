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

package net.nanopay.tx.billing;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import java.util.Date;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.ChargedTo;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.EQ;

public class BillingServiceTest extends Test {
  
  protected BillingServiceInterface billingService;
  protected X x_;
  DigitalAccount senderAcc, receiverAcc;
  User sender, receiver;

  @Override
  public void runTest(X x) {
    x_ = x;
    createAccounts();
    testBilling();
  }

  public void createAccounts() {
    sender = new User();
    sender.setEmail("billingsender@nanopay.net");
    sender = (User) sender.fclone();
    sender.setEmailVerified(true);
    sender.setFirstName("Billing");
    sender.setLastName("Sender");
    sender.setSpid("nanopay");
    sender = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender)).fclone();
    senderAcc = new DigitalAccount();
    senderAcc.setDenomination("CAD");
    senderAcc.setOwner(sender.getId());
    senderAcc.setBalance(100000);
    ((DAO) x_.get("localAccountDAO")).put(senderAcc);

    receiver = new User();
    receiver.setFirstName("Billing");
    receiver.setLastName("Receiver");
    receiver.setEmail("billingreceiver@nanopay.net");
    receiver.setEmailVerified(true);
    receiver.setSpid("nanopay");
    receiver = (User) (((DAO) x_.get("localUserDAO")).put_(x_, receiver)).fclone();
    receiverAcc = new DigitalAccount();
    receiverAcc.setDenomination("CAD");
    receiverAcc.setOwner(receiver.getId());
    receiverAcc.setBalance(100000);
    ((DAO) x_.get("localAccountDAO")).put(receiverAcc);
  }

  public void testBilling() {
    MDAO transactionMDAO = new MDAO(Transaction.getOwnClassInfo());
    x_ = x_.put("localTransactionDAO", transactionMDAO);

    BmoCITransaction bmoTxn = new BmoCITransaction();
    bmoTxn.setId("12345");
    bmoTxn.setAmount(10000);
    bmoTxn.setSourceAccount(senderAcc.getId());
    bmoTxn.setDestinationAccount(receiverAcc.getId());
    bmoTxn.setSourceCurrency(senderAcc.getDenomination());
    bmoTxn.setDestinationCurrency(receiverAcc.getDenomination());
    bmoTxn.setLastStatusChange(new Date());
    bmoTxn.setStatus(TransactionStatus.FAILED);
    bmoTxn.setRejectReason("INST. ID INVALID");

    SummaryTransaction summaryTxn = new SummaryTransaction();
    summaryTxn.setId("12345");
    summaryTxn.setAmount(10000);
    summaryTxn.setSourceAccount(senderAcc.getId());
    summaryTxn.setDestinationAccount(receiverAcc.getId());
    summaryTxn.setSourceCurrency(senderAcc.getDenomination());
    summaryTxn.setDestinationCurrency(receiverAcc.getDenomination());
    summaryTxn.setLastStatusChange(new Date());
    summaryTxn.setStatus(TransactionStatus.FAILED);
    summaryTxn.addNext(bmoTxn);
    ((DAO) x_.get("localTransactionDAO")).put(summaryTxn);

    MDAO errorFeeMDAO = new MDAO(ErrorFee.getOwnClassInfo());
    x_ = x_.put("localErrorFeeDAO", errorFeeMDAO);

    ErrorFee errorFee = new ErrorFee();
    errorFee.setId("12345");
    errorFee.setErrorCode(923);
    errorFee.setAmount(500);
    errorFee.setCurrency("CAD");
    errorFee.setChargedTo(ChargedTo.PAYEE);
    errorFee = (ErrorFee) ((DAO) x_.get("localErrorFeeDAO")).put(errorFee).fclone();

    billingService = (BillingServiceInterface) x_.get("billingService");
    MDAO billMDAO = new MDAO(Bill.getOwnClassInfo());
    x_ = x_.put("localBillDAO", billMDAO);
    billingService.createBills(x_, bmoTxn);

    ArraySink sink = (ArraySink) ((DAO) x_.get("localBillDAO")).where(EQ(Bill.ORIGINATING_TRANSACTION, bmoTxn.getId())).select(new ArraySink());
    Bill bill = (Bill) sink.getArray().get(0);
    test(bill != null, "Bill successfully created from failed transaction");
    test(bill.getErrorCode() == errorFee.getErrorCode(), "bill has correct error code");

    BillingFee[] fees = bill.getFees();
    for ( int i = 0; i < fees.length; i++ ) {
      BillingFee billingFee = fees[i];
      test( billingFee.getAmount() == errorFee.getAmount(), "Billing fee has correct amount");
    }
  }
}
