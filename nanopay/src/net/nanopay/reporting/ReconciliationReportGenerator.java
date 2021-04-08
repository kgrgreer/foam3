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

package net.nanopay.reporting;

import foam.core.X;
import net.nanopay.partner.intuit.ReconciliationReport;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;

public interface ReconciliationReportGenerator {

  ReconciliationReport generateReport(X x, SummaryTransaction transaction, CITransaction ciTransaction, COTransaction coTransaction, DigitalTransaction dt);

}
