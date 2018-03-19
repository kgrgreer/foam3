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
    'net.nanopay.admin.ui.history.UserHistoryItemView'
  ],

  imports: [
    'userHistoryDAO'
  ],

  properties: [
    'id',
    {
      name: 'data',
      expression: function (id) {
        return this.userHistoryDAO.where(this.EQ(this.HistoryRecord.OBJECT_ID, this.id));
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.history.HistoryView',
          title: 'Profile History',
          data: this.data,
          historyItemView: this.UserHistoryItemView.create()
        });
    }
  ]
});
