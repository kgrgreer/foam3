foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'TxLimitRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currencyDAO',
    'accountDAO',
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.ruler.BusinessLimitPredicate',
    'net.nanopay.tx.ruler.TransactionLimitRuleAction',
    'net.nanopay.tx.ruler.TransactionLimitState',
    'static foam.mlang.MLang.*',
  ],

  searchColumns: [
    'id',
    'applyLimitTo',
    'limit',
    'period'
  ],

  properties: [
    { name: 'id' },
    { name: 'description' },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.TxLimitEntityType',
      name: 'applyLimitTo',
      label: 'Applies To',
      section: 'basicInfo',
      tableWidth: 125,
      value: 'ACCOUNT'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      documentation: 'The user to limit.',
      name: 'userToLimit',
      section: 'basicInfo',
      view: (_, X) => {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO.where(X.data.EQ(foam.nanos.auth.User.GROUP, 'liquidBasic')).orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      },
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'USER') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      targetDAOKey: 'accountDAO',
      view: function(_, X) {
        const e = foam.mlang.Expressions.create();
        const Account = net.nanopay.account.Account;
        const LifecycleState = foam.nanos.auth.LifecycleState;
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Accounts',
              dao: X.accountDAO
                .where(e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE))
                .orderBy(Account.NAME)
            }
          ]
        };
      },
      documentation: 'The account to limit.',
      name: 'accountToLimit',
      section: 'basicInfo',
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'ACCOUNT') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      postSet: function(o, n) {
        if ( this.applyLimitTo == 'ACCOUNT' ) {
          this.accountDAO.find(n).then((account)=>{
            if ( account ) {
              this.denomination = account.denomination;
            }
          });
        }
      }
    },
    {
      class: 'Boolean',
      documentation: 'Whether to include the children of the account.',
      name: 'includeChildAccounts',
      section: 'basicInfo',
      visibilityExpression: function(applyLimitTo) {
        // We do not want this for GS R2 demo, so hiding it for now
        // return (applyLimitTo == 'ACCOUNT') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      label: 'Apply Limit When',
      visibility: 'FINAL',
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [true, 'Sending'],
          [false, 'Receiving'],
        ]
      },
      tableWidth: 150,
      tableHeaderFormatter: function(axiom) {
        this.add('Direction');
      },
      tableCellFormatter: function(value, obj) {
        this.add( value ? "Sending" : "Receiving" );
      }
    },
    {
      class: 'UnitValue',
      name: 'limit',
      label: 'With Transaction Value More Than',
      section: 'basicInfo',
      tableHeaderFormatter: function(axiom) {
        this.add('Value');
      },
      tableWidth: 200,
      validationPredicates: [
        {
          args: ['limit'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.TxLimitRule.LIMIT, 0);
          },
          errorString: 'Limit amount must be greater than 0.'
        }
      ],
      view: { class: 'net.nanopay.liquidity.ui.LiquidCurrencyView' }
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      documentation: 'The unit of measure of the transaction limit.',
      section: 'basicInfo',
      required: true,
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'ACCOUNT') ? foam.u2.Visibility.HIDDEN : foam.u2.Visibility.RW;
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      value: 'PER_TRANSACTION',
      section: 'basicInfo',
      label: 'Frequency',
      tableWidth: 200,
    },
    {
      name: 'ruleGroup',
      hidden: true,
      value: 'txlimits'
    },
    {
      name: 'predicate',
      javaGetter: `
        return (new TxLimitPredicate.Builder(getX()))
          .setEntityType(this.getApplyLimitTo())
          .setId(this.getApplyLimitTo() == TxLimitEntityType.ACCOUNT ? this.getAccountToLimit() :
                 this.getApplyLimitTo() == TxLimitEntityType.USER ? this.getUserToLimit() : 0)
          .setSend(this.getSend())
          .build();
      `
    },
    {
      name: 'action',
      transient: true,
      javaGetter: `
        return new TxLimitAction.Builder(getX()).build();
      `,
    },
    {
      class: 'Map',
      name: 'currentLimits',
      visibility: 'RO',
      readPermissionRequired: true,
      writePermissionRequired: true,
      javaFactory: `
        return new java.util.HashMap<String, TransactionLimitState>();
      `,
      documentation: 'Stores map of objects and current running limits.'
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        // make sure all validation from super class passes
        super.validate(x);

        // Check that the proper ID is set
        if (this.getApplyLimitTo() == TxLimitEntityType.USER &&
            this.getUserToLimit() == 0) {
              throw new IllegalStateException("User to limit must be set");
        }
        else if (this.getApplyLimitTo() == TxLimitEntityType.ACCOUNT &&
                 this.getAccountToLimit() == 0) {
              throw new IllegalStateException("Account to limit must be set");
        }
      `
    }
  ]
});
