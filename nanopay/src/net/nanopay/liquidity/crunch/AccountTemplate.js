foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', 

  tableColumns: [
    'templateName'
  ],

  searchColumns: [
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
      class: 'Map',
      view: function() {
        return {
          class: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplateMapView',
          isCapabilityAccountData: false
        }
      }
    }
  ],
});

  