foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'RequestMessageAndErrors',
  extends: 'net.nanopay.sps.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
      value: 20
    },
    {
      class: 'Int',
      name: 'packetType',
      value: 2090
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
    list.add(MSG_TYPE);
    list.add(PACKET_TYPE);
    list.add(TEXT_MESSAGE);
  }
        `);
      }
    }
  ]

});
