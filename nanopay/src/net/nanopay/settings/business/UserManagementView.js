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
    'foam.nanos.auth.UserUserJunction',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.auth.AgentJunctionStatus',
    'net.nanopay.model.ClientUserJunction',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  imports: [
    'agent',
    'agentJunctionDAO',
    'businessInvitationDAO',
    'user'
  ],

  css: `
    ^ {
      margin: auto;
    }
    ^ .foam-u2-view-TableView-net-nanopay-model-ClientUserJunction {
      width: 100% !important;
    }
    ^ table {
      width: 100% !important;
    }
    ^ .net-nanopay-ui-ActionView-addUser {
      float: right;
      margin-bottom: 10px;
      margin-right: 50px;
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
    { name: 'ACTIVE_FAILURE', message: 'Failed to enable ' }
  ],

  methods: [
    function initE() {
      var self = this;

      this.agentJunctionDAO.on.sub(this.updateDAO);
      this.updateDAO();

      this.addClass(this.myClass())
        .startContext({ data: this })
          .start(this.ADD_USER).end()
        .endContext()
        .tag({
          class: 'foam.u2.view.ScrollTableView',
          data$: this.clientJunctionDAO$,
          editColumnsEnabled: false,
          contextMenuActions: [
            foam.core.Action.create({
              name: 'disableUser',
              isEnabled: function() {
                return this.status === self.AgentJunctionStatus.ACTIVE && self.agent.id != this.sourceId;
              },
              code: function(X) {
                // Disable user junction.
                var junction = this;
                this.agentJunctionObj.status = self.AgentJunctionStatus.DISABLED;
                self.agentJunctionDAO.put(this.agentJunctionObj).then(function(resp) {
                  ctrl.add(self.NotificationMessage.create({ message: junction.name + self.DISABLED_SUCCESS }));
                }).catch(function(err) {
                  var message = err ? err.message : self.DISABLED_FAILURE;
                  ctrl.add(self.NotificationMessage.create({ message: message + junction.name, type: 'error' }));
                });
              }
            }),
            foam.core.Action.create({
              name: 'enableUser',
              isEnabled: function() {
                return this.status === self.AgentJunctionStatus.DISABLED && self.agent.id != this.sourceId;
              },
              code: function(X) {
                // Enable user junction.
                var junction = this;
                this.agentJunctionObj.status = self.AgentJunctionStatus.ACTIVE;
                self.agentJunctionDAO.put(this.agentJunctionObj).then(function(resp) {
                  ctrl.add(self.NotificationMessage.create({ message: junction.name + self.ACTIVE_SUCCESS }));
                }).catch(function(err) {
                  var message = err ? err.message : self.ACTIVE_FAILURE;
                  ctrl.add(self.NotificationMessage.create({ message: message + junction.name, type: 'error' }));
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
      // Populate the clientJunctionDAO with all the agents this.user is related to.
      var agentJunctionDAO = this.agentJunctionDAO.where(this.EQ(this.UserUserJunction.TARGET_ID, this.user.id));
      this.clientJunctionDAO.removeAll();
      
      agentJunctionDAO.select({
        put: function(junction) {
          junction = self.ClientUserJunction.create({
            name: junction.partnerInfo.firstName + ' ' + junction.partnerInfo.lastName,
            email: junction.partnerInfo.email,
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
            this.EQ(this.Invitation.CREATED_BY, this.user.id),
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
          class: 'net.nanopay.sme.ui.AddUserToBusinessModal',
          dao: this.clientJunctionDAO
        }));
      }
    }
  ]
});
