foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AddUserToBusinessModal',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.auth.AgentJunctionStatus',
    'net.nanopay.model.ClientUserJunction',
    'net.nanopay.model.Invitation',
    'foam.u2.dialog.NotificationMessage'
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
    ^ .foam-u2-ActionView-closeModal {
      width: 60px;
      background: none !important;
      border: none !important;
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
    ^ .foam-u2-ActionView-closeModal:hover {
      width: 60px;
      background: none;
      color: #525455;
    }
    ^ .input-container {
      margin: 25px;
    }
    ^ input:not([type="checkbox"]) {
      width: 100%;
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
    },
    'dao'
  ],

  messages: [
    { name: 'TITLE', message: 'Invite to ' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'ROLE_LABEL', message: 'Role' },
    { name: 'INVITATION_SUCCESS', message: 'Invitation sent' },
    { name: 'INVITATION_ERROR', message: 'Something went wrong with adding the user.' },
    { name: 'INVALID_EMAIL', message: 'Invalid email address.' },
    { name: 'INVALID_EMAIL2', message: 'Sorry but the email you are trying to add is already a user within your business.' }
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
            .tag(this.EMAIL)
          .end()
        .end()
        .start().addClass('bottom-modal')
          .start().addClass('float-right')
            .startContext({ data: this })
              .tag(this.CLOSE_MODAL, { buttonStyle: 'TERTIARY' })
              .start(this.ADD_USER).addClass('sme').addClass('button').addClass('primary').end()
            .endContext()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'addUser',
      code: async function() {
        if ( ! this.validateEmail(this.email) ) {
          this.notify(this.INVALID_EMAIL, 'error');
          return;
        }

        // Disallow the adding of a user if they are currently already a user in the business.
        // dao is populated when this modal is called from UserManagementView.js
        if ( this.dao ) {
          var disallowUserAdditionReturnFromAddUser = false;
          var currentBusUserArray = (await this.dao.where(this.EQ(this.ClientUserJunction.STATUS, this.AgentJunctionStatus.ACTIVE)).select()).array;
          currentBusUserArray.forEach( (busUser) => {
            if ( foam.util.equals(busUser.email, this.email) ) {
              this.notify(this.INVALID_EMAIL2, 'error');
              disallowUserAdditionReturnFromAddUser = true;
              // only exits loop with return, due to nesting function
              return;
            }
          });
          if ( disallowUserAdditionReturnFromAddUser ) return;
        }

        var invitation = this.Invitation.create({
          group: this.role,
          createdBy: this.user.id,
          email: this.email
        });

        this.businessInvitationDAO
          .put(invitation)
          .then((resp) => {
            this.notify(this.INVITATION_SUCCESS);
            this.agentJunctionDAO.on.reset.pub();
            this.closeDialog();
          })
          .catch((err) => {
            this.notify(this.INVITATION_ERROR, 'error');
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
