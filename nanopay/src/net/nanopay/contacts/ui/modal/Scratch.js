foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'Scratch',

  sections: [
    {
      name: 'stepOne',
      title: 'Create a contact',
      subTitle: 'Create a new contact by entering in their business information below. If you have their banking information, you can start sending payments to the contact right away.'
    },
    {
      name: 'stepTwo',
      title: 'Add banking information',
      subTitle: 'Enter the contact’s bank account information.  Please make sure that this is accurate as payments will go directly to the specified account.'
    },
    {
      name: 'stepThree',
      title: 'Add business address',
      subTitle: 'In order to send payments to this business, we’ll need you to verify their business address below.'
    }
  ],

  properties: [
    net.nanopay.contacts.Contact.ORGANIZATION.clone().copyFrom({
      section: 'stepOne',
      label: 'Business name',
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. Vandelay Industries' }
    }),
    net.nanopay.contacts.Contact.EMAIL.clone().copyFrom({
      section: 'stepOne',
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. example@domain.com' }
    }),
    net.nanopay.contacts.Contact.FIRST_NAME.clone().copyFrom({
      section: 'stepOne',
      gridColumns: 6,
      view: { class: 'foam.u2.tag.Input', placeholder: 'Optional' }

    }),
    net.nanopay.contacts.Contact.LAST_NAME.clone().copyFrom({
      section: 'stepOne',
      gridColumns: 6,
      view: { class: 'foam.u2.tag.Input', placeholder: 'Optional' }
    }),
    {
      name: 'dividerOne',
      section: 'stepOne',
      label: '',
      view: function() {
        return foam.u2.Element.create()
          .start()
            .addClass('divider')
          .end();
      }
    },
    {
      class: 'Boolean',
      name: 'confirm',
      section: 'stepOne',    
      documentation: `True if the user confirms their relationship with the contact.`,
      view: {
        class: 'foam.u2.CheckBox',
        label: `I confirm that I have a business relationship with this contact and
        acknowledge that the bank account info entered by the contact
        business will be used for all deposits to their account.`
    },
      validateObj: function(confirm) {
        if ( ! confirm ) {
          return 'Confirmation required.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      section: 'stepTwo',
      factory: function() {
        var account = net.nanopay.bank.BankAccount.create();
        return account;
      },
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'net.nanopay.bank.BankAccount'
      }
    },
    {
      name: 'dividerTwo',
      section: 'stepTwo',
      label: '',
      view: function() {
        return foam.u2.Element.create()
          .start()
            .addClass('divider')
          .end();
      }
    },
    {
      class: 'Boolean',
      name: 'shouldInvite',
      section: 'stepTwo',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Invite this contact to join Ablii'
      }
    },
    net.nanopay.contacts.Contact.BUSINESS_ADDRESS.clone().copyFrom({
      section: 'stepThree',
      factory: function() {
        return foam.nanos.auth.Address.create();
      }
    }),
    {
      name: 'disclaimer',
      section: 'stepThree',
      label: '',
      view: function() {
        return foam.u2.Element.create()
          .start()
            .addClass('disclaimer')
            .add('* PO Boxes are not Allowed')
          .end();
      }
    },
  ]

});