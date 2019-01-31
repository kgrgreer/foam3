foam.CLASS({
  package: 'net.nanopay.meter.compliance',
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
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.ComplianceValidator',
      name: 'validator',
      documentation: 'Validator class that knows how to validate a given object'
    }
  ],

  methods: [
    {
      name: 'isApplicable',
      javaReturns: 'boolean',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        ComplianceValidator validator = getValidator();
        return validator != null
          ? validator.canValidate(obj)
          : false;
      `
    },
    {
      name: 'test',
      javaReturns: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      args: [
        {
          name: 'entity',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        ComplianceValidator validator = getValidator();
        return validator != null
          ? validator.validate(entity)
          : ComplianceValidationStatus.PENDING;
      `
    }
  ]
});