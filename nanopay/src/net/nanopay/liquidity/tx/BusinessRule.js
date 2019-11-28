foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Business rule base class.',

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
      hidden: true
    },
    {
      name: 'action',
      transient: true,
      hidden: true,
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
