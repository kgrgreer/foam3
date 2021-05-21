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
  name: 'NoMenuTopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar with no menu',

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
          width: 100%;
          margin: auto;
        }
        ^ h1{
          text-align: center;
          font-weight: 100;
          font-size: 20px;
        }

      */}
    })
  ],

  methods: [
    function initE(){
      this
        .addClass(this.myClass())
        .start('div').addClass('topNavContainer')
          .start('h1').add('My Bank').end()
          // Testing Purposes
          // .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
        .end()
    }
  ]
});
