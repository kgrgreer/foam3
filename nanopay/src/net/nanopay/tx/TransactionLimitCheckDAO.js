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

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitCheckDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.*',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sum',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.model.Broker',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionLimit',
    'net.nanopay.tx.model.TransactionLimitTimeFrame',
    'net.nanopay.tx.model.TransactionLimitType',
    'java.util.Calendar',
    'java.util.Date'
  ],

  // Constants used to get the predefined limit values from the Transaction limits(through the property name)
  constants: [
    {
      name: 'DEFAULT_USER_TRANSACTION_LIMIT',
      type: 'String',
      value: 'default_user'
    },
    {
      name: 'DEFAULT_BROKER_TRANSACTION_LIMIT',
      type: 'String',
      value: 'default_broker'
    }
  ],

  messages: [
    { name: 'PAYER_PAYEE_NOT_PROVIDED_FOR_TRANS_ERROR_MSG', message: 'No payer or payee for transaction' },
    { name: 'OVERSTEP_TRANS_LIMITS_ERROR_MSG', message: 'Transaction Limits overstepped' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionLimitCheckDAO(DAO delegate) {
            setDelegate(delegate);
          }
        
          public TransactionLimitCheckDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }  
          
          // Enum to facilitate getting Max or Min hour of each date
          protected enum MaxOrMin {
            MAX, MIN;
          } 
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Transaction transaction = (Transaction) obj;

        DAO accountDAO = (DAO) x.get("localAccountDAO");
        Logger logger = (Logger) x.get("logger");
        Account payerAcc = (Account) transaction.findSourceAccount(x);
        Account payeeAcc = (Account) transaction.findDestinationAccount(x);
        User payee  = (User) ((DAO) x.get("localUserDAO")).find_(x,payeeAcc.getOwner());
        User payer  = (User) ((DAO) x.get("localUserDAO")).find_(x,payerAcc.getOwner());

        if ( payee == null || payer == null ) {
          logger.error(PAYER_PAYEE_NOT_PROVIDED_FOR_TRANS_ERROR_MSG + " " + transaction.getId());
          throw new RuntimeException(PAYER_PAYEE_NOT_PROVIDED_FOR_TRANS_ERROR_MSG);
        }

        // If It's CICO transaction, ignore transaction limits.
        if ( payer == payee ) {
          return getDelegate().put_(x, transaction);
        }


        Object firstLock  = String.valueOf(((Account)transaction.findSourceAccount(x)).getId().compareTo(((Account)transaction.findDestinationAccount(x)).getId()) < 0 ? transaction.findSourceAccount(x) : transaction.findDestinationAccount(x)).intern();
        Object secondLock = String.valueOf(((Account)transaction.findSourceAccount(x)).getId().compareTo(((Account)transaction.findDestinationAccount(x)).getId()) >= 0 ? transaction.findDestinationAccount(x) : transaction.findSourceAccount(x)).intern();

        synchronized ( firstLock ) {
          synchronized ( secondLock ) {

            if ( ! limitsNotAbove(x, transaction, payer, isBroker(payer), TransactionLimitType.SEND,    true) ||
                ! limitsNotAbove(x, transaction, payee, isBroker(payee), TransactionLimitType.RECEIVE, false) ) {
              logger.error("Transaction limits overstepped for " + transaction.getId());
              throw new RuntimeException(OVERSTEP_TRANS_LIMITS_ERROR_MSG);
            }

            return getDelegate().put_(x, transaction);
          }
        }
      `
    },
    {
      name: 'isBroker',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'User', name: 'user' }
      ],
      documentation: 'Checking whether user is a Broker',
      javaCode: `
        Sink count    = new Count();
        DAO brokerDAO = (DAO) getX().get("brokerDAO");

        count = brokerDAO.where(EQ(user.getId(), Broker.USER_ID)).limit(1).select(count);

        return ( (Count) count).getValue() > 0;
      `
    },
    {
      name: 'limitsNotAbove',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'transaction' },
        { type: 'User', name: 'user' },
        { type: 'boolean', name: 'isBroker' },
        { type: 'TransactionLimitType', name: 'type' },
        { type: 'boolean', name: 'isPayer' }
      ],
      documentation: 'Checking if user overstepped its limits',
      javaCode: `
        DAO transactionLimitDAO = (DAO) getX().get("transactionLimitDAO");
        TransactionLimit[] userLimits = (TransactionLimit[]) user.getTransactionLimits();

        for ( TransactionLimitTimeFrame timeFrame : TransactionLimitTimeFrame.values() ) {
          boolean isDefault      = true;
          long    userLimitValue = 0;

          for ( TransactionLimit userLimit : userLimits ) {
            if ( userLimit.getTimeFrame() == timeFrame && userLimit.getType() == type ) {
              isDefault = false;
              userLimitValue = userLimit.getAmount();
              break;
            }
          }
          if ( isDefault ) {
            String limitName = DEFAULT_USER_TRANSACTION_LIMIT;
            if( isBroker ) {
              limitName = DEFAULT_BROKER_TRANSACTION_LIMIT;
            }
            DAO sumLimitDAO = transactionLimitDAO.where(AND(
                EQ(limitName, TransactionLimit.NAME),
                EQ(type,      TransactionLimit.TYPE),
                EQ(timeFrame, TransactionLimit.TIME_FRAME)));

            userLimitValue = ((Double)(((Sum) sumLimitDAO.select(SUM(TransactionLimit.AMOUNT))).getValue())).longValue();
          }
          if ( isOverTimeFrameLimit(x,transaction, user, timeFrame, userLimitValue, isPayer) ) {
            return false;
          }
        }
        return true;
      `
    },
    {
      name: 'isOverTimeFrameLimit',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'transaction' },
        { type: 'User', name: 'user' },
        { type: 'TransactionLimitTimeFrame', name: 'timeFrame' },
        { type: 'long', name: 'limit' },
        { type: 'boolean', name: 'isPayer' }
      ],
      documentation: 'Check if user reached period for a given timeframe and limit',
      javaCode: `
        long userTransactionAmount = 0;
        switch( (TransactionLimitTimeFrame) timeFrame ) {
          case DAY :
            userTransactionAmount = getTransactionAmounts(user, isPayer, Calendar.HOUR_OF_DAY);
            break;
          case WEEK :
            userTransactionAmount = getTransactionAmounts(user, isPayer, Calendar.DAY_OF_WEEK);
            break;
          case MONTH :
            userTransactionAmount = getTransactionAmounts(user, isPayer, Calendar.DAY_OF_MONTH);
            break;
          case YEAR :
            userTransactionAmount = getTransactionAmounts(user, isPayer, Calendar.DAY_OF_YEAR);
            break;
        }
        return ( ( userTransactionAmount + -transaction.getTotal(x, transaction.getSourceAccount()) ) > limit);
      `
    },
    {
      name: 'getTransactionAmounts',
      visibility: 'protected',
      type: 'long',
      args: [
        { type: 'User', name: 'user' },
        { type: 'boolean', name: 'isPayer' },
        { type: 'int', name: 'calendarType' }
      ],
      documentation: 'Getting user amount spent given a time period',
      javaCode: `
        Date firstDate = getDayOfCurrentPeriod(calendarType, MaxOrMin.MIN);
        Date lastDate = getDayOfCurrentPeriod(calendarType, MaxOrMin.MAX);

        DAO list = getDelegate().where(AND(
            EQ(user.getId(), ( isPayer ? Transaction.SOURCE_ACCOUNT : Transaction.DESTINATION_ACCOUNT ) ),
            GTE(Transaction.CREATED, firstDate ),
            LTE(Transaction.CREATED, lastDate )));

        return ((Double)(((Sum) list.select(SUM(Transaction.AMOUNT))).getValue())).longValue();
      `
    },
    {
      name: 'getDayOfCurrentPeriod',
      visibility: 'protected',
      type: 'Date',
      args: [
        { type: 'int', name: 'period' },
        { type: 'MaxOrMin', name: 'maxOrMin' }
      ],
      documentation: 'return min or max date:hour for a specific period according to parameters',
      javaCode: `
        // get start of this week in milliseconds
        Calendar cal = Calendar.getInstance();

        if ( maxOrMin == MaxOrMin.MAX ) {
          cal.set(period, cal.getActualMaximum(period));
          return getEndOfDay(cal);
        }

        cal.set(period, cal.getActualMinimum(period));
        return getStartOfDay(cal);
      `
    },
    {
      name: 'getEndOfDay',
      visibility: 'protected',
      type: 'Date',
      args: [
        { type: 'Calendar', name: 'calendar' }
      ],
      documentation: 'Setting hours, minutes, seconds and milliseconds to maximum',
      javaCode: `
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        return calendar.getTime();
      `
    },
    {
      name: 'getStartOfDay',
      visibility: 'protected',
      type: 'Date',
      args: [
        { type: 'Calendar', name: 'calendar' }
      ],
      documentation: 'Setting hours, minutes, seconds and milliseconds to minimum',
      javaCode: `
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
      `
    }
  ]
});
