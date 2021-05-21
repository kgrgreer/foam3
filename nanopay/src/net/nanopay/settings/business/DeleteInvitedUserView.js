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
  package: 'net.nanopay.settings.business',
  name: 'DeleteInvitedUserView',
  extends: 'foam.u2.DeleteModal',

  documentation: 'View for deleting an invitation and user on userManagement table',

  requires: [
    'foam.log.LogLevel'
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
    { name: 'SUCCESS_MSG', message: 'Successfully deleted' }
  ],

  methods: [
    async function deleteInvitedUser() {
      var self = this;

      this.dao.remove(self.data).then(function() {
        self.clientJunctionDAO.remove(self.junction).then(function() {
          self.notify(self.SUCCESS_MSG, '', self.LogLevel.INFO, true);
        }).catch(function(err) {
          self.notify(self.email + ' ' + message, '', self.LogLevel.ERROR, true);
         })
      }).catch(function(err) {
        var message = err ? err.message : self.FAIL_MSG;
        self.notify(self.email + ' ' + message, '', self.LogLevel.ERROR, true);
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
