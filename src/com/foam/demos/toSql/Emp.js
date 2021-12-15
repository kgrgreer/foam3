/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.toSql',
  name: 'Emp',

  imports: [
    'foam.demos.toSql.Dept'
  ],

  properties: [
    {
      name: 'id',
      class: 'Int'
    },
    {
      class: 'Int',
      name: 'empNo'
    },
    {
      class: 'String',
      name: 'ename'
    },
    {
      class: 'String',
      name: 'job'
    },
    {
      class: 'Reference',
      of: 'foam.demos.toSql.Emp',
      name: 'mgr',
      value: -1
    },
    {
      class: 'Date',
      name: 'hireDate'
    },
    {
      class: 'Float',
      name: 'sal'
    },
    {
      class: 'Float',
      name: 'comm'
    },

    {
      class: 'Reference',
      of: 'foam.demos.toSql.Dept',
      name: 'deptNo'
    },
  ]
});
