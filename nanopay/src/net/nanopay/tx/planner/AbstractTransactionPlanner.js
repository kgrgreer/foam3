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
    'ruleGroup'
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
            altPlan = (Transaction) ((DAO) x.get("localFeeEngineDAO")).put(altPlan);
            quote.addPlan(altPlan);
          }
        }
        if ( txn != null ) {
          txn.setId(UUID.randomUUID().toString());
          txn.setTransfers((Transfer[]) quote.getMyTransfers_().toArray(new Transfer[0]));
          txn.setIsQuoted(true);
          //likely can add logic for setting clearing/completion time based on planners here.
          //auto add fx rate
          txn = (Transaction) ((DAO) x.get("localFeeEngineDAO")).put(txn);
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
        { name: 'clearTLIs', type: 'Boolean' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        DAO d = (DAO) x.get("localTransactionPlannerDAO");
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction((Transaction) txn.fclone());
        if (clearTLIs) {
          quote.getRequestTransaction().clearLineItems();
        }
        quote = (TransactionQuote) d.put(quote);
        return quote.getPlan();
      `
    },
    {
      name: 'multiQuoteTxn',
      documentation: 'Takes care of recursive transactionPlannerDAO calls returns ',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'clearTLIs', type: 'Boolean' }
      ],
      type: 'net.nanopay.tx.model.Transaction[]',
      javaCode: `
        DAO d = (DAO) x.get("localTransactionPlannerDAO");
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction((Transaction) txn.fclone());
        if (clearTLIs) {
          quote.getRequestTransaction().clearLineItems();
        }
        quote = (TransactionQuote) d.put(quote);
        return quote.getPlans();
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
    }
  ],
  axioms: [
      {
        buildJavaClass: function(cls) {
          cls.extras.push( `

            public Transaction quoteTxn(X x, Transaction txn) {
              return quoteTxn(x, txn, true);
            }

            public Transaction[]  multiQuoteTxn(X x, Transaction txn) {
              return multiQuoteTxn(x, txn, true);
            }

        `);
        }
      }
    ]
});

