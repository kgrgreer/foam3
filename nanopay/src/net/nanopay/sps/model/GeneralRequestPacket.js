foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'GeneralRequestPacket',

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
      class: 'Int',
      name: 'messageModifierCode'
    },
    {
      class: 'String',
      name: 'localTransactionTime'
    },
    {
      class: 'String',
      name: 'textMsg'
    },
    {
      class: 'String',
      name: 'TID'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.sps.model.XMLField',
      name: 'xmlField'
    },
    {
      class: 'String',
      name: 'MICR'
    },
    {
      class: 'String',
      name: 'routeCode'
    },
    {
      class: 'String',
      name: 'account'
    },
    {
      class: 'String',
      name: 'checkNum'
    },
    {
      class: 'Long',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'invoice'
    },
    {
      class: 'String',
      name: 'clerkID'
    },
    {
      class: 'String',
      name: 'maxDetailItemsPerTransmission'
    },
    {
      class: 'Int',
      name: 'socialSecurityNum'
    },
    {
      class: 'String',
      name: 'itemID'
    },
    {
      class: 'String',
      name: 'optionsSelected'
    },
    {
      class: 'String',
      name: 'driversLicense'
    },
    {
      class: 'String',
      name: 'DLStateCode'
    },
    {
      class: 'String',
      name: 'dateOfBirth'
    },
    {
      class: 'String',
      name: 'phoneNumber'
    }
  ],

  javaImports: [

  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          //System.out.println("222");
        `);
      }
    }
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
