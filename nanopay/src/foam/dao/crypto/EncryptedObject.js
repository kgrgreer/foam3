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
      class: 'foam.core.ByteArray',
      name: 'data',
      documentation: 'Encrypted data'
    }
  ]
});