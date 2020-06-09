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

  