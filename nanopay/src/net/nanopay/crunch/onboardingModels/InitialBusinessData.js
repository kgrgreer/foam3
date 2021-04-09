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
  name: 'InitialBusinessData',

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.model.Business'
  ],

  imports: [
    'countryDAO',
    'permittedCountryDAO',
    'user',
    'subject'
  ],

  javaImports: [
    'foam.nanos.auth.Address'
  ],

  sections: [
    {
      name: 'businessRegistration',
      title: 'Business information',
      help: `Business information`
    },
    {
      name: 'businessAddress',
      title: 'Business address',
      help: `Business address`
    }
  ],

  messages: [
    { name: 'BUSINESS_NAME_REQUIRED', message: 'Business name required' },
    { name: 'QUEBEC_NOT_SUPPORTED_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address' },
    { name: 'SAME_AS_BUSINESS_ADDRESS_LABEL', message: 'Mailing address is same as business address' },
    { name: 'INVALID_FAX_ERROR', message: 'Valid fax number required' }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Legal name of business.',
      label: 'Business name',
      section: 'businessRegistration',
      required: true,
      visibility: function() {
        if ( this.subject.user.businessName ) {
          return foam.u2.DisplayMode.RO;
        } else {
          return foam.u2.DisplayMode.RW;
        }
      },
      validationPredicates: [
        {
          args: ['businessName'],
          predicateFactory: function(e) {
            return e.GT(e.STRING_LENGTH(net.nanopay.crunch.onboardingModels.InitialBusinessData.BUSINESS_NAME), 0);
          },
          errorMessage: 'BUSINESS_NAME_REQUIRED'
        }
      ],
      factory: function() {
        return this.subject.user.businessName;
      }
    },
    {
      class: 'PhoneNumber',
      name: 'companyPhone',
      documentation: 'Phone number of the business.',
      label: 'Business phone number',
      section: 'businessRegistration',
      required: true
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: 'Company email.',
      label: 'Email',
      section: 'businessRegistration'
    },
    {
      class: 'Boolean',
      name: 'signInAsBusiness',
      value: true,
      hidden: true
    },
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      section: 'businessAddress',
      documentation: 'Business address.',
      label: '',
      factory: function() {
        return this.Address.create({structured: false});
      },
      view: function(_, X) {
        var m = foam.mlang.Expressions.create();
        var countryId = X.data ? X.data.countryId : null;
        var dao = countryId ?
          X.permittedCountryDAO.where(m.EQ(foam.nanos.auth.Country.ID, countryId)) :
          X.permittedCountryDAO;
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation: true
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['address', 'address$regionId', 'address$errors_'],
          predicateFactory: function(e) {
            return e.NEQ(e.DOT(net.nanopay.crunch.onboardingModels.InitialBusinessData.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC');
          },
          errorMessage: 'QUEBEC_NOT_SUPPORTED_ERROR'
        },
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.InitialBusinessData.ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    }),
    {
      class: 'Boolean',
      name: 'sameAsBusinessAddress',
      section: 'businessAddress',
      value: true,
      documentation: `
        Determines whether the business address and its mailing address are the same.
      `,
      label: '',
      view: function(_, X) {
        return foam.u2.CheckBox.create({ label: X.data.SAME_AS_BUSINESS_ADDRESS_LABEL });
      }
    },
    net.nanopay.model.Business.MAILING_ADDRESS.clone().copyFrom({
      documentation: 'Business mailing address.',
      label: 'Mailing address',
      section: 'businessAddress',
      // TODO: Add a JS getter.
      javaGetter: `
        return getSameAsBusinessAddress() ? getAddress() : mailingAddress_;
      `,
      visibility: function(sameAsBusinessAddress) {
        return sameAsBusinessAddress ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: X.data.countryDAO,
          showValidation: true
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['mailingAddress', 'mailingAddress$errors_', 'sameAsBusinessAddress'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.crunch.onboardingModels.InitialBusinessData.SAME_AS_BUSINESS_ADDRESS, true),
              e.EQ(foam.mlang.IsValid.create({
                  arg1: net.nanopay.crunch.onboardingModels.InitialBusinessData.MAILING_ADDRESS
                }), true)
            );
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    })
  ]
});
