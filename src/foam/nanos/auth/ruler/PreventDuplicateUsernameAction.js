/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'PreventDuplicateUsernameAction',

  documentation: `Prevents putting a user with an existing username.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.ValidationException',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'DUPLICATE_ERROR', message: 'User with same username already exists: ' },
    { name: 'EMPTY_ERROR', message: 'Username required' }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserDAO");

        User user = (User) obj;
        if ( SafetyUtil.isEmpty(user.getUserName()) ) {
          return;
          // TODO: REMOVE COMMENT ONCE READY TO MAKE USERNAME A REQUIREMENT
          // throw new RuntimeException(EMPTY_ERROR);
        }

        // Check against the spid of the user who is submitting the request in
        // case the user.spid is not set (or was cleared by PermissionedPropertyDAO).
        var spid = user.getSpid();
        if ( SafetyUtil.isEmpty(spid) ) {
          var subject = (Subject) x.get("subject");
          spid = subject.getUser().getSpid();
        }

        Count count = new Count();
        count = (Count) userDAO
            .where(AND(
              EQ(User.TYPE, user.getType()),
              EQ(User.USER_NAME, user.getUserName()),
              EQ(User.SPID, spid),
              NEQ(User.ID,  user.getId())
            )).limit(1).select(count);

        if ( count.getValue() == 1 ) {
          throw new ValidationException(DUPLICATE_ERROR + user.getUserName());
        }
      `
    }
  ]
});
