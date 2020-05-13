foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'DeleteInvitedUserView',
  extends: 'foam.u2.DeleteModal',

  documentation: 'View for deleting an invitation and user on userManagement table',

  requires: [
    'foam.u2.dialog.NotificationMessage',
  ],

  imports: [
    'agentJunctionDAO',
    'businessInvitationDAO',
    'notify',
    'user',
  ],

  properties: [
    'email',
    'junction',
    'clientJunctionDAO'
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Successfully deleted.' }
  ],

  methods: [
    async function deleteInvitedUser() {
      var self = this;

      this.dao.remove(self.data).then(function() {
        self.clientJunctionDAO.remove(self.junction).then(function() {
          self.notify(self.SUCCESS_MSG, 'success')
        }).catch(function(err) {
          self.notify(self.email + " " + message, 'error');
         })
      }).catch(function(err) {
        var message = err ? err.message : self.FAIL_MSG;
        self.notify(self.email + " " + message, 'error');
      });
    }
  ],

  actions: [
    {
      name: 'delete',
      label: 'Delete',
      code: function(X) {
        this.deleteInvitedUser();
        X.closeDialog();
      }
    }
  ]
});
