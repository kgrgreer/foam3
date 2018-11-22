foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AddUserModal',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.model.Invitation',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      margin: 50px;
      width: 400px;
    }
    ^ .net-nanopay-ui-ActionView-addUser {
      width: 100%;
      margin-top: 25px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
    }
  `,

  imports: [
    'businessInvitationDAO',
    'publicUserDAO',
    'user'
  ],

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
        .start('h2').add(this.TITLE, this.user.businessName).addClass('medium-header').end()
        .start().addClass('input-wrapper')
          .start().addClass('input-label').add(this.EMAIL_LABEL).end()
          .start(this.EMAIL).addClass('input-field').end()
        .end()
        .start().addClass('input-wrapper')
          .start().addClass('input-label').add(this.USER_GROUP_LABEL).end()
          .start(this.USER_GROUP).end()
        .end()
        .startContext({ data: this })
          .start(this.ADD_USER).end()
        .endContext();
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
        }).catch(function(err) {
          var message = err ? err.message : self.INVITATION_ERROR;
          ctrl.add(self.NotificationMessage.create({ message: message, type: 'error' }));
        });
      }
    }
  ]
});
