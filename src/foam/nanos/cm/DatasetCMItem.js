/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'DatasetCMItem',
  extends: 'foam.nanos.cm.CM',
  documeentation:  `
    The model is use to hold x-axis in DatasetCM.
  `,

  javaImports: [
    'java.util.Map.Entry',
    'java.util.Map',
    'java.util.List'
  ],

  properties: [
    {
      class: 'List',
      name: 'values',
      javaType: 'java.util.List<Double>',
      documentation: 'xAxis key',
      storageTransient: true,
      visibility: 'HIDDEN',
      javaFactory: `
        return new java.util.ArrayList<Double>();
      `
    },
  ]
})