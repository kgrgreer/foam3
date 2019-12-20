foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Business rule base class.',

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
      tableWidth: 125,
      tableHeaderFormatter: function(axiom) {
        this.add('Current status');
      },
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
      value: 10,
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
    }
  ]
});
