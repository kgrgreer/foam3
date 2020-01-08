foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'L2TransactionApprovalRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'net.nanopay.liquidity.ruler.ApprovalRuleActionOnCreate',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
  ],

  searchColumns: [
    'id',
    'enabled',
    'startAmount'
  ],

  properties: [
    { name: 'id' },
    { name: 'description' },
    {
      name: 'ruleGroup',
      hidden: true,
      value: 'txapprovals'
    },
    {
      name: 'priority',
      value: 90
    },
    {
      name: 'daoKey',
      value: 'liquidTransactionDAO'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'UPDATE',
      visibility: 'RO',
    },
    {
      name: 'after',
      value: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      section: 'basicInfo',
      targetDAOKey: 'accountDAO',
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
      tableCellFormatter: function(value) {
        var self = this;
        this.__subSubContext__.accountDAO.find(value).then((account)=> {
          account.name ? self.add(account.name) : self.add(account.id);
        });
      }
    },
    {
      class: 'Long',
      name: 'startAmount',
      label: 'Apply to Transactions More Than',
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['startAmount'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.L2TransactionApprovalRule.START_AMOUNT, 0);
          },
          errorString: 'Amount must be greater than 0.'
        }
      ]
    },
    {
      name: 'predicate',
      transient: true,
      javaGetter: `
        return AND(
          new foam.nanos.ruler.predicate.PropertyEQValue.Builder(getX())
            .setPropName("lifecycleState")
            .setPropValue(LifecycleState.PENDING)
            .build(),
          EQ( DOT(NEW_OBJ, Transaction.SOURCE_ACCOUNT), getSourceAccount() ),
          GTE( DOT(NEW_OBJ, Transaction.AMOUNT), getStartAmount() )
        );
      `
    },
    {
      name: 'asyncAction',
      transient: true,
      javaGetter: `
        return new ApprovalRuleActionOnCreate.Builder(getX())
          .setClassification("L2 Approval - Transaction")
          .build();
      `,
    }
  ]
});
