/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryRecordServiceClient',

  implements: [
    'foam.dao.history.HistoryRecordService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.history.HistoryRecordService',
      name: 'delegate'
    }
  ]
});
