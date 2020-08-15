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
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.Transfer',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'org.apache.commons.lang.ArrayUtils'
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
      name: 'daoKey',
      value: 'transactionPlannerDAO',
      visibility: 'HIDDEN',
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
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
      name: 'applyAction',
      documentation: 'applyAction of the rule is called by rule engine',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
          TransactionQuote q = (TransactionQuote) obj;
          Transaction t = q.getRequestTransaction();
          save(getX(), plan(getX(), q, ((Transaction) t), agency), q);
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
            altPlan.setIsQuoted(true);
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
          txn.setIsQuoted(true);
          //likely can add logic for setting clearing/completion time based on planners here.
          //auto add fx rate
          txn = applyFee(x, quote, txn);
          //TODO: hit tax engine
          //TODO: signing
          // add the planner id for validation
          txn.setPlanner(this.getId());
          txn = createSummaryLineItems(x, txn);
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
      name: 'createCompliance',
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
        ct.setIsQuoted(true);
        ct.setId(UUID.randomUUID().toString());
        return ct;
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
      name: 'createSummaryLineItems',
      documentation: 'group up similar line items',
      type: 'net.nanopay.tx.model.Transaction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        return txn;
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
        if ( getIsFeeOnRootCorridors() ) {
          while ( quote.getParent() != null ){
            quote = quote.getParent();
          }

          txn = (Transaction) txn.fclone();
          txn.setSourceAccount(quote.getSourceAccount().getId());
          txn.setDestinationAccount(quote.getDestinationAccount().getId());
          txn.setSourceCurrency(quote.getSourceUnit());
          txn.setDestinationCurrency(quote.getDestinationUnit());
        }
        return (Transaction) ((DAO) x.get("localFeeEngineDAO")).put(txn);
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

