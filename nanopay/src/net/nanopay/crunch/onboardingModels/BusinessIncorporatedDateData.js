
foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessIncorporatedDateData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  sections: [
    {
      name: 'businessIncorporatedDateSection',
      title: 'Enter business incorporated date'
    },
  ],

  messages: [
    { name: 'BUSINESS_REGISTRATION_DATE_ERROR', message: 'Cannot be future dated.' }
  ],

  properties: [
    {
      section: 'businessIncorporatedDateSection',
      name: 'businessIncorporatedDate',
      label: 'Date of Incorporation',
      class: 'Date',
      documentation: 'Date of Business Incorporation.',
      validationPredicates: [
        {
          args: ['businessIncorporatedDate', 'countryOfBusinessRegistration'],
          predicateFactory: function(e) {
            return e.LTE(net.nanopay.crunch.onboardingModels.BusinessIncorporatedDateData.BUSINESS_INCORPORATED_DATE, new Date());
          },
          errorMessage: 'BUSINESS_REGISTRATION_DATE_ERROR'
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