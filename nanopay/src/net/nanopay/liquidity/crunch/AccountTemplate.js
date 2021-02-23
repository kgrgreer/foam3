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
    'java.util.ArrayList',
    'java.util.List'
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
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    { 
      name: 'templateName',
      class: 'String',
    },
    {
      name: 'accounts',
      class: 'List',
      javaType: 'java.util.List<String>',
      javaFactory: `
        return new ArrayList<String>();
      `,
      factory: function() {
        return [];
      }
    },
    {
      name: 'roots',
      class: 'List',
      javaType: 'java.util.List<String>',
      javaFactory: `
        return new ArrayList<String>();
      `,
      factory: function() {
        return [];
      }
    }
  ],
  methods: [
    {
      name: 'toSummary',
      type: 'String',
      documentation: `
        When using a reference to the accountDAO, the labels associated with it will show
        a chosen property rather than the first alphabetical string property. In this
        case, we are using the account name.
      `,
      code: function() {
        return this.templateName || this.id;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getTemplateName()) ? getId() : getTemplateName();
      `
    },
    {
      name: 'validate',
      javaCode: `
        if ( getTemplateName() == null ) 
          throw new IllegalStateException("Template name must be provided");

        List<String> accountsList = (List<String>) getAccounts();
        if ( accountsList == null || accountsList.size() == 0 ) 
          throw new IllegalStateException("At least one account must be provided to create this template");
        
        DAO dao = (DAO) x.get("localAccountDAO");
        for ( String accountId : accountsList ) {
          if ( dao.find(accountId) == null ) 
            throw new IllegalStateException("One or more entries of this template contains an invalid value for account");
        }
      `,
    }
  ]
});

  