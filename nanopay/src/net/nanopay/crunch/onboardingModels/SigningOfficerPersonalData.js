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

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'subject',
    'translationService'
  ],

  requires: [
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address',
    'net.nanopay.model.PersonalIdentification'
  ],

  sections: [
    {
      name: 'signingOfficerPersonalInformationSection',
      title: 'Signing officer\’s role information',
      help: 'Require your most convenient phone number.'
    },
    {
      name: 'signingOfficerAddressSection',
      title: 'Signing officer\’s address',
      help: 'Require your personal address. Used only to confirm your identity.'
    }
  ],

  messages: [
    { name: 'CANNOT_SELECT_QUEBEC_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address' },
    { name: 'UNGER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be less than 125 years old' },
    { name: 'SELECT_JOB_TITLE', message: 'Job title required' },
    { name: 'PLEASE_SELECT', message: 'Please select...' },
    { name: 'YES', message: 'Yes' },
    { name: 'NO', message: 'No' },
    { name: 'OTHER_KEY', message: 'Other' }
  ],

  properties: [
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
          otherKey: X.data.OTHER_KEY,
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLEASE_SELECT,
            dao: X.jobTitleDAO,
            objToChoice: function(a) {
              return [a.name, X.translationService.getTranslation(foam.locale, `${a.name}.label`, a.label)];
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
          errorMessage: 'SELECT_JOB_TITLE'
        }
      ]
    },
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'Phone number',
      visibility: 'RW',
      required: true,
      autoValidate: true,
      gridColumns: 12
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'Is the signing officer considered a politically exposed person (PEP) or head of an international organization(HIO)?',
      help: `
        A politically exposed person (PEP) or the head of an international organization (HIO)
        is a person entrusted with a prominent position that typically comes with the opportunity
        to influence decisions and the ability to control resources
      `,
      value: false,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      },
      visibility: 'RW',
      gridColumns: 12
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party',
      help: `
        A third party is a person or entity who instructs another person or entity
        to conduct an activity or financial transaction on their behalf
      `,
      value: false,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      },
      visibility: 'RW',
      gridColumns: 12
    }),
    {
      name: 'businessId',
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      hidden: true
    }
  ]
});
