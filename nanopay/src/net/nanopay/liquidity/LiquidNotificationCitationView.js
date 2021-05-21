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
  package: 'net.nanopay.liquidity',
  name: 'LiquidNotificationCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'truncated',
      documentation: 'determines whether the body content is truncated or not.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .enableClass('fully-visible', this.truncated$)
          .on('click', this.toggleTruncation)
          .add(this.data.initiationDescription)
          .add(this.data.entity)
          .add(this.data.description)
          .add(this.data.approvalStatus)
        .end();
    }
  ],

  listeners: [
    function toggleTruncation() {
      this.truncated = ! this.truncated;
    }
  ]
});
