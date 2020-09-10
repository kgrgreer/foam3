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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerPersonalData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  imports: [
    'subject'
  ],

  requires: [
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address',
    'net.nanopay.model.PersonalIdentification'
  ],

  sections: [
    {
      name: 'introduction',
      title: 'Signing Officer Process.'
    },
    {
      name: 'signingOfficerPersonalInformationSection',
      title: 'Enter the signing officer\'s personal information',
      help: 'will require your most convenient phone number.'
    },
    {
      name: 'signingOfficerAddressSection',
      title: 'Enter the signing officer\'s address',
      help: 'will require your personal address. Used only to confirm your identity.'
    },
    {
      name: 'signingOfficerIdentificationSection',
      title: 'Enter the signing officer\'s personal identification',
      help: 'will require some piece of personal identifiaction.',
      documentation: 'Documentation of the signing officer',
      isAvailable: function(countryId) {
        return countryId !== 'CA';
      }
    }
  ],

  messages: [
    { name: 'CANNOT_SELECT_QUEBEC_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address.' },
    { name: 'UNGER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old.' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be under the age of 125 years old.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'pleaseReadImportantInformation',
      value: `Thank you for letting us know that you are the signing officer of this company. We must collect
          your information before processing any payments or onboarding requirements for you.
          This is to ensure the protection of all members operating on the platform.
          Your business will not be able to fully unlock invoicing and payment capabilities until at least one signing officer
          completes this form and their identity is fully reviewed and passed.
      `,
      section: 'introduction',
      visibility: 'RO'
    },
    {
      name: 'countryId',
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      hidden: true,
      storageTransient: true,
      writePermissionRequired: true,
      factory: function() {
        var userCountry = this.subject.user && this.subject.user.address ? this.subject.user.address.countryId : null;
        return userCountry;
      }
    },
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'signingOfficerAddressSection',
      label: '',
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: X.countryDAO,
          showValidation: true
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['address', 'address$regionId', 'address$errors_'],
          predicateFactory: function(e) {
            return e.NEQ(e.DOT(net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC');
          },
          errorMessage: 'CANNOT_SELECT_QUEBEC_ERROR'
        },
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    }),
    {
      class: 'String',
      name: 'jobTitle',
      section: 'signingOfficerPersonalInformationSection',
      documentation: 'The job title of signing officer',
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
          args: ['jobTitle'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.JOB_TITLE
              }), 0);
          },
          errorString: 'Please select a Job Title.'
        }
      ]
    },
    foam.nanos.auth.User.PHONE.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: '',
      visibility: 'RW',
      autoValidate: true
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
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
      visibility: 'RW',
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
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
      visibility: 'RW'
    }),
    {
      name: 'businessId',
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      hidden: true
    },
    {
      section: 'signingOfficerIdentificationSection',
      name: 'signingOfficerIdentification',
      class: 'FObjectProperty',
      of: 'net.nanopay.model.PersonalIdentification',
      factory: function() {
        return this.PersonalIdentification.create({}, this);
      },
      view: {
        class: 'foam.u2.detail.SectionedDetailView',
        border: 'foam.u2.borders.NullBorder'
      },
      validationPredicates: [
        {
          args: ['signingOfficerIdentification', 'signingOfficerIdentification$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(foam.mlang.IsValid.create({
                  arg1: net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.SIGNING_OFFICER_IDENTIFICATION
                }), true),
                e.NEQ(net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.SIGNING_OFFICER_IDENTIFICATION, null)
              ),
              e.EQ(net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.COUNTRY_ID, 'CA')
            );
          },
          errorMessage: 'INVALID_ID_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
