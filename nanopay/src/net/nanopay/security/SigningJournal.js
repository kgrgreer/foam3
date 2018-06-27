foam.CLASS({
  package: 'net.nanopay.security',
  name: 'SigningJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Signing algorithm',
      value: 'SHA256withRSA'
    },
    {
      name: 'replay',
      javaCode: `
        /**
         * objectId
         * User
         * algorithm
         * signature
         * value of the object
         * 
         * 
         * Goal => We get an object, and we want to make sure its signature is what we would expect
         * 
         * 
         * Psuedocode =>
         * 
         * check that all the values exist and that the user is valid and has a key
         * then
         * try {
         * if ( algorithm.sign(value, user.privateKey) != signature) {
         *  throw exception
         * }
         * }
         * catch {
         *  logger.log(errorMessage)
         * }
         * finally{
         *  successfully read the entry....
         * }
         * 
         * 
        */
       
      `
    },
  ]
});
