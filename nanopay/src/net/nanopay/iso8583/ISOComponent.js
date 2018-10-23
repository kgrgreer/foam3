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
          name: 'fieldNumber',
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
      name: 'getChildren',
      javaReturns: 'java.util.Map'
    },
    {
      name: 'pack',
      javaReturns: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'unpack',
      javaReturns: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    }
  ]
});
