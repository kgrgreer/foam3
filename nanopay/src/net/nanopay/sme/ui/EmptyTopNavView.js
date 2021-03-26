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
  name: 'EmptyTopNavView',
  extends: 'foam.u2.View',

  imports: [
    'theme'
  ],

  css: `
  ^ {
    width: 100%;
    height: 64px;
    border-bottom: solid 1px #e2e2e3;
    margin: auto;
  }
  ^ img {
    height: 25px;
    margin-top: 20px;
    width: 100%;
  }
  `,

  methods: [
    function initE() {
      let logo = this.theme.largeLogo ? this.theme.largeLogo : this.theme.logo;

      this.addClass(this.myClass())
        .start('img')
          .attr('src', logo)
        .end()
      .end();
    }
  ]
});
