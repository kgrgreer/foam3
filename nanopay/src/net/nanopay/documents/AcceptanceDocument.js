foam.CLASS({
  package: 'net.nanopay.documents',
  name: 'AcceptanceDocument',

  documentation: 'Captures information for acceptance documents like terms and conditions.',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
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
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 150 },
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
  ]
});
