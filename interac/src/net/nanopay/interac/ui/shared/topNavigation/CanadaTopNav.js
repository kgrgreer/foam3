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
  package: 'net.nanopay.interac.ui.shared.topNavigation',
  name: 'CanadaTopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  imports: [ 'menuDAO' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #093649;
          width: 100%;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .topNavContainer {
          width: 962px;
          margin: auto;
        }
        .menuBar > div > ul {
          padding-left: 0;
          font-weight: 100;
          letter-spacing: 0.2px;
          color: #ffffff;
        }
        .menuBar > div > ul > li{
          margin-left: 25px;
          display: inline-block;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }

        .menuBar > div > ul > li:hover {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
      */}
    })
  ],

  properties: [
      {
      name: 'dao',
      factory: function() { return this.menuDAO; }
    }
  ],

  methods: [
    function initE(){
      this
        .addClass(this.myClass())
        .start('div').addClass('topNavContainer')
          .start({class: 'net.nanopay.interac.ui.shared.topNavigation.CanadaLogoView', data: this.data})
          .end()
          .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
          .start({class: 'net.nanopay.interac.ui.shared.topNavigation.UserTopNavView'})
          .end()
        .end()
    }
  ]
});
