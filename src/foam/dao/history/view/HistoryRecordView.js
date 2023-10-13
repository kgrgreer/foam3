/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history.view',
  name: 'HistoryRecordView',
  extends: 'foam.u2.View',

  documentation: `
    A view for displaying history records for specifed object(record) id and specificied property.
    daoKey, objectId, and propertyName must be provided when creating a view

    e.g., if you want to display compliance history from user's history records for user with id 1111,
    do the following:

      {
        class: 'FObjectArray',
        of: 'foam.dao.history.HistoryRecord',
        name: 'complianceHistory',
        view: {
          class: 'foam.dao.history.view.HistoryRecordView',
          daoKey: 'userHistoryDAO',
          objectId: 1111,
          propertyName: 'compliance'
        }
      }
  `,

  imports: [
    'historyRecordService',
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Object',
      name: 'objectId'
    },
    {
      class: 'String',
      name: 'propertyName'
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.history.HistoryRecord',
      name: 'data'
    }
  ],

  methods: [
    async function render() {
      this.SUPER();
      
      if ( this.daoKey && this.objectId && this.propertyName ) {
        this.data = await this.historyRecordService.getRecordsById(null, this.daoKey, this.objectId, this.propertyName);
      }
      
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.view.ArrayView',
          data: this.data,
          valueView: {
            class: 'foam.dao.history.view.HistoryRecordCitationView',
            propertyName: this.propertyName
          }
        });
    }
  ]
});
