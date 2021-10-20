foam.CLASS({
  package: 'com.toSql',
  name: 'Emp',
  
  imports: [
    'com.toSql.Dept'
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
      of: 'com.toSql.Emp',
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
      of: 'com.toSql.Dept',
      name: 'deptNo'
    },
  ]
});


