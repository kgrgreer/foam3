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
  name: 'InternationalBusinessInformationData',

  implements: [
    'foam.core.Validatable'
  ],

  messages: [
    { name: 'BUSINESS_REGISTRATION_DATE_ERROR', message: 'Cannot be future dated.' },
    { name: 'COUNTRY_OF_REGISTRATION_ERROR', message: 'This application does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates.' },
    { name: 'TAX_ID_NUMBER_ERROR', message: 'Please enter valid Federal Tax ID Number (EIN).' }
  ],

  properties: [
    {
      name: 'reviewed',
      class: 'Boolean',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      section: 'businessDetailsSection',
      name: 'businessRegistrationDate',
      label: 'businessFormationDate',
      class: 'Date',
      documentation: 'Date of Business Formation or Incorporation.',
      validationPredicates: [
        {
          args: ['businessRegistrationDate', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.LTE(net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.BUSINESS_REGISTRATION_DATE, new Date()),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'BUSINESS_REGISTRATION_DATE_ERROR'
        }
      ]
    },
    {
      section: 'businessDetailsSection',
      name: 'countryOfBusinessRegistration',
      label: 'countryOfBusinessFormation',
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: 'Country or Jurisdiction of Formation or Incorporation.',
      view: function(args, X) {
        var m = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: '- Please select -',
          dao: X.countryDAO.where(m.OR(
            m.EQ(foam.nanos.auth.Country.ID, 'CA'),
            m.EQ(foam.nanos.auth.Country.ID, 'US')
          )),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        };
      },
      validationPredicates: [
        {
          args: ['countryOfBusinessRegistration', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.COUNTRY_OF_BUSINESS_REGISTRATION, 'CA'),
              e.EQ(net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.COUNTRY_OF_BUSINESS_REGISTRATION, 'US'),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'COUNTRY_OF_REGISTRATION_ERROR'
        }
      ]
    },
    {
      section: 'businessDetailsSection',
      class: 'String',
      name: 'taxIdentificationNumber',
      label: 'Federal Tax ID Number (EIN)',
      documentation: 'Federal Tax ID Number (EIN)',
      visibility: function(countryOfBusinessRegistration) {
        return countryOfBusinessRegistration === 'US' ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['reviewed', 'taxIdentificationNumber', 'countryOfBusinessRegistration'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.COUNTRY_OF_BUSINESS_REGISTRATION, 'CA'),
              e.REG_EXP(net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.TAX_IDENTIFICATION_NUMBER, /^[0-9]{9}$/),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'TAX_ID_NUMBER_ERROR'
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

        if ( ! this.getReviewed() ) {
          throw new IllegalStateException("Must confirm all data entered has been reviewed and is correct.");
        }
      `
    }
  ]
});
