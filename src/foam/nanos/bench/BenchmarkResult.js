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

  tableColumns: [
    'name',
    'threads',
    'operationsST',
    'operationsS',
    'fail',
    'total',
    'created'
  ],

  ids: ['uid', 'run'],

  properties: [
    {
      class: 'String',
      name: 'uid',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'run',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'name',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'threads',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'operationsST',
      label: 'Operations/s/t',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'operationsS',
      label: 'Operations/s',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'pass',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'fail',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'total',
      visibility: 'RO'
    },
    {
      class: 'Map',
      name: 'extra',
      javaFactory: 'return new java.util.concurrent.ConcurrentHashMap();',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hostname',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'osName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'osArch',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'cores',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'usedMemoryGB',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'freeMemoryGB',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'totalMemoryGB',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'maxMemoryGB',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'javaFullversion',
      visibility: 'RO'
    }
  ]
});
