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
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.ComplianceValidator',
      name: 'validator',
      documentation: 'Validator class that knows how to validate a given object'
    }
  ],

  methods: [
    {
      name: 'isApplicable',
      type: 'Boolean',
      args: [
        {
          name: 'obj',
          type: 'foam.core.FObject'
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
      type: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'entity',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        ComplianceValidator validator = getValidator();
        return validator != null
          ? validator.validate(x, entity)
          : ComplianceValidationStatus.PENDING;
      `
    }
  ]
});