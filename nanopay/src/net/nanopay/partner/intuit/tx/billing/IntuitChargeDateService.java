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

package net.nanopay.partner.intuit.tx.billing;

import foam.core.X;
import foam.dao.DAO;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.TemporalAdjusters;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import net.nanopay.tx.billing.ChargeDateServiceInterface;
import net.nanopay.tx.model.Transaction;

import static java.util.Calendar.*;

public class IntuitChargeDateService implements ChargeDateServiceInterface {
  @Override
  public Date findChargeDate(Date transactionDate) {
    Calendar created = getInstance();
    created.setTime(transactionDate);
    Calendar next = getInstance();
    next.clear();
    next.set(YEAR, created.get(YEAR));
    next.set(MONTH, created.get(MONTH) + 1);
    next.set(WEEK_OF_MONTH, 1);
    next.set(DAY_OF_WEEK, Calendar.FRIDAY);
    LocalDate nextMonth = next.getTime().toInstant()
      .atZone(ZoneId.systemDefault())
      .toLocalDate();
    return Date.from(nextMonth.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
