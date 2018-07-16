foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'HostError',
  extends: 'net.nanopay.sps.utils.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgNum',
    },
    {
      class: 'Int',
      name: 'packetType'
    },
    {
      class: 'String',
      name: 'textMessage'
    }
  ],

  javaImports: [
    'java.util.*',
    'foam.core.*'
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
