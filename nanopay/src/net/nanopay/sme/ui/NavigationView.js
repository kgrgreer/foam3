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
  package: 'net.nanopay.sme.ui',
  name: 'NavigationView',
  extends: 'foam.u2.View',

  documentation: 'Navigation for self serve',

  css: `
    ^ .top-nav {
      width: calc(100% - 200px);
      display: inline-block;
    }
    ^ .side-nav {
      float:left;
      display: inline-block;
      width: 200px;
      height: 100%
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .tag({ class: 'net.nanopay.sme.ui.SideNavigationView' })
        .addClass('side-nav');
    }
  ]
});
