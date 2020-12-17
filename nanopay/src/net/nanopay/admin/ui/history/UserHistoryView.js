/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.admin.ui.history',
  name: 'UserHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invitation',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.history.HistoryRecord',
    'net.nanopay.admin.ui.history.UserHistoryItemView',
    'net.nanopay.ui.ExpandContainer'
  ],

  imports: [
    'userHistoryDAO'
  ],

  css: `
    ^ .net-nanopay-ui-ExpandContainer {
      width: 1240px;
    }
    ^ .expand-Container {
      margin: 0;
      padding-top: 20px;
    }
  `,

  properties: [
    'id',
    {
      name: 'data',
      expression: function (id) {
        return this.userHistoryDAO
          .where(this.EQ(this.HistoryRecord.OBJECT_ID, this.id))
          .orderBy(this.HistoryRecord.TIMESTAMP);
      }
    }
  ],

  methods: [
    function initE() {
      var userHistoryContainer = this.ExpandContainer.create({ title: 'Profile History' });

      this
        .addClass(this.myClass())
        .start(userHistoryContainer)
          .tag({
            class: 'foam.u2.history.HistoryView',
            title: '',
            data: this.data,
            historyItemView: this.UserHistoryItemView.create()
          })
        .end();
    }
  ]
});
