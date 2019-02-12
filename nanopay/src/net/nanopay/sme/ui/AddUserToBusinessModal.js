foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AddUserToBusinessModal',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'agentJunctionDAO',
    'businessInvitationDAO',
    'closeDialog',
    'notify',
    'user',
    'validateEmail'
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
      type: 'EMail',
      name: 'email',
      documentation: `The email address of the person to invite.`
    },
    {
      type: 'String',
      name: 'role',
      documentation: `This will determine the invitee's role in the business.`,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['admin', 'Admin'],
          ['approver', 'Approver'],
          ['employee', 'Employee']
        ]
      }
    },
    {
      type: 'Boolean',
      name: 'noChoice',
      value: false,
      documentation: `Set to true to hide the role selector.`
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Invite to ' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'ROLE_LABEL', message: 'Role' },
    { name: 'INVITATION_INTERNAL_SUCCESS', message: 'User successfully added to business.' },
    { name: 'INVITATION_EXTERNAL_SUCCESS', message: 'Invitation sent' },
    { name: 'INVITATION_ERROR', message: 'Something went wrong with adding the user.' },
    { name: 'INVALID_EMAIL', message: 'Invalid email address.' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('input-container')
          .start('h2').add(this.TITLE, this.user.businessName).addClass('medium-header').end()
          .start().addClass('input-wrapper')
            .hide(this.noChoice$)
            .start().addClass('input-label').add(this.ROLE_LABEL).end()
            .tag(this.ROLE)
          .end()
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.EMAIL_LABEL).end()
            .start(this.EMAIL).addClass('input-field').end()
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
        if ( ! this.validateEmail(this.email) ) {
          this.notify(this.INVALID_EMAIL, 'error');
          return;
        }
        var invitation = this.Invitation.create({
          group: this.role,
          createdBy: this.user.id,
          email: this.email
        });

        this.businessInvitationDAO
          .put(invitation)
          .then((resp) => {
            var message = resp.internal
              ? this.INVITATION_INTERNAL_SUCCESS
              : this.INVITATION_EXTERNAL_SUCCESS;
            this.notify(message);
            this.agentJunctionDAO.on.reset.pub();
            this.closeDialog();
          })
          .catch((err) => {
            var message = err ? err.message : this.INVITATION_ERROR;
            this.notify(message, 'error');
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
