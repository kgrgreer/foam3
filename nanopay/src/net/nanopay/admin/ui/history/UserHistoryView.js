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
    ^ .net-nanopay-ui-ExpandContainer{
      width: 1240px
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
