foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'HostError',
  extends: 'net.nanopay.sps.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgNum',
      value: 20
    },
    {
      class: 'Int',
      name: 'packetType',
      value: 2091
    },
    {
      class: 'String',
      name: 'textMessage'
    }
  ],

  javaImports: [
    'java.util.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  {
    list = new ArrayList<>();
    list.add(MSG_NUM);
    list.add(PACKET_TYPE);
    list.add(TEXT_MESSAGE);
  }
        `);
      }
    }
  ]

});
