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
  package: 'net.nanopay.fx',
  name: 'TotalRateLineItem',
  extends: 'net.nanopay.fx.FXLineItem',

  documentation: `Total rate line item produced by the FeeEngine when
    applying fee and rate to override the raw quoted FX rates.`,

  properties: [
    {
      name: 'amount',
      factory: function() {
        return this.rate.toFixed(4);
      }
    }
  ],
  
  methods: [
    function toSummary() {
      return this.name;
    }
  ]
});
