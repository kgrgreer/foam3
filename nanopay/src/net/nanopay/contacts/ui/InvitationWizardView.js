foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'InvitationWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: `
    Lets the user invite an external user to the platform. Doesn't add a contact.
  `,

  imports: [
    'pushMenu',
    'ctrl',
    'invitationDAO',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^section-container {
      padding: 24px 24px 32px;
    }
    .foam-u2-tag-Input {
      width: 100%;
    }
    ^button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back {
      color: #604aff;
      padding: 0;
      margin: 32px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back:hover {
      color: #4d38e1;
    }
  `,

  messages: [
    {
      name: 'INVITE_SUCCESS',
      message: 'Sent a request to connect.'
    },
    {
      name: 'INVITE_FAILURE',
      message: 'There was a problem sending the invitation.'
    }
  ],
  
  methods: [
    function initE() {
      var self = this;

      this.addClass(this.myClass());
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass(self.myClass('section-container'))
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass(this.myClass('button-container'))
              .tag(this.BACK, { buttonStyle: 'TERTIARY' })
              .start(this.NEXT).end()
            .end()
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        if (X.subStack && X.subStack.depth > 1 ) {
          X.subStack.back();
        } else {
          //How do i get back to MenuToolBar??
          X.pushMenu('sme.main.contacts');
          X.closeDialog();
        }
      }
    },
    {
      name: 'next',
      label: 'Send Invitation',
      isEnabled: function(data$errors_, nextIndex) {
        return ! data$errors_ && nextIndex === -1;
      },
      code: async function(X) {
        this.data.createdBy = this.user.id;
        this.invitationDAO
          .put(this.data.clone())
          .then(() => {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.INVITE_SUCCESS,
            }));
            // Force the view to update.
            this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
            X.closeDialog();
          })
          .catch((e) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.INVITE_FAILURE,
              type: 'error'
            }));
          });
      }
    }
  ]
});