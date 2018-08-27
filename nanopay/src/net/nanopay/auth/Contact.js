/*
  Example usage of contacts:

  // Add a contact.
  ctrl.user.contacts.targetDAO
    .put(net.nanopay.auth.Contact.create({
      email: 'contacty@example.com',
      firstName: 'Contacty',
      lastName: 'McContactFace'
    })).then((contact) => ctrl.user.contacts.add(contact));

  // Print the contacts to the console.
  ctrl.user.contacts.junctionDAO.select(console);
*/

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'Contact',
  extends: 'foam.nanos.auth.User',

  documentation: `
    Contacts were introduced as a part of the Self-Serve project. They represent
    people that are not yet on the platform, but that you can still send
    invoices to.
  `,

  properties: [{ name: 'type', value: 'Contact' }]
});
