/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'PreventDuplicateEmailAction',

  documentation: `Prevents putting a user with an existing email.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.DuplicateEmailException',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.Email',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.ServiceProvider',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      name: 'ALLOW_DUPLICATE_EMAIL_PERMISSION_NAME',
      type: 'String',
      value: 'spid.default.allowDuplicateEmails'
    }
  ],

  messages: [
    { name: 'EMPTY_ERROR', message: 'Email required' },
    { name: 'INVALID_ERROR', message: 'Invalid email' }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserDAO");

        User user = (User) obj;
        if ( oldObj == null && SafetyUtil.isEmpty(user.getEmail()) ) {
          throw new RuntimeException(EMPTY_ERROR);
        }

        if ( ! Email.isValid(user.getEmail()) ) {
          throw new RuntimeException(INVALID_ERROR);
        }

        // Check against the spid of the user who is submitting the request in
        // case the user.spid is not set (or was cleared by PermissionedPropertyDAO).
        var spid = user.getSpid();
        if ( SafetyUtil.isEmpty(spid) ) {
          var subject = (Subject) x.get("subject");
          spid = subject.getUser().getSpid();
        }

        // check if the allowDuplicateEmail permission has been granted;
        // if it has, then skip over the duplicate email check below.
        if ( spidGrantsDuplicateEmailPermission(getX(), spid) ) {
          return;
        }

        Count count = new Count();
        count = (Count) userDAO
            .where(AND(
              EQ(User.LIFECYCLE_STATE, LifecycleState.ACTIVE),
              EQ(User.TYPE, user.getType()),
              EQ(User.EMAIL, user.getEmail()),
              EQ(User.SPID, spid),
              NEQ(User.ID,  user.getId())
            )).limit(1).select(count);

        if ( count.getValue() == 1 ) {
          throw new DuplicateEmailException();
        }
      `
    }
  ],

  static: [
    {
      name: 'spidGrantsDuplicateEmailPermission',
      type: 'Boolean',
      documentation: `
      Common function for checking if the given SPID allows
      duplicate emails.
      `,
      args: 'foam.core.X x, String spid',
      javaCode: `
      // the X must contain a crunchService otherwise an NPE
      // might happen when we try to check the ServiceProvider
      // for the permission
      if ( x.get("crunchService") == null ) {
        foam.nanos.logger.Loggers.logger(x).error("crunchService not present in x");
        throw new AuthorizationException();
      }

      DAO localSpidDAO = (DAO) x.get("localServiceProviderDAO");
      ServiceProvider sp = (ServiceProvider) localSpidDAO.find(spid);

      if ( sp == null ) return false;

      // need to do setX() here. at this point we know that
      // the crunchService is present, but it might not be
      // present in the ServiceProvider's x. this avoids
      // a crash
      sp.setX(x);

      return sp.grantsPermission(x, ALLOW_DUPLICATE_EMAIL_PERMISSION_NAME);
      `
    }
  ]

});
