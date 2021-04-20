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
  package: 'net.nanopay.partner.treviso',
  name: 'SigningOfficerPersonalDataTreviso',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'subject',
    'translationService'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address',
    'net.nanopay.model.PersonalIdentification'
  ],

  sections: [
    {
      name: 'signingOfficerPersonalInformationSection',
      title: 'Additional Operator Information',
      help: 'Require your most convenient phone number.'
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
    { name: 'SELECT_HAVE_SIGNED_CONTRACT', message: 'As the signing officer of this business, you are required to have signed this contract.' },
    { name: 'OTHER_KEY', message: 'Other' }
  ],

  properties: [
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: '',
      factory: function() {
        return this.Address.create({structured: false});
      },
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
            return e.NEQ(e.DOT(net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC');
          },
          errorMessage: 'CANNOT_SELECT_QUEBEC_ERROR'
        },
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso.ADDRESS
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
                arg1: net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso.JOB_TITLE
              }), 0);
          },
          errorMessage: 'SELECT_JOB_TITLE'
        }
      ]
    },
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'Phone number',
      required: true,
      autoValidate: true,
      gridColumns: 12
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'Is the signing officer considered a politically exposed person (PEP)?',
      help: `
      As defined in item 7 of Bacen Circular Letter 3430/2010 -
      “For the purposes of the provisions of § 1 of art. 4 of Circular No. 3,461, of 2009,
      are clients examples of situations that characterize close relationships and lead to
      the classification of permanentas politically exposed persons:
      I – constitution of politically exposed persons as attorneys or representatives;
      II - control, direct or indirect, by a politically exposed person, in the case of a corporate client;
      and III – habitual movement of financial resources from or to a politically exposed person Client of the institution,
                not justified by economic events, such as the acquisition of goods or provision of services;".

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
      createVisibility: 'RW',
      gridColumns: 12
    }),
    {
      name: 'fatca',
      class: 'Boolean',
      documentation: `todo save this property somewhere`,
      section: 'signingOfficerPersonalInformationSection',
      label: 'Are assets reported under the Foreign Account Tax Compliance Act (FATCA)?',
      help: `
      The FATCA - Foreign Account Tax Compliance Act is an American federal law,
      which aims to prevent tax evasion by individuals and legal entities that have a tax
      obligation in the United States of America (“USA”), including those that have accounts
      and investments abroad.
      The FATCA aims to identify such persons, establish the reporting of accounts and
      investments outside the USA for the purpose of taxing the income obtained by them,
      through information provided by the financial institutions that hold the account and / or
      taxable investment.
      It is considered as “US Person” (American Citizen) by the FATCA, subject to reporting to
      the American tax authorities, those indicated in the FATCA, including:
      (a) American citizen, that is, born in the United States, its territories, American Samoa or in Swain Islands;
      (b) a US citizen, national or natural person;
      (c) has a residence and / or address and / or telephone number in the United States;
      (d) has American citizenship derived from parents;
      (e) a legal entity with substantial controllers or owners who are an individual resident
          for tax purposes in the United States, citizen or national of the United States.
      In the context of CRS, your financial information may be provided to governments that report
      that, in due course, they have exchanged information with authorities in the participating
      country or countries in which you are a tax resident, disclosing the information exclusively
      to the competent authorities, in accordance with applicable laws. jurisdiction.
      For more information visit:
      FATCA - USA US Internal Revenue Service (www.irs.gov/fatca)
      `,
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
      gridColumns: 12
    },
    {
      class: 'Boolean',
      name: 'hasSignedContratosDeCambio',
      label: 'Has the foreign exchange contract been signed?',
      section: 'signingOfficerPersonalInformationSection',
      help: `
        Foreign exchange contract (Contratos de câmbio) is a legal arrangement in which the
        parties agree to transfer between them a certain amount of foreign exchange at a
        predetermined rate of exchange, and as of a predetermined date.
      `,
      value: true,
      visibility: 'HIDDEN',
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
      gridColumns: 12,
      validationPredicates: [
        {
          args: ['hasSignedContratosDeCambio'],
          predicateFactory: function(e) {
            return e.EQ(
              net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso.HAS_SIGNED_CONTRATOS_DE_CAMBIO,
              true
            );
          },
          errorMessage: 'SELECT_HAVE_SIGNED_CONTRACT'
        }
      ]
    },
    {
      name: 'businessId',
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      hidden: true
    }
  ]
});
