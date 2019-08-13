foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Abstract class for transaction limits, never to be instantiated. Meant to be extended' +
  'by models that would provide logic for getObjectToMap method. See example: AccountTransactionLimitRule.',

  imports: [
    'accountDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.core.X',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  sections: [
    {
      name: 'accounts',
      order: 500
    }
  ],

  properties: [
    {
      name: 'name',
      visibility: 'RO',
      expression: function(limit, send, period) {
        return `${limit} ${send ? 'sending' : 'receiving'} ${period.label} transaction limit`;
      }
    },
    {
      class: 'String',
      name: 'ruleGroup',
      value: 'transactionLimits',
      visibility: 'RO',
      permissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'CREATE',
      visibility: 'RO'
    },
    {
      class: 'Double',
      name: 'limit',
      label: 'Maximum transaction size',
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['limit'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.tx.ruler.TransactionLimitRule.LIMIT, 0);
          },
          errorString: 'Please set a transaction limit.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      label: 'Apply limit to...',
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [true, 'Sending'],
          [false, 'Receiving'],
        ]
      }
    },
    {
      class: 'String',
      name: 'transactionType',
      value: null,
      label: 'Transaction Type',
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['DigitalTransaction', 'Digital Transaction'],
          ['AlternaCITransaction', 'Alterna Cash In'],
          ['AlternaCOTransaction', 'Alterna Cash Out'],
          [null, 'Any Transaction']
        ]
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      value: 'DAILY',
      label: 'Transaction limit time frame.'
    },
    {
      class: 'Map',
      name: 'currentLimits',
      visibility: 'RO',
      permissionRequired: true,
      javaFactory: `
        return new java.util.HashMap<Object, TransactionLimitState>();
      `,
      documentation: 'Stores map of objects and current running limits.'
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      label: '',
      section: 'accounts',
      view: function(_, x) {
        var M = foam.mlang.Expressions.create();
        return foam.u2.view.FilteredReferenceView.create({
          filteringDAO: x.businessDAO,
          dao: x.accountDAO.where(M.EQ(net.nanopay.account.Account.TYPE, "OverdraftAccount")),
          filteredProperty: net.nanopay.account.Account.OWNER,
          data$: x.data.slot(this.name)
        }, x);
      }
    },
    {
      name: 'action',
      javaFactory: `
        return new TransactionLimitRuleAction.Builder(getX())
          .setSend(this.getSend())
          .setLimit(this.getLimit())
          .setPeriod(this.getPeriod())
          .setCurrentLimits(this.getCurrentLimits())
          .build();
      `,
    },
    {
      name: 'predicate',
      javaFactory: `
        if ( getTransactionType() == null ) {
          return 
            foam.mlang.MLang.EQ(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, getAccount());
        } else {
          return
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(net.nanopay.tx.model.Transaction.TYPE, getTransactionType()),
              foam.mlang.MLang.EQ(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, getAccount())
            );
        }
      ` 
    }
  ],

  methods: [
    {
      name: 'updateLimitAmount',
      args: [
        {
          name: 'amount',
          type: 'Double'
        },
        {
          name: 'msPeriod',
          type: 'Long'
        }
      ],
      type: 'Double',
      javaCode: `
      return Math.max(amount - msPeriod * getLimit() / getPeriod().getMs(), 0);
      `
    },
    {
      name: 'updateRule',
      type: 'foam.nanos.ruler.Rule',
      args: [
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        }
      ],
      javaCode: `
      TransactionLimitRule ret = (TransactionLimitRule) rule.fclone();
      if ( ret.getSend() != getSend() ) {
        throw new RuntimeException("send property cannot be changed");
      }
      ret.clearAction();
      return ret;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public void setX(X x) {
          this.x_ = x;
        };
        // finds an object to map. E.g., if limit is set per account, the method will return source/destination account'
        //when set per business, will return business.
        public abstract Object getObjectToMap(net.nanopay.tx.model.Transaction txn, foam.core.X x);
        `);
      }
    }
  ]
});
