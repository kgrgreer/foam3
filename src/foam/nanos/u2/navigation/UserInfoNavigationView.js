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
      font-size: 12px;
    }
    ^agentName{
      color: /*%GREY3%*/ #cbcfd4;
      font-weight: 400;
      font-size: 11px;
    }
    ^name-container {
      max-width: 90px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: normal;
      display: flex;
      padding:
    }
  `,

  methods: [
    async function initE() {
      var self = this;
      var menu = this.Menu.create({ id: this.theme.settingsRootMenu });
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
      var menuArray = (await menu.children.orderBy(foam.nanos.menu.Menu.ORDER).select())
        .array.map( menuItem => {
          var e = this;
          return self.Action.create({
            name: menuItem.name,
            label: this.translationService.getTranslation(foam.locale, menuItem.id + '.label', menuItem.label),
            code: () => {
              menuItem.launch_(X, e);
            }
          });
        });

      this
      .addClass(this.myClass())
      .start(this.OverlayActionListView, {
        contents: mainLabel,
        data: menuArray,
        obj: self,
        buttonStyle: 'UNSTYLED'
      })
        .addClass(this.myClass('dropdown'))
      .end();
    }
  ]
});
