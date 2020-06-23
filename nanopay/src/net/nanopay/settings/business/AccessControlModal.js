foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'AccessControlModal',
  extends: 'foam.u2.View',

  documentation: `
    assign approval authority to multiple users based on the structure of the business.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.UserUserJunction',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.auth.AgentJunctionStatus',
    'net.nanopay.model.ClientUserJunction',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'agentJunctionDAO',
    'businessInvitationDAO',
    'closeDialog',
    'notify',
    'subject',
    'user',
    'validateEmail'
  ],

  css: `
    ^ {
      width: 650px;
      height: 745px;
    }
    ^ .title {
      margin: 24px;
      font-size: 30px;
      font-weight: 900;
    }
    ^ .subTitle {
      margin: 24px;
      font-size: 18px;
      color: #8e9090;
      margin-top: -8px;
    }
    ^ .main {
      margin: 24px;
    }
    ^ .button-container {
      width: 650px;
      justify-content: flex-end;
      align-items: center;
      display: flex;
      height: 84px;
      background-color: #fafafa;
      position: fixed;
      bottom: 0;
      position: absolute;
      margin: 0;
    }
    ^ .button-container > div > button {
      font-size: 18px;
      margin: 0px 20px 0px 15px;
      height: 45;
      width: 110;
    }
    table {
      margin: 24px 32px -10px 32px;
      border-collapse: separate;
      border-spacing: 5px 18px;
    }
    tr:hover {
      outline: 2px solid #937dff;
    }
    tr {
      border-radius: 4px;
      -webkit-box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, .2);
    }
    td {
      padding-bottom: 15px;
      padding-top: 15px;
      padding-left: 3px;
      padding-left: 8px;
      padding-right: 8px;
    }
    ^ .labelStyle {
      font-weight: 900;
      font-size: 20px;
      margin-top: 10px;
    }
    ^ .labelDescriptionStyle {
      font-size: 17px;
      color: #9ba1a6;
      margin-top: 10px;
    }
    ^ .emailStyle {
       margin-left: 32px;
       width: 92%;
    }
    ^ .emailStyle .foam-u2-TextField {
      width: 98%;
      margin-top: 10px;
    }
    ^ .input-wrapper {
      font-size: 18;
    }
  `,

  messages: [
    {
      name: 'TITLE_1', message: 'Change '
    },
    {
      name: 'TITLE_2', message: '\'s access control'
    },
    {
      name: 'SUB_TITLE_1', message: 'Choose what access control '
    },
    {
      name: 'SUB_TITLE_2', message: ' will have in nanopay Corporation.'
    },
    {
      name: 'ADMIN', message: 'Admin'
    },
    {
      name: 'ADMIN_DESCRIPTION',
      message: 'Admin is a single user who holds the highest level of permissions. Only this person can manage all users and deactivate company account or transfer Admin access to someone else.'
    },
    {
      name: 'APPROVER', message: 'Approver'
    },
    {
      name: 'APPROVER_DESCRIPTION',
      message: 'There can be multiple Approvers, Approvers have the same level of permissions as the Admin, except they can\'t manage the Admin access or deactivate company account.'
    },
    {
      name: 'EMPLOYEE', message: 'Employee'
    },
    {
      name: 'EMPLOYEE_DESCRIPTION',
      message: 'Employees are the people in your company. They can create invoices and initiate payments, but they require the approvals from the Approvers or Admin.'
    },
    {
      name: 'ACCESS_CONTROL_CHANGE_SUCCESS', message: 'Access control successfully changed'
    },
    {
      name: 'ACCESS_CONTROL_CHANGE_FAILURE', message: 'Failed to change access control : '
    },
    {
      name: 'ACCESS_CONTROL_CHANGE_ERROR', message: 'Please select a different access control.'
    },
    { name: 'INVITE_TITLE', message: 'Invite to ' },
    { name: 'THE_USER', message: 'the user' },
    { name: 'EMAIL_LABEL', message: 'Email'},
    { name: 'INVITATION_SUCCESS', message: 'Invitation sent' },
    { name: 'INVITATION_ERROR', message: 'Something went wrong with adding the user.' },
    { name: 'INVALID_EMAIL', message: 'Invalid email address.' },
    { name: 'INVALID_EMAIL2', message: 'Sorry but the email you are trying to add is already a user within your business.' },
    { name: 'INVALID_ACCESS_CONTROL', message: 'Please select an access control' }
  ],

  properties: [
    {
      name: 'accessControlValue',
      factory: function() { return [
               ['admin', this.ADMIN, this.ADMIN_DESCRIPTION],
               ['approver', this.APPROVER, this.APPROVER_DESCRIPTION],
               ['employee', this.EMPLOYEE, this.EMPLOYEE_DESCRIPTION],
             ];
       }
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: `The email address of the person to invite.`
    },
    {
      class: 'Boolean',
      name: 'isAddUser',
      value: false,
      documentation: `flag to distinguish if the addUser is called (Invite user to business)`
    },
    'accessControl',
    'dao',
    'junction'
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      // set default accessControl
      if ( self.junction && self.junction.accessControl )
        self.accessControl = self.junction.accessControl.toLowerCase();
      else
        self.accessControl = 'employee';


      this.addClass(this.myClass())
        .start()
          .start('h2').addClass('title')
            .add(this.isAddUser ? this.INVITE_TITLE : this.TITLE_1).add(this.isAddUser ? this.subject.user.toSummary(): this.subject.realUser.toSummary()).add(this.isAddUser ? '' : this.TITLE_2)
          .end()
          .start('p').addClass('subTitle')
             .add(this.SUB_TITLE_1).add(this.isAddUser ? this.THE_USER : this.subject.realUser.toSummary()).add(this.SUB_TITLE_2)
          .end()
          .start('table')
            .add(this.accessControlValue.map(function(ac) {
              return self.E('div')
                .start('tr')
                  .start('td')
                    .start('input')
                      .attrs({
                         type: 'radio',
                         name: 'accessControl',
                         value: ac[0],
                         checked: self.slot(function (data, accessControl) { return data === ac[0] || accessControl === ac[0]; })
                       })
                    .end()
                  .end()
                  .start('td')
                    .start('div').addClass('labelStyle')
                      .start('label')
                        .start('span')
                          .add(ac[1])
                        .end()
                      .end()
                    .end()
                   .start('div').addClass('labelDescriptionStyle')
                     .start('span')
                       .add(ac[2])
                     .end()
                   .end()
                  .end()
                   .on('click', function(evt) {
                      self.data = ac[0];
                      self.accessControl = ac[0];
                    })
                .end()
              }))
          .end()
          .startContext({ data: this })
            .start().addClass('emailStyle').show(this.isAddUser$)
              .start().addClass('input-wrapper').add(this.EMAIL_LABEL).end()
              .tag(this.EMAIL)
            .end()
          .endContext()
          .startContext({ data: this })
            .start().addClass('button-container')
              .start()
                .tag(this.CANCEL, { size: 'LARGE', buttonStyle: 'TERTIARY' })
              .end()
              .start().addClass(this.myClass('button-sub-container'))
                .tag(this.SAVE, {
                   size: 'LARGE',
                   label$: this.isAddUser$.map((flag) => flag ? 'Add User' : 'Save')
                 })
              .end()
            .end()
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(isAddUser, email) {
        if ( isAddUser) {
          return email ? true : false;
        } else {
          return true;
        }
      },
      code: async function(X) {
        var self = this;

        if ( ! this.accessControl ) {
          this.notify(this.INVALID_ACCESS_CONTROL, 'error');
          return;
        }

        var newAccessControl = self.accessControl.charAt(0).toUpperCase() + self.accessControl.slice(1);

        if ( ! self.isAddUser ) {
          if ( newAccessControl === self.junction.accessControl ) {
            this.notify(`${ this.ACCESS_CONTROL_CHANGE_ERROR }`, 'error');
            return;
          }

          if ( this.dao ) {
            this.dao.where(
              self.AND(
                  self.EQ(this.ClientUserJunction.EMAIL, self.junction.email),
                  self.OR(
                    self.EQ(this.ClientUserJunction.STATUS, this.AgentJunctionStatus.ACTIVE),
                    self.EQ(this.ClientUserJunction.STATUS, this.AgentJunctionStatus.INVITED)
                  )
                )
              ).select().then(function(cj) {
                cj.array[0].accessControl = newAccessControl;
                self.dao.put(cj.array[0]).then(function() {
                  if (cj.array[0].status === self.AgentJunctionStatus.INVITED ) {
                    //resend an invitation with a new group
                    var invitation = self.Invitation.create({
                      group: self.accessControl,
                      createdBy: self.user.id,
                      email: self.junction.email,
                      isRequiredResend: true
                    });

                    self.businessInvitationDAO
                      .put(invitation)
                      .then(function(resp) {
                        self.notify(self.ACCESS_CONTROL_CHANGE_SUCCESS);
                        self.agentJunctionDAO.on.reset.pub();
                      }).catch((err) => {
                        self.notify(`${ self.ACCESS_CONTROL_CHANGE_FAILURE } ${ err.message }`, 'error');
                      });
                  } else { // AgentJunctionStatus.ACTIVE
                    self.agentJunctionDAO
                      .where(self.AND(
                          self.EQ(self.UserUserJunction.TARGET_ID, self.user.id),
                          self.EQ(self.UserUserJunction.SOURCE_ID, self.junction.sourceId),
                        )
                     ).select().then(function(aj) {
                      aj.array[0].group = `${ self.user.businessPermissionId }.${ self.accessControl }`;

                      self.agentJunctionDAO.put(aj.array[0]).then(function() {
                        self.notify(self.ACCESS_CONTROL_CHANGE_SUCCESS);
                      }).catch((err) => {
                        self.notify(`${ self.ACCESS_CONTROL_CHANGE_FAILURE } ${ err.message }`, 'error');
                      })
                     }).catch((err) => {
                        self.notify(`${ self.ACCESS_CONTROL_CHANGE_FAILURE } ${ err.message }`, 'error');
                     })
                  }
                 });
                }).catch((err) => {
                  self.notify(`${ self.ACCESS_CONTROL_CHANGE_FAILURE } ${ err.message }`, 'error');
                });

               X.closeDialog();
            }
        } else { // isAddUser
          if ( ! this.validateEmail(self.email) ) {
            self.notify(self.INVALID_EMAIL, 'error');
            return;
          }

          // Disallow the adding of a user if they are currently already a user in the business.
          // dao is populated when this modal is called from UserManagementView.js
          if ( self.dao ) {
            var disallowUserAdditionReturnFromAddUser = false;
            var currentBusUserArray = (await self.dao.where(self.EQ(self.ClientUserJunction.STATUS, self.AgentJunctionStatus.ACTIVE)).select()).array;
            currentBusUserArray.forEach( (busUser) => {
              if ( foam.util.equals(busUser.email, self.email) ) {
                this.notify(this.INVALID_EMAIL2, 'error');
                disallowUserAdditionReturnFromAddUser = true;
                // only exits loop with return, due to nesting function
                return;
              }
            });
            if ( disallowUserAdditionReturnFromAddUser ) return;
          }

          var invitation = this.Invitation.create({
            group: self.accessControl,
            createdBy: this.subject.user.id,
            email: self.email
          });

          this.businessInvitationDAO
            .put(invitation)
            .then((resp) => {
              this.notify(this.INVITATION_SUCCESS);
              this.agentJunctionDAO.on.reset.pub();
              this.closeDialog();
            })
            .catch((err) => {
              this.notify(`${ this.INVITATION_ERROR } ${ err.message }`, 'error');
            });
        }
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
