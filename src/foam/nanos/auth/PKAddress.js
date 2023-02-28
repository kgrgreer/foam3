/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PKAddress',
  extends: 'foam.nanos.auth.Address',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'streetNumber',
      gridColumns: 6
    },
    {
      name: 'streetName',
      gridColumns: 6
    },
    {
      name: 'suite',
      visibility: 'HIDDEN'
    },
    {
      name: 'countryId',
      visibility: 'DISABLED'
    }
  ]
});
