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

  implements: [
    'foam.core.Validatable'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.model.Business'
  ],

  imports: [
    'countryDAO',
    'permittedCountryDAO',
    'user'
  ],

  javaImports: [
    'foam.nanos.auth.Address'
  ],

  sections: [
    {
      name: 'businessRegistration',
      title: 'Business Details',
      help: `Please enter business details.`
    },
    {
      name: 'businessAddress',
      title: 'Business Address',
      help: `Please enter your business' address.`
    }
  ],

  messages: [
    { name: 'QUEBEC_NOT_SUPPORTED_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address.' }
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
      section: 'businessRegistration',
      required: true
    },
    {
      class: 'PhoneNumber',
      name: 'companyPhone',
      documentation: 'Phone number of the business.',
      label: 'Company Phone #',
      section: 'businessRegistration',
      required: true
    },
    {
      class: 'PhoneNumber',
      name: 'fax',
      documentation: 'Fax number of the business.',
      label: 'Fax #',
      section: 'businessRegistration'
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: 'Company email.',
      label: 'Email Address',
      section: 'businessRegistration'
    },
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      section: 'businessAddress',
      documentation: 'Business address.',
      label: '',
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
    net.nanopay.model.Business.MAILING_ADDRESS.clone().copyFrom({
      documentation: 'Business mailing address.',
      section: 'businessAddress',
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
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessAddressData.MAILING_ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    })
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
