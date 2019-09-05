/*
  This is a hack that's needed because the properties we pull
  in from other models don't get their sourceCls_ set properly.
  The outputter being used is what the js build tool uses and it
  outputs properties to look like they'd look if they were hand
  written.
  TODO: Make this not necessary.
*/
foam.LIB({
  name: 'net.nanopay.sme.onboarding',
  constants: {
    SpecialOutputter: foam.json.Outputter.create({
      pretty: true,
      strict: false,
      outputDefaultValues: false,
      passPropertiesByReference: false,
      propertyPredicate: function(o, p) {
        return o.hasOwnProperty(p.name) &&
          ! p.storageTransient;
      }
    }),
  }
});

foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'OwnerSection',
  extends: 'foam.layout.SectionAxiom',
  properties: [
    {
      class: 'Int',
      name: 'index'
    },
    {
      name: 'name',
      expression: function(index) {
        return `owner${index}Section`;
      }
    },
    {
      name: 'help',
      value: 'Next, I’ll need you to tell me some more details about the remaining owners who hold 25% + of the company…'
    },
    {
      name: 'title',
      expression: function(index) {
        return `Add for owner #${index}`;
      }
    },
    {
      name: 'isAvailable',
      factory: function() {
        var i = this.index;
        return function(signingOfficer, amountOfOwners) {
          return signingOfficer && amountOfOwners >= i;
        };
      },
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'OwnerProperty',
  extends: 'foam.core.FObjectProperty',
  properties: [
    ['of', 'net.nanopay.model.BeneficialOwner'],
    {
      class: 'Int',
      name: 'index'
    },
    {
      name: 'name',
      expression: function(index) {
        return `owner${index}`;
      }
    },
    {
      name: 'section',
      expression: function(index) {
        return `owner${index}Section`;
      }
    },
    {
      name: 'label',
      value: ''
    },
    {
      name: 'factory',
      value: function() {
        return net.nanopay.model.BeneficialOwner.create({
          business$: this.businessId$
        }, this);
      }
    },
    {
      name: 'view',
      value: {
        class: 'foam.u2.detail.SectionView',
        sectionName: 'requiredSection',
        showTitle: false
      },
    },
    {
      name: 'validationPredicates',
      factory: function() {
        var i = this.index;
        return [
          {
            args: ['signingOfficer', 'amountOfOwners', `owner${i}$errors_`],
            predicateFactory: function(e) {
              return e.OR(
                e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
                e.LT(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, i),
                e.EQ(foam.mlang.IsValid.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding['OWNER'+i]
                }), true)
              );
            },
            errorString: `Owner #${i} is invalid.`
          }
        ];
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboarding',

  implements: [ 'foam.core.Validatable' ],

  ids: ['userId'],

  tableColumns: [
    'userId',
    'legalName',
    'status',
    'created',
    'lastModified'
  ],

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  documentation: `Multifunctional model used for business onboarding`,

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.USBusinessOnboarding'
  ],

  imports: [
    'ctrl',
    'pushMenu',
    'appConfig',
    'identificationTypeDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'net.nanopay.sme.onboarding.OnboardingStatus'
  ],

  sections: [
    {
      name: 'gettingStartedSection',
      title: 'Before you get started',
      help: `Welcome! I’m Joanne, and I’ll help you unlock the full power of Ablii.`
    },
    {
      name: 'adminReferenceSection',
      title: 'Admin Reference Properties',
      permissionRequired: true,
    },
    {
      name: 'signingOfficerQuestionSection',
      title: 'Are you considered a signing officer at your company?',
      help: 'Alright, let’s do this! First off, I’m going to need to know if you are a signing officer at your company…'
    },
    {
      name: 'personalInformationSection',
      title: 'Enter your personal information',
      help: 'Thanks, now I’ll need a bit of personal information so I can verify your identity…'
    },
    {
      name: 'homeAddressSection',
      title: 'Enter your home address',
      help: 'Awesome! Next, I’ll need to know your current home address…',
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'signingOfficerEmailSection',
      title: 'Enter your signing officer\'s email',
      help: `For security, we require the approval of a signing officer before you can continue.
          I can email your signing officer directly for the approval.`,
      isAvailable: function (signingOfficer) { return !signingOfficer }
    },
    {
      name: 'businessAddressSection',
      title: 'Enter your business address',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'businessDetailsSection',
      title: 'Enter your business details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'transactionDetailsSection',
      title: 'Enter your transaction details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'ownershipYesOrNoSection',
      title: 'Does your company have anyone that owns 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document
          the percentage of ownership of any individual with a 25% + stake in the company.`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'ownershipAmountSection',
      title: 'How many individuals directly or indirectly own 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document
          the percentage of ownership of any individual with a 25% + stake in the company.`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'personalOwnershipSection',
      title: 'Please select your principal type and percentage of ownership',
      help: `I’ve gone ahead and filled out the owner details for you, but I’ll need you to confirm your percentage of ownership…`,
      isAvailable: function(signingOfficer, amountOfOwners, userOwnsPercent) {
        return signingOfficer && amountOfOwners > 0 && userOwnsPercent;
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 1,
      isAvailable: function(signingOfficer, userOwnsPercent, amountOfOwners) {
        return signingOfficer && amountOfOwners >= 1 && ! userOwnsPercent;
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 2,
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 3,
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 4,
    },
    {
      name: 'reviewOwnersSection',
      title: 'Review the list of owners',
      help: 'Awesome! Just confirm the details you’ve entered are correct and we can proceed!',
      isAvailable: function(signingOfficer) {
        return signingOfficer;
      }
    },
    {
      name: 'twoFactorSection',
      title: 'Protect your account against fraud with two-factor authentication',
      help: 'Alright, it looks like that is all of the information we need! Last thing I’ll ask is that you enable two factor authentication. We want to make sure your account is safe!',
      isAvailable: function(signingOfficer) {
        return signingOfficer;
      }
    }
  ],

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.sme.onboarding.OnboardingStatus',
      name: 'status',
      value: 'DRAFT',
      section: 'adminReferenceSection'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      section: 'adminReferenceSection',
      label: 'Business Name'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      section: 'adminReferenceSection',
      postSet: function(_, n) {
        this.userId$find.then((user) => {
          if ( this.userId != n ) return;
          this.firstName = user.firstName;
          this.lastName = user.lastName;
        });
      },
      tableCellFormatter: function(id, o) {
        var e = this.start('span').add(id).end();
        o.userId$find.then(function(b) {
          e.add(' - ', b.businessName || b.organization);
        });
      }
    },
    {
      documentation: 'Creation date.',
      name: 'created',
      class: 'DateTime',
      visibility: 'RO',
      section: 'adminReferenceSection',
    },
    {
      documentation: 'Last modified date.',
      name: 'lastModified',
      class: 'DateTime',
      visibility: 'RO',
      section: 'adminReferenceSection',
    },
    {
      class: 'String',
      name: 'firstName',
      flags: ['web'],
      transient: true,
      section: 'adminReferenceSection',
      minLength: 1
    },
    {
      class: 'String',
      name: 'lastName',
      flags: ['web'],
      transient: true,
      section: 'adminReferenceSection',
      minLength: 1
    },
    {
      class: 'String',
      name: 'legalName',
      flags: ['web'],
      transient: true,
      hidden: true,
      getter: function() {
        return this.userId$find.then((user) => {
          return user.lastName ? user.firstName + " " + user.lastName : user.firstName;
        });

      }
    },
    {
      class: 'String',
      name: 'remoteHost',
      section: 'adminReferenceSection'
    },
    {
      name: 'welcome',
      section: 'gettingStartedSection',
      flags: ['web'],
      transient: true,
      label: '',
      view: {
        class: 'net.nanopay.sme.onboarding.ui.IntroOnboarding'
      }
    },
    {
      class: 'Boolean',
      name: 'signingOfficer',
      section: 'signingOfficerQuestionSection',
      help: `A signing officer is a person legally authorized to act on behalf of the business (e.g CEO, COO, board director)`,
      label: '',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes, I am a signing officer'],
          [false, 'No, I am not'],
        ],
      }
    },

    foam.nanos.auth.User.JOB_TITLE.clone().copyFrom({
      section: 'personalInformationSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Chief Visionary Officer'
      },
      minLength: 1,
      maxLength: 50
    }),
    foam.nanos.auth.User.PHONE.clone().copyFrom({
      section: 'personalInformationSection',
      label: '',
      autoValidate: true
    }),
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      label: 'Date of birth',
      section: 'personalInformationSection',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              foam.mlang.predicate.OlderThan.create({
                arg1: net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY,
                timeMs: 18 * 365 * 24 * 60 * 60 * 1000
              })
            );
          },
          errorString: 'Must be at least 18 years old.'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NOT(
                foam.mlang.predicate.OlderThan.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY,
                  timeMs: 125 * 365 * 24 * 60 * 60 * 1000
                })
              )
            );
          },
          errorString: 'Must be under the age of 125 years old.'
        }
      ]
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      section: 'personalInformationSection',
      label: 'I am a politically exposed person or head of an international organization (PEP/HIO)',
      help: `
        A political exposed person (PEP) or the head of an international organization (HIO)
        is a person entrusted with a prominent position that typically comes with the opportunity
        to influence decisions and the ability to control resources
      `,
      value: false,
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
        ],
        isHorizontal: true
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      section: 'personalInformationSection',
      label: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party',
      help: `
        A third party is a person or entity who instructs another person or entity
        to conduct an activity or financial transaction on their behalf
      `,
      value: false,
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
        ],
        isHorizontal: true
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      label: '',
      section: 'homeAddressSection',
      view: function(args, X) {
        // Temporarily only allow businesses in Canada to sign up.
        var m = foam.mlang.Expressions.create();
        var dao = X.countryDAO.where(m.OR(m.EQ(foam.nanos.auth.Country.ID, 'CA'),m.EQ(foam.nanos.auth.Country.ID, 'US')))
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao
        };
      },
      validationPredicates: [
        {
          // Temporarily only allow businesses in Canada to sign up.
          args: ['signingOfficer', 'address', 'address$countryId', 'address$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'CA'),
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'US')
            );
          },
          errorString: 'Ablii does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates.'
        },
        {
          args: ['signingOfficer', 'address', 'address$regionId', 'address$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC')
            );
          },
          errorString: 'Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.'
        },
        {
          args: ['signingOfficer', 'address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS
              }), true)
            );
          },
          errorString: 'Invalid address.'
        }
      ],
      validationTextVisible: true
    }),
    {
      name: 'signingOfficerEmailInfo',
      documentation: 'More info on signing officer',
      label: '',
      section: 'signingOfficerEmailSection',
      view: function() {
        return foam.u2.Element.create()
          .start('div')
            .add('Invite a signing officer to complete the onboarding for your business.  Once the signing officer completes their onboarding, your business can start using Ablii.')
          .end();
      }
    },
    {
      class: 'String',
      name: 'signingOfficerEmail',
      label: 'Enter your signing officer\'s email',
      documentation: 'Business signing officer emails. To be sent invitations to join platform',
      section: 'signingOfficerEmailSection',
      placeholder: 'example@email.com',
      validationPredicates: [
        {
          args: ['signingOfficer', 'signingOfficerEmail'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, true),
              e.REG_EXP(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER_EMAIL, /.+@.+/)
            );
          },
          errorString: 'Please provide an email for the signing officer.'
        }
      ]
    },
    foam.nanos.auth.User.BUSINESS_ADDRESS.clone().copyFrom({
      label: '',
      section: 'businessAddressSection',
      view: function(args, X) {
        // Temporarily only allow businesses in Canada to sign up.
        var m = foam.mlang.Expressions.create();
        var dao = X.countryDAO.where(m.EQ(foam.nanos.auth.Country.ID, 'CA'))
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao
        };
      },
      validationPredicates: [
        {
          // Temporarily only allow businesses in Canada to sign up.
          args: ['signingOfficer', 'businessAddress', 'businessAddress$countryId', 'businessAddress$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'CA'),
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'US')
            );
          },
          errorString: 'Ablii does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates.'
        },
        {
          args: ['signingOfficer', 'businessAddress', 'businessAddress$regionId', 'businessAddress$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC')
            );
          },
          errorString: 'Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.'
        },
        {
          args: ['signingOfficer', 'businessAddress', 'businessAddress$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS
              }), true)
            );
          },
          errorString: 'Invalid address.'
        }
      ],
      validationTextVisible: true
    }),
    foam.nanos.auth.User.BUSINESS_TYPE_ID.clone().copyFrom({
      label: 'Type of business',
      section: 'businessDetailsSection',
      placeholder: 'Select...',
      validationPredicates: [
        {
          args: ['signingOfficer', 'businessTypeId'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID, 0)
            );
          },
          errorString: 'Please select a type of business.'
        }
      ]
    }),
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'businessSectorId',
      section: 'businessDetailsSection',
      documentation: 'Represents the specific economic grouping for the business.',
      label: 'Nature of business',
      view: { class: 'net.nanopay.business.NatureOfBusiness' },
      validationPredicates: [
        {
          args: ['signingOfficer', 'businessSectorId'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_SECTOR_ID, 0)
            );
          },
          errorString: 'Please select a nature of business.'
        }
      ]
    },
    foam.nanos.auth.User.SOURCE_OF_FUNDS.clone().copyFrom({
      section: 'businessDetailsSection',
      label: 'Primary source of funds',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        otherKey: 'Other',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Select...',
          choices: [
            'Purchase of goods produced',
            'Completion of service contracts',
            'Investment Income',
            'Brokerage Fees',
            'Consulting Fees',
            'Sale of investments',
            'Inheritance',
            'Grants, loans, and other sources of financing',
            'Other'
          ]
        }
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'sourceOfFunds'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.SOURCE_OF_FUNDS
                }), 0)
            );
          },
          errorString: 'Please provide a primary source of funds.'
        }
      ]
    }),
    {
      class: 'Boolean',
      name: 'operatingUnderDifferentName',
      label: 'Does your business operate under a different name?',
      section: 'businessDetailsSection',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No'],
        ],
        isHorizontal: true
      }
    },
    foam.nanos.auth.User.OPERATING_BUSINESS_NAME.clone().copyFrom({
      section: 'businessDetailsSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Enter your operating name'
      },
      visibilityExpression: function(operatingUnderDifferentName) {
        return operatingUnderDifferentName ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'operatingUnderDifferentName', 'operatingBusinessName'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.OPERATING_UNDER_DIFFERENT_NAME, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.OPERATING_BUSINESS_NAME
                }), 0)
            );
          },
          errorString: 'Please enter a business name.'
        }
      ]
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_REVENUE.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'annualRevenue'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_REVENUE
                }), 0)
            );
          },
          errorString: 'Please make a selection.'
        }
      ]
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_DOMESTIC_VOLUME.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'annualDomesticVolume'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_DOMESTIC_VOLUME
                }), 0)
            );
          },
          errorString: 'Please make a selection.'
        }
      ]
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_FREQUENCY.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          '1 to 99',
          '100 to 199',
          '200 to 499',
          '500 to 999',
          'Over 1000'
        ]
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'annualTransactionFrequency'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_TRANSACTION_FREQUENCY
                }), 0)
            );
          },
          errorString: 'Please make a selection.'
        }
      ]
    }),

    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetailsSection',
      documentation: 'Change to option dropdown',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        otherKey: 'Other',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Select...',
          choices: [
            'Payables for products and/or services',
            'Working capital',
            'Bill payments',
            'Intracompany bank transfers',
            'Government fee and taxes',
            'Other'
          ]
        }
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'transactionPurpose'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.TRANSACTION_PURPOSE
                }), 0)
            );
          },
          errorString: 'Please provide a transaction purpose.'
        }
      ]
    }),

    foam.nanos.auth.User.TARGET_CUSTOMERS.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.tag.TextArea',
        onKey: true,
        placeholder: 'Example: Small manufacturing businesses in North America'
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'targetCustomers'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.TARGET_CUSTOMERS
                }), 0)
            );
          },
          errorString: 'Please enter target customers.'
        }
      ]
    }),
    {
      class: 'Boolean',
      name: 'ownershipAbovePercent',
      label: '',
      section: 'ownershipYesOrNoSection',
      postSet: function(_, n) {
        if ( ! n ) this.amountOfOwners = 0;
      },
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [false, 'No (or this is a publicly traded company)'],
          [true, 'Yes, we have owners with 25% +']
        ],
      },
    },
    {
      class: 'Long',
      name: 'amountOfOwners',
      section: 'ownershipAmountSection',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [ 0, 1, 2, 3, 4 ],
        isHorizontal: true
      },
      postSet: function(_, n) {
        this.publiclyTraded = this.userOwnsPercent = false;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'amountOfOwners'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.AND(
                e.GTE(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, 0),
                e.LTE(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, 4)
              )
            );
          },
          errorString: 'Please select a number of owners.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'userOwnsPercent',
      section: 'ownershipAmountSection',
      label: '',
      label2: 'I am one of these owners',
      postSet: function(_, n) {
        if ( n ) this.clearProperty('owner1');
      },
      visibilityExpression: function(amountOfOwners) {
        return amountOfOwners > 0 ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'publiclyTraded',
      section: 'ownershipAmountSection',
      label: '',
      label2: 'This is a publicly traded company',
      postSet: function(_, n) {
        if ( n ) this.clearProperty('owner1');
      },
      visibilityExpression: function(amountOfOwners) {
        return amountOfOwners == 0 ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'twoFactorAuth',
      section: 'twoFactorSection',
      label: '',
      view: {
        class: 'net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding'
      }
    },
    {
      class: 'String',
      name: 'roJobTitle',
      label: 'Job Title',
      expression: function(jobTitle) {
        return jobTitle;
      },
      section: 'personalOwnershipSection',
      visibility: foam.u2.Visibility.RO
    },

    // FIXME: IntView not respecting the min-max range
    net.nanopay.model.BeneficialOwner.OWNERSHIP_PERCENT.clone().copyFrom({
      section: 'personalOwnershipSection',
      label: '% of ownership',
      validationPredicates: [
        {
          args: ['signingOfficer', 'userOwnsPercent', 'ownershipPercent'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.USER_OWNS_PERCENT, false),
              e.AND(
                e.LTE(net.nanopay.sme.onboarding.BusinessOnboarding.OWNERSHIP_PERCENT, 100),
                e.GTE(net.nanopay.sme.onboarding.BusinessOnboarding.OWNERSHIP_PERCENT, 25)
              )
            );
          },
          errorString: `Ownership must be between 25% and 100%.`
        }
      ]
    }),
    {
      class: 'net.nanopay.sme.onboarding.OwnerProperty',
      index: 1,
      postSet: function(_, n) {
        if ( ! this.userOwnsPercent ) return;
        this.onDetach(n.ownershipPercent$.follow(this.ownershipPercent$));
        this.onDetach(n.jobTitle$.follow(this.jobTitle$));
        this.onDetach(n.firstName$.follow(this.firstName$));
        this.onDetach(n.lastName$.follow(this.lastName$));
        this.onDetach(n.birthday$.follow(this.birthday$));
        this.onDetach(n.address$.follow(this.address$));
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerProperty',
      index: 2
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerProperty',
      index: 3
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerProperty',
      index: 4
    },
    {
      name: 'beneficialOwnersTable',
      flags: ['web'],
      label: '',
      section: 'reviewOwnersSection',
      transient: true,
      cloneProperty: function() {},
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: 'net.nanopay.model.BeneficialOwner',
          seqNo: true,
          daoType: 'MDAO'
        });
      },
      postSet: function() {
        this.updateTable();
      },
      view: {
        class: 'foam.u2.view.TableView',
        editColumnsEnabled: false,
        disableUserSelection: true,
        columns: [
          'firstName',
          'lastName',
          'jobTitle',
          'ownershipPercent'
        ]
      },
      visibilityExpression: function(amountOfOwners) {
        return amountOfOwners > 0 ? foam.u2.Visibility.RO : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'totalOwnership',
      section: 'reviewOwnersSection',
      expression: function(amountOfOwners,
                           owner1$ownershipPercent,
                           owner2$ownershipPercent,
                           owner3$ownershipPercent,
                           owner4$ownershipPercent) {
        var sum = 0;
        if ( amountOfOwners >= 1 ) sum += owner1$ownershipPercent;
        if ( amountOfOwners >= 2 ) sum += owner2$ownershipPercent;
        if ( amountOfOwners >= 3 ) sum += owner3$ownershipPercent;
        if ( amountOfOwners >= 4 ) sum += owner4$ownershipPercent;
        return sum;
      },
      javaGetter: `
        int sum = 0;
        if ( getAmountOfOwners() >= 1 ) sum += getOwner1().getOwnershipPercent();
        if ( getAmountOfOwners() >= 2 ) sum += getOwner2().getOwnershipPercent();
        if ( getAmountOfOwners() >= 3 ) sum += getOwner3().getOwnershipPercent();
        if ( getAmountOfOwners() >= 4 ) sum += getOwner4().getOwnershipPercent();
        return sum;
      `,
      visibilityExpression: function(totalOwnership) {
        return totalOwnership > 100 ? foam.u2.Visibility.RO : foam.u2.Visibility.HIDDEN;
      },
      autoValidate: true,
      max: 100
    },
    {
      class: 'Boolean',
      name: 'certifyAllInfoIsAccurate',
      section: 'reviewOwnersSection',
      label: '',
      label2: 'I certify that all beneficial owners with 25% or more ownership have been listed and the information included about them is accurate.',
      validationPredicates: [
        {
          args: ['signingOfficer', 'certifyAllInfoIsAccurate'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.CERTIFY_ALL_INFO_IS_ACCURATE, true)
            );
          },
          errorString: 'You must certify that all beneficial owners with 25% or more ownership have been listed.'
        }
      ]
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      section: 'reviewOwnersSection',
      name: 'dualPartyAgreement',
      documentation: 'Verifies if the user is accept the dual-party agreement.',
      docName: 'dualPartyAgreementCAD',
      label: '',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'dualPartyAgreement'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.DUAL_PARTY_AGREEMENT, 0)
            );
          },
          errorString: 'Must acknowledge the dual party agreement.'
        }
      ]
    }
  ].map((a) => net.nanopay.sme.onboarding.SpecialOutputter.objectify(a)),

  reactions: [
    ['', 'propertyChange.amountOfOwners', 'updateTable']
  ].concat([1, 2, 3, 4].map((i) => [
    [`owner${i}`, 'propertyChange', 'updateTable'],
    ['', `propertyChange.owner${i}`, 'updateTable']
  ]).flat()),

  listeners: [
    {
      name: 'updateTable',
      isFramed: true,
      code: function() {
        var self = this;
        self.beneficialOwnersTable.removeAll().then(function() {
          for ( var i = 0; i < self.amountOfOwners; i++ ) {
            self.beneficialOwnersTable.put(self['owner'+(i+1)].clone());
          }
        });
      }
    },
  ],

  messages: [
    {
      name: 'PROHIBITED_MESSAGE',
      message: 'You do not have permission to update a submitted onboard profile.'
    }
  ],

  methods: [
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
        AuthService auth = (AuthService) x.get("auth");
        DAO businessOnboardingDAO = (DAO) x.get("businessOnboardingDAO");

        BusinessOnboarding oldObj = (BusinessOnboarding) businessOnboardingDAO.find(this.getId());

        if ( auth.check(x, "onboarding.update.*") ) return;

        if (
          oldObj != null &&
          oldObj.getStatus() == OnboardingStatus.SUBMITTED &&
          oldObj.getSigningOfficer()
        ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "businessOnboarding.create." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "businessOnboarding.read." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "businessOnboarding.update." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "businessOnboarding.delete." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    }
  ]
});
