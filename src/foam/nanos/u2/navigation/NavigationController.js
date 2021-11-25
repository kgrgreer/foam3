/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NavigationController',
  extends: 'foam.u2.Controller',

  documentation: 'Component to combine Macro layouts',

  css: `
    :root {
      --sidebar-width: 240px;
      --topbar-height: 64px;
      --footer-height: 0px;
    }

    /******************
    Replace with css grid when Chrome 
    and Safari add animation support 
    to grid-template-columns
    ---------
    .stack-wrapper{
      display: grid;
      grid-template-columns: minmax(240px, 10%) 1fr;
    }
    ********************/

    .stack-wrapper {
      display: flex;
    }

    .login-stack {
      height: calc(100vh - var(--footer-height));
    }

    .application-stack {
      height: calc(100vh - var(--topbar-height) - var(--footer-height));
    }

    ^sideNav nav {
      position: absolute;
      z-index: 100;
    }

    ^sidebar > ^sideNav nav {
      width: var(--sidebar-width);
      transition: 0.2s ease;
    }

    ^sidebarClosed > ^sideNav nav{
      width: 0px;
      transition: 0.2s ease;
    }
    
    ^stack-view {
      height: 100%;
      overflow: auto;
      transition: 0.2s ease;
    }
    
    ^sidebarClosed > ^stack-view, 
    ^sidebar > ^stack-view {
      width: 100vw;
    }

    @media only screen and (min-width: /*%DISPLAYWIDTH.LG%*/ 960px) {
      ^sidebar + .application-stack > ^stack-view {
        width: calc(100vw - var(--sidebar-width));
      }
      ^sideNav nav {
        position: relative;
        z-index: 1;
      }
    }
  `,

  imports: [
    'displayWidth',
    'initLayout',
    'isMenuOpen',
    'loginSuccess',
    'layoutInitialized',
    'showNav',
    'stack'
  ],

  requires: [
    'foam.u2.stack.DesktopStackView',
    'foam.u2.layout.DisplayWidth'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'topNav'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'sideNav'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'footer'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'mainView'
    }
  ],
  methods: [
    function render() {
      // TODO: Add responsive View switching
      this.onDetach(this.displayWidth$.sub(this.maybeCloseNav));
      this.layoutInitialized$.sub(function() { debugger; })
      this.addClass()
      .add(this.slot( async function(loginSuccess, topNav) {
        if ( ! loginSuccess || ! topNav ) return null;
        await this.initLayout;
        return this.E().tag(topNav).show(this.showNav$);
      }))
      .start()
        .addClass('stack-wrapper')
        .enableClass(this.myClass('sidebarClosed'), this.isMenuOpen$, true)
        .enableClass(this.myClass('sidebar'), this.isMenuOpen$)
        .enableClass('login-stack', this.layoutInitialized$, true)
        .enableClass('application-stack', this.layoutInitialized$)
        .add(this.slot( async function(loginSuccess, sideNav) {
          if ( ! loginSuccess || ! sideNav ) return null;
          await this.initLayout;
          return this.E()
            .tag(sideNav)
            .show(this.showNav$)
            .addClass(this.myClass('sideNav'));
        }))
        .start(this.mainView)
          .addClass(this.myClass('stack-view'))
        .end()
      .end();
      // TODO: Maybe add footer support if needed
    }
  ],

  listeners: [
    function maybeCloseNav() {
      if ( this.displayWidth.ordinal < this.DisplayWidth.LG.ordinal ) {
        this.isMenuOpen = false;
      }
    }
  ]
});
