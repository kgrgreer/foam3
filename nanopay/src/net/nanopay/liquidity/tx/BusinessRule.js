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
      tableWidth: 125
    },
    {
      name: 'name',
      section: 'basicInfo',
      label: 'Rule Name',
      tableWidth: 400
    },
    {
      name: 'enabled',
      readPermissionRequired: false,
      tableWidth: 125,
      tableHeaderFormatter: function(axiom) {
        this.add('Status');
      },
      columnLabel: 'Status',
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
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      value: 'CREATE_OR_UPDATE',
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
            if ( user.toSummary() ) {
              this.add(user.toSummary());
            }
          }
        }.bind(this));
      }
    },
    {
      name: 'createdByAgent',
      visibility: 'HIDDEN',
      section: 'basicInfo' // Sort of a hack to avoid creating an empty section
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
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      visibility: 'RO'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.PENDING,
      writePermissionRequired: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'spid',
      value: ''
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      documentation: `When using a reference to the roleDAO, the labels associated
        to it will show a chosen property rather than the first alphabetical string
        property. In this case, we are using the name.
      `,
      code: function(x) {
        return this.name || this.id;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getName()) ? getId() : getName();
      `
    },
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
        if (this.getRuleGroup() == null ||
            this.getRuleGroup() == "") {
              throw new IllegalStateException("Rule group must be set");
        }
      `
    }
  ]
});
