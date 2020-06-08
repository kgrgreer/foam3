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
  name: 'UserTopNavView',
  extends: 'foam.u2.Element',

  documentation: 'View user name and user nav settings',

  imports: [ 'user' ],

  requires: [ 'foam.nanos.menu.SubMenuView', 'foam.nanos.menu.Menu' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: inline-block;
          float: right;
          margin-top: 10px;
        }
        ^ h1 {
          margin: 0;
          font-size: 15px;
          display: inline-block;
          font-weight: 100;
          color: white;
        }
        ^carrot {
          width: 0; 
          height: 0; 
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid white;
          display: inline-block;
          position: relative;
          top: -2;
          left: 5;
        }
        ^ img{
          width: 25px;
          height: 25px;
          display: inline-block;
          position: relative;
          top: 5;
          right: 10;
          padding-right: 15px;
        }
        ^user-name:hover {
          cursor: pointer;
        }
        ^ .foam-nanos-menu-SubMenuView-inner {
          position: absolute;
          float: right;
          z-index: 10000;
          width: 208px;
          height: 160px;
          background: white;
          box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
          top: 65px;
          right: 15px;
        }
        ^ .foam-nanos-menu-SubMenuView-inner > div {
          height: 40px;
          padding-left: 50px;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
          line-height: 40px;
        }
        ^ .foam-nanos-menu-SubMenuView-inner > div:last-child {
          background-color: #f6f9f9;
          box-shadow: 0 -1px 0 0 #e9e9e9;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #c82e2e;
        }
        ^ .foam-nanos-menu-SubMenuView-inner > div:hover {
          background-color: #59aadd;
          color: white;
          cursor: pointer;
        }
        ^ .foam-nanos-menu-SubMenuView-inner::after {
          content: ' ';
          position: absolute;
          height: 0;
          width: 0;
          border: 8px solid transparent;
          border-bottom-color: white;
          -ms-transform: translate(140px, -176px);
          transform: translate(140px, -176px);
        }
      */}
    })
  ],

  methods: [
    function initE() {
      
      this
        .addClass(this.myClass())
        .tag({class:'foam.u2.tag.Image', data: 'images/alert-exclamation.png'})
        .tag({class: 'foam.u2.tag.Image', data: 'images/bell.png'})
        .start('h1')
          .add( this.user.firstName$ ).addClass(this.myClass('user-name'))
            .on('click', function() {
              this.tag(this.SubMenuView.create({menu: this.Menu.create({id: 'settings'})}))
            }.bind(this))
        .end()
        .start('div')
          .addClass(this.myClass('carrot'))
        .end()
    }
  ]
});