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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksSubHeader',
  extends: 'foam.u2.Controller',

  imports: [
    'theme'
  ],

  css: `
    ^ {
      background: /*%BLACK%*/ #1e1f21;
      height: 65px;
      width: 100%;
      margin-bottom: 15px;
      margin-top: 20px;
      display: table;
    }
    ^ .verticalCenter {
      display: table-cell;
      vertical-align: middle;
    }
    ^ .icConnected {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-left: 30px;
      vertical-align: middle;
    }
    ^ .firstImg {
      display: inline-block;
      max-width: 120px;
      max-height: 65px;
      width: auto;
      height: auto;
      vertical-align: middle;
      margin-left: 82px;
    }
    ^ .secondImg {
      display: inline-block;
      max-width: 120px;
      max-height: 65px;
      width: auto;
      height: auto;
      margin-left: 30px;
      vertical-align: middle;
    }
  `,

  properties: [
    'secondImg'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var logoSlot = this.theme.logo$.map(function(logo) { return logo || self.logo; });
      this
      .addClass(this.myClass())
      .start('div').addClass('verticalCenter')
        .start({class: 'foam.u2.tag.Image', data$: logoSlot}).addClass('firstImg').end()
        .start({class: 'foam.u2.tag.Image', data: 'images/banks/ic-connected.svg'}).addClass('icConnected').end()
        .callIf(self.secondImg, function() {
          this.start({class: 'foam.u2.tag.Image', data$: self.secondImg$}).addClass('secondImg').end()
        })
        .callIf(!self.secondImg, function() {
          this.start({class: 'foam.u2.tag.Image', data$: logoSlot}).addClass('secondImg').end()
        })
      .end()
    }
  ]
});
