foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceHistory',

  documentation: 'Compliance validation history record',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: 'User who last modified the entry'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.ComplianceRule',
      name: 'ruleId',
      documentation: 'Compliance rule to check against'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'entity',
      documentation: 'Entity (e.g., User, Business or Account) to check for compliance'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      name: 'status',
      documentation: 'Status of the compliance record'
    },
    {
      class: 'DateTime',
      name: 'expirationDate',
      documentation: 'Validity of the compliance record'
    },
    {
      class: 'Boolean',
      name: 'wasRenew',
      value: false,
      documentation: 'Renewal indicator for the compliance record'
    }
  ]
});