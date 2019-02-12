foam.INTERFACE({
  package: 'net.nanopay.iso8583.padder',
  name: 'Padder',

  documentation: 'Interface to pad string',

  methods: [
    {
      name: 'pad',
      type: 'String',
      args: [
        {
          name: 'data',
          type: 'String'
        },
        {
          name: 'maxLength',
          type: 'Integer'
        }
      ]
    },
    {
      name: 'unpad',
      type: 'String',
      args: [
        {
          name: 'data',
          type: 'String'
        }
      ]
    }
  ]
});
