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
        return `Add details for owner #${index}`;
      }
    },
    {
      name: 'isAvailable',
      factory: function() {
        var i = this.index;
        return function(amountOfOwners) {
          return amountOfOwners >= i;
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
  documentation: `Multifunctional model used for business onboarding`,

  ids: ['userId', 'businessId'],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

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
    'identificationTypeDAO',
    'theme'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'net.nanopay.sme.onboarding.OnboardingStatus'
  ],

  tableColumns: [
    'userId.firstName',
    'userId.lastName',
    'businessId.businessName',
    'status',
    'created',
    'lastModified'
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
      title: 'Are you a signing officer for your company?',
      help: 'Alright, let’s do this! First off, I’m going to need to know if you are a signing officer at the company…',
      //permissionRequired: true
    },
    {
      name: 'personalInformationSection',
      title: 'Enter your personal information',
      help: 'Thanks, now I’ll need a bit of personal information so I can verify the identity…'
    },
    {
      name: 'signingOfficerEmailSection',
      title: 'Enter a signing officer\'s information',
      help: `Before you proceed we’ll need to invite a signing officer to approve the application.
             I can email the signing officer directly for you.`,
      isAvailable: function (signingOfficer) { return !signingOfficer }
    },
    {
      name: 'homeAddressSection',
      title: 'Enter the signing officer\'s personal information',
      help: 'Awesome! Next, I’ll need to know the signing officer\'s personal information…',
    },
    {
      name: 'businessAddressSection',
      title: 'Enter the business address',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on the company…`,
    },
    {
      name: 'businessDetailsSection',
      title: 'Enter the business details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on the company…`,
    },
    {
      name: 'transactionDetailsSection',
      title: 'Enter the business transaction details',
      help: `Thanks! Now let’s get some details on the company's transactions.`,
    },
    {
      name: 'ownershipAmountSection',
      title: 'How many individuals directly or indirectly own 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document
          the percentage of ownership of any individual with a 25% + stake in the company.`,
    },
    {
      name: 'personalOwnershipSection',
      title: 'Please select the percentage of ownership',
      help: `I’ve gone ahead and filled out the owner details for you, but I’ll need you to confirm your percentage of ownership…`,
      isAvailable: function(amountOfOwners, userOwnsPercent) {
        return amountOfOwners > 0 && userOwnsPercent;
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 1,
      isAvailable: function(userOwnsPercent, amountOfOwners) {
        return amountOfOwners >= 1 && ! userOwnsPercent;
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 2,
      isAvailable: function(userOwnsPercent, amountOfOwners) {
         return amountOfOwners >= 2;
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 3,
      isAvailable: function(userOwnsPercent, amountOfOwners) {
         return amountOfOwners >= 3;
      }
    },
    {
      class: 'net.nanopay.sme.onboarding.OwnerSection',
      index: 4,
      isAvailable: function(userOwnsPercent, amountOfOwners) {
        return amountOfOwners >= 4;
      }
    },
    {
      name: 'directorsInfoSection',
      title: 'Enter the directors information',
      help: `Next, I’ll need details about the company directors, include all of the directors name here.`,
      isAvailable: function (businessTypeId) {
        return businessTypeId === 3 || businessTypeId === 5 || businessTypeId === 6;
      }
    },
    {
      name: 'reviewOwnersSection',
      title: 'Review the list of owners',
      help: 'Awesome! Just confirm the details you’ve entered are correct and we can proceed!',
      isAvailable: function(amountOfOwners, signingOfficer) {
        return amountOfOwners > 0 || (amountOfOwners == 0 && signingOfficer) ;
      }
    },
    {
      name: 'twoFactorSection',
      title: 'Protect your account against fraud with two-factor authentication',
      help: 'Alright, it looks like that is all of the information we need! Last thing I’ll ask is that you enable two factor authentication. We want to make sure your account is safe!',
      isAvailable: function (signingOfficer) { return signingOfficer }
    }
  ],

  messages: [
    { name: 'MAKE_A_SELECTION', message: 'Please make a selection.' },
    { name: 'PROVIDE_TRANSACTION_PURPOSE', message: 'Please provide transaction purpose.' }
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
      label: 'Business Name',
      tableCellFormatter: function(id, o) {
        var e = this.start('span').add(id).end();
        o.businessId$find.then((b) => {
          if ( ! b ) return;
          e.add(' - ', b.toSummary());
        });
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      section: 'adminReferenceSection',
      postSet: async function(_, n) {
        try {
          const user = await this.userId$find;
          if ( this.userId === n ) {
            this.firstName = user.firstName;
            this.lastName = user.lastName;
            this.jobTitle = user.jobTitle;
            this.phoneNumber = user.phoneNumber;
          }
        } catch (e) {
          // ignore error, this is here to catch the fact that userId/businessId is a copied property to a
          // multiPartId model but doesn't copy the postSet thus causing an error in the dao view.
        }
      },
      tableCellFormatter: function(id, o) {
        var e = this.start('span').add(id).end();
        o.userId$find.then((b) => {
          if ( ! b ) return;
          e.add(' - ', b.toSummary());
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
          if ( ! user ) return;
          return user.lastName ? user.firstName + ' ' + user.lastName : user.firstName;
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
          [true, 'Yes'],
          [false, 'No'],
        ],
      },
      postSet: async function() {
        if ( this.signingOfficer ) {
          const user = await this.userId$find;

          this.adminJobTitle = this.jobTitle;
          this.adminPhone = this.phoneNumber;
          this.signingOfficerEmail = '';
          this.OWNERSHIP_PERCENT.label = '% of ownership of ' + user.firstName;

          if ( this.userOwnsPercent && this.amountOfOwners > 0 ) {
            this.owner1.firstName = user.firstName;
            this.owner1.lastName = user.lastName;
            this.owner1.jobTitle = user.jobTitle;
          }
        } else {
          this.adminJobTitle = '';
          this.adminPhone = '';
          this.OWNERSHIP_PERCENT.label = '% of ownership of ' + this.adminFirstName;
        }
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      section: 'personalInformationSection',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            dao: X.jobTitleDAO,
            objToChoice: function(a) {
              return [a.name, a.label];
            }
          }
        };
      },
      postSet: function() {
        if ( this.userOwnsPercent && this.signingOfficer ) {
          this.owner1.jobTitle = this.jobTitle;
        }
      },
      validationPredicates: [
        {
          args: ['jobTitle'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.sme.onboarding.BusinessOnboarding.JOB_TITLE
              }), 0);
          },
          errorString: 'Please enter a Job Title.'
        }
      ]
    },
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom({
      section: 'personalInformationSection',
      label: '',
      createVisibility: 'RW',
      autoValidate: true,
      required: true
      // verified.writePermissionRequired value is set as false in the init()
    }),
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      label: 'Date of birth',
      section: 'personalInformationSection',
      visibility: function(signingOfficer) {
        return signingOfficer ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ) );
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY, null),
              e.LT(net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY, limit)
            );
          },
          errorString: 'Must be at least 18 years old.'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ) );
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY, null),
              e.GT(net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY, limit)
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
        A politically exposed person (PEP) or the head of an international organization (HIO)
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
      visibility: function(signingOfficer) {
        return signingOfficer ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
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
      visibility: function(signingOfficer) {
        return signingOfficer ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    }),
    {
      class: 'String',
      name: 'adminJobTitle',
      label: 'Job Title',
      section: 'homeAddressSection',
      width: 100,
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            dao: X.jobTitleDAO,
            objToChoice: function(a) {
              return [a.name, a.label];
            }
          }
        };
      },
      postSet: function() {
        if ( this.userOwnsPercent && ! this.signingOfficer ) {
          this.owner1.jobTitle = this.adminJobTitle;
        }
      },
      visibility: function(signingOfficer) {
        return signingOfficer ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      validationPredicates: [
        {
          args: ['adminJobTitle', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
                e.GT(
                  foam.mlang.StringLength.create({
                    arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_JOB_TITLE
                  }), 0),
                  e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
                );
            },
          errorString: 'Please select job title.'
        }
      ],
      validationTextVisible: true
    },
    {
      class: 'PhoneNumber',
      name: 'adminPhone',
      section: 'homeAddressSection',
      label: 'Phone Number',
      visibility: function(signingOfficer) {
        return signingOfficer ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      validationPredicates: [
        {
          args: ['adminPhone', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.REG_EXP(
                net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_PHONE,
                /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Invalid phone number.'
        },
      ],
      expression: function (signingOfficer, phoneNumber) {
        return signingOfficer ? phoneNumber : '';
      }
    },
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      label: '',
      section: 'homeAddressSection',
      view: function(_, X) {
        // Temporarily only allow businesses in Canada to sign up.
        var m = foam.mlang.Expressions.create();
        var dao = X.countryDAO.where(m.OR(m.EQ(foam.nanos.auth.Country.ID, 'CA'),
        m.EQ(foam.nanos.auth.Country.ID, 'US')));
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation: X.data.signingOfficer
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          // Temporarily only allow businesses in Canada to sign up.
          args: ['address', 'address$countryId', 'address$errors_', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'CA'),
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'US'),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Ablii does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates.'
        },
        {
          args: ['address', 'address$regionId', 'address$errors_', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC'),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.'
        },
        {
          args: ['address', 'address$errors_', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ADDRESS
              }), true),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Invalid address.'
        }
      ],
    }),
    {
      name: 'signingOfficerEmailInfo',
      documentation: 'More info on signing officer',
      label: '',
      section: 'signingOfficerEmailSection',
      view: function(_,X) {
        return foam.u2.Element.create()
          .start('p')
            .add(X.data.INVITE_SIGNING_OFFICER + X.theme.appName )
          .end();
      }
    },
    {
      class: 'String',
      name: 'adminFirstName',
      section: 'signingOfficerEmailSection',
      documentation: 'Signing officer \' first name',
      label: 'First Name',
      width: 100,
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['adminFirstName', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
                e.GT(
                  foam.mlang.StringLength.create({
                    arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_FIRST_NAME
                  }), 0)
              ),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, true)
            );
          },
          errorString: 'Please enter first name with least 1 character.'
        }
      ],
      postSet: function() {
        if ( this.userOwnsPercent && ! this.signingOfficer ) {
          this.owner1.firstName = this.adminFirstName;
        }
      }
    },
    {
      class: 'String',
      name: 'adminLastName',
      label: 'Last Name',
      section: 'signingOfficerEmailSection',
      documentation: 'Signing officer \' last name',
      width: 100,
      gridColumns: 6,
      postSet: function() {
        if ( this.userOwnsPercent && ! this.signingOfficer ) {
          this.owner1.lastName = this.adminLastName;
        }
      }
    },
    {
      class: 'String',
      name: 'signingOfficerEmail',
      label: 'Enter a signing officer\'s email',
      documentation: 'Business signing officer emails. To be sent invitations to join platform',
      section: 'signingOfficerEmailSection',
      placeholder: 'example@email.com',
      validationPredicates: [
        {
          args: ['signingOfficer', 'signingOfficerEmail'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, true),
              e.REG_EXP(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER_EMAIL, /^[A-Za-z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,6}$/)
            );
          },
          errorString: 'Please provide an email for the signing officer.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'sendInvitation',
      section: 'signingOfficerEmailSection',
      documentation: 'Sending an Invitation for a signing officer when Save & Exit or Finish performed.',
      label: '',
      hidden: true,
      value: false
    },
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      name: 'businessAddress',
      label: '',
      section: 'businessAddressSection',
      view: function(_, X) {
        // Temporarily only allow businesses in Canada to sign up.
        var m = foam.mlang.Expressions.create();
        var dao = X.countryDAO.where(m.EQ(foam.nanos.auth.Country.ID, 'CA'));
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation: X.data.signingOfficer
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          // Temporarily only allow businesses in Canada to sign up.
          args: ['businessAddress', 'businessAddress$countryId', 'businessAddress$errors_', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'CA'),
              e.EQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 'US'),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Ablii does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates.'
        },
        {
          args: ['businessAddress', 'businessAddress$regionId', 'businessAddress$errors_', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(e.DOT(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC'),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.'
        },
        {
          args: ['businessAddress', 'businessAddress$errors_', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS
              }), true),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Invalid address.'
        }
      ],
    }),
    net.nanopay.model.Business.BUSINESS_TYPE_ID.clone().copyFrom({
      label: 'Type of business',
      section: 'businessDetailsSection',
      view: function(args, X) {
        return {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            dao: X.businessTypeDAO,
            objToChoice: function(a) {
              return [a.id, a.name];
          }
        };
      },
      postSet: function() {
        if ( this.businessTypeId === 1 ) { // 'Sole Proprietorship'
          if ( this.signingOfficer ) {
              this.businessDirectors[0] = net.nanopay.model.BusinessDirector.create({
                firstName: this.firstName,
                lastName: this.lastName
              });
          }
          else {
            this.businessDirectors[0] = net.nanopay.model.BusinessDirector.create({
              firstName: this.adminFirstName != null ? this.adminFirstName : null,
              lastName: this.adminLastName != null ? this.adminLastName : null
            });
          }
        } else {
          this.businessDirectors = null;
        }
      },
      validationPredicates: [
        {
          args: ['businessTypeId', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID, 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Please select type of business.'
        }
      ]
    }),
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'businessSectorId',
      label: 'Business Sector',
      section: 'businessDetailsSection',
      documentation: 'Represents the specific economic grouping for the business.',
      label: 'Nature of business',
      view: { class: 'net.nanopay.business.NatureOfBusiness' },
      validationPredicates: [
        {
          args: ['businessSectorId', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_SECTOR_ID, 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorMessage: 'SELECT_BUSINESS_SECTOR'
        }
      ]
    },
    net.nanopay.model.Business.SOURCE_OF_FUNDS.clone().copyFrom({
      section: 'businessDetailsSection',
      label: 'Primary source of funds',
      view: function(args, X) {
        return {
        class: 'foam.u2.view.ChoiceWithOtherView',
        otherKey: 'Other',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLACE_HOLDER,
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
      }
      },
      validationPredicates: [
        {
          args: ['sourceOfFunds', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.SOURCE_OF_FUNDS
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Please provide primary source of funds.'
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
    net.nanopay.model.Business.OPERATING_BUSINESS_NAME.clone().copyFrom({
      section: 'businessDetailsSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Enter your operating name'
      },
      visibility: function(operatingUnderDifferentName) {
        return operatingUnderDifferentName ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['operatingUnderDifferentName', 'operatingBusinessName', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.OPERATING_UNDER_DIFFERENT_NAME, false),
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.OPERATING_BUSINESS_NAME
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Please enter business name.'
        }
      ]
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_REVENUE.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: function(args, X) {
        return {
        class: 'foam.u2.view.ChoiceView',
        placeholder: X.data.PLACE_HOLDER,
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      }
      },
      javaSetter: `
        annualRevenue_ = val;
        annualRevenueIsSet_ = true;
      `,
      javaGetter: `
        return annualRevenue_;
      `,
      validationPredicates: [
        {
          args: ['annualRevenue', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_REVENUE
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'MAKE_A_SELECTION'
        }
      ]
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_DOMESTIC_VOLUME.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: function(arg, X) {
        return {
        class: 'foam.u2.view.ChoiceView',
        placeholder: X.data.PLACE_HOLDER,
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      }
      },
      javaSetter: `
        annualDomesticVolume_ = val;
        annualDomesticVolumeIsSet_ = true;
      `,
      javaGetter: `
        return annualDomesticVolume_;
      `,
      validationPredicates: [
        {
          args: ['annualDomesticVolume', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_DOMESTIC_VOLUME
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'MAKE_A_SELECTION'
        }
      ]
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_FREQUENCY.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLACE_HOLDER,
          choices: [
            '1 to 99',
            '100 to 199',
            '200 to 499',
            '500 to 999',
            'Over 1000'
          ]
        };
      },
      javaSetter: `
        annualTransactionFrequency_ = val;
        annualTransactionFrequencyIsSet_ = true;
      `,
      javaGetter: `
        return annualTransactionFrequency_;
      `,
      validationPredicates: [
        {
          args: ['annualTransactionFrequency', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_TRANSACTION_FREQUENCY
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'MAKE_A_SELECTION'
        }
      ]
    }),

    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetailsSection',
      documentation: 'Change to option dropdown',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            choices: [
              'Payables for products and/or services',
              'Working capital',
              'Bill payments',
              'Intracompany bank transfers',
              'Government fee and taxes',
              'Other'
            ]
          }
        };
      },
      javaSetter: `
        transactionPurpose_ = val;
        transactionPurposeIsSet_ = true;
      `,
      javaGetter: `
        return transactionPurpose_;
      `,
      validationPredicates: [
        {
          args: ['transactionPurpose', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.TRANSACTION_PURPOSE
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'PROVIDE_TRANSACTION_PURPOSE'
        }
      ]
    }),

    net.nanopay.model.Business.TARGET_CUSTOMERS.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.tag.TextArea',
        onKey: true,
        placeholder: 'Example: Small manufacturing businesses in North America'
      },
      validationPredicates: [
        {
          args: ['targetCustomers', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.BusinessOnboarding.TARGET_CUSTOMERS
                }), 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Please enter target customers.'
        }
      ]
    }),
    {
      class: 'Long',
      name: 'amountOfOwners',
      label: '',
      section: 'ownershipAmountSection',
      value: -1,
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [ 0, 1, 2, 3, 4 ],
        isHorizontal: true
      },
      postSet: function(_, n) {
        if ( this.amountOfOwners > 0 ) {
          this.publiclyTraded = false;
        } else if ( this.amountOfOwners === 0 ) {
          this.userOwnsPercent = false;
        };

        if ( this.signingOfficer ) {
          this.USER_OWNS_PERCENT.label = 'I am one of the owners.';
        } else {
          this.USER_OWNS_PERCENT.label = this.adminFirstName + ' is one of the owners.';
        }
      },
      validationPredicates: [
        {
          args: ['amountOfOwners', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.GTE(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, 0),
                e.LTE(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, 4)
              ),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
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
      postSet: async function(_, newV) {
        if ( newV ) {
          if ( this.signingOfficer ) {
            const user = await this.userId$find;

            this.owner1.firstName = user.firstName;
            this.owner1.lastName = user.lastName;
            this.owner1.jobTitle = user.jobTitle;
          } else {
            this.owner1.firstName = this.adminFirstName;
            this.owner1.lastName = this.adminLastName;
            this.owner1.jobTitle = this.adminJobTitle;
          }

          this.owner1.birthday = this.birthday;
          // Need to compare before setting FObject property to prevent
          // unnecessary propagation of propertyChanged
          if ( ! foam.util.equals(this.owner1.address, this.address) ) {
            this.owner1.address = this.address;
          }
          this.owner1.ownershipPercent = this.ownershipPercent;
        } else {
          if ( this.amountOfOwners > 0 &&
            (this.owner1.firstName === this.firstName || this.owner1.firstName === this.adminFirstName) &&
            (this.owner1.lastName === this.lastName || this.owner1.lastName === this.adminLastName)
          ) {
            this.clearProperty('owner1');
          }
          this.clearProperty('ownershipPercent');
        }
      },
      visibility: function(amountOfOwners) {
        return amountOfOwners > 0 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'publiclyTraded',
      section: 'ownershipAmountSection',
      label: 'This is a publicly traded company',
      postSet: function(_, n) {
        if ( n ) this.clearProperty('owner1');
      },
      visibility: function(amountOfOwners) {
        return amountOfOwners == 0 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
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
    net.nanopay.model.BeneficialOwner.OWNERSHIP_PERCENT.clone().copyFrom({
      section: 'personalOwnershipSection',
      postSet: function(o, n) {
        this.owner1.ownershipPercent = n;
      },
      validationPredicates: [
        {
          args: ['amountOfOwners', 'ownershipPercent', 'userOwnsPercent', 'signingOfficer'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, 0),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.USER_OWNS_PERCENT, false),
              e.AND(
                e.LTE(net.nanopay.sme.onboarding.BusinessOnboarding.OWNERSHIP_PERCENT, 100),
                e.GTE(net.nanopay.sme.onboarding.BusinessOnboarding.OWNERSHIP_PERCENT, 25)
              ),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: `Ownership must be between 25% and 100%.`
        }
      ]
    }),
    // owner1..4
    {
      class: 'net.nanopay.sme.onboarding.OwnerProperty',
      index: 1,
      validationPredicates: [
      {
        args: ['signingOfficer', 'amountOfOwners', 'userOwnsPercent', 'owner1$errors_'],
        predicateFactory: function(e) {
          return e.OR(
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false),
            e.LT(net.nanopay.sme.onboarding.BusinessOnboarding.AMOUNT_OF_OWNERS, 1),
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.USER_OWNS_PERCENT, true),
            e.EQ(foam.mlang.IsValid.create({
              arg1: net.nanopay.sme.onboarding.BusinessOnboarding['OWNER1']
            }), true)
          );
        },
        errorString: 'Owner1 is invalid.'
      }
     ]
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
      class: 'FObjectArray',
      name: 'businessDirectors',
      label: '',
      of: 'net.nanopay.model.BusinessDirector',
      section: 'directorsInfoSection',
      view: {
        class: 'foam.u2.view.TitledArrayView',
        mode: 'RW',
        enableAdding: true,
        enableRemoving: true,
        defaultNewItem: '',
        title: 'Directors'
      },
      autoValidate: true,
      validationTextVisible: true,
      validateObj: function(businessDirectors) {
        if ( this.signingOfficer && (this.businessTypeId === 3 || this.businessTypeId === 5 || this.businessTypeId == 6) ) {
           if ( businessDirectors.length < 1 )
            return 'Please enter director\'s information.'
        }
      },
    },
    {
      class: 'Boolean',
      name: 'directorsListed',
      section: 'directorsInfoSection',
      label: 'I certify that all directors have been listed or that my business does not require director information.',
      validationPredicates: [
       {
         args: ['businessTypeId', 'directorsListed', 'signingOfficer'],
         predicateFactory: function(e) {
           return e.OR(
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.DIRECTORS_LISTED, true),
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID, 1),
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID, 2),
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID, 4),
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID, 7),
            e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
          );
         },
         errorString: 'You must certify that all directors have been listed.'
       }
      ]
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
      visibility: function(amountOfOwners) {
        return amountOfOwners > 0 ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Long',
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
      visibility: function(totalOwnership) {
        return Number(totalOwnership) > 100 ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      },
      autoValidate: true,
      max: 100,
      validationPredicates: [
        {
          args: ['totalOwnership'],
          predicateFactory: function(e) {
            return e.OR (
              e.LTE(net.nanopay.sme.onboarding.BusinessOnboarding.TOTAL_OWNERSHIP, 100),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'The total ownership should be less than 100%.'
        }
      ]
    },
    {
      name: 'noBeneficialOwners',
      section: 'reviewOwnersSection',
      label: 'There are no beneficial owners with 25% or more ownership listed.',
      documentation: 'If amountOfOwners property is zero, this message will be display',
      visibility: function(amountOfOwners) {
        return amountOfOwners === 0 ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      },
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'certifyAllInfoIsAccurate',
      section: 'reviewOwnersSection',
      docName: 'certifyOwnersOwnMoreThen25Percent',
      label: '',
      visibility: function(signingOfficer, amountOfOwners) {
        return signingOfficer ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'certifyAllInfoIsAccurate', 'amountOfOwners'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, true),
                e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.CERTIFY_ALL_INFO_IS_ACCURATE, 0)
              ),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
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
      visibility: function(signingOfficer) {
        return signingOfficer ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'dualPartyAgreement', 'amountOfOwners'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, true),
                e.NEQ(net.nanopay.sme.onboarding.BusinessOnboarding.DUAL_PARTY_AGREEMENT, 0)
              ),
              e.EQ(net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER, false)
            );
          },
          errorString: 'Must acknowledge the dual party agreement.'
        }
      ]
    }
  ].map((a) => net.nanopay.sme.onboarding.SpecialOutputter.objectify(a)),

  reactions: [
    ['', 'propertyChange.amountOfOwners', 'updateTable'],
    ['', 'propertyChange.amountOfOwners', 'resetCertify']
  ].concat([1, 2, 3, 4].map((i) => [
    [`owner${i}`, 'propertyChange', 'updateTable'],
    [`owner${i}`, 'propertyChange', 'resetCertify'],
    ['', `propertyChange.owner${i}`, 'updateTable'],
    ['', `propertyChange.owner${i}`, 'resetCertify']
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
    {
      name: 'resetCertify',
      isFramed: true,
      code: function() {
        this.certifyAllInfoIsAccurate = false;
      }
    }
  ],

  messages: [
    {
      name: 'PROHIBITED_MESSAGE',
      message: 'You do not have permission to update a submitted onboard profile.'
    },
    {
      name: 'PLACE_HOLDER',
      message: 'Please select...'
    },
    {
      name: 'INVITE_SIGNING_OFFICER',
      message: 'Invite a signing officer to complete the onboarding for your business.  Once the signing officer completes their onboarding, your business can start using '
    },
    {
      name: 'SELECT_BUSINESS_SECTOR',
      message: 'Please select business sector'
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
        BusinessOnboarding obj = (BusinessOnboarding) this;
        BusinessOnboarding oldObj = (BusinessOnboarding) businessOnboardingDAO.find(this.getId());
        if ( auth.check(x, "onboarding.update.*") ) return;
        if (
          oldObj != null &&
          oldObj.getStatus() == OnboardingStatus.SUBMITTED
        ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }
        if ( obj.getStatus() == OnboardingStatus.SUBMITTED ) FObject.super.validate(x);
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();
        if ( user.getId() == getUserId() ) return;
        String permission = "businessonboarding.create." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;
        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();
        if ( user.getId() == getUserId() ) return;
        String permission = "businessonboarding.read." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;
        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();
        if ( user.getId() == getUserId() ) return;
        String permission = "businessonboarding.update." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;
        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();
        if ( user.getId() == getUserId() ) return;
        String permission = "businessonboarding.remove." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;
        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'init',
      code: async function() {
        this.ADDRESS.label = '';
        this.BUSINESS_ADDRESS.label = '';

        if ( this.amountOfOwners > 0 ) {
          if ( this.signingOfficer ) {
            const user = await this.userId$find;

            this.USER_OWNS_PERCENT.label = 'I am one of the owners.';
            this.OWNERSHIP_PERCENT.label = '% of ownership of ' + user.firstName;

            if ( this.userOwnsPercent ) {
              this.owner1.firstName = user.firstName;
              this.owner1.lastName = user.lastName;
              this.owner1.jobTitle = user.jobTitle;
            }
          } else {
            this.USER_OWNS_PERCENT.label = this.adminFirstName + ' is one of the owners.';
            this.OWNERSHIP_PERCENT.label = '% of ownership of ' + this.adminFirstName;

            if ( this.userOwnsPercent ) {
              this.owner1.firstName = this.adminFirstName;
              this.owner1.lastName = this.adminLastName;
              this.owner1.jobTitle = this.adminJobTitle;
            }
          }
        }

        this.owner1.showValidation$ = this.signingOfficer$;
        this.owner2.showValidation$ = this.signingOfficer$;
        this.owner3.showValidation$ = this.signingOfficer$;
        this.owner4.showValidation$ = this.signingOfficer$;
      }
    }
  ]
});
