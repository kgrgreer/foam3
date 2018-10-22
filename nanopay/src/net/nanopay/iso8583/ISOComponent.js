foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOComponent',

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber'
    },
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'set',
      javaReturns: 'void',
      args: [
        {
          name: 'c',
          javaType: 'net.nanopay.iso8583.ISOComponent'
        }
      ]
    },
    {
      name: 'unset',
      javaReturns: 'void',
      args: [
        {
          name: 'field',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'getKey',
      javaReturns: 'Object'
    },
    {
      name: 'getBytes',
      javaReturns: 'byte[]'
    },
    {
      name: 'pack',
      javaReturns: 'byte[]'
    },
    {
      name: 'unpack',
      javaReturns: 'int',
      args: [
        {
          name: 'b',
          javaType: 'byte[]'
        }
      ]
    }
  ]
});
