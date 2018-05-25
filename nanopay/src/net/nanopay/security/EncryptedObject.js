foam.CLASS({
  package: 'net.nanopay.security',
  name: 'EncryptedObject',

  documentation: 'Represents an encrypted object',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'data',
      documentation: 'Encrypted data in Base64'
    }
  ]
});