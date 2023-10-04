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
      async: true,
      args: [
        { name: 'x',              type: 'Context' },
        { name: 'dao',            type: 'foam.dao.DAO' },
        { name: 'propertName',    type: 'String' }
      ]
    },
    {
      name: 'getRecords',
      type: 'HistoryRecord[]',
      async: true,
      args: [
        { name: 'x',              type: 'Context' },
        { name: 'dao',            type: 'foam.dao.DAO' },
        { name: 'propertName',    type: 'String' }
      ]
    }
  ]
});
