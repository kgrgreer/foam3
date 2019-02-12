foam.CLASS({
  package: 'net.nanopay.settings',
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
  ]
});
