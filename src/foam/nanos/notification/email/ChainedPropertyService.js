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
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
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
      X userX = getX();
      if ( user != null ) userX = foam.util.Auth.sudo(getX(), user);

      Map args = templateArgs;
      if ( args == null ||
           args.size() == 0 ) {
        args = emailMessage.getTemplateArguments();
        if ( args == null ) {
          args = new HashMap();
        }
      }

      String userGroup = (String) args.get("userGroup");
      if ( ! SafetyUtil.isEmpty(userGroup) )
        group = userGroup;
      else {
        group = ((Group) userX.get("group")).getId();
        Loggers.logger(userX, this).debug("Could set 'userGroup' on template for group, but instead have defaulted to whatever is in the context - " + group);
      }

      for ( EmailPropertyService eps: getData() ) {
        emailMessage = eps.apply(userX, group, emailMessage, args);
      }
      return emailMessage;
      `
    }
  ]
});
