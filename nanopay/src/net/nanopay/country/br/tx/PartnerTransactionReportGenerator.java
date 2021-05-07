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


package net.nanopay.country.br.tx;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.fx.afex.AFEXTransaction;
import net.nanopay.partner.treviso.tx.TrevisoTransaction;
import net.nanopay.reporting.ReconciliationReportGenerator;
import net.nanopay.tx.FeeSummaryTransactionLineItem;
import net.nanopay.tx.HistoricStatus;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import java.util.HashMap;
import java.util.Map;

import static foam.mlang.MLang.*;

public class PartnerTransactionReportGenerator extends ReconciliationReportGenerator {
  protected Map<String, String> afexMap = new HashMap<>();

  @Override
  public PartnerReport generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    var tx = (Transaction) src;
    var report = dst == null ? new PartnerReport() : (PartnerReport) dst;
    var afexTx = getAFEXTransaction(x, tx);

    TransactionLineItem nanoLineItem = getNanopayFeeLineItem(tx);

    PartnerLineItem lineitem = new PartnerLineItem();

    for (TransactionLineItem lineItem: tx.getLineItems() ) {
      if ( lineItem instanceof PartnerLineItem ) {
        lineitem = (PartnerLineItem) lineItem;
        break;
      }
    }
    report.copyFrom(lineitem);

    HistoricStatus[] statusHistory = afexTx.getStatusHistory();
    for ( HistoricStatus status : statusHistory ) {
      if ( status.getStatus().equals(TransactionStatus.PENDING) ) report.setTradeDate(status.getTimeStamp());
    }
    var sender = tx.findSourceAccount(x).findOwner(x);
    var receiver = tx.findDestinationAccount(x).findOwner(x);

    report.setSpid(tx.getSpid());
    report.setClientName(sender.getLegalName());
    report.setClientId(sender.getId());
    report.setBeneficiaryName(receiver.getLegalName());
    report.setBeneficiaryId(receiver.getId());
    report.setTransactionId(tx.getId());
    report.setPrincipleAmount(tx.getAmount());
    report.setPrincipleCurrency(tx.getSourceCurrency());
    report.setDestinationAmount(tx.getDestinationAmount());
    report.setDestinationCurrency(tx.getDestinationCurrency());

    report.setTradeNumber(afexTx.getAfexTradeResponseNumber());
    report.setValueDate(afexTx.getCompletionDate());

    // to support legacy data, transactions that dont have the lineitem would get default values
    if ( nanoLineItem != null ) {
      report.setNanopayFee(nanoLineItem.getAmount());
      report.setNanopayFeeCurrency(nanoLineItem.getCurrency());
    }
    return (PartnerReport) super.generate(x, src, report);
  }

  protected AFEXTransaction getAFEXTransaction(X x, Transaction tx) {
    var txDAO = (DAO) x.get("localTransactionDAO");

    if ( afexMap.get(tx.getId()) != null ) return (AFEXTransaction) txDAO.find(afexMap.get(tx.getId()));

    ((DAO) x.get("localTransactionDAO")).where(CLASS_OF(AFEXTransaction.class)).select(new AbstractSink() {

      @Override
      public void put(Object obj, Detachable sub) {
        var afexTx = (AFEXTransaction) obj;
        afexMap.put(getRoot(x, afexTx), afexTx.getId());
      }

    });

    return (AFEXTransaction) txDAO.find(afexMap.get(tx.getId()));
  }

  protected TransactionLineItem getNanopayFeeLineItem(Transaction tx) {
    for ( TransactionLineItem lineItem : tx.getLineItems() ) {
      if ( lineItem instanceof FeeSummaryTransactionLineItem ) return lineItem;
    }
    return null;
  }

  PartnerTransactionReportGenerator(String spid, boolean cached) {
    super(spid, cached);
  }

  PartnerTransactionReportGenerator(String spid) {
    super(spid);
  }

}
