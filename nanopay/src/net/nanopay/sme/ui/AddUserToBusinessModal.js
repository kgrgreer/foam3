foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AddUserToBusinessModal',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.model.Invitation',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'agentJunctionDAO',
    'businessInvitationDAO',
    'closeDialog',
    'publicUserDAO',
    'user'
  ],

  css: `
    ^ {
      width: 500px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
    }
    ^ .net-nanopay-ui-ActionView-closeModal {
      width: 60px;
      background: none;
      color: #525455;
      font-size: 16px;
      margin-right: 25px;
    }
    ^ .bottom-modal {
      float: right;
      width: 100%;
      height: 65px;
      padding-right: 25px;
      padding-top: 25px;
      background: #fafafa;
    }
    ^ .net-nanopay-ui-ActionView-closeModal:hover {
      width: 60px;
      background: none;
      color: #525455;
    }
    ^ .input-container {
      margin: 25px;
    }
    ^ .button {
      width: 100px;
      font-size: 14px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name: 'userGroup',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Admin',
          'Approver',
          'Employee'
        ]
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Add a User to ' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'USER_GROUP_LABEL', message: 'User permission' },
    { name: 'INVITATION_INTERNAL_SUCCESS', message: 'User successfully added to business.' },
    { name: 'INVITATION_EXTERNAL_SUCCESS', message: 'User invitation sent to join business.' },
    { name: 'INVITATION_ERROR', message: 'Something went wrong with adding the user.' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('input-container')
          .start('h2').add(this.TITLE, this.user.businessName).addClass('medium-header').end()
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.EMAIL_LABEL).end()
            .start(this.EMAIL).addClass('input-field').end()
          .end()
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.USER_GROUP_LABEL).end()
            .start(this.USER_GROUP).end()
          .end()
        .end()
        .start().addClass('bottom-modal')
          .start().addClass('float-right')
            .startContext({ data: this })
              .start(this.CLOSE_MODAL).end()
              .start(this.ADD_USER).addClass('sme').addClass('button').addClass('primary').end()
            .endContext()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'addUser',
      code: function() {
        var self = this;
        // Create invitation
        var userGroup = this.userGroup.toLowerCase();

        var invitation = this.Invitation.create({
          group: userGroup,
          createdBy: this.user.id,
          email: this.email
        });

        this.businessInvitationDAO.put(invitation).then(function(resp) {
          var message = resp.internal ? self.INVITATION_INTERNAL_SUCCESS : self.INVITATION_EXTERNAL_SUCCESS;
          ctrl.add(self.NotificationMessage.create({ message: message }));
          self.agentJunctionDAO.on.reset.pub();
          self.closeDialog();
        }).catch(function(err) {
          var message = err ? err.message : self.INVITATION_ERROR;
          ctrl.add(self.NotificationMessage.create({ message: message, type: 'error' }));
        });
      }
    },
    {
      name: 'closeModal',
      label: 'Cancel',
      code: function() {
        this.closeDialog();
      }
    }
  ]
});
