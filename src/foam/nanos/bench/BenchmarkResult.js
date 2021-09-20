/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'BenchmarkResult',

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
    }
  ]
});
