foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Transaction Business Rule.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*'
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
    'businessRuleAction',
    'createdBy',
    'description'
  ],

  properties: [
    {
      name: 'id',
      section: 'basicInfo',
      label: 'Rule Name',
      tableWidth: 750
    },
    {
      name: 'enabled',
      label: 'Current status',
      value: true,
      tableWidth: 125,
      tableCellFormatter: function(value, obj) {
        this.add( value ? "Enabled" : "Disabled" );
      }
    },
    {
      class: 'String',
      name: 'description',
      section: 'basicInfo'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'sourcePredicate',
      label: 'Source Condition',
      section: 'basicInfo',
      factory: function() {
        var expr = this.PropertyExpr.create({
          //of: this.Account,
          property: this.Account.NAME
        });
        var cons = this.Constant.create({
          value: "Source Account"
        });
        var pred = this.Eq.create({
          //view: foam.u2.detail.SectionedDetailView,
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaFactory: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .build())
          .setArg2(new Constant.Builder(getX())
            .build())
          .build();
      `
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      label: 'Destination Condition',
      section: 'basicInfo',
      factory: function() {
        var expr = this.PropertyExpr.create({
          property: this.Account.NAME
        });
        var cons = this.Constant.create({
          value: "Destination Account"
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaFactory: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .build())
          .setArg2(new Constant.Builder(getX())
            .build())
          .build();
      `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.BusinessRuleAction',
      name: 'businessRuleAction',
      section: 'basicInfo',
      label: 'Action Type',
      tableWidth: 125
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'CREATE',
      visibility: 'RO',
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'RO',
    },
    {
      name: 'priority',
      hidden: true,
      javaGetter: `
        return 10;
      `
    },
    {
      name: 'ruleGroup',
      value: 'businessRules',
      hidden: true
    },
    {
      name: 'documentation',
      transient: true,
      hidden: true,
      javaGetter: `
        return this.getDescription();
      `
    },
    {
      name: 'after',
      value: false,
      hidden: true
    },
    {
      name: 'predicate',
      transient: true,
      hidden: true,
      javaGetter: `
        return foam.mlang.MLang.AND(
          (new BusinessRuleTransactionPredicate.Builder(getX())).setIsSourcePredicate(true).setPredicate(this.getSourcePredicate()).build(), 
          (new BusinessRuleTransactionPredicate.Builder(getX())).setIsSourcePredicate(false).setPredicate(this.getDestinationPredicate()).build());
      `
    },
    {
      name: 'action',
      transient: true,
      hidden: true,
      javaGetter: `
        // PREVENT
        if (this.getBusinessRuleAction() == BusinessRuleAction.PREVENT)
          return new ExceptionRuleAction.Builder(getX()).setMessage(this.getId() + " preventing operation. " + this.getDescription()).build();

        // NOTIFY
        if (this.getBusinessRuleAction() == BusinessRuleAction.NOTIFY)
          return new BusinessRuleNotificationAction.Builder(getX()).setBusinessRuleId(this.getId()).build();  // TODO - add proper configuration for this email address

        // APPROVAL - TODO

        // ALLOW
        return null;
      `,
    },
    {
      name: 'saveHistory',
      hidden: true
    },
    {
      name: 'validity',
      hidden: true
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the account was created in the system.',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'The ID of the User who created the account.',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.__subContext__.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.label() ) {
              this.add(user.label());
            }
          }
        }.bind(this));
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time of when the account was last changed in the system.',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The unique identifier of the individual person, or real user,
        who last modified this account.`,
      visibility: 'RO',
    }
  ]
});
