foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'ReversalRequest',

  properties: [
    {
      class: 'String',
      name: 'reqId',
    },
    {
      class: 'String',
      name: 'msgSrc',
      value: 'Nanopay'
    },
    {
      class: 'String',
      name: 'clientCode'
    },
    {
      class: 'DateTime',
      name: 'datePost'
    },
    {
      class: 'String',
      name: 'msgId'
    }
  ]
});
