/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'IPAccessAddSink',
  extends: 'foam.dao.AbstractSink',
  implements: ['foam.core.ContextAware'],
  flags: ['java'],

  documentation: 'Jettys IPAccessHandler only supports add',

  javaImports: [
    'foam.nanos.logger.Loggers',
    'org.eclipse.jetty.server.handler.IPAccessHandler'
  ],

  properties: [
    {
      name: 'ipAccessHandler',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true
    }
  ],

  methods: [
    {
      name: 'put',
      args: 'Object obj, foam.core.Detachable sub',
      javaCode: `
      IPAccess ip = (IPAccess) obj;
      if ( ip.getBlock() ) {
         ((IPAccessHandler)getIpAccessHandler()).addBlack(ip.getId());
      } else {
         ((IPAccessHandler)getIpAccessHandler()).addWhite(ip.getId());
      }
      `
    }
  ]
})
