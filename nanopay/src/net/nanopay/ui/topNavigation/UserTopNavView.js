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
  package: 'net.nanopay.ui.topNavigation',
  name: 'UserTopNavView',
  extends: 'foam.u2.Element',

  documentation: 'View user name and user nav settings',

  imports: [
    'user',
    'window'
  ],

  requires: [ 'foam.nanos.menu.SubMenuView', 'foam.nanos.menu.Menu' ],

  css: `
    ^ {
      display: inline-block;
      float: right;
      margin-right: 40px;
    }
    ^ h1 {
      margin: 0;
      padding: 15px;
      font-size: 14px;
      display: inline-block;
      font-weight: 100;
      color: white;
      position: relative;
      bottom: 5;
    }
    ^ h1:hover {
      cursor: pointer;
      text-shadow: 0 0 5px white, 0 0 10px white;
    }
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
      display: inline-block;
      position: relative;
      right: 10;
      bottom: 7;
      cursor: pointer;
    }
    ^ img{
      width: 25px;
      display: inline-block;
      position: relative;
      top: 2px;
      right: 10px;
      cursor: pointer;
    }
    ^user-name:hover {
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner {
      position: absolute;
      float: right;
      z-index: 10001;
      width: 215px;
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
      color: /*%BLACK%*/ #1e1f21;
      line-height: 25px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:last-child {
      background-color: #f6f9f9;
      box-shadow: 0 -1px 0 0 #e9e9e9;
      font-size: 14px;
      color: #c82e2e;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:hover {
      background-color: /*%PRIMARY3%*/ #406dea;
      color: white;
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      -ms-transform: translate(130px, -16px);
      transform: translate(130px, -16px);
    }
    ^ .profile-container{
      display: inline-block;
      cursor: pointer;
      padding-top: 10px;
      height: 40px;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        // .start({class:'foam.u2.tag.Image', data: 'images/alert-exclamation.png'}).on('click', function(){
        //   self.window.location.assign('https://nanopay.net/contact/')
        // })
        // .end()
        .start().addClass('profile-container')
          .on('click', function() {
            this.tag(this.SubMenuView.create({menu: this.Menu.create({id: 'settings'})}))
          }.bind(this))
          .start('h1')
            .add( this.user.firstName$ ).addClass(this.myClass('user-name'))
          .end()
        .end()
        .start('div')
          .addClass(this.myClass('carrot'))
            .on('click', function() {
              this.tag(this.SubMenuView.create({menu: this.Menu.create({id: 'settings'})}))
            }.bind(this))
        .end();
    }
  ]
});
