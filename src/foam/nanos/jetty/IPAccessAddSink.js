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

  documentation: 'Jettys InetAccessHandler only supports add',

  javaImports: [
    'foam.nanos.logger.Loggers',
    'org.eclipse.jetty.server.handler.InetAccessHandler'
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
         ((InetAccessHandler)getIpAccessHandler()).exclude(ip.getId());
      } else {
         ((InetAccessHandler)getIpAccessHandler()).include(ip.getId());
      }
      `
    }
  ]
})
