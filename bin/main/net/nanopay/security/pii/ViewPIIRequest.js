foam.CLASS({
  package: 'net.nanopay.security.pii',
  name: 'ViewPIIRequest',

  documentation: `Modelled PII Request`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  searchColumns: [
    'viewRequestStatus'
   ],

  tableColumns: [
    'id', 'createdBy', 'approvedBy'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
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
      of: 'net.nanopay.security.pii.PIIRequestStatus'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approvedBy',
      documentation: 'Id of user that Approved the request'
    },
    {
      name: 'approvedAt',
      class: 'DateTime',
      documentation: 'Time at which the request was approved'
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
