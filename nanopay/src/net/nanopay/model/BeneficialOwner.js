foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BeneficialOwner',

  documentation: `
    A beneficial owner is a person who owns part of a business.
  `,

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.HumanNameTrait'
  ],

  requires: [
    'foam.nanos.auth.Address'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  imports: [
    'complianceHistoryDAO'
  ],

  tableColumns: [
    'id',
    'business',
    'legalName'
  ],

  sections: [
    {
      name: 'requiredSection'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'showValidation',
      value: true
    },
    {
      class: 'String',
      name: 'jobTitle',
      section: 'requiredSection',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: 'Please select...',
            dao: X.jobTitleDAO,
            objToChoice: function(a) {
              return [a.name, a.label];
            }
          }
        };
      },
      validationPredicates: [
        {
          args: ['jobTitle', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.model.BeneficialOwner.JOB_TITLE
                }), 0)
            );
          },
          errorString: 'Please select a Job Title.'
        }
      ]
    },
    {
      class: 'Int',
      name: 'ownershipPercent',
      section: 'requiredSection',
      documentation: `
        Represents the percentage of the business that the beneficial owner
        owns.
      `,
      autoValidate: true,
      validationPredicates: [
        {
          args: ['ownershipPercent', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.AND(
                e.GTE(net.nanopay.model.BeneficialOwner.OWNERSHIP_PERCENT, 25),
                e.LTE(net.nanopay.model.BeneficialOwner.OWNERSHIP_PERCENT, 100)
              )
            );
          },
          errorString: 'Must be between 25 and 100'
        }
      ]
    },
    {
      class: 'String',
      name: 'firstName',
      section: 'requiredSection',
      validationPredicates: [
        {
          args: ['firstName', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.model.BeneficialOwner.FIRST_NAME
                }), 0)
            );
          },
          errorString: 'Please enter first name'
        }
      ]
    },
    {
      class: 'String',
      name: 'lastName',
      section: 'requiredSection',
      validationPredicates: [
        {
          args: ['lastName', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.model.BeneficialOwner.LAST_NAME
                }), 0)
            );
          },
          errorString: 'Please enter last name'
        }
      ]
    },
    'middleName',
    'legalName',
    {
      class: 'Date',
      name: 'birthday',
      label: 'Date of birth',
      section: 'requiredSection',
      validationPredicates: [
        {
          args: ['birthday', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              foam.mlang.predicate.OlderThan.create({
                arg1: net.nanopay.model.BeneficialOwner.BIRTHDAY,
                timeMs: 18 * 365 * 24 * 60 * 60 * 1000
              })
            );
          },
          errorString: 'Must be at least 18 years old.'
        },
        {
          args: ['birthday', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.NOT(
                foam.mlang.predicate.OlderThan.create({
                  arg1: net.nanopay.model.BeneficialOwner.BIRTHDAY,
                  timeMs: 125 * 365 * 24 * 60 * 60 * 1000
                })
              )
            );
          },
          errorString: 'Must be under the age of 125 years old.'
        }
      ]
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      section: 'requiredSection',
      factory: function() {
        return this.Address.create();
      },
      view: function(_, X) {
        var m = foam.mlang.Expressions.create();
        var dao = X.countryDAO.where(m.OR(m.EQ(foam.nanos.auth.Country.ID, 'CA'),m.EQ(foam.nanos.auth.Country.ID, 'US')))
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation: X.data.showValidation
        };
      },
      autoValidate: true
    },
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = ((Subject) x.get("subject")).getUser();

        if ( auth.check(x, String.format("beneficialowner.create.%d", this.getId())) ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses can have beneficial owners.");
        }

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot add beneficial owners to other businesses.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = ((Subject) x.get("subject")).getUser();

        if ( auth.check(x, String.format("beneficialowner.read.%d", this.getId())) ) return;

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot see beneficial owners owned by other businesses.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( auth.check(x, String.format("beneficialowner.update.%d", this.getId())) ) return;

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot edit beneficial owners owned by other businesses.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = ((Subject) x.get("subject")).getUser();

        if ( auth.check(x, String.format("beneficialowner.delete.%d", this.getId())) ) return;

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot remove beneficial owners owned by other businesses.");
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        return this.lastName ? this.firstName + ' ' + this.lastName : this.firstName;
      },
      javaCode: `
        if ( SafetyUtil.isEmpty(getLastName()) ) return getFirstName();
        return getFirstName() + " " + getLastName();
      `
    }
  ],
  actions: [
    {
      name: 'viewComplianceHistory',
      label: 'View Compliance History',
      availablePermissions: ['service.compliancehistorydao'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.legalName}'s Compliance History`,
          data: this.complianceHistoryDAO.where(m.AND(
              m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id + ''),
              m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'beneficialOwnerDAO')
          ))
        });
      }
    }
  ]
});
