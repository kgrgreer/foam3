foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'RequestMessage',

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
      name: 'textMessage'
    }
  ]
});
