/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.toSql',
  name: 'SalGrade',

  properties: [
    {
      name: 'id',
      class: 'Int'
    },
    {
      class: 'Int',
      name: 'grade'
    },
    {
      class: 'Float',
      name: 'loSal'
    },
    {
      class: 'Float',
      name: 'hiSal'
    }
  ]
});
