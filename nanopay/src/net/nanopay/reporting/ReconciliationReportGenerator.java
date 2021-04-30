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

package net.nanopay.reporting;

import foam.core.X;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.tx.SummarizingTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.model.Transaction;

public abstract class ReconciliationReportGenerator extends ReportGenerator {

  protected String getRoot(X x, Transaction transaction) {
    var superX = x.put("subject", new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build());

    while( transaction != null && ! (transaction instanceof SummarizingTransaction) ) {
      transaction = transaction.findRoot(superX);
    }

    if ( transaction == null )
      throw new RuntimeException("Transaction missing SummaryTransaction root");

    return transaction.getId();
  }

  protected ReconciliationReportGenerator() {
    super();
  }

  protected ReconciliationReportGenerator(String spid) {
    super(spid);
  }

}
