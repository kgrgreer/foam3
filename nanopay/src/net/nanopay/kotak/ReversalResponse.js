foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'ReversalResponse',

  properties: [
    {
      class: 'String',
      name: 'reqId',
    },
    {
      class: 'String',
      name: 'msgSrc'
    },
    {
      class: 'String',
      name: 'clientCode'
    },
    {
      class: 'String',
      name: 'datePost'
    },
    {
      class: 'String',
      name: 'msgId'
    },
    {
      class: 'String',
      name: 'statusCode'
    },
    {
      class: 'String',
      name: 'statusDesc'
    },
    {
      class: 'String',
      name: 'UTR'
    }
  ]
});
