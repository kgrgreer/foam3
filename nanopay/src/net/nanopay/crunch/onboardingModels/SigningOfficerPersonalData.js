foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerPersonalData',

  implements: [ 
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address',
    'net.nanopay.model.PersonalIdentification'
  ],

  sections: [
    {
      name: 'signingOfficerPersonalInformationSection',
      title: 'Enter the signing officer\'s personal information'
    },
    {
      name: 'signingOfficerAddressSection',
      title: 'Enter the signing officer\'s address'
    },
    {
      name: 'signingOfficerIdentificationSection',
      title: 'Enter the signing officer\'s personal identification',
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
      name: 'countryId',
      class: 'String',
      hidden: true,
      storageTransient: true,
      writePermissionRequired: true
    },
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'signingOfficerAddressSection',
      label: '',
      view: function(_, X) {
        var m = foam.mlang.Expressions.create();
        var countryId = X.user && X.user.address ? X.user.address.countryId : null;
        var dao = countryId ? 
          X.countryDAO.where(m.EQ(foam.nanos.auth.Country.ID, countryId)) : 
          X.countryDAO;

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
    foam.nanos.auth.User.PHONE.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: '',
      createVisibility: 'RW',
      autoValidate: true
    }),
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'Date of birth',
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return foam.mlang.predicate.OlderThan.create({
              arg1: net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.BIRTHDAY,
              timeMs: 18 * 365 * 24 * 60 * 60 * 1000
            });
          },
          errorMessage: 'UNGER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return e.NOT(
              foam.mlang.predicate.OlderThan.create({
                arg1: net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.BIRTHDAY,
                timeMs: 125 * 365 * 24 * 60 * 60 * 1000
              })
            );
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        }
      ]
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