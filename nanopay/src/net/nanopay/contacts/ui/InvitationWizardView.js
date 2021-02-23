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
  package: 'net.nanopay.contacts.ui',
  name: 'InvitationWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: `
    Lets the user invite an external user to the platform. Doesn't add a contact.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'pushMenu',
    'ctrl',
    'contactService',
    'invitationDAO',
    'notify',
    'user',
    'userDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User'
  ],

  messages: [
    {
      name: 'INVITE_SUCCESS',
      message: 'Sent a request to connect'
    },
    {
      name: 'INVITE_FAILURE',
      message: 'There was a problem sending the invitation'
    },
    {
      name: 'EXISTING_BUSINESS',
      message: `This email has already been registered on Ablii.
                You can set up a connection with this user and their business by using their payment code or
                finding them in the search business menu when adding a contact.
               `
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isEdit',
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
        if ( this.isEdit ) {
          X.closeDialog();
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
        var isExisting = await this.contactService.checkExistingContact(this, this.data.email, this.data.isContact);

        if ( ! isExisting ) {
          this.invitationDAO
            .put(this.data)
            .then(() => {
              X.notify(this.INVITE_SUCCESS, '', this.LogLevel.INFO, true);
              // Force the view to update.
              this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
              X.closeDialog();
            })
            .catch((e) => {
              let message = e.message || this.INVITE_FAILURE;
              X.notify(message, '', this.LogLevel.ERROR, true);
            });
        } else {
          X.notify(this.EXISTING_BUSINESS, '', this.LogLevel.WARN, true);
        }
      }
    }
  ]
});
