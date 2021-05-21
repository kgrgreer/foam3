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
  name: 'UserManagementView',
  extends: 'foam.u2.View',
  documentation: 'View that users can use to manage its staff or users that have access to them.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.log.LogLevel',
    'foam.nanos.auth.UserUserJunction',
    'foam.u2.dialog.Popup',
    'foam.u2.ConfirmationModal',
    'foam.nanos.auth.AgentJunctionStatus',
    'net.nanopay.model.ClientUserJunction',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  imports: [
    'notify',
    'subject',
    'agentJunctionDAO',
    'businessInvitationDAO'
  ],

  exports: [
    'clientJunctionDAO'
  ],

  css: `
    ^ {
      max-width: 1025px;
    }

    ^actions {
      display: flex;
      justify-content: flex-end;
      padding-bottom: 8px;
    }
  `,

  properties: [
    {
      name: 'clientJunctionDAO',
      documentation: `Agent Junction DAO storing presentable junction objects.`,
      factory: function() {
        return this.EasyDAO.create({
          of: 'net.nanopay.model.ClientUserJunction',
          daoType: 'MDAO',
          seqNo: true
        }).orderBy(this.ClientUserJunction.STATUS);
      }
    }
  ],

  messages: [
    {
      name: 'PLACEHOLDER_TEXT',
      message: `You don't have any users part of your business. Click the Add
        a user button to add a new user to your business.`
    },
    { name: 'DISABLED_SUCCESS', message: ' successfully disabled' },
    { name: 'DISABLED_FAILURE', message: 'Failed to disable ' },
    { name: 'ACTIVE_SUCCESS', message: ' successfully enabled' },
    { name: 'ACTIVE_FAILURE', message: 'Failed to enable ' },
    { name: 'DELETE_FAILURE', message: 'Failed to delete ' },
    { name: 'INVITE', message: 'invite' },
    { name: 'INVITATION_SUCCESS', message: 'Invitation resent' },
    { name: 'INVITATION_FAILURE', message: 'Failed to resent invitation' }
  ],

  methods: [
    function initE() {
      var self = this;

      this.agentJunctionDAO.on.sub(this.updateDAO);
      this.updateDAO();

      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('actions'))
          .startContext({ data: this })
            .start(this.ADD_USER).end()
          .endContext()
        .end()
        .tag({
          class: 'foam.u2.view.ScrollTableView',
          data$: this.clientJunctionDAO$,
          editColumnsEnabled: false,
          contextMenuActions: [
            foam.core.Action.create({
              name: 'changeAccessControl',
              isAvailable: function() {
                return (this.status === self.AgentJunctionStatus.ACTIVE || this.status === self.AgentJunctionStatus.INVITED) && self.subject.realUser.id != this.sourceId;
              },
              code: function(X) {
                var junction = this;

                ctrl.add(self.Popup.create().tag({
                  class: 'net.nanopay.settings.business.AccessControlModal',
                  dao: self.clientJunctionDAO,
                  junction: junction
                }));
              }
            }),
            foam.core.Action.create({
              name: 'deactivateAccount',
              isAvailable: function() {
                return this.status === self.AgentJunctionStatus.ACTIVE && self.subject.realUser.id != this.sourceId;
              },
              confirmationView: function(_, X) {
                return {class: 'foam.u2.ConfirmationModal'};
              },
              code: function(X) {
                // Disable user junction.
                var junction = this;
                this.agentJunctionObj.status = self.AgentJunctionStatus.DISABLED;
                self.agentJunctionDAO.put(this.agentJunctionObj).then(function(resp) {
                  self.notify(junction.name + self.DISABLED_SUCCESS, '', self.LogLevel.INFO, true);
                }).catch(function(err) {
                  var message = err ? err.message : self.DISABLED_FAILURE;
                  self.notify(message + junction.name, '', self.LogLevel.ERROR, true);
                });
              }
            }),
            foam.core.Action.create({
              name: 'activateAccount',
              isAvailable: function() {
                return this.status === self.AgentJunctionStatus.DISABLED && self.subject.realUser.id != this.sourceId;
              },
              code: function(X) {
                // Enable user junction.
                var junction = this;
                this.agentJunctionObj.status = self.AgentJunctionStatus.ACTIVE;
                self.agentJunctionDAO.put(this.agentJunctionObj).then(function(resp) {
                  self.notify(`${ junction.name + self.ACTIVE_SUCCESS }`, '', self.LogLevel.INFO, true);
                }).catch(function(err) {
                  var message = err ? err.message : self.ACTIVE_FAILURE;
                  self.notify(`${ message + junction.name }`, '', self.LogLevel.ERROR, true);
                });
              }
            }),
            foam.core.Action.create({
              name: 'resendInvitation',
              isAvailable: function() {
                return this.status === self.AgentJunctionStatus.INVITED && self.subject.realUser.id != this.sourceId;
              },
              code: function(X) {
                var junction = this;
                var email = this.email;

                self.businessInvitationDAO
                  .where(
                    self.AND(
                      self.EQ(self.Invitation.EMAIL, email),
                      self.EQ(self.Invitation.STATUS, self.InvitationStatus.SENT),
                      self.EQ(self.Invitation.CREATED_BY, self.subject.user.id)
                    )
                  ).select().then(function(invite) {
                      invite.array[0].isRequiredResend = true;
                      self.businessInvitationDAO.put(invite.array[0]).then((resp) => {
                      self.notify(`${ self.INVITATION_SUCCESS }`, 'success');
                    }).catch((err) => {
                      var message = err ? err.message : self.INVITATION_FAILURE;
                      self.notify(`${ message }`, 'error');
                    })
                  });
              }
            }),
            foam.core.Action.create({
              name: 'revokeInvitation',
              isAvailable: function() {
                return this.status === self.AgentJunctionStatus.INVITED && self.subject.realUser.id != this.sourceId;
              },
              code: function(X) {
                var junction = this;
                var email = this.email;

                self.businessInvitationDAO
                  .where(
                    self.AND(
                      self.EQ(self.Invitation.EMAIL, email),
                      self.EQ(self.Invitation.STATUS, self.InvitationStatus.SENT),
                      self.EQ(self.Invitation.CREATED_BY, self.subject.user.id)
                    )
                  ).select().then(function(invite) {
                    ctrl.add(self.Popup.create().tag({
                      class: 'net.nanopay.settings.business.DeleteInvitedUserView',
                      dao: self.businessInvitationDAO,
                      data: invite.array[0],
                      email: email,
                      junction: junction,
                      clientJunctionDAO: self.clientJunctionDAO,
                      label: self.INVITE
                    }))
                  });
              }
            })
          ]
        })
        .tag({
          class: 'net.nanopay.ui.Placeholder',
          dao: this.clientJunctionDAO,
          message: this.PLACEHOLDER_TEXT,
          image: 'images/member-plus.png'
        });
    }
  ],

  listeners: [
    function updateDAO() {
      var self = this;

      // Populate the clientJunctionDAO with all the agents this.subject.user is related to.
      var agentJunctionDAO = this.agentJunctionDAO.where(this.EQ(this.UserUserJunction.TARGET_ID, this.subject.user.id));
      this.clientJunctionDAO.removeAll();

      agentJunctionDAO.select({
        put: function(junction) {
          junction = self.ClientUserJunction.create({
            name: junction.partnerInfo ? junction.partnerInfo.firstName + ' ' + junction.partnerInfo.lastName : '',
            email: junction.partnerInfo ? junction.partnerInfo.email : '',
            sourceId: junction.sourceId,
            targetId: junction.targetId,
            group: junction.group,
            status: junction.status,
            agentJunctionObj: junction
          });
          self.clientJunctionDAO.put(junction);
        }
      });

      this.businessInvitationDAO
        .where(
          this.AND(
            this.EQ(this.Invitation.CREATED_BY, this.subject.user.id),
            this.EQ(this.Invitation.STATUS, this.InvitationStatus.SENT)
          )
        )
        .select({
          put: (invite) => {
            this.clientJunctionDAO.put(this.ClientUserJunction.create({
              email: invite.email,
              group: invite.group,
              status: this.AgentJunctionStatus.INVITED,

              // This will be populated when the user signs up.
              name: invite.invitee
                ? invite.invitee.firstName + ' ' + invite.invitee.lastName
                : ''
            }));
          }
        });
    }
  ],

  actions: [
    {
      name: 'addUser',
      code: function() {
        // Add add user flow
        ctrl.add(this.Popup.create().tag({
          class: 'net.nanopay.settings.business.AccessControlModal',
          dao: this.clientJunctionDAO,
          isAddUser: true
        }));
      }
    }
  ]
});
