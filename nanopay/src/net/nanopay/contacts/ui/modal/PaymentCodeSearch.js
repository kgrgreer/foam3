foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'PaymentCodeSearch',

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
      subTitle: 'Search a business on Ablii to add them to your contacts.  You can ask your contact for their Payment Code.'
    },
    {
      name: 'confirm',
      title: ''
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'paymentCodeValue',
      documentation: 'Payment code provided by user.',
      section: 'search',
      label: 'Payment Code',
      view: {
        class: 'foam.u2.view.IconTextFieldView',
        type: 'search',
        placeHolder: 'Type your contact’s payment code',
        icon: 'images/ablii/payment-code.png'
      }
    },
    {
      name: 'myPaymentCode',
      section: 'search',
      label: '',
      view: function(_, X) {
        return foam.u2.Element.create()
          .start().addClass('my-payment-code-container')
            .start().addClass('my-payment-code-title')
              .add('My Payment Code')
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
      section: 'confirm',
      label: '',
      factory: function() {
        return this.Contact.create({
          type: 'Contact',
          group: 'sme'
        });
      },
      view: { class: 'net.nanopay.contacts.ui.modal.AddContactConfirmation' }
    }
  ]
});