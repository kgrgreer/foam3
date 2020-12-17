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
  package: 'net.nanopay.tx.gs',
  name: 'ProgressBarData',
  plural: 'PBDs',

  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Long',
      name: 'value'
    },
    {
      class: 'Long',
      name: 'maxValue',
      value: 100
    },
    {
      class: 'Double',
      name: 'state',
      expression: function(value, maxValue){
        return ( (value / maxValue) * 100);
      },

    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'Boolean',
      name: 'statusPass',
      value: true
    },
    {
      class: 'String',
      name: 'report'
    }
  ]
});
