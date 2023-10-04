/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao.history',
  name: 'HistoryRecordService',

  skeleton: true,

  methods: [
    {
      name: 'getRecord',
      type: 'HistoryRecord',
      documentation: `
        Returns the latest record that has 'propertyName' property update
      `,
      async: true,
      args: 'Context x, foam.dao.DAO dao, String propertyName'
    },
    {
      name: 'getRecords',
      type: 'HistoryRecord[]',
      documentation: `
        Returns all the records that have 'propertyName' property update
      `,
      async: true,
      args: 'Context x, foam.dao.DAO dao, String propertyName'
    }
  ]
});
