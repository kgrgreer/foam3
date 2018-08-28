# Contacts

Contacts are a way to send money to and request money from people who are not
yet on the platform. They will receive an email inviting them to sign up on the
platform to receive their money.

## Usage

### Create a contact

```JavaScript
ctrl.user.contacts.put(net.nanopay.contacts.Contact.create({
  firstName: 'Fox',
  lastName: 'McCloud',
  email: 'fox@example.com'
}));
```

### Print contacts to console

```JavaScript
ctrl.user.contacts.select(console);
```
