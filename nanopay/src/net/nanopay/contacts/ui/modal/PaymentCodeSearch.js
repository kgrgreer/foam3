foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'PaymentCodeSearch',

  imports: [
    'user'
  ],

  exports: [ 'as data' ],

  sections: [
    {
      name: 'search',
      title: 'Search by Payment Code',
      subTitle: 'Search a business on Ablii to add them to your contacts.  You can ask your contact for their Payment Code.'
    },
    {
      name: 'confirm',
      title: 'confirm'
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
      getter: async function() {
        debugger;
        return await this.user.paymentCode.select().array[0];
      }
    },
    {
      name: 'confirm',
      section: 'confirm',
      label: '',
      // view: {
      //   class: 'net.nanopay.contacts.ui.modal.AddContactConfirmation',
      //   data: this.contact
      // }
    },
    // {
    //   class: 'FObjectProperty',
    //   name: 'contact',
    //   hidden: true,
    //   factory: function() {
    //     return net.nanopay.contacts.Contact.create();
    //   },
    // }
  ]

});