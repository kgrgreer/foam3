/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.dig.bench',
  name: 'DIGBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  javaImports: [
    'foam.nanos.dig.DIG'
  ],

  properties: [
    {
      name: 'setupUrl',
      class: 'String',
      value: 'https://hera:8443'
    },
    {
      name: 'setupSessionId',
      class: 'String'
    },
    {
      documentation: 'Basic Auth',
      name: 'setupUserName',
      class: 'String',
      value: 'admin'
    },
    {
      name: 'setupPassword',
      class: 'String'
    },
    {
      documentation: 'single load-balancer url, or many for manual Pseudo load-balancing',
      name: 'urls',
      label: 'URLs (Load-Balanced)',
      class: 'StringArray',
      javaFactory: 'return new String[] { "https://moosehead:4444" };'
    },
    {
      name: 'sessionId',
      class: 'String',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'connectionTimeout',
      class: 'Long',
      units: 'ms',
      value: 20000
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'requestTimeout',
      class: 'Long',
      units: 'ms',
      value: 20000
    }
  ],

  javaCode: `
  protected int lastServerIndex_ = 0;
  `,

  methods: [
    {
      name: 'getNextServerIndex',
      args: 'Context x',
      javaType: 'int',
      synchronized: true,
      javaCode: `
      lastServerIndex_ = (lastServerIndex_ + 1) % getUrls().length;
      return lastServerIndex_;
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      // nop
      `
    }
  ]
});
