/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.http.test',
  name: 'DIGBroadcastWebAgentTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DOP',
    'foam.nanos.dig.DIG',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'javax.servlet.http.HttpServletRequest'
  ],

  properties: [
    {
      name: 'pathSpec',
      class: 'String',
      value: 'broadcast',
    },
    {
      name: 'data',
      class: 'String',
      value: 'param1=value1'
    },
    {
      name: 'dop',
      class: 'Enum',
      of: 'foam.dao.DOP',
      value: 'PUT'
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'connectionTimeout',
      class: 'Long',
      units: 'ms',
      value: 20000,
      section: 'details'
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'requestTimeout',
      class: 'Long',
      units: 'ms',
      value: 10000,
      section: 'details'
    }
  ],

  methods: [
    {
      name: 'runTest',
      args: 'X x',
      javaCode: `
      String url = "http://" + System.getProperty("hostname", "localhost") + ":" + System.getProperty("http.port", "8080");

      DIG client = new DIG.Builder(x)
        .setPostURL(url)
        .setServiceName(getPathSpec())
        .setConnectionTimeout(getConnectionTimeout())
        .setRequestTimeout(getRequestTimeout())
        .build();

      Object reply = client.submit(x, getDop(), getData());
      test ( reply != null, "recieved non-null reply: "+reply);
      test ( client.getLastResponseCode() == 200, "response code 200: "+client.getLastResponseCode());


      client = new DIG.Builder(x)
        .setPostURL(url)
        .setServiceName(getPathSpec()+"-fail")
        .setConnectionTimeout(getConnectionTimeout())
        .setRequestTimeout(getRequestTimeout())
        .build();

      try {
        reply = client.submit(x, getDop(), getData());
        test ( false, "expected exception: "+reply);
      } catch (Exception e) {
        test ( client.getLastResponseCode() != 200, "response code ! 200: "+client.getLastResponseCode());
        test ( e instanceof foam.core.FOAMException, "expected FOAMException: "+e.getClass().getSimpleName());
      }
      `
    }
  ]
})
