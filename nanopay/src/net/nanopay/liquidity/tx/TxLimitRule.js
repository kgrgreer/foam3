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
    'net.nanopay.tx.ruler.TransactionLimitState',
    'static foam.mlang.MLang.*',
    'foam.util.SafetyUtil'
  ],

  searchColumns: [
    'id',
    'name',
    'applyLimitTo',
    'limit',
    'period'
  ],

  tableColumns: [
    'id',
    'name',
    'enabled',
    'applyLimitTo',
    'send',
    'limit',
    'period'
  ],

  properties: [
    { name: 'name' },
    { name: 'description' },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.TxLimitEntityType',
      name: 'applyLimitTo',
      label: 'Applies To',
      section: 'basicInfo',
      tableWidth: 125,
      value: 'ACCOUNT',
      view: (_, X) => {
        return {
          class: 'foam.u2.EnumView',
          permissioned: true
        };
      },
      postSet: function(o, n) {
        if ( o.name === 'ACCOUNT' ) {
          this.clearProperty('accountToLimit');
          this.clearProperty('includeChildAccounts');
        } else if ( o.name === 'USER' ) {
          this.clearProperty('userToLimit');
          this.clearProperty('denomination');
        } else if (o.name === 'BUSINESS' ) {
          this.clearProperty('businessToLimit');
          this.clearProperty('denomination');
        }
      }
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
              dao: X.liquiditySettingsUserDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      },
      visibility: function(applyLimitTo) {
        return (applyLimitTo == 'USER') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.__subContext__.liquiditySettingsUserDAO
          .find(value)
          .then((user) => {
            this.add(user.toSummary());
          })
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      targetDAOKey: 'businessDAO',
      documentation: 'The business to limit.',
      name: 'businessToLimit',
      section: 'basicInfo',
      view: (_, X) => {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Businesses',
              dao: X.businessDAO.orderBy(net.nanopay.model.Business.BUSINESS_NAME)
            }
          ]
        };
      },
      visibility: function(applyLimitTo) {
        return (applyLimitTo == 'BUSINESS') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.__subContext__.businessDAO
          .find(value)
          .then((business) => {
            this.add(business.toSummary());
          })
          .catch((error) => {
            this.add(value);
          });
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
                .where(
                  e.AND(
                    e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                    foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
                  )
                )
                .orderBy(Account.NAME)
            }
          ]
        };
      },
      documentation: 'The account to limit.',
      name: 'accountToLimit',
      section: 'basicInfo',
      visibility: function(applyLimitTo) {
        return (applyLimitTo == 'ACCOUNT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
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
      visibility: function(applyLimitTo) {
        // We do not want this for GS R2 demo, so hiding it for now
        // return (applyLimitTo == 'BUSINESS') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      label: 'Apply Limit When',
      updateVisibility: 'RO',
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
      tableHeader: function(axiom) {
        return 'Direction';
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
      tableHeader: function(axiom) {
        return 'Value';
      },
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
      view: { class: 'foam.u2.view.CurrencyInputView', contingentProperty: 'denomination' }
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      documentation: 'The unit of measure of the transaction limit.',
      section: 'basicInfo',
      required: true,
      visibility: function(applyLimitTo) {
        return (applyLimitTo == 'ACCOUNT') ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.currencyDAO,
              heading: 'Currencies'
            }
          ]
        };
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
          //TODO: check liquidity for stringId
          .setId(this.getApplyLimitTo() == TxLimitEntityType.ACCOUNT ? this.getAccountToLimit() :
                 this.getApplyLimitTo() == TxLimitEntityType.BUSINESS ? this.getBusinessToLimit() :
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
        else if (this.getApplyLimitTo() == TxLimitEntityType.BUSINESS &&
            this.getBusinessToLimit() == 0) {
              throw new IllegalStateException("Business to limit must be set");
        }
        else if (this.getApplyLimitTo() == TxLimitEntityType.ACCOUNT &&
                  SafetyUtil.isEmpty(this.getAccountToLimit())) {
              throw new IllegalStateException("Account to limit must be set");
        }
      `
    }
  ]
});
