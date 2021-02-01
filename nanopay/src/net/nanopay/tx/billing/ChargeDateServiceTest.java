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
package net.nanopay.tx.billing;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.Subject;
import foam.nanos.test.Test;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.TemporalAdjusters;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import net.nanopay.partner.intuit.tx.billing.IntuitChargeDateService;

import static foam.mlang.MLang.EQ;
import static java.util.Calendar.*;

public class ChargeDateServiceTest extends Test {

  protected ChargeDateServiceInterface chargeDateService;
  protected X x;

  @Override
  public void runTest(X x) {
    this.x = x;
    testNanopayChargeDate(x);
    testIntuitChargeDate(x);
  }

  private void testNanopayChargeDate(X x) {
    chargeDateService = new ChargeDateService();
    Calendar now = getInstance();
    now.setTime(new Date());
    Calendar next = getInstance();
    next.clear();
    next.set(YEAR, now.get(YEAR));
    next.set(MONTH, now.get(MONTH) + 1);
    next.set(DAY_OF_MONTH, 1);

    Date nanopayChargeDate = chargeDateService.findChargeDate(new Date());
    Calendar chargeDate = getInstance();
    chargeDate.setTime(nanopayChargeDate);

    Boolean correctChargeDate = (chargeDate.get(YEAR) == next.get(YEAR) && 
                               chargeDate.get(MONTH) == next.get(MONTH) && 
                               chargeDate.get(DAY_OF_MONTH) == next.get(DAY_OF_MONTH));

    test( correctChargeDate == true, "Correct charge date generated for nanopay user");
  }

  private void testIntuitChargeDate(X x) {
    chargeDateService = new IntuitChargeDateService();
    Calendar now = getInstance();
    now.setTime(new Date());
    Calendar next = getInstance();
    next.clear();
    next.set(YEAR, now.get(YEAR));
    next.set(MONTH, now.get(MONTH) + 1);
    next.set(DAY_OF_MONTH, 1);
    LocalDate nextMonth = next.getTime().toInstant()
      .atZone(ZoneId.systemDefault())
      .toLocalDate();
    LocalDate firstFriday = nextMonth.with(TemporalAdjusters.firstInMonth(DayOfWeek.FRIDAY));
    Date firstFridayDate = Date.from(firstFriday.atStartOfDay(ZoneId.systemDefault()).toInstant());
    Date intuitChargeDate = chargeDateService.findChargeDate(new Date());
    Calendar chargeDate = getInstance();
    Calendar firstFridayOfNextMonth = getInstance();
    chargeDate.setTime(intuitChargeDate);
    firstFridayOfNextMonth.setTime(firstFridayDate);

    Boolean correctChargeDate = (chargeDate.get(YEAR) == firstFridayOfNextMonth.get(YEAR) && 
                               chargeDate.get(MONTH) == firstFridayOfNextMonth.get(MONTH) && 
                               chargeDate.get(DAY_OF_MONTH) == firstFridayOfNextMonth.get(DAY_OF_MONTH));

    test( correctChargeDate == true, "Correct charge date generated for intuit user");
  }
}
