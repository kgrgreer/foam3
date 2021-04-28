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


package net.nanopay.partner.tx;

import foam.core.FObject;
import foam.core.X;
import net.nanopay.fx.afex.AFEXTransaction;
import net.nanopay.reporting.ReportGenerator;
import net.nanopay.tx.HistoricStatus;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class PartnerTransactionReportGenerator extends ReportGenerator {

  @Override
  public PartnerLineItem generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    var tx = (Transaction) src;
    var cor = new PartnerReport();
    var afexTx = getAFEXTransaction(tx);

    PartnerLineItem lineitem = new PartnerLineItem();

    for (TransactionLineItem lineItem: tx.getLineItems() ) {
      if ( lineItem instanceof PartnerLineItem ) {
        lineitem = (PartnerLineItem) lineItem;
        break;
      }
    }
    cor.copyFrom(lineitem);

    HistoricStatus[] historyStatus = afexTx.getStatusHistory();
    for ( HistoricStatus status : historyStatus ) {
      if ( status.getStatus().equals(TransactionStatus.PENDING) ) cor.setTradeDate(status.getTimeStamp());
    }
    var sender = tx.findSourceAccount(x).findOwner(x);
    var receiver = tx.findDestinationAccount(x).findOwner(x);

    cor.setSpid(tx.getSpid());
    cor.setClientName(sender.getLegalName());
    cor.setClientId(sender.getId());
    cor.setBeneficiaryName(receiver.getLegalName());
    cor.setBeneficiaryId(receiver.getId());
    cor.setTransactionId(tx.getId());
    cor.setPrincipleAmount(tx.getAmount());
    cor.setPrincipalCurrency(tx.getSourceCurrency());
    cor.setDestinationAmount(tx.getDestinationAmount());
    cor.setDestinationCurrency(tx.getDestinationCurrency());

    cor.setTradeNumber(afexTx.getAfexTradeResponseNumber());
    cor.setValueDate(afexTx.getCompletionDate());
    return (PartnerLineItem) super.generate(x, src, cor);
  }

  protected AFEXTransaction getAFEXTransaction(Transaction tx) {
    for ( Transaction txn : tx.getNext() ) {
      if ( txn instanceof AFEXTransaction ) return (AFEXTransaction) txn;
      AFEXTransaction temp = getAFEXTransaction(txn);
      if ( temp != null ) return temp;
    }
    return new AFEXTransaction();
  }

}
