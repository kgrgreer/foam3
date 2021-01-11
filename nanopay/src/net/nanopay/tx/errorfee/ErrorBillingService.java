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
package net.nanopay.tx.errorfee;

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


public class ErrorBillingService implements ErrorBilling {
  @Override
  public ErrorCharge getErrorCharge(X x, String transactionId) {
    ChargeDateServiceInterface chargeDateService = (ChargeDateServiceInterface) x.get("chargeDateService");
    DAO errorCodeDAO = (DAO) x.get("errorCodeDAO");
    DAO errorFeeDAO = (DAO) x.get("localErrorFeeDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    ErrorCharge errorCharge = new ErrorCharge();

    Transaction txn = (Transaction) transactionDAO.find(transactionId);
    if ( txn instanceof SummaryTransaction ) {
      SummaryTransaction summaryTxn = (SummaryTransaction) txn;
      ChainSummary chainSummary = summaryTxn.getChainSummary();

      if ( chainSummary.getErrorCode() == 0 ) {
        errorCharge.setErrorCode(chainSummary.getErrorCode());
        return errorCharge;
      }

      ErrorCode errorCode = (ErrorCode) errorCodeDAO.find(chainSummary.getErrorCode());
      if ( errorCode == null ) {
        errorCharge.setErrorCode(chainSummary.getErrorCode());
        return errorCharge;
      }

      ArraySink sink = (ArraySink) errorFeeDAO.where(
        EQ(ErrorFee.ERROR_CODE, errorCode.getId())
      ).select(new ArraySink());

      Date chargeDate = chargeDateService.findChargeDate(summaryTxn.getLastStatusChange());
      ErrorChargeFee[] errorChargeFees = new ErrorChargeFee[sink.getArray().size()];
      for ( int i = 0; i < sink.getArray().size(); i++ ) {
        ErrorChargeFee errorChargeFee = new ErrorChargeFee();
        ErrorFee errorFee = (ErrorFee) sink.getArray().get(i);
        if ( errorFee.getChargedTo().equals(ChargedTo.PAYER) ) {
          setupChargeToUser(x, summaryTxn.getSourceAccount(), errorChargeFee);
        } else {
          setupChargeToUser(x, summaryTxn.getDestinationAccount(), errorChargeFee);
        }
        errorChargeFee.setChargeDate(chargeDate);
        errorChargeFee.setAmount(errorFee.getAmount());
        errorChargeFee.setCurrency(errorFee.getCurrency());
        errorChargeFee.setDescription(errorCode.getFullText());
        errorChargeFees[i] = errorChargeFee;
      }

      errorCharge.setErrorCode(errorCode.getId());
      errorCharge.setFees(errorChargeFees);
    } else {
      throw new FOAMException("Transaction must be a SummaryTransaction to fetch error billing information");
    }

    return errorCharge;
  }

  private void setupChargeToUser(X x, String accountId, ErrorChargeFee errorChargeFee) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    DAO userDAO = (DAO) x.get("localUserDAO");
    Account account = (Account) accountDAO.find(accountId);
    if ( userDAO.find(account.getOwner()) instanceof Business ) {
      Business business = (Business) userDAO.find(account.getOwner());
      errorChargeFee.setChargeToBusiness(business.getId());
    } else {
      User user = (User) userDAO.find(account.getOwner());
      errorChargeFee.setChargeToUser(user.getId());
    }
  }
}
