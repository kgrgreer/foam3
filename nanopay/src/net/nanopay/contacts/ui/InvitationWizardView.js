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

  properties: [
    {
      class: 'Boolean',
      name: 'disableMenuMode',
      documentation: `Set to true when inviting a contact directly from
      contact controller.`,
      value: false
    }
  ],
  
  methods: [
    function initE() {
      var self = this;
      this.addClass('wizard');
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass('section-container')
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass('button-container')
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
        if ( this.disableMenuMode ) {
          X.closeDialog();
        }
        else if (X.subStack && X.subStack.depth > 1 ) {
          X.subStack.back();
        } else {
          X.pushMenu('sme.menu.toolbar');
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
            let message = e.message || this.INVITE_FAILURE;
            this.ctrl.add(this.NotificationMessage.create({
              message: message,
              type: 'error'
            }));
          });
      }
    }
  ]
});