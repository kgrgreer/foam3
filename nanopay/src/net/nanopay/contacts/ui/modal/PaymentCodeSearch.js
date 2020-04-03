foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'PaymentCodeSearch',

  documentation: 'Property modal for PaymentCodeSearchWizardView.',

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  imports: [
    'user'
  ],

  sections: [
    {
      name: 'search',
      title: 'Search by Payment Code',
      subTitle: `
      Search a business on Ablii to add them to your contacts. You can ask your
      contact for their Payment Code.
      `
    },
    {
      name: 'confirmation',
      title: ''
    }
  ],

  messages: [
    { name: 'USER_PAYMENT_CODE_LABEL', message: 'My Payment Code' }
  ],

  properties: [
    {
      class: 'String',
      name: 'paymentCodeValue',
      documentation: 'Payment code provided by user.',
      section: 'search',
      label: 'Payment Code',
      placeholder: 'Type your contact’s payment code',
      type: 'search',
      view: {
        class: 'foam.u2.view.IconTextFieldView',
        icon: 'images/ablii/payment-code.png'
      }
    },
    {
      name: 'myPaymentCode',
      documentation: `Display property for user's payment code`,
      section: 'search',
      label: '',
      view: function(_, X) {
        return foam.u2.Element.create()
          .start().addClass('my-payment-code-container')
            .start().addClass('my-payment-code-title')
              .add(X.data.USER_PAYMENT_CODE_LABEL)
            .end()
            .start().addClass('my-payment-code-value')
              .select(X.data.user.paymentCode, (paymentCode) => {
                return foam.u2.Element.create().start().add(paymentCode.id).end();
              })
            .end()
          .end();
      }
    },
    {
      class: 'FObjectProperty',
      name: 'contact',
      documentation: `
        The contact object of the business associated to the given payment code.
      `,
      section: 'confirmation',
      label: '',
      factory: function() {
        return this.Contact.create({
          type: 'Contact',
          group: 'sme'
        });
      },
      view: { class: 'net.nanopay.contacts.ui.modal.ContactConfirmationView' }
    }
  ]
});