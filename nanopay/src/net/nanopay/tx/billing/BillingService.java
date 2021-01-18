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
import net.nanopay.tx.ChainSummary;
import net.nanopay.tx.ChargedTo;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.EQ;


public class BillingService implements BillingServiceInterface {
  @Override
  public Bill createBill(X x, String transactionId) {
    ChargeDateServiceInterface chargeDateService = (ChargeDateServiceInterface) x.get("chargeDateService");
    DAO billDAO = (DAO) x.get("billDAO");
    DAO errorCodeDAO = (DAO) x.get("errorCodeDAO");
    DAO errorFeeDAO = (DAO) x.get("localErrorFeeDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Bill bill = new Bill();

    Transaction txn = (Transaction) transactionDAO.find(transactionId);
    if ( txn instanceof SummaryTransaction ) {
      SummaryTransaction summaryTxn = (SummaryTransaction) txn;
      ChainSummary chainSummary = summaryTxn.getChainSummary();

      if ( chainSummary.getErrorCode() == 0 ) {
        bill.setErrorCode(chainSummary.getErrorCode());
        return bill;
      }

      ErrorCode errorCode = (ErrorCode) errorCodeDAO.find(chainSummary.getErrorCode());
      if ( errorCode == null ) {
        bill.setErrorCode(chainSummary.getErrorCode());
        return bill;
      }

      ArraySink sink = (ArraySink) errorFeeDAO.where(
        EQ(ErrorFee.ERROR_CODE, errorCode.getId())
      ).select(new ArraySink());

      Date chargeDate = chargeDateService.findChargeDate(summaryTxn.getLastStatusChange());
      BillingFee[] billingFees = new BillingFee[sink.getArray().size()];
      for ( int i = 0; i < sink.getArray().size(); i++ ) {
        BillingFee billingFee = new BillingFee();
        ErrorFee errorFee = (ErrorFee) sink.getArray().get(i);
        if ( errorFee.getChargedTo().equals(ChargedTo.PAYER) ) {
          setupChargeToUser(x, summaryTxn.getSourceAccount(), billingFee);
        } else {
          setupChargeToUser(x, summaryTxn.getDestinationAccount(), billingFee);
        }
        billingFee.setChargeDate(chargeDate);
        billingFee.setAmount(errorFee.getAmount());
        billingFee.setCurrency(errorFee.getCurrency());
        billingFee.setDescription(errorCode.getFullText());
        billingFees[i] = billingFee;
      }

      bill.setErrorCode(errorCode.getId());
      bill.setFees(billingFees);
    } else {
      throw new FOAMException("Transaction must be a SummaryTransaction to fetch error billing information");
    }

    return (Bill) billDAO.put(bill);
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
