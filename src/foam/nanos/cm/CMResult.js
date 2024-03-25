/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'CMResult',

  documentation: `
    Model the result of CM, so the result can render into plot easiler.
  `,

  properties: [
    {
      class: 'String',
      name: 'key'
    },
    {
      class: 'Double',
      name: 'value'
    },
    {
      class: 'List',
      javaType: 'java.util.List<String>',
      documentation: 'xAxis key',
      name: 'labels',
      javaFactory: `
        return new java.util.ArrayList<String>();
      `
    },
    {
      class: 'Map',
      name: 'dataset',
      documentation: 'xAxis keys',
      javaType: 'java.util.Map<String, java.util.List<Integer>>',
      javaFactory: `
        return new java.util.HashMap<String, java.util.List<Integer>>();
      `
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        return "TODO";
      },
      javaCode: `
        return "TODO";
      `
    }
  ]
})