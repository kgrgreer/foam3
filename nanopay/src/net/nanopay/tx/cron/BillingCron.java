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
import foam.nanos.alarming.Alarm;
import foam.nanos.logger.Logger;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.billing.Bill;
import net.nanopay.tx.billing.BillingFee;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class BillingCron implements ContextAgent {
  @Override
  public void execute(X x) {
    // query all bills from this month
    ArraySink bills = (ArraySink) ((DAO) x.get("billDAO")).where(
        AND(
          LTE(Bill.CHARGE_DATE, new Date()),
          EQ(Bill.STATUS, TransactionStatus.PENDING)
        )
    ).select(new ArraySink());

    // Short-circuit if there are no bills
    if ( bills.getArray().size() == 0 ) return;

    // Keep a record of the cron running
    ((Logger) x.get("logger")).info("BillingCron processing " + bills.getArray().size() + " bills");

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
    Account feeAccount = (Account) x.get("feeAccount");
    for ( Long userId : billingMap.keySet() ) {
      ArraySink userAccountSink = (ArraySink) ((DAO) x.get("localAccountDAO"))
        .where(
          AND(
            EQ(Account.OWNER, userId),
            INSTANCE_OF(BankAccount.class)
          )
        )
        .orderBy(Account.CREATED)
        .limit(1)
        .select(new ArraySink());
      
      if ( userAccountSink.getArray().size() == 0 ) {
        String name = "BillingCron: Unable to find bank account to bill user: " + userId;
        DAO alarmDAO = (DAO) x.get("alarmDAO");
        Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, name));
        if ( alarm != null && alarm.getIsActive() ) { continue; }
        alarm = new Alarm.Builder(x)
                  .setName(name)
                  .setIsActive(true)
                  .setNote("Bank account for user: " + userId + " does not exist")
                  .build();
        alarmDAO.put(alarm);
        ((Logger) x.get("logger")).warning(name);
        continue;
      }
      
      Account userAccount = (Account) userAccountSink.getArray().get(0);
      long amount = 0;
      String currency = userAccount.getDenomination();
      List<Bill> billList = billingMap.get(userId);
      for ( Bill bill : billList ) {
        BillingFee[] fees = bill.getFees();
        for ( BillingFee fee : fees  ) {
          amount += fee.getAmount();

          // Check the currency of the fee
          if ( !currency.equals(fee.getCurrency()) ) {
            ((Logger) x.get("logger")).warning("BillingCron unexpected currency when charging fee on bill: " + bill.getId() + " - " + fee);
          }
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
          bill = (Bill) bill.fclone();
          bill.setBillingTransaction(billingTxn.getId());
          bill.setStatus(TransactionStatus.SENT);
          ((DAO) x.get("billDAO")).put(bill);
        }
      } catch (Throwable t) {
        ((Logger) x.get("logger")).error("BillingCron error creating billing transaction for: " + userId, t);
      }
    }
  }

}
