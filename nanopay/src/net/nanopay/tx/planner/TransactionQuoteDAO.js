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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'TransactionQuoteDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Request a plan quote for a Transaction.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.UnsupportedTransactionException',
    'net.nanopay.tx.planner.UnableToPlanException',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.PlanCostComparator',
    'net.nanopay.tx.PlanETAComparator',
    'net.nanopay.tx.PlanTransactionComparator',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Collections'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `

      TransactionQuote quote = (TransactionQuote) obj;
      Logger logger = (Logger) x.get("logger");

      //when a planner forces to pick a certain plan we do not calculate cost.
      if ( quote.getPlan() != null ) {
        return getDelegate().put_(x, quote);
      }

      //if no plans found throw exception
      if ( quote.getPlans().length == 0 ) {
        Transaction requestTxn = quote.getRequestTransaction();
        String message = String.format("Unable to plan transaction with source currency: %s, destination currency: %s, source account: %s, destination account: %s", requestTxn.getSourceCurrency(), requestTxn.getDestinationCurrency(), requestTxn.getSourceAccount(), requestTxn.getDestinationAccount());
        sendNOC(x, message);
        ((Logger) x.get("logger")).error(message);
        throw new UnableToPlanException();
      }

      //if there was only one plan added we do not need to calculate the cost.
      if ( quote.getPlans().length == 1 ) {
        quote.setPlan(quote.getPlans()[0]);
        return getDelegate().put_(x, quote);
      }
      // Select the best plan.
      PlanCostComparator costComparator =  new PlanCostComparator.Builder(x).build();
      PlanETAComparator etaComparator =  new PlanETAComparator.Builder(x).build();
      PlanTransactionComparator planComparators = new PlanTransactionComparator.Builder(x).build();
      planComparators.add(costComparator); // Compare Cost first
      planComparators.add(etaComparator);
      List<Transaction> transactionPlans = new ArrayList<>();

      for ( Transaction aTransaction : quote.getPlans() ) {
          transactionPlans.add(aTransaction);
      }
      if ( transactionPlans.size() == 0 ) {
        throw new UnableToPlanException();
      }
      Collections.sort(transactionPlans, planComparators);
      quote.setPlan(transactionPlans.get(0));

      return getDelegate().put_(x, quote);`
    },
    {
      name: 'sendNOC',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'message',
          type: 'String'
        }
      ],
      javaCode: `
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
      ((DAO) x.get("localNotificationDAO")).put(notification);
      ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);

      String name = "Unable to plan";
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, name));
      if ( alarm != null &&
           alarm.getIsActive() ) {
        return;
      }
      alarm = new Alarm.Builder(x)
                 .setName(name)
                 .setIsActive(true)
                 .setReason(AlarmReason.UNSUPPORTED)
                 .setNote(message)
                 .build();
      alarmDAO.put(alarm);
    `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionQuoteDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
