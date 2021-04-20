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
  package: 'net.nanopay.tx.planner',
  name: 'TransactionQuotingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.ZeroAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.planner.UnableToPlanException',
    'net.nanopay.tx.creditengine.CreditCodeAccount'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enableValidation',
      value: false
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
      public TransactionQuotingDAO(X x, DAO delegate) {
        setX(x);
        setDelegate(delegate);
        System.err.println("Direct constructor use is deprecated. Use Builder instead.");
      }
       public TransactionQuotingDAO(X x, DAO delegate, Boolean validate) {
         setX(x);
         setDelegate(delegate);
         setEnableValidation(validate);
       }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' }
      ],
      type: 'foam.core.FObject',
      javaCode: `
        Transaction txn = (Transaction) obj;

        // find old Txn
        if ( ! SafetyUtil.isEmpty(txn.getId()) ) {
          Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(txn.getId());
          if (oldTxn != null) //old Txn found, this is an update, no quote required
            return getDelegate().put_(x, txn);
        }

        if ( SafetyUtil.isEmpty(txn.getId()) ) { // Transaction planning, no id.
          TransactionQuote quote = (TransactionQuote) ((DAO) x.get("localTransactionPlannerDAO")).inX(x).put(txn);
          validateQuoteTransfers(x, quote); // deprecated. should be done in planner validation
          txn = (Transaction) quote.getPlan(); // transaction is auto-quoted.
        }

        Transaction loadedTxn;
        // txn does not exist in journal, check if plan exists
        if (txn.getIsValid() == false) {
          loadedTxn = (Transaction) ((DAO) x.get("localTransactionPlannerDAO")).inX(x).put_(x, txn); // here we do property updates.
          if ( loadedTxn == null ) {
            // validation has failed or txn plan not found or expired
            return txn; // TODO: review if we still need to return txn.
          }
          if (  ! SafetyUtil.equals( loadedTxn.getId(), txn.getId()) ) {
            // Transaction was replanned (completed partial or other reason)
            return loadedTxn;
          }

          consumeCreditCode(x, loadedTxn);
          return getDelegate().put_(x, loadedTxn); //recovered plan is put in.
        }
        consumeCreditCode(x, txn);
        return getDelegate().put_(x, txn); // txn being saved as part of chain here.
      `
    },
    {
      name: 'validateQuoteTransfers',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote'}
      ],
      javaCode: `
        if ( ! getEnableValidation() )
          return;

        DAO balanceDAO = (DAO) x.get("balanceDAO");
        Logger logger = (Logger) x.get("logger");

        Transaction transaction = quote.getPlan();
        Transfer[] transfers = transaction.getTransfers();

        for ( Transfer transfer : transfers ) {
          try {
            transfer.validate();
          } catch (RuntimeException e) {
            throw new UnableToPlanException("Invalid plan", e);
          }
          Account account = transfer.findAccount(getX());
          if ( account == null ) {
            logger.error(this.getClass().getSimpleName(), "validateQuoteTransfers", "transfer account not found: " + transfer.getAccount(), transfer);
            throw new UnableToPlanException("Invalid plan");
          }

          // Skip validation of amounts for transfers to trust accounts (zero accounts) since we don't
          // want to surface these errors to the user during quoting. The error will be caught in the
          // TransactionDAO during validation of transfers there if the trust account doesn't have enough
          // value at that point.
          if ( ! ( account instanceof ZeroAccount ) ) {
            account.validateAmount(x, (Balance) balanceDAO.find(account.getId()), transfer.getAmount());
          }
        }
      `
    },
    {
      name: 'consumeCreditCode',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      type: 'net.nanopay.tx.model.Transaction',
      documentation: 'consumes the credit code',
      javaCode: `
        if ( ( (txn instanceof SummarizingTransaction) ) && txn.getCreditCodes() != null && txn.getCreditCodes().length > 0 ) {
          DAO creditCodeDAO = (DAO) x.get("localCreditCodeDAO");
          for ( String code : txn.getCreditCodes() ) {
            CreditCodeAccount creditCode = (CreditCodeAccount) creditCodeDAO.find(code);
            if ( creditCode == null ) {
              throw new RuntimeException("cant find error code");
            }
            creditCode.consume(x, txn);
          }
        }
      `
    }
  ]

});
