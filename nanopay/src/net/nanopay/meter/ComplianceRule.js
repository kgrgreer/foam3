foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'ComplianceRule',

  documentation: 'Compliance rule for compliance validation',

  imports: [
    'logger?'
  ],

  javaImports: [
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      required: true,
      visibility: 'RO',
      documentation: 'Unique name of the compliance rule'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      documentation: 'Enables the compliance rule'
    },
    {
      class: 'Long',
      name: 'validity',
      value: 365,
      documentation: 'Validity of the compliance rule (in days)'
    },
    {
      class: 'Class',
      javaType: 'foam.core.ClassInfo',
      name: 'validator',
      documentation: 'Validator class that knows how to validate a given entity'
    }
  ],

  methods: [
    {
      name: 'isApplicable',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'entity',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( getValidator() == null ) return false;

        try {
          ComplianceValidator validator = (ComplianceValidator) getValidator().newInstance();
          return validator.canValidate(entity);
        } catch (IllegalAccessException | InstantiationException e) {
          Logger logger = (Logger) getLogger();
          logger.warning("Could not instantiate ComplianceValidator.", e);

          return false;
        }
      `
    }
  ]
});