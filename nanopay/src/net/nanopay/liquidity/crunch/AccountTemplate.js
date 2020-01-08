foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', 

  tableColumns: [
    'id',
    'templateName'
  ],

  properties: [  
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    { name: 'templateName',
      class: 'String'
    },
    {
      name: 'accounts',
      class: 'Map'
    }
  ],
});

  