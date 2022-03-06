/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ChainedPropertyService',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  documentation:
  `Model that stores the array of decorators that fills the emailMessage
   with service level precedence on properties.`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'java.util.Map',
    'java.util.HashMap'
  ],

  properties: [
    {
      name: 'data',
      class: 'FObjectArray',
      of: 'EmailPropertyService'
    }
  ],

  methods: [
    {
      name: 'apply',
      javaCode:
      `
      User user = (User) emailMessage.findUser(getX());
      Session session = new Session();
      session.setUserId(user.getId());
      X userX = session.applyTo(getX());
      session.setContext(userX);
      userX = userX.put(Session.class, session);
      if ( group == null ) {
        group = ((Group) userX.get("group")).getId();
      }

      Map args = templateArgs;
      if ( args == null ||
           args.size() == 0 ) {
        args = emailMessage.getTemplateArguments();
        if ( args == null ) {
          args = new HashMap();
        }
      }

      for ( EmailPropertyService eps: getData() ) {
        emailMessage = eps.apply(userX, group, emailMessage, args);
      }
      return emailMessage;
      `
    }
  ]
});
