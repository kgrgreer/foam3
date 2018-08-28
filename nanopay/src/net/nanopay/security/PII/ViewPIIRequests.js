foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'ViewPIIRequests',

  documentation: `Modelled PII Request`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  searchColumns: [
    'severity'
   ],

  properties: [
    // will setSeqNoDAO take of this?
    // {
    //   name: 'Serial Number'
    //   class: 'Long',
    // }
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the request'
    },
    {
      name: 'submittedAt',
      class: 'DateTime',
    },
    {
      name: 'requestStatus',
      class: 'Enum',
      of: 'net.nanopay.security.PII.requestStatus',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'reviewedBy',
      documentation: 'Person at nanopay who reviewed this request'
    },
    {
      name: 'reviewedAt',
      class: 'DateTime',
    },
  ]
});
