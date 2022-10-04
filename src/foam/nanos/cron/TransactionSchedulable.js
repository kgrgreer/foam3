/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'TransactionSchedulable',
  extends: 'foam.nanos.cron.Schedulable',

  tableColumns: [
    'name',
//    'amount',
    'frequency',
    'startDate',
    'lastRun',
    'lifeCycleState'
  ],

  properties: [
    {
      name: 'objectToSchedule',
      createVisibility: 'HIDDEN',
      postSet: function (_,v) {
        if ( ! v ) return;
        this.denomination = v.destinationCurrency;
        this.amount = v.sourceAmount;
      }
    },
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      class: 'UnitValue',
      name: 'amount',
      unitPropName: 'denomination',
      createVisibility: 'HIDDEN',
      transient: true
    }
  ]
});
