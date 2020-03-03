foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactMenu',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The initial step in the ContactWizardModal. Allows the user to select
    by which means to add a contact.

    #OPTIONS
    1) Search by Business Name
    2) Add by Payment Code
    3) Create from Scratch
    4) Send Invitation
  `,

  css: `
    ^title {
      margin: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^options {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0 36px 32px 36px;
    }
    ^option {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 96px;
      height: 118px;
      padding-bottom: 5px;
      padding-top: 15px;
      border-radius: 3px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #edf0f5;
    }
    ^option:hover {
      border: solid 1px #604aff;
      cursor: pointer;
    }
    ^option-title {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }
    ^option-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 62px;
      width: 62px;
      margin-bottom: 8px;
    }
  `,

  messages: [
    { name: 'ADD_CONTACT_MENU_TITLE', message: 'Add a contact' }
  ],

  constants: {
    OPTIONS : [
      {
        optionTitle: 'Search by Business Name',
        optionIcon: {
          src: 'images/ablii/search.png',
          width: '50px',
          height: '50px'
        },
        optionDestination: 'selectBusiness'
      },
      {
        optionTitle: 'Add by Payment Code',
        optionIcon: {
          src: 'images/ablii/payment-code.png',
          width: '50px',
          height: '50px'
        },
        optionDestination: 'AddContactByPaymentCode'
      },
      {
        optionTitle: 'Create from Scratch',
        optionIcon: {
          src: 'images/ablii/scratch.png',
          width: '50px',
          height: '50px'
        },
        optionDestination: 'AddContactStepOne'
      },
      {
        optionTitle: 'Invite',
        optionIcon: {
          src: 'images/ablii/mail.png',
          width: '45px',
          height: '35px'
        },
        optionDestination: 'InviteContact'
      },
    ]
  },

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('title'))
          .add(this.ADD_CONTACT_MENU_TITLE)
        .end()
        .start()
          .addClass(this.myClass('options'))
          .add(this.OPTIONS.map((option) => {
            return self.E()
              .start()
              .addClass(this.myClass('option'))
                .start()
                .addClass(this.myClass('option-icon-container'))
                  .start('img')
                    .addClass(this.myClass('option-icon'))
                    .style({ 'width': option.optionIcon.width, 'height': option.optionIcon.height})
                    .attrs({ src: option.optionIcon.src })
                  .end()
                .end()
                .start()
                  .addClass(this.myClass('option-title'))
                  .add(option.optionTitle)
                .end()
              .on('click', this.moveTo(option.optionDestination))  
              .end();
          }))
        .end()
        ;    
    },

    function moveTo(id) {
      self = this;
      return function(e) {
        self.pushToId(id);
      }
    }
  ]
});