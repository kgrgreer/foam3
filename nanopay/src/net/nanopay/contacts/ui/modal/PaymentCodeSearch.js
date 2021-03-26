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
  package: 'net.nanopay.contacts.ui.modal',
  name: 'PaymentCodeSearch',

  documentation: 'Property modal for PaymentCodeSearchWizardView.',

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  imports: [
    'subject',
    'theme'
  ],

  sections: [
    {
      name: 'search',
      title: 'Search by Payment Code',
      subTitle: function() {
        return this.SEARCH_BUSINESS_1 + this.theme.appName + this.SEARCH_BUSINESS_2
      }
    },
    {
      name: 'confirmation',
      title: ''
    }
  ],

  messages: [
    { name: 'USER_PAYMENT_CODE_LABEL', message: 'My Payment Code' },
    { name:'SEARCH_BUSINESS_1', message:'Search a business on '},
    { name:'SEARCH_BUSINESS_2', message:' to add them to your contacts. You can ask your contact for their Payment Code.'}
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
        icon: 'images/ablii/payment-code.png',
        focused: true
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
              .select(X.data.subject.user.paymentCode, (paymentCode) => {
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
          group: this.subject.user.spid +  '-sme'
        });
      },
      view: { class: 'net.nanopay.contacts.ui.modal.ContactConfirmationView' }
    }
  ]
});
