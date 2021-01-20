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

package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Calendar;
import net.nanopay.tx.billing.Bill;

public class BillingCron implements ContextAgent {
  

  @Override
  public void execute(X x) {
    // create single billing transaction, set txn id to all the bills
    Calendar today = Calendar.getInstance();
    int currentMonth = today.get(Calendar.MONTH);
    int currentYear = today.get(Calendar.YEAR);
    User adminUser = new User.Builder(x)
      .setFirstName("Billing")
      .setLastName("Admin")
      .setEmail("billingadmin@nanopay.net")
      .setSpid("intuit")
      .setGroup("admin")
      .build();
    adminUser = (User) ((DAO) x.get("localUserDAO")).put(adminUser);

    Subject subject = new Subject.Builder(x).setUser(adminUser).build();
    x = x.put("subject", subject);

    ArraySink sink = (ArraySink) ((DAO) x.get("billDAO")).select(new ArraySink());
    List<Bill> billList = new ArrayList<>();
    
    for ( int i = 0; i < sink.getArray().size(); i++ ) {
      Bill bill = (Bill) sink.getArray().get(i);
      Date chargeDate = bill.getChargeDate();
      LocalDate localChargeDate = chargeDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      int chargeMonth = localChargeDate.getMonthValue();
      int chargeYear = localChargeDate.getYear();
      if ( (chargeMonth == currentMonth) && (chargeYear == currentYear) ) {
        billList.add(bill);
      }
    }

  }
}
