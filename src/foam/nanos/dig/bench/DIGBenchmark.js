/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.dig.bench',
  name: 'DIGBenchmark',
  extends: 'foam.nanos.bench.Benchmark',
  abstract: true,

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
      class: 'String',
      value: '2c2d88af-cba8-9549-05e9-18be400a0aed'
    },
    {
      documentation: 'single load-balancer url, or many for manual psuedo load-balancing',
      name: 'urls',
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
    }
  ]
});
