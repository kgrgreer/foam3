foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessUserJunctionRefinement',
  refines: 'net.nanopay.model.BusinessUserJunction',

  implements: 'foam.nanos.auth.Authorizable',

  javaImports: [
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      class: 'Int',
      name: 'ownershipPercent',
      documentation: `
        Represents the percentage of the business that this beneficial owner
        owns.
      `,
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException', 'IllegalStateException'],
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new AuthenticationException();
        }

        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, "*") ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses may assign signing officers.");
        }

        if ( this.getTargetId() != user.getId() ) {
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
        if ( user == null ) {
          throw new AuthenticationException();
        }

        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, "*") ) return;

        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

        if (
          this.getSourceId() != user.getId() &&
          this.getTargetId() != user.getId() &&

          this.agent != null &&
          (
            this.getSourceId() != agent.getId() &&
            this.getTargetId() != agent.getId() &&
          )
        ) {
          throw new AuthorizationException();
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
      javaThrows: ['AuthorizationException', 'IllegalStateException'],
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new AuthenticationException();
        }

        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, "*") ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses may assign signing officers.");
        }

        if ( this.getTargetId() != user.getId() ) {
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
        if ( user == null ) {
          throw new AuthenticationException();
        }

        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, "*") ) return;

        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

        if (
          this.getSourceId() != user.getId() &&
          this.getTargetId() != user.getId() &&

          this.agent != null &&
          (
            this.getSourceId() != agent.getId() &&
            this.getTargetId() != agent.getId() &&
          )
        ) {
          throw new AuthorizationException();
        }
      `
    }
  ]
});
