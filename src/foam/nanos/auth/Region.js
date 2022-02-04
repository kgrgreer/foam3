/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Region',

  documentation: 'Region (province/state) information.',

  ids: ['code'],
  constants: [
    {
      name: 'PHONE_NUMBER_REGEX',
      factory: () => /^[a-zA-Z]*$/,
    }
  ],
  searchColumns: [
    'code',
    'name'
  ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'isoCode'
    },
    {
      class: 'String',
      name: 'name',
      validationPredicates: [
        {
          args: ['name'],
          query: 'name~PHONE_NUMBER_REGEX',
          errorString: `you suck`
        }
      ]
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'StringArray',
      name: 'alternativeNames'
    },
//    {
//        class: 'EMail',
//        name: 'email',
//        required: true
//      },
//    {
//      class: 'Int',
//      name: 'test',
//      min: 6,
//      autoValidate: true
//    },
//    {
//      class: 'PhoneNumber',
//      name: 'phone',
//      required: true
//    },
    {
      class: 'Date',
      name: 'date'
    },
    {
      class: 'String',
      name: 'testStr',
      minLength: 6,
      autoValidate: true
    },
  ]
});
