foam.CLASS({
  package: 'net.nanopay.documents',
  name: 'AcceptanceDocument',

  documentation: 'Captures information for acceptance documents like terms and conditions.',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User'
  ],

  requires: [
    'net.nanopay.documents.ui.AcceptanceDocumentView'
  ],

  tableColumns: [
    'id',
    'name',
    'link',
    'issuedDate',
    'expiryDate',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      class: 'String',
      name: 'title',
      documentation: 'Title of acceptance document to be displayed.'
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      documentation: 'Name of acceptance document.',
      required: true
    },
    {
      class: 'String',
      name: 'version',
      documentation: 'acceptance document version'
    },
    {
      class: 'Date',
      name: 'issuedDate',
      label: 'Effective Date',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'Date',
      name: 'expiryDate',
      documentation: 'Document expiry date after which user must re-accept document',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'String',
      name: 'body',
      documentation: 'Template body',
      view: { class: 'net.nanopay.documents.ui.AcceptanceDocumentView' }
    },
    {
      class: 'String',
      name: 'link',
      documentation: 'Link to the document '
    },
    {
      class: 'String',
      name: 'checkboxText',
      documentation: 'Text to be displayed for checkbox'
    },
    {
      class: 'Boolean',
      name: 'printable',
      documentation: 'Determines whether acceptance document can be printed.',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'authenticated',
      documentation: 'Determines user should be logged-in before accepting or seeing document.',
      value: false,
    },
    {
      class: 'String',
      name: 'transactionType',
      documentation: 'Type of transaction that acceptance document applies to. This also identifies the Payment Provider',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: 'For Country specific documents,'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Region',
      name: 'state',
      documentation: 'For State/Province/Region specific documents'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.documents.AcceptanceDocumentType',
      name: 'documentType',
      documentation: `Currently documents can be of Onboarding or Disclosure type.`,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.PaymentProvider',
      name: 'paymentProvider',
      documentation: 'Identifies payment provider related to document'
    },
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
      if ( getAuthenticated() ) {
        User user = (User) x.get("user");
        if ( user == null ) throw new AuthorizationException("You need to be logged in to access document.");
      }
      `
    }
  ]
});
