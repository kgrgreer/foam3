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
  package: 'net.nanopay.interac.ui.shared',
  name: 'FixedFloatView',
  extends: 'foam.u2.FloatView',

  documentation: 'View to display a float view with fixed precision with trailing zeros.',

  methods: [
    function formatNumber(val) {
      val = val.toFixed(this.precision);
      return val;
    }
  ]
});
