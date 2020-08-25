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
  package: 'net.nanopay.model',
  name: 'BeneficialOwner',

  documentation: `
    A beneficial owner is a person who owns part of a business.
    has 2 modes:
    1) 'percent' which assumes everything is pre-populated with user(signingOfficer) data
    2) ...anything else, which assumes nothing and entire object is visible.
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
    'business.id',
    'firstName',
    'lastName'
  ],

  sections: [
    {
      name: 'requiredSection'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'The ID of the beneficial owner'
    },
    {
      class: 'String',
      name: 'mode',
      documentation: 'Used to change visibility. ex) "percent" suggests all hidden but this.ownershipPercent.',
      hidden: true,
      flags: ['js']
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'Used to change visibility of various country specific properties.',
      hidden: true,
      flags: ['js']
    },
    {
      class: 'Boolean',
      name: 'showValidation',
      value: true
    },
    {
      class: 'String',
      name: 'firstName',
      section: 'requiredSection',
      visibility: function(mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
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
      visibility: function(mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
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
      documentation: 'The birthday of the beneficial owner',
      visibility: function(mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      validationPredicates: [
        {
          args: ['birthday', 'showValidation'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.AND(
                e.NEQ(net.nanopay.model.BeneficialOwner.BIRTHDAY, null),
                e.LT(net.nanopay.model.BeneficialOwner.BIRTHDAY, limit)
              )
            );
          },
          errorString: 'Must be at least 18 years old.'
        },
        {
          args: ['birthday', 'showValidation'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.AND(
                e.NEQ(net.nanopay.model.BeneficialOwner.BIRTHDAY, null),
                e.GT(net.nanopay.model.BeneficialOwner.BIRTHDAY, limit)
              )
            );
          },
          errorString: 'Must be under the age of 125 years old.'
        }
      ]
    },
    {
      class: 'String',
      name: 'jobTitle',
      section: 'requiredSection',
      documentation: 'The job title of the beneficial owner',
      visibility: function(mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
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
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      section: 'requiredSection',
      documentation: 'The address of the beneficial owner',
      visibility: function(mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      factory: function() {
        return this.Address.create();
      },
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: X.countryDAO,
          showValidation: X.data.showValidation
        };
      },
      autoValidate: true
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'nationality',
      of: 'foam.nanos.auth.Country',
      section: 'requiredSection',
      documentation: `Defined nationality of beneficial owner.`,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Countries',
              dao: X.countryDAO
            }
          ]
        };
      }
    },
    {
      class: 'String',
      name: 'cpf',
      label: 'CPF',
      section: 'requiredSection',
      required: true,
      documentation: `CPF number of beneficial owner.`,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'cpnj',
      label: 'CPNJ',
      section: 'requiredSection',
      documentation: `CPNJ number of beneficial owner business if part of another business.`,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `Determines whether the user is a domestic or foreign _Politically
        Exposed Person (PEP), Head of an International Organization (HIO)_, or
        related to any such person.
      `,
      section: 'requiredSection',
      label: 'This owner is a politically exposed person or head of an international organization (PEP/HIO)',
      help: `
        A political exposed person (PEP) or the head of an international organization (HIO)
        is a person entrusted with a prominent position that typically comes with the opportunity
        to influence decisions and the ability to control resources
      `,
      value: false,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
        ],
        isHorizontal: true
      }
    }
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
