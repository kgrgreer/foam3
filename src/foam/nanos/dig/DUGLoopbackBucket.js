/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGLoopbackBucket',

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  documentation: `WebAgent which can be a DUG endpoint for testing`,

  javaImports: [
    'foam.nanos.http.HttpParameters',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse'
  ],

  properties: [
    {
      documentation: 'Last recieved HTTP post data',
      name: 'content',
      class: 'String'
    },
    {
      name: 'timestamp',
      class: 'DateTime',
    }
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      HttpServletRequest req = x.get(HttpServletRequest.class);
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      HttpParameters p = x.get(HttpParameters.class);
      setContent(p.getParameter("data"));
      setTimestamp(new java.util.Date());
      Loggers.logger(x, this).info("received", getContent());
      `
    }
  ]
})
