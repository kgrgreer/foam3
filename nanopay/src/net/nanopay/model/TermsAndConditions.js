foam.CLASS({
  package: 'net.nanopay.model',
  name: 'TermsAndConditions',

  documentation: 'Terms and Condition Model',

  javaImports: [
    'java.nio.charset.StandardCharsets',
    'java.util.Date' ,
  ],

  tableColumns: [ 'name', 'issuedDate' ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Template name'
    },
    {
      class: 'Date',
      name: 'issuedDate',
      label: 'Effective Date',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      class: 'String',
      name: 'body',
      documentation: 'Template body',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 150 },
      javaSetter:
`body_ = val;
bodyIsSet_ = true;
bodyAsByteArray_ = null;
bodyAsByteArrayIsSet_ = false;`
    },
    {
      class: 'Array',
      name: 'bodyAsByteArray',
      hidden: true,
      transient: true,
      javaType: 'byte[]',
      javaFactory: 'return getBody() != null ? getBody().getBytes(StandardCharsets.UTF_8) : null;'
    }
  ]
});