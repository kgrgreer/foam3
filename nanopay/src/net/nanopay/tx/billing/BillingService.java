/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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

import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.core.FOAMException;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.User;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import net.nanopay.account.Account;
import net.nanopay.integration.ErrorCode;
import net.nanopay.model.Business;
import net.nanopay.tx.ChargedTo;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.EQ;

public class BillingService implements BillingServiceInterface {
  @Override
  public void createBills(X x, Transaction transaction) {
    ChargeDateServiceInterface chargeDateService = (ChargeDateServiceInterface) x.get("chargeDateService");
    DAO billDAO = (DAO) x.get("localBillDAO");
    DAO errorCodeDAO = (DAO) x.get("errorCodeDAO");
    DAO errorFeeDAO = (DAO) x.get("localErrorFeeDAO");

    Long errorCode = transaction.calculateErrorCode();
    if ( errorCode == 0 ) {
      return;
    }
    ErrorCode errorCodeObj = (ErrorCode) errorCodeDAO.find(errorCode);
    if ( errorCodeObj == null ) {
      return;
    }

    ArraySink sink = (ArraySink) errorFeeDAO.where(
      EQ(ErrorFee.ERROR_CODE, errorCodeObj.getId())
    ).select(new ArraySink());

    Date transactionDate = transaction.getLastStatusChange() != null ?
      transaction.getLastStatusChange() :
      transaction.getLastModified();
    Date chargeDate = chargeDateService.findChargeDate(transactionDate);
    Map<ChargedTo, List<BillingFee>> billingMap = new HashMap<>();
    Transaction originatingSummaryTxn = transaction.findRoot(x);

    List txnBills = getBills(x, originatingSummaryTxn.getId());
    if ( txnBills.size() > 0 ) { return; }

    for ( int i = 0; i < sink.getArray().size(); i++ ) {
      BillingFee billingFee = new BillingFee();
      ErrorFee errorFee = (ErrorFee) sink.getArray().get(i);
      
      billingFee.setAmount(errorFee.getAmount());
      billingFee.setCurrency(errorFee.getCurrency());
      billingFee.setDescription(errorCodeObj.getFullText());

      if ( ! billingMap.containsKey(errorFee.getChargedTo()) ) {
        billingMap.put(errorFee.getChargedTo(), new ArrayList<BillingFee>());
      }
      billingMap.get(errorFee.getChargedTo()).add(billingFee);
    }

    for ( ChargedTo chargedTo : billingMap.keySet() ) {
      List<BillingFee> billingFeeList = billingMap.get(chargedTo);
      Bill bill = new Bill();
      bill.setChargedTo(chargedTo);
      bill.setErrorCode(errorCodeObj.getId());
      bill.setFees(billingFeeList.toArray(new BillingFee[billingFeeList.size()]));
      bill.setOriginatingTransaction(transaction.getId());
      bill.setChargeDate(chargeDate);
      bill.setStatus(TransactionStatus.PENDING);
      bill.setSpid(transaction.getSpid());

      if ( originatingSummaryTxn instanceof SummaryTransaction ) {
        bill.setOriginatingSummaryTransaction(originatingSummaryTxn.getId());
      }
      if ( chargedTo.equals(ChargedTo.PAYER) ) {
        setupChargeToUser(x, originatingSummaryTxn.getSourceAccount(), bill);
      } else {
        setupChargeToUser(x, originatingSummaryTxn.getDestinationAccount(), bill);
      }
      billDAO.put(bill);
    }
  }

  @Override
  public List getBills(X x, String transactionId) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    SummaryTransaction txn = (SummaryTransaction) transactionDAO.find(transactionId);
    ArraySink billSink = (ArraySink) txn.getBills(x).select(new ArraySink());
    return billSink.getArray();
  }

  private void setupChargeToUser(X x, String accountId, Bill bill) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    DAO userDAO = (DAO) x.get("localUserDAO");
    Account account = (Account) accountDAO.find(accountId);
    if ( userDAO.find(account.getOwner()) instanceof Business ) {
      Business business = (Business) userDAO.find(account.getOwner());
      bill.setChargeToBusiness(business.getId());
    } else {
      User user = (User) userDAO.find(account.getOwner());
      bill.setChargeToUser(user.getId());
    }
  }
}
