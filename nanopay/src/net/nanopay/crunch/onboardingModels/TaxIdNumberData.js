
foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'TaxIdNumberData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  sections: [
    {
      name: 'taxIdNumberSection',
      title: 'Enter tax number'
    },
  ],

  messages: [
    { name: 'TAX_ID_NUMBER_ERROR', message: 'Please enter valid Federal Tax ID Number (EIN).' }
  ],

  properties: [
    {
      section: 'taxIdNumberSection',
      class: 'String',
      name: 'taxIdentificationNumber',
      label: 'Federal Tax ID Number (EIN)',
      documentation: 'Federal Tax ID Number (EIN)',
      validationPredicates: [
        {
          args: ['taxIdentificationNumber'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.crunch.onboardingModels.TaxIdNumberData.TAX_IDENTIFICATION_NUMBER, /^[0-9]{9}$/);
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
      `
    }
  ]
});