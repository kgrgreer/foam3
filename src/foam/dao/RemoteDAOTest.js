/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RemoteDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
      var putDao = new foam.dao.PutOnlyDAO.Builder(x).setDelegate(new foam.dao.NullDAO.Builder(x).setOf(foam.nanos.auth.User.getOwnClassInfo()).build()).build();
      var delegate = new foam.dao.ReadOnlyDAO.Builder(x)
                     .setDelegate(putDao)
                     .build();
      var dao = new foam.dao.EasyDAO.Builder(x).setOf(foam.nanos.auth.User.getOwnClassInfo()).setDecorator(delegate).build();
      
      `
    }
  ]
});
