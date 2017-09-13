foam.CLASS({
  package: 'foam.dao.crypto',
  name: 'EncryptedObject',

  documentation: 'Represents an encrypted object',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'data',
      documentation: 'Encrypted data in Base64'
    }
  ]
});