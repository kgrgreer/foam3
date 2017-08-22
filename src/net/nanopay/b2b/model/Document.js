foam.CLASS({
  package: 'net.nanopay.b2b.model',
  name: 'Document',

  documentation: 'Unknown, TODO.',

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'fileUrl',
      required: true
    },
    {
      class: 'String',
      name: 'note'
    },
    {
      class: 'Boolean',
      name: 'required'
    }
  ]
});
