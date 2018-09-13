foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'ViewPIIRequests',

  documentation: `Modelled PII Request`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  searchColumns: [
    'viewRequestStatus'
   ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the request'
    },
    {
      name: 'created',
      class: 'DateTime',
    },
    {
      name: 'reportIssued',
      class: 'Boolean'
    },
    {
      name: 'viewRequestStatus',
      class: 'Enum',
      of: 'net.nanopay.security.PII.PIIRequestStatus'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: 'Placeholder for reviewer'
    },
    {
      name: 'lastModified',
      class: 'DateTime',
      documentation: 'Placeholder for reviwedAt'
    },
    {
      name: 'requestExpiresAt',
      class: 'DateTime',
    },
    {
      class: 'List',
      name: 'downloadedAt',
      documentation: 'List that holds times at which the report was downloaded',
      javaType: 'java.util.ArrayList<java.util.Date>'
    }
  ]
});
