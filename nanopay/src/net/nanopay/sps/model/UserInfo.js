foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'UserInfo',

  properties: [
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'String',
      name: 'acct'
    },
    {
      class: 'String',
      name: 'other'
    },
    {
      class: 'String',
      name: 'location'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'secc'
    },
    {
      class: 'String',
      name: 'ptc'
    }
  ],

  javaImports: [

  ],

  methods: [
    {
      name: 'generateGeneralRequestPacket',
      javaCode:
        `System.out.println("111");
`
    }
  ]
});
