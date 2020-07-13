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
  name: 'CapabilityAccountTemplate',
  extends: 'net.nanopay.liquidity.crunch.AccountTemplate',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'java.util.ArrayList'
  ],
  
  searchColumns: [
    'templateName'
  ],

  properties: [
    {
      name: 'accounts',
      view: function(_, x) {
        return {
          class: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplateMapView',
          isCapabilityAccountData: true
        };
      }
    }
  ]

});
