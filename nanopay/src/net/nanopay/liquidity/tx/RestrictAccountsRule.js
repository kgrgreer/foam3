foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'RestrictAccountsRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  documentation: 'Prevents specified accounts from transacting.',

  javaImports: [
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*',
    'net.nanopay.account.Account'
  ],

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.PropertyExpr',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Neq',
    'net.nanopay.account.Account'
  ],

  searchColumns: [
    'id',
    'enabled',
    'createdBy'
  ],

  properties: [
    { name: 'id' },
    { name: 'description' },
    {
      class: 'Reference',
      name: 'sourceAccount',
      section: 'basicInfo',
      targetDAOKey: 'accountDAO',
      of: 'net.nanopay.account.Account',
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
      class: 'Boolean',
      name: 'includeSourceChildAccounts',
      documentation: 'Whether to include the children of the source account.',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      name: 'destinationAccount',
      section: 'basicInfo',
      targetDAOKey: 'accountDAO',
      of: 'net.nanopay.account.Account',
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
      class: 'Boolean',
      name: 'includeDestinationChildAccounts',
      documentation: 'Whether to include the children of the destination account.',
      section: 'basicInfo'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'sourcePredicate',
      expression: function(sourceAccount) {
        var expr = this.PropertyExpr.create({
          of: 'net.nanopay.account.Account',
          property: this.Account.ID
        });
        var cons = this.Constant.create({
          value: sourceAccount
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaGetter: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .setOf(Account.getOwnClassInfo())
            .setProperty(Account.ID)
            .build())
          .setArg2(new Constant.Builder(getX())
            .setValue(this.getSourceAccount())
            .build())
          .build();
      `,
      hidden: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      expression: function(destinationAccount) {
        var expr = this.PropertyExpr.create({
          of: 'net.nanopay.account.Account',
          property: this.Account.ID
        });
        var cons = this.Constant.create({
          value: destinationAccount
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaGetter: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .setOf(Account.getOwnClassInfo())
            .setProperty(Account.ID)
            .build())
          .setArg2(new Constant.Builder(getX())
            .setValue(this.getDestinationAccount())
            .build())
          .build();
      `,
      hidden: true
    },
    {
      name: 'ruleGroup',
      value: 'restrictAccountsRules',
      hidden: true
    },
    {
      name: 'predicate',
      transient: true,
      hidden: true,
      javaGetter: `
        return foam.mlang.MLang.AND(
          (new BusinessRuleTransactionPredicate.Builder(getX()))
            .setIsSourcePredicate(true)
            .setIncludeChildAccounts(this.getIncludeSourceChildAccounts())
            .setParentId(this.getSourceAccount())
            .setPredicate(this.getSourcePredicate())
            .build(),
          (new BusinessRuleTransactionPredicate.Builder(getX()))
            .setIsSourcePredicate(false)
            .setIncludeChildAccounts(this.getIncludeDestinationChildAccounts())
            .setParentId(this.getDestinationAccount())
            .setPredicate(this.getDestinationPredicate())
            .build()
        );
      `
    },
    {
      name: 'action',
      transient: true,
      hidden: true,
      javaGetter: `
        return new ExceptionRuleAction.Builder(getX()).setMessage(this.getId() + " restricting operation. " + this.getDescription()).build();
      `
    }
  ]
});
