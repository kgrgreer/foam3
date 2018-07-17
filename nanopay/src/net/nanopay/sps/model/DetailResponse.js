foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'DetailResponse',
  extends: 'net.nanopay.sps.model.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
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
list.add(MSG_TYPE);
list.add(PACKET_NUM);
list.add(ITEM);
list.add(ITEM_CONTENT);
}
        `);
      }
    }
  ]

});
