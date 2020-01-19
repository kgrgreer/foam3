foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'L2TransactionApprovalRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.ruler.predicate.PropertyEQValue',
    'net.nanopay.liquidity.ruler.AccountTemplateContains',
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
      documentation: 'Prioritize account-based rules over accountTemplate-based rules.',
      javaGetter: `
        return getUseAccountTemplate() ? 80 : 90;
      `
    },
    {
      name: 'daoKey',
      value: 'transactionDAO'
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
      class: 'Boolean',
      name: 'useAccountTemplate',
      documentation: 'Use account template instead of source account if set to true.',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      label: 'Apply To Account',
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
      },
      visibilityExpression: function(useAccountTemplate) {
        return ! useAccountTemplate ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      postSet: function(_, nu) {
        if ( ! this.useAccountTemplate && !! nu ) {
          this.sourceAccount$find.then((account) => {
            this.denomination = account.denomination;
          });
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.AccountTemplate',
      name: 'accountTemplate',
      label: 'Apply To Account Template',
      section: 'basicInfo',
      visibilityExpression: function(useAccountTemplate) {
        return useAccountTemplate ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      documentation: 'The denomination to apply to when using accountTemplate.',
      label: 'Apply To Denomination',
      section: 'basicInfo',
      visibilityExpression: function(useAccountTemplate) {
        return useAccountTemplate ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'UnitValue',
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
      ],
      view: function(_, x) {
        return {
          class: 'foam.u2.view.IntView',
          readView: {
            class: 'foam.u2.view.TableCellFormatterReadView' ,
          }
        };
      }
    },
    {
      name: 'predicate',
      transient: true,
      javaGetter: `
        Predicate accountPredicate = EQ(DOT(NEW_OBJ, Transaction.SOURCE_ACCOUNT), getSourceAccount());
        Predicate denominationPredicate = TRUE;
        if ( getUseAccountTemplate() ) {
          accountPredicate = new AccountTemplateContains.Builder(getX())
            .setAccountProperty(Transaction.SOURCE_ACCOUNT)
            .setAccountTemplate(getAccountTemplate())
            .build();
          denominationPredicate = EQ(DOT(NEW_OBJ, Transaction.SOURCE_CURRENCY), getDenomination());
        }

        return AND(
          new PropertyEQValue.Builder(getX())
            .setPropName("lifecycleState")
            .setPropValue(LifecycleState.PENDING)
            .build(),
          denominationPredicate,
          accountPredicate,
          GTE( DOT(NEW_OBJ, Transaction.AMOUNT), getStartAmount() )
        );
      `
    },
    {
      name: 'asyncAction',
      transient: true,
      javaGetter: `
        return new ApprovalRuleActionOnCreate.Builder(getX())
          .setApproverLevel(2)
          .build();
      `,
    }
  ]
});
