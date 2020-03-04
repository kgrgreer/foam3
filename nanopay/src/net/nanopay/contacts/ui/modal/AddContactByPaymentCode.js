foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactByPaymentCode',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    Lets the user add an internal user (public or private) as a contact
    by inputting their payment code.
  `,

  imports: [
    'ctrl',
    'user',
    'businessFromPaymentCode'
  ],

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^payment-code-field {
      position: relative;
    }
    ^payment-code-icon {
      height: 14px;
      width: 14px;
      position: absolute;
      margin-left: 10px;
      margin-top: 14px;
    }
    ^ ^payment-code-input {
      width: 100%;
      padding-left: 32px;
      margin-bottom: 32px;
    }
    ^my-payment-code-container{
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-bottom: 240px;
    }
    ^my-payment-code-title{
      display: flex;
      justify-content: center;
      align-items: center;
      width: 113px;
      height: 26px;
      border-radius: 3px;
      border: solid 0.5px #979797;
      background-color: #e2e2e3;
      font-size: 12px;
      line-height: 1.5;
      color: #8e9090;
      margin-right: 8px;
    }
    ^my-payment-code-value{
      font-size: 12px;
      line-height: 1.5;
      color: #8e9090;
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'PAYMENT_CODE_ICON',
      value: 'images/ablii/payment-code.png'
    }
  ],

  messages: [
    {
      name: 'TITLE',
      message: 'Add by Payment Code'
    },
    {
      name: 'INSTRUCTION',
      message: `Input a payment code to add an Ablii business to your
        contacts. You can ask your contact for their Payment Code.`
    },
    {
      name: 'INPUT_TITLE',
      message: 'Payment Code'
    },
    {
      name: 'MY_PAYMENT_CODE_TITLE',
      message: 'My Payment Code'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'paymentCodeValue',
      documentation: 'Payment code provided by user.',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Type your contact’s payment code',
      }
    }
  ],

  methods: [

    function initE() {
      this
        .addClass(this.myClass())
        .start().addClass('contact-container')
          .start().addClass('contact-title')
            .add(this.TITLE)
          .end()
          .start().addClass('instruction')
            .add(this.INSTRUCTION)
          .end()
          .start().addClass('field-label')
            .add(this.INPUT_TITLE)
          .end()
          .start().addClass(this.myClass('payment-code-field'))
            .start({
              class: 'foam.u2.tag.Image',
              data: this.PAYMENT_CODE_ICON
            })
              .addClass(this.myClass('payment-code-icon'))
            .end()
            .start(this.PAYMENT_CODE_VALUE)
              .addClass(this.myClass('payment-code-input'))
            .end()
          .end()
          .start().addClass(this.myClass('my-payment-code-container'))
            .start().addClass(this.myClass('my-payment-code-title'))
              .add(this.MY_PAYMENT_CODE_TITLE)
            .end()
            .start().addClass(this.myClass('my-payment-code-value'))
              .select(this.user.paymentCode, (paymentCode) => {
                return this.E().start().add(paymentCode.id).end();
              })
            .end()
          .end()
        .end()
        .start().addClass('button-container')
          .tag(this.BACK, { buttonStyle: 'TERTIARY' })
          .start(this.NEXT).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        if ( X.subStack.depth > 1 ) {
          X.subStack.back();
        } else {
          X.closeDialog();
        }
      }
    },
    {
      name: 'next',
      label: 'Add Contact',
      code: async function(X) {
        let { data } = this.wizard;
        try {
          var business = await this.businessFromPaymentCode.getPublicBusinessInfo(X, this.paymentCodeValue);
          // copy over contact properties
          data.copyFrom({
            organization: business.organization,
            businessId: business.id,
            address: business.address
          });
          // set confirmation display properties
          data.businessSectorId = business.businessSectorId;
          data.operatingBusinessName = business.operatingBusinessName;
          data.paymentCodeValue = this.paymentCodeValue;

          this.pushToId('AddContactConfirmation');
        } catch (err) {
          var msg = err.message || this.GENERIC_PUT_FAILED;
          this.ctrl.notify(msg, 'error');
        }
      }
    }
  ]
});
