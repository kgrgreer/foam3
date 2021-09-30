/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'BenchmarkResult',

  mixins: [
    'foam.nanos.auth.CreatedAwareMixin'
  ],

  properties: [
    //TODO Transactions (M)
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Int',
      name: 'Threads'
    },
    {
      class: 'Float',
      name: 'MemoryGB'
    },
    {
      class: 'Float',
      name: 'OperationsST',
      label: 'Operations/s/t',
    },
    {
      class: 'Int',
      name: 'Pass'
    },
    {
      class: 'Float',
      name: 'OperationsS',
      label: 'Operations/s',
    },
    {
      class: 'Int',
      name: 'Total'
    },
    {
      class: 'Float',
      name: 'TransactionsM',
      label: 'Transactions (M)'
    },
    {
      class: 'Int',
      name: 'Run'
    },
    {
      class: 'Int',
      name: 'Fail'
    },
    {
      class: 'String',
      name: 'Name'
    },
    {
      class: 'String',
      name: 'osArch'
    },
    {
      class: 'String',
      name: 'javaVmInfo'
    },
    {
      class: 'String',
      name: 'javaVersion'
    },
    {
      class: 'String',
      name: 'javaCompiler'
    },
    {
      class: 'String',
      name: 'javaFullversion'
    },

    {
      class: 'String',
      name: 'javaRuntimeVersion'
    },
    {
      class: 'String',
      name: 'osName'
    },
    {
      class: 'String',
      name: 'sunArchDataModel'
    },
    {
      class: 'Int',
      name: 'core'
    },
    {
      class: 'Long',
      name: 'freeMemory'
    },
    {
      class: 'Long',
      name: 'maxMemory'
    },
    {
      class: 'String',
      name: 'JavaVmName'
    },
    {
      class: 'String',
      name: 'JavaVmVersion'
    }
  ]
});
