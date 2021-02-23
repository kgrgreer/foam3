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
  name: 'AccountData', 
  
  documentation: `
  A model for the data stored in the value of the map of AccountTemplate. 
  `,

  properties: [  
    {
      name: 'isIncluded',
      label: 'Include in Account Group',
      class: 'Boolean',
      value: true
    },
    {
      name: 'isCascading',
      label: 'Apply to Sub-Accounts',
      class: 'Boolean',
      value: true,
      visibility: function(isIncluded) {
        return ! isIncluded ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      }
    }
  ],
});

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountData', 
  extends: 'net.nanopay.liquidity.crunch.AccountData',

  documentation: `
  A model for the data stored in the value of the map of CapabilityAccountTemplate. 
  `,

  properties: [  
    {
      name: 'approverLevel',
      label: 'Authorization Level',
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.crunch.ApproverLevel',
      javaType: 'net.nanopay.liquidity.crunch.ApproverLevel',
      visibility: 'HIDDEN',
      factory: function() {
        return net.nanopay.liquidity.crunch.ApproverLevel.create({ approverLevel: 1 });
      },
      view: function(_, x) {
        return {  
          class: 'foam.u2.view.FObjectView',
        };
      }
    }
  ],
});
