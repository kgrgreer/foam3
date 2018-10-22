foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOComponent',

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
      name: 'getFieldNumber',
      javaReturns: 'int'
    },
    {
      name: 'setFieldNumber',
      javaReturns: 'void',
      args: [
        {
          name: 'val',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'getKey',
      javaReturns: 'Object'
    },
    {
      name: 'getValue',
      javaReturns: 'Object'
    },
    {
      name: 'setValue',
      javaReturns: 'void',
      args: [
        {
          name: 'val',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'getBytes',
      javaReturns: 'byte[]'
    },
    {
      name: 'getMaxField',
      javaReturns: 'int'
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
