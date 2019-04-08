foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ConsumerKYCRequest',
  extends: 'net.nanopay.meter.compliance.identityMind.IdentityMindRequest',

  properties: [
    {
      class: 'String',
      name: 'man',
      documentation: 'Account name for the user. Must be unique.'
    },
    {
      class: 'String',
      name: 'tea',
      documentation: 'Email address for the user.',
    },
    {
      class: 'String',
      name: 'ip',
      documentation: `Customer's IP address.`
    },
    {
      class: 'String',
      name: 'bfn',
      documentation: 'Billing first name (source user data).'
    },
    {
      class: 'String',
      name: 'bln',
      documentation: 'Billing last name (source user data).'
    },
    {
      class: 'String',
      name: 'bsn',
      documentation: 'Billing street (source user data).'
    },
    {
      class: 'String',
      name: 'bco',
      documentation: 'Billing country (source user data).'
    },
    {
      class: 'String',
      name: 'bz',
      documentation: 'Billing zip/postal code (source user data).'
    },
    {
      class: 'String',
      name: 'bc',
      documentation: 'Billing city (source user data).'
    },
    {
      class: 'String',
      name: 'bs',
      documentation: 'Billing state (source user data).'
    },
    {
      class: 'String',
      name: 'bs',
      documentation: 'Billing state (source user data).'
    },
    {
      class: 'String',
      name: 'phn',
      documentation: 'Customer primary phone number.'
    },
    {
      class: 'String',
      name: 'tid',
      documentation: 'Transaction identifier. If provided, will link the request/transaction to another.'
    },
    {
      class: 'String',
      name: 'accountCreationTime',
      documentation: 'User account creation time in UTC. Encoded as a Unix timestamp or ISO 8601 string.'
    },
    {
      class: 'String',
      name: 'merchantAid',
      documentation: 'If the user is linked to a business as one of the owners of the business.'
    },
    {
      class: 'Double',
      name: 'ownership',
      documentation: 'If the user is linked to a business as one of the owners of the business, the percentage of ownership.'
    },
    {
      class: 'String',
      name: 'title',
      documentation: 'Title of the user.'
    },
    {
      class: 'String',
      name: 'dob',
      documentation: `User's date of birth encoded as an ISO8601 string.`
    },
    {
      class: 'String',
      name: 'assn',
      documentation: `User's social security number or national identification number.`
    },
    {
      class: 'String',
      name: 'profile',
      documentation: 'Policy profile to be used to evaluate this transaction.'
    },
    {
      class: 'Int',
      name: 'stage',
      documentation: 'Stage of application being processed. An integer between 1 and 5.',
      value: 1
    },
    {
      class: 'String',
      name: 'memo',
      documentation: 'Free form memo field.'
    }
  ]
});
