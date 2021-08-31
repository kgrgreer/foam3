/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RemoteDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.core.X',
    'foam.util.Auth'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      var putDao = new foam.dao.PutOnlyDAO.Builder(x).setDelegate(new foam.dao.NullDAO.Builder(x).setOf(foam.nanos.auth.User.getOwnClassInfo()).build()).build();
      var delegate = new foam.dao.ReadOnlyDAO.Builder(x)
                     .setDelegate(putDao)
                     .build();
      var dao = new foam.dao.EasyDAO.Builder(x).setAuthorize(false).setOf(foam.nanos.auth.User.getOwnClassInfo()).setInternalAccessDAO(putDao).setDecorator(delegate).build();

      User godUser = new User.Builder(x)
              .setEmail("pushkin@gmail.com")
              .setGroup("system")
              .build();

      Subject subject = new Subject.Builder(x).build();
      subject.setUser(godUser);
      var godX = x.put("subject", subject);
      test(dao.inX(godX).put(new User()) instanceof User, "User object was sucessfully stored in userDAO with system context. The operation bypassed readonluy dao");
      User user = new User.Builder(x)
        .setEmail("esenin@gmail.com")
        .setGroup("27")
        .build();
      Subject subject2 = new Subject.Builder(x).build();
      subject2.setUser(user);
      var sadX = x.put("subject", subject2);
      var passed = false;
      try {
        dao.inX(sadX).put(new User());
      } catch (UnsupportedOperationException e) {
        passed = true;
      }
      test(passed, "the operation didn't bypass the readOnly dao with non system context");
      `
    }
  ]
});
