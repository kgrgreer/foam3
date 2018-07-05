foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'DetailResponse',
  extends: 'net.nanopay.sps.model.ParsePacket',

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
list.add(PACKET_NUM);
list.add(ITEM);
list.add(ITEM_CONTENT);
}
        `);
      }
    }
  ]

});
