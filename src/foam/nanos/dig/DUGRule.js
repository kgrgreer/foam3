/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGRule',
  extends: 'foam.nanos.ruler.Rule',

  requires: [
    'foam.nanos.http.Format'
  ],

  tableColumns: [
    'name',
    'url',
    'daoKey',
    'format'
  ],

  searchColumns: [
    'name',
    'url',
    'enabled',
    'daoKey',
    'operation'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.util.SafetyUtil'
  ],

  sections: [
    {
      name: 'basicInfo',
      permissionRequired: true
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    },
    {
      name: 'dugInfo',
      order: 10
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.create") && ! auth.check(x, "dugrule.create") ) {
          throw new AuthorizationException("You do not have permission to create the rule.");
        }

        final var nspecDAO = ((DAO) x.get("AuthenticatedNSpecDAO")).inX(x);
        if ( nspecDAO == null || nspecDAO.find(getDaoKey()) == null || ( !SafetyUtil.isEmpty(getSecureDaoKey()) && nspecDAO.find(getSecureDaoKey()) == null) ) {
          throw new AuthorizationException("You do not have permission to create a rule on the specified dao.");
        }
      `
    },
    {
        name: 'evaluateBearerToken',
        type: 'String',
        javaCode: `
        return getBearerToken();
        `
    }
  ],

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'documentation',
      hidden: true
    },
    {
      class: 'String',
      name: 'name',
      section: 'dugInfo',
      tableWidth: 250
    },
    {
      name: 'daoKey',
      label: 'DAO',
      section: 'dugInfo',
      targetDAOKey: 'AuthenticatedNSpecDAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO')
                ))
                .orderBy(foam.nanos.boot.NSpec.ID)
            }
          ]
        };
      },
      tableWidth: 150
    },
    {
      class: 'String',
      name: 'secureDaoKey',
      documentation: `
        The permissioned DAO the refind will happen on if the acting user is specified
        ie. If the DAOKey was 'localUserDAO' then the SecureDAOKey could be 'userDAO'
        DUGRule action will use daoKey if this property is not set
      `,
      label: 'Secure DAO',
      section: 'dugInfo',
      tableWidth: 150,
      targetDAOKey: 'AuthenticatedNSpecDAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO')
                ))
                .orderBy(foam.nanos.boot.NSpec.ID)
            }
          ]
        };
      }
    },
    {
      name: 'ruleGroup',
      value: 'DUG',
      hidden: true
    },
    {
      name: 'priority',
      hidden: true
    },
    {
      class: 'URL',
      name: 'url',
      label: 'URL',
      section: 'dugInfo'
    },
    {
      class: 'String',
      name: 'bearerToken',
      section: 'dugInfo'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format',
      value: foam.nanos.http.Format.JSON,
      tableWidth: 100,
      section: 'dugInfo',
      readVisibility: 'HIDDEN',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['JSON', 'JSON'],
          ['XML',  'XML']
        ],
        placeholder: '--'
      },
    },
    {
      name: 'enabled',
      value: true,
      section: 'basicInfo'
    },
    {
      name: 'async',
      value: true,
    },
    {
      name: 'action',
      documentation: `All DUGRules use the same rule action, so a default one is created on demand instead of being configured`,
      section: 'dugInfo',
      view: { class: 'foam.u2.tag.TextArea' },
      javaGetter: `
        DUGRuleAction action = new DUGRuleAction();
        action.setUrl(getUrl());
        action.setBearerToken(getBearerToken());
        action.setFormat(getFormat());
        return action;
      `
    },
    {
      name: 'after',
      value: true,
      section: 'basicInfo',
      hidden: true
    },
    {
      name: 'predicate',
      hidden: true,
      section: 'basicInfo',
      // FIX ME: Currently the front end does not load this correctly, causing incorrect values to be saved with each update.
      networkTransient: true
    },
    {
      name: 'validity',
      hidden: true
    },
    {
      name: 'saveHistory',
      hidden: true
    },
    {
      name: 'operation',
      hidden: true,
      value: 'CREATE_OR_UPDATE'
    },
    {
      name: 'debug',
      hidden: true
    },
    {
      name: 'lifecycleState',
      hidden: true
    },
    {
      name: 'createdByAgent',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'actingUser',
      writepermissionrequired: true,
      readpermissionrequired: true,
      section: 'dugInfo'
    },
    {
      class: 'Boolean',
      name: 'actAsUser',
      section: 'dugInfo',
      writepermissionrequired: true,
      readpermissionrequired: true,
      value: true
    },
    {
      name: 'createdBy',
      section: 'basicInfo'
    },
    {
      name: 'spid',
      value: ""
    }
  ]
});
