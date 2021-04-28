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
import net.nanopay.reporting.ReportGenerator;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class PartnerTransactionReportGenerator extends ReportGenerator {

  @Override
  public PartnerLineItem generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    var tx = (Transaction) src;

    PartnerLineItem lineitem = null;

    for (TransactionLineItem lineItem: tx.getLineItems() ) {
      if ( lineItem instanceof PartnerLineItem ) {
        lineitem = (PartnerLineItem) lineItem;
        break;
      }
    }

    var cor = lineitem == null ? new PartnerLineItem() : lineitem;
    return (PartnerLineItem) super.generate(x, src, cor);
  }

}
