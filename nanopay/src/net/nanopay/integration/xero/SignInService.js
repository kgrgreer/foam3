foam.INTERFACE({
  package: 'net.nanopay.integration.xero',
  name: 'SignInService',

  documentation: 'System that allows the generation of tokens as well as processing of said generated tokens',

  methods: [
    {
      name: 'checkSignIn',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        }
      ]
    },
    {
      name: 'isSignedIn',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        },
        {
          name: 'parameters',
          javaType: 'java.util.Map<String, Object>',
          swiftType: '[String:Any]'
        }
      ]
    },
  ]
});
