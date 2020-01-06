foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'TxLimitRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  imports: [
    'currencyDAO',
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
    'enabled',
    'applyLimitTo',
    'send',
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
      section: 'basicInfo',
      tableWidth: 125,
      tableHeaderFormatter: function(axiom) {
        this.add('Entity Type');
      },
      value: 'ACCOUNT'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      documentation: 'The user to limit.',
      name: 'userToLimit',
      section: 'basicInfo',
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'USER') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      targetDAOKey: 'accountDAO',
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      documentation: 'The account to limit.',
      name: 'accountToLimit',
      section: 'basicInfo',
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'ACCOUNT') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      documentation: 'Whether to include the children of the account.',
      name: 'includeChildAccounts',
      section: 'basicInfo',
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'ACCOUNT') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      targetDAOKey: 'businessDAO',
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      documentation: 'The business to limit.',
      name: 'businessToLimit',
      section: 'basicInfo',
      visibilityExpression: function(applyLimitTo) {
        return (applyLimitTo == 'BUSINESS') ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
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
      class: 'Long',
      name: 'limit',
      label: 'With Transaction Value More Than',
      section: 'basicInfo',
      tableHeaderFormatter: function(axiom) {
        this.add('Value');
      },
      tableCellFormatter: function(value, obj) {
        if ( obj.denomination ) {
          obj.currencyDAO.find(obj.denomination).then(function(currency) {
              if ( currency ) {
                this.add( currency.format(value) );
              } else {
                this.add( value );
              }
          }.bind(this));
        } else {
          this.add( value );
        }
      },
      tableWidth: 200,
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      documentation: 'The unit of measure of the transaction limit.',
      section: 'basicInfo',
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      value: 'DAILY',
      section: 'basicInfo',
      label: 'Over Timeframe',
      tableHeaderFormatter: function(axiom) {
        this.add('Period');
      },
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
  ]
});
