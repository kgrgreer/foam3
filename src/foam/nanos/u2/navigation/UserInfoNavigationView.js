/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'UserInfoNavigationView',
  extends: 'foam.u2.View',

  documentation: 'Displays user and agent label if present. Clicking view opens settings submenu.',

  requires: [
    'foam.nanos.menu.Menu',
    'foam.core.Action',
    'foam.u2.view.OverlayActionListView'
  ],

  imports: [
    'theme',
    'subject',
    'translationService'
  ],

  css: `
    ^ {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    ^userName {
      color: /*%GREY4%*/ #e7eaec;
      font-weight: 600;
      font-size: 1.2rem;
    }
    ^agentName{
      color: /*%GREY3%*/ #cbcfd4;
      font-weight: 400;
      font-size: 1.1rem;
    }
    ^name-container {
      max-width: 90px;
      line-height: normal;
      display: flex;
    }
    ^name-container > *{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,

  methods: [
    async function render() {
      var self = this;
      var X    = this.__subContext__;

      var mainLabel = this.E()
        .add(this.slot(subject$user => {
        if ( ! this.subject.user ) return;
        return this.E().addClass(self.myClass('name-container'))
            .start('span').addClass(this.myClass('userName'))
              .add(this.subject.user.toSummary())
            .end();
        }))
        .add(this.slot(subject$realUser => {
          if ( ! this.subject.realUser ) return;
          return this.E().addClass(self.myClass('name-container'))
              .start('span').addClass(this.myClass('agentName'))
                .add( this.subject.realUser.toSummary() )
              .end();
        }));

      // We need to add menus from settings (and then add menus from theme.settingsRootMenu) 
      // because some menus are used in both settings and theme.settingsRootMenu (e.g., sign-out).
      // Doing this prevents us from creating the same menu for each setting.
      let menu = this.Menu.create({ id: 'settings' });
      let menuArray = (await menu.children.select()).array;
      
      // add theme.settingsRootMenu menus
      if ( this.theme.settingsRootMenu !== 'settings' ) {
        menu = this.Menu.create({ id: this.theme.settingsRootMenu });
        menuArray = menuArray.concat((await menu.children.select()).array);
      }

      menuArray.sort((a, b) => a.order - b.order);

      this
      .addClass(this.myClass())
      .start(this.OverlayActionListView, {
        label: mainLabel,
        data: menuArray,
        obj: self,
        buttonStyle: 'UNSTYLED'
      })
        .addClass(this.myClass('dropdown'))
      .end();
    }
  ]
});
