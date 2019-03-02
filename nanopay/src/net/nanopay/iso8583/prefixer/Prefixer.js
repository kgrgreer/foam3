foam.INTERFACE({
  package: 'net.nanopay.iso8583.prefixer',
  name: 'Prefixer',

  documentation: 'Interface for prefixing data',

  methods: [
    {
      name: 'encodeLength',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'length',
          type: 'Integer'
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'decodeLength',
      type: 'Integer',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    },
    {
      name: 'getPackedLength',
      type: 'Integer'
    }
  ]
});
