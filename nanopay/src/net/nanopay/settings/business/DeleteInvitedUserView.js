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
    'user',
  ],

  properties: [
    'email',
    'junction',
    'clientJunctionDAO'
  ],

  methods: [
    async function deleteInvitedUser() {
      var self = this;

      this.dao.remove(self.data).then(function() {
        self.clientJunctionDAO.remove(self.junction).then(function() {
          ctrl.add(self.NotificationMessage.create({ message: self.SUCCESS_MSG, type: 'success' }));

        }).catch(function(err) {
            ctrl.add(self.NotificationMessage.create({ message: self.email + " " + message, type: 'error' }));
          })
      }).catch(function(err) {
        var message = err ? err.message : self.FAIL_MSG;
        ctrl.add(self.NotificationMessage.create({ message: self.email + " " + message, type: 'error' }));
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
