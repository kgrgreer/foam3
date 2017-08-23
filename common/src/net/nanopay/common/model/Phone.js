foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'Phone',

  documentation: 'Phone number information.',

  properties: [
    {
      class: 'Boolean',
      name: 'verified' 
    },
    {
      class: 'String',
      name: 'number',
      required: true
    },
    {
      class: 'String',
      name: 'type'
    }
  ]
});
