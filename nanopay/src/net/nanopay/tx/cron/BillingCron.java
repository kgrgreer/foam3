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
import foam.nanos.logger.Logger;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import net.nanopay.account.Account;
import net.nanopay.tx.billing.Bill;
import net.nanopay.tx.billing.BillingFee;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class BillingCron implements ContextAgent {
  @Override
  public void execute(X x) {
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
        LT(Bill.CHARGE_DATE, new Date())
    ).select(new ArraySink());

    // add bills in a map and associate them to the users or businesses being charged
    Map<Long, List<Bill>> billingMap = new HashMap<>();
    for ( int i = 0; i < bills.getArray().size(); i++ ) {
      Bill bill = (Bill) bills.getArray().get(i);
      Long id = (Long) bill.getChargeToUser() != null ? bill.getChargeToUser() : bill.getChargeToBusiness();
      if ( ! billingMap.containsKey(id) ) {
          billingMap.put(id, new ArrayList<Bill>());
      }
      billingMap.get(id).add(bill);
    }

    // for each userId in the billingMap generate a billing transaction
    for ( Long userId : billingMap.keySet() ) {
      ArraySink userAccountSink = (ArraySink) ((DAO) x.get("localAccountDAO"))
        .where(EQ(Account.OWNER, userId))
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
        .setSourceCurrency(userAccount.getDenomination())
        .setDestinationCurrency(feeAccount.getDenomination())
        .setAmount(amount)
        .build();

      try {
        billingTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).put(billingTxn);
        for ( Bill bill : billList ) {
          bill.setBillingTransaction(billingTxn.getId());
          bill.setStatus(TransactionStatus.SENT);
          ((DAO) x.get("billDAO")).put(bill);
        }
      } catch (Throwable e) {
        ((Logger) x.get("logger")).error("BillingCron error: " +  e.getMessage());
      }
    }
  }

}
