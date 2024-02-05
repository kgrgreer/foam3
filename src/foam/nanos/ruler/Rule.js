/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'Rule',
  extends: 'foam.nanos.ruler.Ruled',

  documentation: 'Rule model represents rules(actions) that need to be applied in case passed object satisfies provided predicate.',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  imports: [
    'userDAO?'
  ],

  requires: [
    'foam.mlang.predicate.True'
  ],

  javaImports: [
    'foam.core.DirectAgency',
    'foam.dao.DAO',
    'foam.mlang.predicate.FScriptPredicate',
    'foam.mlang.predicate.MQLExpr',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.dao.Operation',
    'foam.nanos.logger.Logger',
    'foam.nanos.om.OMLogger',
    'foam.nanos.pm.PM',
    'java.util.Collection',
    'java.util.Date',
    'foam.util.retry.RetryStrategy',
    'foam.util.retry.SimpleRetryStrategy',
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'id',
    'name',
    'ruleGroup.id',
    'enabled',
    'priority',
    'daoKey',
    'createdBy.legalName',
    'lastModifiedBy.legalName'
  ],

  searchColumns: [
    'id',
    'name',
    'ruleGroup',
    'enabled',
    'priority',
    'daoKey',
    'operation',
    'after',
    'validity'
  ],

  sections: [
    {
      name: 'basicInfo',
      order: 100
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
      // will display in '_defaultSection'
    },
    {
      class: 'String',
      name: 'name',
      tableWidth: 300,
      section: 'basicInfo'
    },
    {
      name: 'priority',
      tableWidth: 66,
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'documentation',
      readPermissionRequired: true,
      writePermissionRequired: true,
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12, cols: 80
      },
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      name: 'daoKey',
      of: 'foam.nanos.boot.NSpec',
      targetDAOKey: 'nSpecDAO',
      label: 'DAO',
      documentation: 'dao name that the rule is applied on.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Services',
              dao: X.nSpecDAO.where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'))
            }
          ]
        };
      },
      tableWidth: 125
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Defines when the rules is to be applied: put/removed'
    },
    {
      class: 'Boolean',
      name: 'after',
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: `Defines if the rule needs to be applied before or after operation is completed
      E.g. on dao.put: before object was stored in a dao or after.`
    },
    {
      class: 'Boolean',
      name: 'async',
      value: false,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Defines if the rule is async. Async rule always runs after DAO put/remove, the after flag on the rule will be ignored.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'action',
      documentation: 'The action to be executed if predicates returns true for passed object.',
      javaCloneProperty: 'set(dest, get(source));' // NOTE: without this, many test cases fail with permission issues.
    },
    {
      name: 'enabled',
      tableWidth: 70,
      section: 'basicInfo'
    },
    {
      class: 'Boolean',
      name: 'saveHistory',
      value: false,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Determines if history of rule execution should be saved.',
      help: 'Automatically sets to true when validity is greater than zero.',
      adapt: function(_, nu) {
        return nu || this.validity > 0;
      }
    },
    {
      class: 'Boolean',
      name: 'debug',
      documentation: 'Test this boolean before generating expensive logger.debug calls, to speed rule execution.'
    },
    {
      class: 'Int',
      name: 'validity',
      documentation: 'Validity of the rule (in days) for automatic rescheduling.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      postSet: function(_, nu) {
        if ( nu > 0
          && ! this.saveHistory
        ) {
          this.saveHistory = true;
        }
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      section: 'basicInfo',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'basicInfo',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'basicInfo',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      section: 'basicInfo',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      section: 'basicInfo',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      section: 'basicInfo',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      section: 'basicInfo',
      value: foam.nanos.auth.LifecycleState.PENDING,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      writePermissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      section: 'basicInfo',
      value: foam.nanos.auth.ServiceProviderAware.GLOBAL_SPID,
      documentation: 'Service Provider Id of the rule. Default to ServiceProviderAware.GLOBAL_SPID for rule applicable to all service providers.'
    },
    {
      class: 'Int',
      name: 'maxRetry',
      documentation: 'The number of max retry when failed to execute the action. Only applicable to async rule.',
      visibility: function(async) {
        return async ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'retryDelay',
      unit: 'ms',
      documentation: 'The delay time in millisecond to retry executing the action after failure. Only applicable to async rule.',
      visibility: function(async) {
        return async ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        }
      ],
      javaCode: `
        ((OMLogger) x.get("OMLogger")).log("Rule", (SafetyUtil.isEmpty(getName()) ? getId() : getName()));
        try {
          if ( getPredicate() instanceof MQLExpr || getPredicate() instanceof FScriptPredicate ) {
            RulerData data = new RulerData();
            Subject subject = (Subject) x.get("subject");
            data.setN(obj);
            data.setO(oldObj);
            data.setUser(subject.getUser());
            data.setRealUser(subject.getRealUser());
            data.setSpid(subject.getUser().getSpid());
            data.setDateTime(new Date());
            return getPredicate().f(data);
          } else {
            return getPredicate().f(x.put("NEW", obj).put("OLD", oldObj));
          }
        } catch ( Throwable t ) {
          try {
            return getPredicate().f(obj);
          } catch ( Throwable th ) { }
          // ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "id", getId(), "\\nrule", this, "\\nobj", obj, "\\nold", oldObj, "\\n", t);
          ((Logger) x.get("logger")).error("Failed to evaluate predicate of rule: " + getId(), t);
          return false;
        }
      `
    },
    {
      name: 'apply',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        },
        {
          name: 'ruler',
          type: 'foam.nanos.ruler.RuleEngine'
        },
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        },
        {
          name: 'agency',
          type: 'foam.core.Agency'
        }
      ],
      javaCode: `
        PM pm = PM.create(x, this.getClass(), getDaoKey(), getId());
        try {
          ((OMLogger) x.get("OMLogger")).log("Rule", (SafetyUtil.isEmpty(getName()) ? getId() : getName()), "Action");
          getAction().applyAction(x, obj, oldObj, ruler, rule, agency);
        } finally {
          pm.log(x);
        }
        try {
          ruler.saveHistory(this, obj);
        } catch ( Exception e ) { /* Ignored */ }
      `
    },
    {
      name: 'asyncApply',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        },
        {
          name: 'ruler',
          type: 'foam.nanos.ruler.RuleEngine'
        },
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        },
      ],
      javaCode: `
        try {
          ((OMLogger) x.get("OMLogger")).log("Rule", (SafetyUtil.isEmpty(getName()) ? getId() : getName()), "AsyncAction");
          apply(x, obj, oldObj, ruler, rule, new DirectAgency());
        } catch ( Exception e ) {
          var strategy = getMaxRetry() > 0 ?
            new SimpleRetryStrategy(getMaxRetry(), getRetryDelay()) :
            (RetryStrategy) x.get("ruleRetryStrategy");

          new RetryManager(strategy, rule.getName()).submit(x, userX -> {
            ((OMLogger) x.get("OMLogger")).log("Rule", (SafetyUtil.isEmpty(getName()) ? getId() : getName()), "AsyncActionRetry");
            apply(x, obj, oldObj, ruler, rule, new DirectAgency());
          });
        }
      `
    },
    {
      name: 'updateRule',
      type: 'foam.nanos.ruler.Rule',
      documentation: `since rules are stored as lists in the RulerDAO we use listeners to update them whenever ruleDAO is updated.
      the method provides logic for modifying already stored rule. If not overridden, the incoming rule will be stored in the list as it is.`,
      args: [
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        }
      ],
      javaCode: `
      return rule;`
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.name || this.id;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getName()) ? getName() : getId();
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.create") ) {
          throw new AuthorizationException("You do not have permission to create the rule.");
        }

        final var nspecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
        if ( nspecDAO == null || nspecDAO.find(getDaoKey()) == null ) {
          throw new AuthorizationException("You do not have permission to create a rule on the specified dao.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.read." + getId()) ) {
          throw new AuthorizationException("You do not have permission to read the rule.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.update." + getId()) ) {
          throw new AuthorizationException("You do not have permission to update the rule.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.remove." + getId()) ) {
          throw new AuthorizationException("You do not have permission to delete the rule.");
        }
      `
    },
    {
      name: 'getUser',
      type: 'foam.nanos.auth.User',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' }
      ],
      documentation: `Return user extracted from obj to be used for checking the
        user permission to access (i.e. execute) the rule.

        Return null (default) to skip access permission check on the rule.

        Subclasses of Rule should override "getUser" method to return the
        appropriate user for which the permission is checked.
      `,
      javaCode: 'return null;'
    }
  ],

  javaCode: `
    public static Rule findById(Collection<Rule> listRule, String passedId) {
      return listRule.stream().filter(rule -> passedId.equals(rule.getId())).findFirst().orElse(null);
    }
  `
});
