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
    'foam.nanos.auth.HumanNameTrait',
    'foam.mlang.Expressions',
    'foam.core.Validatable'
  ],

  requires: [
    'foam.nanos.auth.Address'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.country.br.BrazilVerificationService',
  ],

  imports: [
    'brazilVerificationService',
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

  messages: [
    { name: 'INVALID_CPF', message: 'Valid CPF number required' },
    { name: 'INVALID_OWNER_NAME', message: 'Click to verify owner name' },
    { name: 'INVALID_NATIONALITY', message: 'Nationality required' },
    { name: 'INVALID_FIRST_NAME', message: 'First name required' },
    { name: 'INVALID_LAST_NAME', message: 'Last name required' },
    { name: 'INVALID_JOB_TITLE', message: 'Job title required' },
    { name: 'INVALID_OWNER_PERCENT', message: 'Percentage must be a value between 25 and 100' },
    { name: 'INVALID_DATE_ERROR', message: 'Valid date of birth required' },
    { name: 'UNGER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be less than 125 years old' },
    { name: 'STREET_NUMBER_LABEL', message: 'Street number' },
    { name: 'STREET_NAME_LABEL', message: 'Street name' },
    { name: 'PLACEHOLDER', message: 'Select a country' },
    { name: 'COMPLIANCE_HISTORY_MSG', message: 'Compliance History for' }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'The ID of the beneficial owner',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'mode',
      documentation: 'Used to change visibility. ex) "percent" suggests all hidden but this.ownershipPercent.',
      hidden: true,
      externalTransient: true
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'Used to change visibility of various country specific properties.',
      hidden: true,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'showValidation',
      value: true,
      externalTransient: true
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
          errorMessage: 'INVALID_FIRST_NAME'
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
          errorMessage: 'INVALID_LAST_NAME'
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
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.NEQ(net.nanopay.model.BeneficialOwner.BIRTHDAY, null)
            );
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['birthday', 'showValidation'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.LT(net.nanopay.model.BeneficialOwner.BIRTHDAY, limit)
            );
          },
          errorMessage: 'UNGER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday', 'showValidation'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.GT(net.nanopay.model.BeneficialOwner.BIRTHDAY, limit)
            );
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        },
      ],
      postSet: function(_,n) {
        this.cpfName = "";
        if ( this.cpf.length == 11 ) {
          this.getCpfName(this.cpf).then((v) => {
            this.cpfName = v;
          });
        }
      }
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
          errorMessage: 'INVALID_JOB_TITLE'
        }
      ]
    },
    {
      class: 'Int',
      name: 'ownershipPercent',
      label: 'Percentage of ownership',
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
          errorMessage: 'INVALID_OWNER_PERCENT'
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
        let address = this.Address.create();
        address.streetName$.prop.label = this.STREET_NAME_LABEL;
        address.streetNumber$.prop.label = this.STREET_NUMBER_LABEL;
        return address
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
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          placeholder: X.data.PLACEHOLDER,
          sections: [
            {
              heading: 'Countries',
              dao: X.countryDAO
            }
          ]
        };
      },
      validationPredicates: [
        {
          args: ['nationality', 'showValidation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.model.BeneficialOwner.SHOW_VALIDATION, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.model.BeneficialOwner.NATIONALITY
                }), 0)
            );
          },
          errorMessage: 'INVALID_NATIONALITY'
        }
      ]
    },
    {
      class: 'String',
      name: 'cpf',
      label: 'Cadastro de Pessoas Físicas (CPF)',
      section: 'requiredSection',
      documentation: `CPF number of beneficial owner.`,
      visibility: function(type, mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : type == 'BR' ?
        foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['type', 'cpfName'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.model.BeneficialOwner.TYPE, 'BR'),
              e.AND(
                e.EQ(net.nanopay.model.BeneficialOwner.TYPE, 'BR'),
                e.GT(net.nanopay.model.BeneficialOwner.CPF_NAME, 0)
              )
            );
          },
          errorMessage: 'INVALID_CPF'
        }
      ],
      externalTransient: true,
      tableCellFormatter: function(val) {
        return foam.String.applyFormat(val, 'xxx.xxx.xxx-xx');
      },
      postSet: function(_,n) {
        this.cpfName = "";
        if ( n.length == 11 ) {
          this.getCpfName(n).then((v) => {
            this.cpfName = v;
          });
        }
      },
      view: function(_, X) {
        return foam.u2.FragmentedTextField.create({
          delegates: [
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              onKey: true,
              data: X.data.cpf.slice(0,3)
            },
            '.',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              onKey: true,
              data: X.data.cpf.slice(3,6)
            },
            '.',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              onKey: true,
              data: X.data.cpf.slice(6,9)
            },
            '-',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 2 } ],
              onKey: true,
              data: X.data.cpf.slice(9,11)
            }
          ]
        })
      }
    },
    {
      class: 'String',
      name: 'cpfName',
      label: '',
      section: 'requiredSection',
      hidden: true,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Please verify that name displayed below matches owner name.',
      section: 'requiredSection',
      visibility: function (type, cpfName, mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN :
          type == 'BR' && cpfName.length > 0 ?
            foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      view: function(n, X) {
        var self = X.data$;
        return foam.u2.CheckBox.create({
          labelFormatter: function() {
            this.start('span')
              .add(self.dot('cpfName'))
            .end();
          }
        });
      },
      validationPredicates: [
        {
          args: ['verifyName'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(net.nanopay.model.BeneficialOwner.VERIFY_NAME, true),
                e.EQ(net.nanopay.model.BeneficialOwner.TYPE, 'BR')
              ),
              e.NEQ(net.nanopay.model.BeneficialOwner.TYPE, 'BR')
            );
          },
          errorMessage: 'INVALID_OWNER_NAME'
        }
      ],
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `Determines whether the user is a domestic or foreign _Politically
        Exposed Person (PEP), Head of an International Organization (HIO)_, or
        related to any such person.
      `,
      section: 'requiredSection',
      label: 'The owner is a politically exposed person (PEP) or head of an international organization (HIO)',
      help: `
        A political exposed person (PEP) or the head of an international organization (HIO)
        is a person entrusted with a prominent position that typically comes with the opportunity
        to influence decisions and the ability to control resources
      `,
      value: false,
      visibility: function (type, mode) {
        return mode === 'percent' ? foam.u2.DisplayMode.HIDDEN : type == 'BR' ?
          foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
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
      name: 'getCpfName',
      code: async function(cpf,) {
        return await this.brazilVerificationService.getCPFNameWithBirthDate(this.__subContext__, cpf, this.birthday);
      }
    },
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

        if ( auth.check(x, String.format("beneficialowner.remove.%d", this.getId())) ) return;

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
    },
    {
      name: 'validate',
      javaCode: `
        if ( "BR".equals(getType()) ) {

        if ( ! getVerifyName() )
          throw new IllegalStateException("Must verify name attached to CPF is valid.");

          try {
            if ( ! ((BrazilVerificationService) x.get("brazilVerificationService")).validateCpf(x, getCpf(), getBirthday()) )
              throw new RuntimeException(INVALID_CPF);
          } catch(Throwable t) {
            throw t;
          }
        }
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
        var dao = this.complianceHistoryDAO.where(m.AND(
          m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id + ''),
          m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'beneficialOwnerDAO')
        ));
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle:`${this.COMPLIANCE_HISTORY_MSG} ${this.legalName}`
          }
        });
      }
    }
  ]
});
