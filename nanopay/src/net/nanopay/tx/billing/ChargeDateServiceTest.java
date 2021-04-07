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
import foam.nanos.test.Test;
import java.util.Calendar;
import java.util.Date;

import static foam.mlang.MLang.EQ;
import static java.util.Calendar.*;

public class ChargeDateServiceTest extends Test {

  protected ChargeDateServiceInterface chargeDateService;
  protected X x;

  @Override
  public void runTest(X x) {
    this.x = x;
    testChargeDate(x);
  }

  private void testChargeDate(X x) {
    chargeDateService = new ChargeDateService();
    Calendar now = getInstance();
    now.setTime(new Date());
    Calendar next = getInstance();
    next.clear();
    next.set(YEAR, now.get(YEAR));
    next.set(MONTH, now.get(MONTH) + 1);
    next.set(DAY_OF_MONTH, 5);

    Date chargeDate = chargeDateService.findChargeDate(new Date());
    Calendar chargeDateCalendar = getInstance();
    chargeDateCalendar.setTime(chargeDate);

    Boolean correctChargeDate = (chargeDateCalendar.get(YEAR) == next.get(YEAR) && 
                               chargeDateCalendar.get(MONTH) == next.get(MONTH) && 
                               chargeDateCalendar.get(DAY_OF_MONTH) == next.get(DAY_OF_MONTH));

    test( correctChargeDate == true, "Correct charge date generated");
  }
}
