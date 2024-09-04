/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'IPAccessSink',
  extends: 'foam.dao.AbstractSink',
  implements: ['foam.core.ContextAware'],
  flags: ['java'],

  documentation: `Manage Jettys IPAccess list`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.logger.Loggers',
    'org.eclipse.jetty.server.handler.IPAccessHandler'
  ],

  properties: [
    {
      name: 'ipAccessHandler',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    {
      name: 'put',
      args: 'Object obj, foam.core.Detachable sub',
      javaCode: `
      // sub.detach();
      clear();
      `
    },
    {
      name: 'remove',
      args: 'Object obj, foam.core.Detachable sub',
      javaCode: `
      // sub.detach();
      clear();
      `
    },
    {
      documentation: 'Jettys IPAccessHandler does not support remove, so have to clear and re-add',
      name: 'clear',
      javaCode: `
      Loggers.logger(getX(), this).info("clear");
      ((IPAccessHandler)getIpAccessHandler()).setWhite(null);
      ((IPAccessHandler)getIpAccessHandler()).setBlack(null);
      getDao().select(new IPAccessAddSink(getIpAccessHandler()));
      `
    }
  ]
})
