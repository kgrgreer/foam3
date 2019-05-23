foam.CLASS({
  package: 'net.nanopay.documents',
  name: 'UserAcceptanceDocument',

  documentation: 'Captures acceptance documents accepted by user and date accepted.',

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.dao.DAO'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.Authorizable'
  ],

  tableColumns: [
      'id', 'user', 'acceptedDocument', 'createdBy'
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
      name: 'user'
    },
    {
      class: 'String',
      name: 'ipAddress'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'acceptedDocument'
    },
    {
      class: 'Boolean',
      name: 'accepted',
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
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
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authenticateUser',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      DAO acceptanceDocumentDAO = (DAO) x.get("acceptanceDocumentDAO");
      AcceptanceDocument acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO.find(getAcceptedDocument());
      if ( acceptanceDocument != null && acceptanceDocument.getAuthenticated()) {
        User user = (User) x.get("user");
        if ( user == null ) throw new AuthorizationException("You need to be logged in to access document.");
      }
      `
    }
  ]
});
