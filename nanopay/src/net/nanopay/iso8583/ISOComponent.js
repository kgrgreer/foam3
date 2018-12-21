foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOComponent',

  documentation: `
    Represents a high level ISO 8583 Component. A component may be a field on an ISO 8583 or it may
    be an entire ISO 8583 message itself.
  `,

  methods: [
    {
      name: 'set',
      documentation: 'Sets a field.',
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
      documentation: 'Unsets a field.',
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
      documentation: 'Packs this ISO 8583 component into an OutputStream',
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
      documentation: 'Unpacks this ISO 8583 component from an InputStream',
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
