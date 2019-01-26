foam.CLASS({
  package: 'net.nanopay.meter',
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
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      documentation: 'Creation date'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      documentation: 'User who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      documentation: 'Last modified date'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      visibility: 'RO',
      documentation: 'User who last modified the entry'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.ComplianceRule',
      name: 'ruleId',
      visibility: 'RO',
      documentation: 'Compliance rule to check against'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'entity',
      visibility: 'RO',
      documentation: 'Entity (e.g., User, Business or Account) to check for compliance'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.ComplianceValidationStatus',
      name: 'status',
      visibility: 'RO',
      documentation: 'Status of the compliance record'
    },
    {
      class: 'DateTime',
      name: 'expirationDate',
      visibility: 'RO',
      documentation: 'Validity of the compliance record'
    },
    {
      class: 'Boolean',
      name: 'wasRenew',
      value: false,
      visibility: 'RO',
      documentation: 'Renewal indicator for the compliance record'
    }
  ]
});