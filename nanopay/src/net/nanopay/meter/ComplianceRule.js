foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'ComplianceRule',

  documentation: 'Compliance rule for compliance validation',

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
  ]
});