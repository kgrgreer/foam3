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
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import net.nanopay.tx.billing.Bill;

public class BillingCron implements ContextAgent {
  

  @Override
  public void execute(X x) {
    
    // fetch todays date
    Calendar today = Calendar.getInstance();
    int currentMonth = today.get(Calendar.MONTH);
    int currentYear = today.get(Calendar.YEAR);

    // create admin user context
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

    // fetch all bills from this month
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

    // add bills in a map and associate them to the users or businesses being charged
    Map<Long, List<Bill>> billingMap = new HashMap<>();
    for ( int i = 0; i < billList.size(); i++ ) {
      Bill bill = billList.get(i);
      if ( (Long) bill.getChargeToUser() != null ) {
        if ( ! billingMap.containsKey(bill.getChargeToUser()) ) {
          List<Bill> userBillingList = new ArrayList<>();
          userBillingList.add(bill);
          billingMap.put(bill.getChargeToUser(), userBillingList);
        } else {
          billingMap.get(bill.getChargeToUser()).add(bill);
        }
      } else {
        if ( ! billingMap.containsKey(bill.getChargeToBusiness()) ) {
          List<Bill> businessBillingList = new ArrayList<>();
          businessBillingList.add(bill);
          billingMap.put(bill.getChargeToBusiness(), businessBillingList);
        } else {
          billingMap.get(bill.getChargeToBusiness()).add(bill);
        }
      }
    }

  }
}
