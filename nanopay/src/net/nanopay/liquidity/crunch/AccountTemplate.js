foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', 
  implements: [ 'foam.core.Validatable' ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.Map',
    'java.util.Set'
  ],

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
    { 
      name: 'templateName',
      class: 'String',
      required: true
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
  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( getTemplateName() == null ) 
          throw new IllegalStateException("Template name must be provided");

        Map<String, AccountData> map = getAccounts();
        if ( map == null || map.size() == 0 ) 
          throw new IllegalStateException("At least one account must be provided to create this template");
        
        DAO dao = (DAO) x.get("localAccountDAO");
        Set<String> keySet = map.keySet();
        for ( String key : keySet ) {
          if ( dao.find(Long.parseLong(key)) == null ) 
            throw new IllegalStateException("One or more entries of this template contains an invalid value for account");
        }
      `,
    }
  ]
});

  