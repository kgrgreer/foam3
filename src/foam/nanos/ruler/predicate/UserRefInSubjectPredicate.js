/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'UserRefInSubjectPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'A predicate that returns true when a user reference can be found as the subject user or realuser.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'Boolean',
      name: 'isRealUser',
      documentation: ' If isRealUser is set, only return true if property matches subject.realUser'
    },
    {
      class: 'Boolean',
      name: 'isUser',
      documentation: ' If isUser is set, only return true if property matches subject.user'
    }
  ],

  methods: [
    {
      name: 'f',
      code: () => true,
      javaCode: `
        X x = (X) obj;
        Subject subject = (Subject) x.get("subject");

        FObject obj = (FObject) NEW_OBJ.f(obj);
        Long prop = (Long) obj.getProperty(getPropName());

        var isUser = prop == subject.getUser().getId();
        var isRealUser = prop == subject.getRealUser.getId();

        return getIsUser() && isUser || getIsRealUser() && isRealUser ||
          ( ! getIsRealUser() && ! getIsUser() ) && ( isUser || isRealUser );
      `
    }
  ]
});
