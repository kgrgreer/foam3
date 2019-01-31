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

  javaImports: [
    'foam.dao.DAO'
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
      class: 'Object',
      name: 'entityId',
      visibility: 'RO',
      documentation: 'Id of entity (e.g., User, Business or Account) object to check for compliance'
    },
    {
      class: 'String',
      name: 'entityDaoKey',
      visibility: 'RO',
      documentation: 'DAO name of the entity object'
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
  ],

  methods: [
    {
      name: 'getEntity',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode: `
        return ((DAO) x.get(getEntityDaoKey())).find(getEntityId()).fclone();
      `
    }
  ]
});