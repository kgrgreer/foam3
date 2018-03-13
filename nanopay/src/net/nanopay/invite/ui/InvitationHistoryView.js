foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invitation',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.invite.model.Invitation',
    'net.nanopay.invite.ui.InvitationHistoryItemView'
  ],

  imports: [
    'invitationHistoryDAO'
  ],

  properties: [
    'id',
    {
      name: 'data',
      factory: function () {
        return this.invitationHistoryDAO.where(this.EQ(this.Invitation.ID, this.id));
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
          data: this.invitationHistoryDAO,
          historyItemView: this.InvitationHistoryItemView.create()
        });
    }
  ]
});
