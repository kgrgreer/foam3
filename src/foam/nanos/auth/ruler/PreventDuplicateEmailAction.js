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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.Email',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      name: 'ALLOW_DUPLICATE_EMAIL_PERMISSION_NAME',
      type: 'String',
      value: 'foam.allowDuplicateEmail'
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

        if ( oldObj != null ) {
          // do not run the following checks if the user already exists
          // and isn't changing their email address.
          // assumption here is that if a user successfully registered,
          // they would have run by this check already.
          if ( SafetyUtil.equalsIgnoreCase(user.getEmail(), ((User)oldObj).getEmail() ) {
            return; 
          }

          // if user already exists, check for allowDuplicateEmail permission.
          AuthService authService = (AuthService)x.get("auth");
          if ( authService.checkUser(x, user, ALLOW_DUPLICATE_EMAIL_PERMISSION_NAME) ) {
            return;
          }
        }

        if ( oldObj == null ) {
          // if user is being created for the first time,
          // check if the spid grants the allowDuplicateEmail permission.
          // (this code is almost the exact same as in CapabilityAuthService)
          DAO localSpidDAO = (DAO) x.get("localServiceProviderDAO");
          ServiceProvider sp = (ServiceProvider) localSpidDAO.find(spid);
          if ( sp != null ) {
            // setX(getX()) exact same hack as in CapabilityAuthService
            sp.setX(getX());
            if ( sp.grantsPermission(ALLOW_DUPLICATE_EMAIL_PERMISSION_NAME) ) {
              return;
            }
          }
        }

        Count count = new Count();
        count = (Count) userDAO
            .where(AND(
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
  ]
});
