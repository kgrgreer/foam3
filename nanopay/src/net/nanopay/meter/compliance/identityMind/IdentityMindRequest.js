/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindRequest',

  properties: [
    {
      class: 'String',
      name: 'url',
      transient: true
    },
    {
      class: 'String',
      name: 'basicAuth',
      transient: true
    },
    {
      class: 'String',
      name: 'entityType',
      transient: true
    },
    {
      class: 'String',
      name: 'daoKey',
      transient: true
    },
    {
      class: 'Object',
      name: 'entityId',
      transient: true
    },
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
      name: 'amn',
      documentation: 'Legal name of the business.'
    },
    {
      class: 'String',
      name: 'afn',
      documentation: 'The first name of the contact person for the business.'
    },
    {
      class: 'String',
      name: 'aln',
      documentation: 'The last name of the contact person for the business.'
    },
    {
      class: 'String',
      name: 'asn',
      documentation: 'The street address of the business.'
    },
    {
      class: 'String',
      name: 'ac',
      documentation: 'The city of the business.'
    },
    {
      class: 'String',
      name: 'aco',
      documentation: 'The country of the business.'
    },
    {
      class: 'String',
      name: 'as',
      documentation: 'The state of the business.'
    },
    {
      class: 'String',
      name: 'az',
      documentation: 'The zip of the business.'
    },
    {
      class: 'String',
      name: 'aph',
      documentation: 'The primary phone number of the business.'
    },
    {
      class: 'String',
      name: 'website',
      documentation: 'The URL of the company website.'
    },
    {
      class: 'String',
      name: 'businesstype',
      documentation: 'The type of business.'
    },
    {
      class: 'String',
      name: 'dman',
      documentation: 'Destination user unique identifier.'
    },
    {
      class: 'String',
      name: 'demail',
      documentation: 'Email address for the destination user.',
    },
    {
      class: 'String',
      name: 'sfn',
      documentation: 'Shipping first name (destination user data).'
    },
    {
      class: 'String',
      name: 'sln',
      documentation: 'Shipping last name (destination user data).'
    },
    {
      class: 'String',
      name: 'ssn',
      documentation: 'Shipping street (destination user data).'
    },
    {
      class: 'String',
      name: 'sco',
      documentation: 'Shipping country (destination user data).'
    },
    {
      class: 'String',
      name: 'sz',
      documentation: 'Shipping zip/postal code (destination user data).'
    },
    {
      class: 'String',
      name: 'sc',
      documentation: 'Shipping city (destination user data).'
    },
    {
      class: 'String',
      name: 'ss',
      documentation: 'Shipping state (destination user data).'
    },
    {
      class: 'String',
      name: 'dph',
      documentation: 'The phone number associated with the destination user.'
    },
    {
      class: 'String',
      name: 'pach',
      documentation: 'Source ACH account number (Hash).'
    },
    {
      class: 'String',
      name: 'dpach',
      documentation: 'Destination ACH account number (Hash).'
    },
    {
      class: 'String',
      name: 'phash',
      documentation: 'Source digital account number (Hash).'
    },
    {
      class: 'String',
      name: 'dphash',
      documentation: 'Destination digital account number (Hash).'
    },
    {
      class: 'String',
      name: 'amt',
      documentation: 'The amount of the transaction'
    },
    {
      class: 'String',
      name: 'ccy',
      documentation: 'The ISO 4217 currency code of the transaction encoded as a String.'
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
      class: 'StringArray',
      name: 'tags',
      documentation: 'An array of tags to be applied to the transaction'
    },
    {
      class: 'String',
      name: 'memo',
      documentation: 'Free form memo field - Used as recipient business name.'
    },
    {
      class: 'Boolean',
      name: 'memo1',
      documentation: 'Memo1 field - Used as domestic transaction flag.'
    },
    {
      class: 'Int',
      name: 'memo3',
      documentation: 'Corresponding Dow Jones matches.'
    },
    {
      class: 'Boolean',
      name: 'memo4',
      documentation: 'Corresponding SecurefactSIDni results.'
    },
    {
      class: 'Boolean',
      name: 'memo5',
      documentation: 'Corresponding SecurefactLEV results.'
    }
  ]
});
