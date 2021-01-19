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
import foam.core.X;
import foam.nanos.auth.User;
import java.util.Date;
import net.nanopay.account.Account;
import net.nanopay.integration.ErrorCode;
import net.nanopay.model.Business;
import net.nanopay.tx.ChargedTo;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.EQ;


public class BillingService implements BillingServiceInterface {

  // getBills() find corresponding bills for the summaryTxn children

  @Override
  public void createBill(X x, Transaction transaction) {
    ChargeDateServiceInterface chargeDateService = (ChargeDateServiceInterface) x.get("chargeDateService");
    DAO billDAO = (DAO) x.get("billDAO");
    DAO errorCodeDAO = (DAO) x.get("errorCodeDAO");
    DAO errorFeeDAO = (DAO) x.get("localErrorFeeDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Bill bill = new Bill();

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

    Date chargeDate = chargeDateService.findChargeDate(transaction.getLastStatusChange());
    BillingFee[] billingFees = new BillingFee[sink.getArray().size()];
    for ( int i = 0; i < sink.getArray().size(); i++ ) {
      BillingFee billingFee = new BillingFee();
      ErrorFee errorFee = (ErrorFee) sink.getArray().get(i);
      if ( errorFee.getChargedTo().equals(ChargedTo.PAYER) ) {
        setupChargeToUser(x, transaction.getSourceAccount(), billingFee);
      } else {
        setupChargeToUser(x, transaction.getDestinationAccount(), billingFee);
      }
      billingFee.setAmount(errorFee.getAmount());
      billingFee.setCurrency(errorFee.getCurrency());
      billingFee.setDescription(errorCodeObj.getFullText());
      billingFees[i] = billingFee;
    }

    bill.setErrorCode(errorCodeObj.getId());
    bill.setFees(billingFees);
    bill.setOriginatingTransaction(transaction.getId());
    bill.setChargeDate(chargeDate);
    bill.setStatus(transaction.getStatus());
    bill.setStatusHistory(transaction.getStatusHistory());
    billDAO.put(bill);
  }

  private void setupChargeToUser(X x, String accountId, BillingFee billingFee) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    DAO userDAO = (DAO) x.get("localUserDAO");
    Account account = (Account) accountDAO.find(accountId);
    if ( userDAO.find(account.getOwner()) instanceof Business ) {
      Business business = (Business) userDAO.find(account.getOwner());
      billingFee.setChargeToBusiness(business.getId());
    } else {
      User user = (User) userDAO.find(account.getOwner());
      billingFee.setChargeToUser(user.getId());
    }
  }
}
