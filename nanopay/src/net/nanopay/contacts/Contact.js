foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'Contact',

  documentation: `
    Contacts were introduced as a part of the Self-Serve project. They represent
    people that are not yet on the platform, but that you can still send
    invoices to.
  `,

  implements: [
    'foam.nanos.auth.HumanNameTrait'
  ],

  requires: [
    'foam.nanos.auth.Phone'
  ],

  // TODO: The following properties don't have to be defined here anymore once
  // https://github.com/foam-framework/foam2/issues/1529 is fixed:
  //   1. firstName
  //   2. middleName
  //   3. lastName
  //   4. legalName
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'userId',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      documentation: `The User instance that the contact refers to.`
    },
    {
      class: 'String',
      name: 'organization',
      documentation: 'Organization or business the contact is a part of.',
      required: true
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      documentation: 'Email address of contact.',
      required: true,
      preSet: function(_, val) {
        return val.toLowerCase();
      },
      javaSetter:
      `email_ = val.toLowerCase();
       emailIsSet_ = true;`,
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ( ! emailRegex.test(email) ) {
          return 'Invalid email address.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: `
        A phone object that include the phone number and whether it has been
        verified or not.
      `,
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      transient: true,
      documentation: 'The phone number of the contact.',
      expression: function(phone) {
        return phone.number;
      }
    },
    'firstName',
    'middleName',
    'lastName',
    'legalName'
  ]
});
