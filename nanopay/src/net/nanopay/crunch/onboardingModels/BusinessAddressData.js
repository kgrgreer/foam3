foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessAddressData',

  implements: [
    'foam.core.Validatable'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.model.Business'
  ],

  imports: [
    'countryDAO',
    'user'
  ],

  javaImports: [
    'foam.nanos.auth.Address'
  ],

  sections: [
    {
      name: 'businessAddressSection',
      title: 'Enter the business address',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on the company…`
    }
  ],

  messages: [
    { name: 'COUNTRY_MISMATCH_ERROR', message: 'Country of business address must match the country of business registration.' },
    { name: 'QUEBEC_NOT_SUPPORTED_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address.' }
  ],

  properties: [
    {
      name: 'countryId',
      class: 'String',
      hidden: true,
      storageTransient: true,
      factory: function() {
        return this.user && this.user.address ? this.user.address.countryId : null;
      }
    },
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      section: 'businessAddressSection',
      label: '',
      view: function(_, X) {
        var m = foam.mlang.Expressions.create();
        var countryId = X.data ? X.data.countryId : null;
        var dao = countryId ? 
          X.countryDAO.where(m.EQ(foam.nanos.auth.Country.ID, countryId)) : 
          X.countryDAO;

        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation$: X.data.slot((reviewed) => reviewed)
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['address', 'address$countryId', 'address$errors_', 'reviewed', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.NEQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_ID, null),
                e.EQ(
                  e.DOT(net.nanopay.crunch.onboardingModels.BusinessAddressData.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), 
                  net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_ID
                )
              ),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_ID, null),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.REVIEWED, false)
            );
          },
          errorMessage: 'COUNTRY_MISMATCH_ERROR'
        },
        {
          args: ['address', 'address$regionId', 'address$errors_', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(e.DOT(net.nanopay.crunch.onboardingModels.BusinessAddressData.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC'),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.REVIEWED, false)
            );
          },
          errorMessage: 'QUEBEC_NOT_SUPPORTED_ERROR'
        },
        {
          args: ['address', 'address$errors_', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessAddressData.ADDRESS
              }), true),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessAddressData.REVIEWED, false)
            );
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    }),
    {
      name: 'reviewed',
      class: 'Boolean',
      section: 'businessAddressSection',
      readPermissionRequired: true,
      writePermissionRequired: true
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
