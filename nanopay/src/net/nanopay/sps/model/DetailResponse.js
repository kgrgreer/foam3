foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'DetailResponse',

  properties: [
    {
      class: 'Int',
      name: 'msgNum',
    },
    {
      class: 'Int',
      name: 'packetNum'
    },
    {
      class: 'String',
      name: 'item'
    },
    {
      class: 'String',
      name: 'itemContent'
    }
  ]
});
