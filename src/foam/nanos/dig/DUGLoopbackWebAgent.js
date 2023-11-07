/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGLoopbackWebAgent',

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  documentation: `WebAgent which can be a DUG endpoint for testing`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.http.HttpParameters',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse'
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      HttpServletRequest req = x.get(HttpServletRequest.class);
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      HttpParameters p = x.get(HttpParameters.class);
      DUGLoopback loopback = new DUGLoopback();
      loopback.setData(p.getParameter("data"));
      loopback.setTimestamp(new java.util.Date());
      Loggers.logger(x, this).info("received", loopback);
      ((DAO) x.get("dugLoopbackDAO")).put(loopback);
      `
    }
  ]
})
