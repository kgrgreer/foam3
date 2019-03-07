foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessUserJunctionRefinement',
  refines: 'net.nanopay.model.BusinessUserJunction',

  documentation: `
    A junction between a Business and User means that the user is a signing
    officer for the business.
  `,

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");

        if ( auth.check(x, "*") ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses may assign signing officers.");
        }

        if ( this.getSourceId() != user.getId() ) {
          throw new AuthorizationException("Users may not assign themselves as signing officers of businesses. The business must assign the user as a signing officer.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

        if ( auth.check(x, "*") ) return;

        if (
          this.getSourceId() != user.getId() &&
          this.getTargetId() != user.getId() &&

          agent != null &&
          (
            this.getSourceId() != agent.getId() &&
            this.getTargetId() != agent.getId()
          )
        ) {
          throw new AuthorizationException("Permission denied. You are not associated with this junction.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if ( auth.check(x, "*") ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses may assign signing officers.");
        }

        if ( this.getSourceId() != user.getId() ) {
          throw new AuthorizationException("Users may not assign themselves as signing officers of businesses. The business must assign the user as a signing officer.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

        if ( auth.check(x, "*") ) return;

        if (
          this.getSourceId() != user.getId() &&
          this.getTargetId() != user.getId() &&

          agent != null &&
          (
            this.getSourceId() != agent.getId() &&
            this.getTargetId() != agent.getId()
          )
        ) {
          throw new AuthorizationException();
        }
      `
    }
  ]
});
