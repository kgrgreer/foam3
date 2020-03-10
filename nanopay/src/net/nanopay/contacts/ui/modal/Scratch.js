foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'Scratch',

  sections: [
    {
      name: 'stepOne'
    },
    {
      name: 'stepTwo'
    },
    {
      name: 'stepThree'
    }
  ],

  properties: [
    net.nanopay.contacts.Contact.ORGANIZATION.clone().copyFrom({
      section: 'stepOne'
    }),
    net.nanopay.contacts.Contact.EMAIL.clone().copyFrom({
      section: 'stepOne'
    }),
    net.nanopay.contacts.Contact.FIRST_NAME.clone().copyFrom({
      section: 'stepOne'
    }),
    net.nanopay.contacts.Contact.LAST_NAME.clone().copyFrom({
      section: 'stepOne'
    }),
    net.nanopay.contacts.Contact.BANK_ACCOUNT.clone().copyFrom({
      section: 'stepTwo'
    }),
    net.nanopay.contacts.Contact.BUSINESS_ADDRESS.clone().copyFrom({
      section: 'stepThree',
      factory: function() {
        return foam.nanos.auth.Address.create();
      }
    })
  ]

});