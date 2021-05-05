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
  name: 'ContactWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: 'Lets the user create a contact from scratch.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation',
    'foam.layout.Section',
    'foam.nanos.menu.Menu'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'ctrl',
    'contactService',
    'invitationDAO',
    'pushMenu',
    'menuDAO',
    'subject'
  ],

  css: `
    ^ {
      box-sizing: border-box;
      width: 600px;
      padding: 30px;
      max-height: 570px;
      overflow-y: auto;
    }
    ^left-button-container {
      width: 200px;
      display: flex;
      justify-content: flex-start;
    }
    ^option {
      margin-left: 15px;
    }
    ^step-indicator {
      margin-right: 150px;
    }
    .property-rbiLink {
      margin-top: -33px;
      top: 50px;
      position: relative;
      float: right;
    }
    ^ .button-container-wrapper {
      position: relative;
      width: 600px;
      right: 30px;
      top: 30px;
    }
    ^ .button-container {
      padding: 0 30px;
    }

    .wizard {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    .section-container {
      padding: 24px 24px 32px;
      max-height: 570px;
      overflow-y: scroll;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
  `,

  messages: [
    { name: 'EDIT_STEP_ONE_TITLE', message: 'Edit contact' },
    { name: 'EDIT_STEP_TWO_TITLE', message: 'Edit banking information' },
    { name: 'EDIT_STEP_THREE_TITLE', message: 'Edit business address' },
    { name: 'STEP', message: 'Step' },
    { name: 'OF_MSG', message: 'of' },
    { name: 'CONTACT_ADDED', message: 'Contact added successfully' },
    { name: 'CONTACT_EDITED', message: 'Contact edited' },
    { name: 'INVITE_SUCCESS', message: 'Sent a request to connect' },
    { name: 'CONTACT_ADDED_INVITE_SUCCESS', message: 'Contact added successfully. An email invitation was sent.' },
    { name: 'CONTACT_ADDED_INVITE_FAILURE', message: 'Contact added successfully. An email invitation could not be sent.' },
    { name: 'ACCOUNT_CREATION_ERROR', message: 'Failed to add an account' },
    {
      name: 'EXISTING_BUSINESS',
      message: `This email has already been registered on Ablii.
                You can set up a connection with this user and their business by using their payment code or
                finding them in the search business menu when adding a contact.
               `
    },
    { name: 'GENERIC_PUT_FAILED', message: 'Failed to add an account.' },
    { name: 'SECTION_ONE_TITLE', message: 'Add Contact' },
    { name: 'SECTION_TWO_TITLE', message: 'Add Bank Account' },
    { name: 'SECTION_TWO_SUBTITLE', message: 'Enter the contact’s bank account information.  Please make sure that this is accurate as payments will go directly to the specified account.' },
    { name: 'SECTION_THREE_TITLE', message: 'Add Business Address' },
    { name: 'SECTION_THREE_SUBTITLE', message: 'Enter the contact’s business address. PO boxes are not accepted.' },
    { name: 'OF_MGS', message: 'of' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'contact',
      documentation: 'The contact returned after put to contactDAO.'
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `Set to true when editing a contact from contact controller.`,
      value: false
    },
    {
      class: 'String',
      name: 'redirectMenu',
      documentation: `
        The menu to redirect to when going back to MenuToolBar with only a single 
        available Contact submenu.`
    },
    {
      class: 'Int',
      name: 'availableMenuCount',
      documentation: `The number of Contact submenus the user has permission to read.`,
      value: 0
    }
  ],

  methods: [
    async function init() {
      var sectionOne = this.Section.create({
        title: this.SECTION_ONE_TITLE,
        properties: [
          net.nanopay.contacts.Contact.ORGANIZATION.clone().copyFrom({ gridColumns: 12 }),
          net.nanopay.contacts.Contact.EMAIL.clone().copyFrom({ gridColumns: 12 }),
          net.nanopay.contacts.Contact.FIRST_NAME,
          net.nanopay.contacts.Contact.LAST_NAME,
          net.nanopay.contacts.Contact.CONFIRM.clone().copyFrom({ gridColumns: 12 }),
          net.nanopay.contacts.Contact.AVAILABLE_COUNTRIES
        ],
        fromClass: 'net.nanopay.contacts.Contact'
      });
      var sectionTwo = this.Section.create({
        title: this.SECTION_TWO_TITLE,
        subTitle: this.SECTION_TWO_SUBTITLE,
        properties: [
          net.nanopay.contacts.Contact.CREATE_BANK_ACCOUNT,
          net.nanopay.contacts.Contact.NO_CORRIDORS_AVAILABLE,
          net.nanopay.contacts.Contact.SHOULD_INVITE
        ],
        fromClass: 'net.nanopay.contacts.Contact'
      });
      var sectionThree = this.Section.create({
        title: this.SECTION_THREE_TITLE,
        subTitle: this.SECTION_THREE_SUBTITLE,
        properties: [
          net.nanopay.contacts.Contact.BUSINESS_ADDRESS
        ],
        fromClass: 'net.nanopay.contacts.Contact'
      });

      // custom sections for contact wizard
      this.sections = [ sectionOne, sectionTwo, sectionThree ];
      this.data.copyFrom({
        type: 'Contact',
        group: this.subject.user.spid +  '-sme'
      });
      if ( this.isEdit ) {
        this.data.isEdit = true;
        this.data.shouldInvite = false;
        this.sections[0].title = this.EDIT_STEP_ONE_TITLE;
        this.sections[0].subTitle = '';
        this.sections[1].title = this.EDIT_STEP_TWO_TITLE;
        this.sections[1].subTitle = '';
        this.sections[2].title = this.EDIT_STEP_THREE_TITLE;
        this.sections[2].subTitle = '';
        if ( this.data.bankAccount.length != 0 ) {
          this.data.createBankAccount = await this.bankAccountDAO.find(this.data.bankAccount);
        }
      }
      let count = await this.menuDAO
        .where(
          this.AND(
            this.STARTS_WITH(this.Menu.ID, 'submenu.contact'),
            this.EQ(this.Menu.PARENT, 'sme'),
            this.NEQ(this.Menu.ID, 'submenu.contact.toolbar')
          )
        )
        .select(this.Count.create());
      this.availableMenuCount = count.value;
    },
    function initE() {
      var self = this;

      self
        .addClass(this.myClass())
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass('button-container-wrapper')
              .start().addClass('button-container')
                .start().addClass(self.myClass('left-button-container'))
                  .tag(this.BACK, { buttonStyle: 'TERTIARY' })
                  .start().addClass(self.myClass('option'))
                    .tag(this.OPTION, { buttonStyle: 'SECONDARY' })
                  .end()
                .end()
                .start().addClass(self.myClass('step-indicator'))
                  .add(this.slot(function(currentIndex) {
                    return `${self.STEP} ${currentIndex + 1} ${self.OF_MSG} 3`;
                  }))
                .end()
                .start(this.NEXT).end()
                .start(this.SAVE).end()
              .end()
            .end()
          .endContext()
        .end();
    },
    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;
      try {
        let canInvite = this.data.createBankAccount && this.data.createBankAccount.country != 'IN';

        if ( this.data.shouldInvite && canInvite ) {
          // check if it is already joined
          var isExisting = await this.contactService.checkExistingContact(this.__subContext__, this.data.email, false);

          if ( ! isExisting ) {
            try {
              this.contact = await this.subject.user.contacts.put(this.data);

              if ( await this.sendInvite(false) ) {
                this.ctrl.notify(this.CONTACT_ADDED_INVITE_SUCCESS, '', this.LogLevel.INFO, true);
              }
            } catch (err) {
              var msg = err.message || this.GENERIC_PUT_FAILED;
              this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
            }
          } else {
            this.ctrl.notify(this.EXISTING_BUSINESS, '', this.LogLevel.WARN, true);
            return false;
          }
        } else {
          this.contact = await this.subject.user.contacts.put(this.data);
          this.ctrl.notify(this.isEdit ? this.CONTACT_EDITED : this.CONTACT_ADDED, '', this.LogLevel.INFO, true);
        }
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
        this.isConnecting = false;
        return false;
      }
      this.data.copyFrom(this.contact);
      this.isConnecting = false;
      return true;
    },
    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite(showToastMsg) {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.subject.user.id,
        inviteeId: this.data.id,
        businessName: this.data.organization,
        message: ''
      });
      try {
        await this.invitationDAO.put(invite);
        if ( showToastMsg ) {
          this.ctrl.notify(this.INVITE_SUCCESS, '', this.LogLevel.INFO, true);
        }
        // Force the view to update.
        this.subject.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
      } catch (e) {
        this.ctrl.notify(this.CONTACT_ADDED_INVITE_FAILURE, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },
    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      this.isConnecting = true;
      var contact = this.contact;
      var bankAccount = this.data.createBankAccount;
      bankAccount.owner = contact.id;
      try {
        await this.bankAccountDAO.put(bankAccount);
      } catch (err) {
        var msg = err.message || this.ACCOUNT_CREATION_ERROR;
        this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
        return false;
      }
      this.isConnecting = false;
      return true;
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        this.isConnecting = false;
        if ( this.currentIndex === 0 ) {
          this.data.isEdit = false;
          if ( this.redirectMenu ) {
            this.availableMenuCount > 1 ? X.pushMenu('sme.menu.toolbar') : X.pushMenu(this.redirectMenu);
          }
          else {
            X.closeDialog()
          }
        }
        else {
          this.currentIndex = this.prevIndex;
        } 
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(data$errors_, data$createBankAccount, data$createBankAccount$errors_, currentIndex) {
        if ( currentIndex === 1 ) return data$createBankAccount && ! data$createBankAccount$errors_;
        return ! data$errors_;
      },
      isAvailable: function(nextIndex) {
        return nextIndex !== -1;
      },
      code: function() {
        this.currentIndex = this.nextIndex;
      }
    },
    {
      name: 'option',
      label: 'Save and close',
      isAvailable: function(currentIndex, data$bankAccount) {
        return currentIndex === 1 && ! data$bankAccount;
      },
      code: async function(X) {
        this.data.clearProperty("createBankAccount");
        if ( ! await this.addContact() ) return;
        X.closeDialog();
      }
    },
    {
      name: 'save',
      label: 'Submit',
      isEnabled: function(data$businessAddress$errors_, isConnecting) {
        return ! data$businessAddress$errors_ && ! isConnecting;
      },
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        if ( ! await this.addBankAccount() ) return;
        X.closeDialog();
      }
    }
  ]
});
