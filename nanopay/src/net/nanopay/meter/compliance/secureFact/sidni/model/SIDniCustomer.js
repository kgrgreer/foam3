foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniCustomer',

  documentation: `The Customer object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'custTransactionId',
      documentation: 'Identifier for the transaction, used to check for duplicates, max length of 256.',
      validateObj: function(custTransactionId) {
        if ( custTransactionId.length() > 256 ) {
          return 'custTransactionId is longer than 256 characters';
        }
      }
    },
    {
      class: 'String',
      name: 'userReference',
      required: true,
      documentation: 'Identifer for transaction from the customer.',
      validateObj: function(userReference) {
        if ( userReference.length() > 30 ) {
          return 'UserReference is longer than 30 characters';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'consentGranted',
      required: true,
      documentation: 'Specifies if the individual has consented to being searched.'
    },
    {
      class: 'String',
      name: 'language',
      required: true,
      documentation: 'Language in which responses will be provided. Currently only supports en-CA',
      value: 'en-CA'
    },
    {
      class: 'String',
      name: 'flinksLoginId',
      documentation: 'Flinks loginId, refer to doc before using.'
    },
  ]
});
