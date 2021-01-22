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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import net.nanopay.account.Account;
import net.nanopay.tx.billing.Bill;
import net.nanopay.tx.billing.BillingFee;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;
import static java.util.Calendar.*;

public class BillingCron implements ContextAgent {
  @Override
  public void execute(X x) {
    
    // fetch first day of this month and next month
    Calendar first = getInstance();
    Calendar next = getInstance();
    first.set(DAY_OF_MONTH, 1);
    next.clear();
    next.set(YEAR, first.get(YEAR));
    next.set(MONTH, first.get(MONTH) + 1);
    next.set(DAY_OF_MONTH, 1);
    Date firstDayOfThisMonth = first.getTime();
    Date firstDayOfNextMonth = next.getTime();

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

    // query all bills from this month
    ArraySink bills = (ArraySink) ((DAO) x.get("billDAO")).where(
      AND(
        GTE(Bill.CHARGE_DATE, firstDayOfThisMonth),
        LT(Bill.CHARGE_DATE, firstDayOfNextMonth)
      )
    ).select(new ArraySink());

    // add bills in a map and associate them to the users or businesses being charged
    Map<Long, List<Bill>> billingMap = new HashMap<>();
    for ( int i = 0; i < bills.getArray().size(); i++ ) {
      Bill bill = (Bill) bills.getArray().get(i);
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

    for ( Long userId : billingMap.keySet() ) {
      ArraySink userAccountSink = (ArraySink) ((DAO) x.get("localAccountDAO"))
        .where(AND(EQ(Account.OWNER, userId), EQ(Account.DENOMINATION, "CAD")))
        .orderBy(Account.CREATED)
        .limit(1)
        .select(new ArraySink());

      ArraySink feeAccountSink = (ArraySink) ((DAO) x.get("localAccountDAO"))
        .where(EQ(Account.NAME, "Nanopay Fee Receiving Account"))
        .select(new ArraySink());
      
      Account userAccount = (Account) userAccountSink.getArray().get(0);
      Account feeAccount = (Account) feeAccountSink.getArray().get(0);
      
      long amount = 0;
      List<Bill> billList = billingMap.get(userId);
      for ( Bill bill : billList ) {
        BillingFee[] fees = bill.getFees();
        for ( BillingFee fee : fees  ) {
          amount += fee.getAmount();
        }
      }

      Transaction billingTxn = new Transaction.Builder(x)
        .setSourceAccount(userAccount.getId())
        .setDestinationAccount(feeAccount.getId())
        .setAmount(amount)
        .build();

      billingTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).put(billingTxn);

      for ( Bill bill : billList ) {
        bill.setBillingTransaction(billingTxn.getId());
        ((DAO) x.get("billDAO")).put(bill);
      }
    }


  }
}
