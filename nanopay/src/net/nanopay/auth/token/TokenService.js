foam.INTERFACE({
  package: 'net.nanopay.auth.token',
  name: 'TokenService',

  documentation: 'Generates and processes tokens',

  methods: [
    {
      name: 'generateToken',
      returns: 'Promise',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ]
    },
    {
      name: 'processToken',
      returns: 'Promise',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        },
        {
          name: 'token',
          javaType: 'String'
        },
        {
          name: 'data',
          javaType: 'java.util.Map',
          documentation: 'Any additional data needed to process the token'
        }
      ]
    }
  ]
});
