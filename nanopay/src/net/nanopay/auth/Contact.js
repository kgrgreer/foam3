/*
  Example usage of contacts:

  // Add a contact.
  ctrl.user.contacts.put(net.nanopay.auth.Contact.create({
    firstName: 'Fox',
    lastName: 'McCloud',
    email: 'fox@example.com'
  }));

  // Print the contacts to the console.
  ctrl.user.contacts.select(console);
*/

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'Contact',

  documentation: `
    Contacts were introduced as a part of the Self-Serve project. They represent
    people that are not yet on the platform, but that you can still send
    invoices to.
  `,

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      documentation: `The User instance that the contact refers to.`
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      documentation: 'Email address of contact.',
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
      class: 'String',
      name: 'firstName',
      tableWidth: 160,
      documentation: 'First name of contact.',
      validateObj: function(firstName) {
        if ( firstName.length > 70 ) {
          return 'First name cannot exceed 70 characters.';
        } else if ( /\d/.test(firstName) ) {
          return 'First name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Last name of contact.',
      tableWidth: 160,
      validateObj: function(lastName) {
        if ( lastName.length > 70 ) {
          return 'Last name cannot exceed 70 characters.';
        } else if ( /\d/.test(lastName) ) {
          return 'Last name cannot contain numbers.';
        }
      }
    },
  ]
});
