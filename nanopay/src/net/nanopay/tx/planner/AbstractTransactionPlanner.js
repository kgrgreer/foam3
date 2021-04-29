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
  name: 'AbstractTransactionPlanner',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Abstract rule action for transaction planning.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  imports: [
    'ruleGroupDAO',
  ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.UUID',
    'java.util.List',
    'java.util.ArrayList',
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.ExternalTransfer',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.*',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TaxLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.LimitTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'org.apache.commons.lang.ArrayUtils',
    'net.nanopay.tx.TransactionException',
    'net.nanopay.tx.PropertyCompare'
  ],

  tableColumns: [
    'willPlan',
    'name',
    'id',
    'enabled',
    'bestPlan',
    'multiPlan_',
    'ruleGroup.id'
  ],

  properties: [
    {
      name: 'multiPlan_',
      label: 'Multi Planner',
      documentation: 'true for planners which produce more then one plan',
      class: 'Boolean',
      value: false
    },
    {
      name: 'enabled',
      value: true
    },
    {
      name: 'willPlan',
      label: 'Planner will Plan',
      documentation: 'For front end, tells whether this planner will plan or not',
      class: 'Boolean',
      expression: async function() {
        return ( ( await this.ruleGroupDAO.find(this.ruleGroup) ).enabled && this.enabled );
      },
      storageTransient: true
    },
    {
      name: 'bestPlan',
      label: 'Force Best Plan',
      class: 'Boolean',
      documentation: 'determines whether to save as best plan',
      value: false
    },
    {
      name: 'isFeeOnRootCorridors',
      class: 'Boolean',
      documentation: `Determines whether fee is applied on the planned
        transaction with the country and currency corridors from the root quote.

        If set to false (default), fee is applied directly on the transaction.`,
      value: false
    },
    {
      name: 'action',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return this;',
    },
    {
      name: 'after',
      visibility: 'HIDDEN',
      value: false
    },
    {
      name: 'upperLimit',
      class: 'Long',
      value: 0,
      documentation: 'The planner will only plan txns with an amount below this limit. 0 means not set'
    },
    {
      name: 'lowerLimit',
      class: 'Long',
      value: 0,
      documentation: 'The planner will only plan txns with an amount above this limit'
    },
    {
      name: 'daoKey',
      value: 'transactionPlannerDAO',
      visibility: 'HIDDEN',
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      value: 'CREATE',
      visibility: 'HIDDEN',
    },
  ],

  methods: [
    //planners set themselves as rule actions, which would lead to stack overflow on cloning
    {
      name: 'fclone',
      type: 'foam.core.FObject',
      javaCode: `
        this.__frozen__ = false;
        return this;
      `
    },
    {
      name: 'getPredicate',
      type: 'foam.mlang.predicate.Predicate',
      documentation: 'override predicate with transaction value limits (sender side)',
      javaCode: `
      // TODO: uncomment code block when MQL done
        if ( getLowerLimit() > 0 ) {
          if ( getUpperLimit() > 0 ) {
          // both lower and upper limits active
            return AND(
              super.getPredicate(),
              new PropertyCompare( "gte", "amount", getLowerLimit(), true ), //TODO: replace with MQL predicate
              new PropertyCompare( "lt", "amount", getUpperLimit(), true ) //TODO: replace with MQL predicate
            );
          }
          // lower limit active upper not
          return AND(
            super.getPredicate(),
            new PropertyCompare( "gte", "amount", getLowerLimit(), true ) //TODO: replace with MQL predicate
          );
        }
        if ( getUpperLimit() > 0 ) {
          // upper limit active, lower not
          return AND(
            super.getPredicate(),
            new PropertyCompare( "lt", "amount", getUpperLimit(), true ) //TODO: replace with MQL predicate
          );
        }
        // limits not active

        return super.getPredicate();
      `
    },
    {
      name: 'getUser',
      javaCode: `
        return ((TransactionQuote) obj).getSourceAccount().findOwner(x);
      `
    },
    {
      name: 'applyAction',
      documentation: 'applyAction of the rule is called by rule engine',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
          TransactionQuote q = (TransactionQuote) obj;
          Transaction t = q.getRequestTransaction();
          save(x, plan(x, q, ((Transaction) t), agency), q);
        }
      },"AbstractTransaction Planner executing");
      `
    },
    {
      name: 'plan',
      documentation: 'The transaction that is to be planned should be created here',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' },
        { name: 'requestTxn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'agency', type: 'foam.core.Agency' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        /* Needs to be overwritten by extending class */
        return new Transaction();
      `
    },
    {
      name: 'save',
      documentation: 'boiler plate transaction fields that need to be set for a valid plan',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' }
      ],
      javaCode: `
        if ( getMultiPlan_() ) { // for performance can disallow multiplans on some planners?
          for ( Object altPlanO : quote.getAlternatePlans_() ) {
            Transaction altPlan = (Transaction) altPlanO;
            altPlan.setTransfers((Transfer[]) ArrayUtils.addAll(altPlan.getTransfers(),quote.getMyTransfers_().toArray(new Transfer[0])));
            // add the planner id for validation
            altPlan.setPlanner(this.getId());
            altPlan.setId(UUID.randomUUID().toString());
            altPlan = applyFee(x, quote, altPlan);
            quote.addPlan(altPlan);
          }
        }
        if ( txn != null ) {
          txn.setId(UUID.randomUUID().toString());
          txn.setTransfers((Transfer[]) quote.getMyTransfers_().toArray(new Transfer[0]));
          //likely can add logic for setting clearing/completion time based on planners here.
          //auto add fx rate
          txn = applyFee(x, quote, txn);
          //TODO: hit tax engine
          //TODO: signing
          // add the planner id for validation
          txn.setPlanner(this.getId());
          quote.addPlan(txn);
          if (getBestPlan()) {
            quote.setPlan(txn);
          }
        }
        quote.clearAlternatePlans_();
        quote.clearMyTransfers_();
      `
    },
    {
      name: 'quoteTxn',
      documentation: 'Takes care of recursive transactionPlannerDAO calls returns best txn',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'parent', type: 'net.nanopay.tx.TransactionQuote' },
        { name: 'clearTLIs', type: 'Boolean' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        var quote = _quoteTxn(x, txn, parent, clearTLIs);
        return quote.getPlan();
      `
    },
    {
      name: 'multiQuoteTxn',
      documentation: 'Takes care of recursive transactionPlannerDAO calls returns ',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'parent', type: 'net.nanopay.tx.TransactionQuote' },
        { name: 'clearTLIs', type: 'Boolean' }
      ],
      type: 'net.nanopay.tx.model.Transaction[]',
      javaCode: `
        var quote = _quoteTxn(x, txn, parent, clearTLIs);
        return quote.getPlans();
      `
    },
    {
      name: '_quoteTxn',
      documentation: 'Helper method to quote a transaction. Internal use only.',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'parent', type: 'net.nanopay.tx.TransactionQuote' },
        { name: 'clearTLIs', type: 'Boolean' }
      ],
      type: 'net.nanopay.tx.TransactionQuote',
      javaCode: `
        DAO dao = (DAO) x.get("localTransactionPlannerDAO");
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction((Transaction) txn.fclone());
        quote.setParent(parent);
        if (clearTLIs) {
          quote.getRequestTransaction().clearLineItems();
        }
        return (TransactionQuote) dao.put(quote);
      `
    },
    {
      name: 'createComplianceTransaction',
      documentation: 'Creates a compliance transaction and returns it',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.tx.ComplianceTransaction',
      javaCode: `
        ComplianceTransaction ct = new ComplianceTransaction();
        ct.copyFrom(txn);
        ct.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        ct.setName("Compliance Transaction");
        ct.clearTransfers();
        ct.clearLineItems();
        ct.setPlanner(getId());
        ct.clearNext();
        ct.setId(UUID.randomUUID().toString());
        return ct;
      `
    },
    {
      name: 'createLimitTransaction',
      documentation: 'Creates a limit transaction and returns it',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.tx.LimitTransaction',
      javaCode: `
        LimitTransaction lt = new LimitTransaction();
        lt.copyFrom(txn);
        lt.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        lt.setName("Limit Transaction");
        lt.clearTransfers();
        lt.clearLineItems();
        lt.setPlanner(getId());
        lt.clearNext();
        lt.setId(UUID.randomUUID().toString());
        return lt;
      `
    },
    {
      name: 'validatePlan',
      documentation: 'final step validation to see if there are any line items etc to be filled out',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        return true;
        // To be filled out in extending class.
      `
    },
    {
      name: 'postPlanning',
      documentation: 'Run any planner specific logic that needs to happen after planning and then run validation logic',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'root', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        return validatePlan(x,txn);
        // To be filled out in extending class.
      `
    },
    {
      name: 'applyFee',
      type: 'Transaction',
      documentation: `
        In the normal flow, fee is applied on the planned transaction that is
        returned by the planner, which is the head transaction in the chain.
        However, applyFee() can also be used by and inside the planner logic to
        send a specific transaction in the chain for fee evaluation.

        The specific transaction might not have the same country and currency
        corridors as that of the root quote.

        If the 'isFeeOnRootCorridors' flag is set to false (default), fee will
        be directly applied on the transaction.

        If the 'isFeeOnRootCorridors' flag is set to true, the transaction will
        use the country and currency corridors from the root quote instead of
        its own. Therefore, fees targeting those corridors will be applied on
        the transaction.`,
      args: [
        { name: 'x', type: 'Context' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        var txnclone = (Transaction) txn.fclone();
        if ( getIsFeeOnRootCorridors() ) {
          // TODO: validate Crunch capabilities?
          while ( quote.getParent() != null ){
            quote = quote.getParent();
          }

          txnclone.setSourceAccount(quote.getSourceAccount().getId());
          txnclone.setDestinationAccount(quote.getDestinationAccount().getId());
          txnclone.setSourceCurrency(quote.getSourceUnit());
          txnclone.setDestinationCurrency(quote.getDestinationUnit());
        }
        txnclone = (Transaction) ((DAO) x.get("localFeeEngineDAO")).put(txnclone);

        txn.setLineItems(txnclone.getLineItems());
        txn = createFeeTransfers(x, txn, quote);
        txn = createTaxTransfers(x, txn, quote);
        return txn;
      `
    },
    {
      name: 'createFeeTransfers',
      documentation: 'Creates transfers for fees, and adjusts other transfers if needed',
      type: 'Transaction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' },
      ],
      javaCode: `
        TransactionLineItem [] ls = txn.getLineItems();
        for ( TransactionLineItem li : ls ) {
          if ( li instanceof FeeLineItem && ! (li instanceof InvoicedFeeLineItem) && ! SafetyUtil.isEmpty(li.getSourceAccount()) ) {
            FeeLineItem feeLineItem = (FeeLineItem) li;
            Account acc = null;
            if ( feeLineItem.getSourceAccount() == quote.getSourceAccount().getId() )
              acc = quote.getSourceAccount();
            if ( feeLineItem.getSourceAccount() == quote.getDestinationAccount().getId() )
              acc = quote.getDestinationAccount();
            if (acc == null)
              acc = feeLineItem.findSourceAccount(x);
            if ( acc instanceof DigitalAccount) {
              Transfer tSend = new Transfer(acc.getId(), -feeLineItem.getAmount());
              Transfer tReceive = new Transfer(feeLineItem.getDestinationAccount(), feeLineItem.getAmount());
              Transfer[] transfers = { tSend, tReceive };
              txn.add(transfers);
            }
            else {
              Transfer tSend = new ExternalTransfer(acc.getId(), -feeLineItem.getAmount());
              Transfer tReceive = new ExternalTransfer(feeLineItem.getDestinationAccount(), feeLineItem.getAmount());
              Transfer[] transfers = { tSend, tReceive };
              txn.add(transfers);
            }
          }
        }
        return txn;
      `
    },
    {
      name: 'createTaxTransfers',
      documentation: 'Creates transfers for taxes',
      type: 'Transaction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' },
      ],
      javaCode: `
        TransactionLineItem [] ls = txn.getLineItems();
        for ( TransactionLineItem li : ls ) {
          if ( li instanceof TaxLineItem && ! SafetyUtil.isEmpty(li.getSourceAccount()) ) {
            TaxLineItem taxLineItem = (TaxLineItem) li;
            Account acc = null;
            if ( taxLineItem.getSourceAccount() == quote.getSourceAccount().getId() )
              acc = quote.getSourceAccount();
            if ( taxLineItem.getSourceAccount() == quote.getDestinationAccount().getId() )
              acc = quote.getDestinationAccount();
            if (acc == null)
              acc = taxLineItem.findSourceAccount(x);
            if ( acc instanceof DigitalAccount) {
              Transfer tSend = new Transfer(acc.getId(), -taxLineItem.getAmount());
              Transfer tReceive = new Transfer(taxLineItem.getDestinationAccount(), taxLineItem.getAmount());
              Transfer[] transfers = { tSend, tReceive };
              txn.add(transfers);
            }
            else {
              Transfer tSend = new ExternalTransfer(acc.getId(), -taxLineItem.getAmount());
              Transfer tReceive = new ExternalTransfer(taxLineItem.getDestinationAccount(), taxLineItem.getAmount());
              Transfer[] transfers = { tSend, tReceive };
              txn.add(transfers);
            }
          }
        }
        return txn;
      `
    },
    {
      name: 'removeSummaryTransaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      documentation: 'Remove the summary and or compliance transaction from this chain.',
      javaCode: `
        boolean removed = false;
        if ( (txn != null) && (txn instanceof FXSummaryTransaction || txn instanceof SummaryTransaction) ) {
          txn = txn.getNext()[0];
          removed = true;
        }
        if ( (txn != null) && (txn instanceof ComplianceTransaction) ) {
          txn = txn.getNext()[0];
          removed = true;
        }
        if ( txn == null )
          throw new TransactionException("Error: Summary removal called on bare summary transaction.");
        if (removed)
          txn.setStatus(txn.getInitialStatus());
        return txn;
      `
    }
  ],
  axioms: [
      {
        buildJavaClass: function(cls) {
          cls.extras.push( `

            public Transaction quoteTxn(X x, Transaction txn, TransactionQuote parent) {
              return quoteTxn(x, txn, parent, true);
            }

            public Transaction[]  multiQuoteTxn(X x, Transaction txn, TransactionQuote parent) {
              return multiQuoteTxn(x, txn, parent, true);
            }

        `);
        }
      }
    ]
});

