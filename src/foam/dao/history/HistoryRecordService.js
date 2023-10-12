/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao.history',
  name: 'HistoryRecordService',
  client: true,
  skeleton: true,

  methods: [
    {
      name: 'getRecord',
      type: 'HistoryRecord',
      documentation: `
        Returns the latest record that has 'propertyName' property update
      `,
      async: true,
      args: 'Context x, String daoKey, String propertyName'
    },
    {
      name: 'getRecordById',
      type: 'HistoryRecord',
      documentation: `
        Returns the latest record that has id as its objectId and has 'propertyName' property update
      `,
      async: true,
      args: 'Context x, String daoKey, Object id, String propertyName'
    },
    {
      name: 'getRecords',
      type: 'java.util.List<HistoryRecord>',
      documentation: `
        Returns all the records that have 'propertyName' property update
      `,
      async: true,
      args: 'Context x, String daoKey, String propertyName'
    },
    {
      name: 'getRecordsById',
      type: 'java.util.List<HistoryRecord>',
      documentation: `
        Returns all the records that have id as their objectId and have 'propertyName' property update
      `,
      async: true,
      args: 'Context x, String daoKey, Object id, String propertyName'
    }
  ]
});
