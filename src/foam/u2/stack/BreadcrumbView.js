/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'BreadcrumbView',
  extends: 'foam.u2.View',

  imports: ['stack'],

  requires: ['foam.core.Action'],

  css: `
  ^display {
    display: inline-flex;
    align-items: center;
  }
  ^slash{
    padding: 8px;
    vertical-align: middle;
  }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass('display'));
      var navStack = this.stack.stack_.slice(this.stack.navStackBottom, this.stack.pos);
      var themeIcon = navStack.length == 1 ? 'back' : '';
      navStack.map((v, i, _) =>{
        var index = i + this.stack.navStackBottom;
        var jumpAction  = self.Action.create({
          name: 'back',
          code: () => {
            self.stack.jump(index, self);
          }
        });
        if ( navStack[i][3].navStackTitle ) {
          self.tag(jumpAction, {
            label: navStack[i][3].navStackTitle || 'Back',
            themeIcon: themeIcon,
            buttonStyle: 'LINK'
          })
          .callIf(navStack.length != 1, () => { self.start('span').addClass(this.myClass('slash')).add('/').end(); });
        } else {
          console.warn('Missing Title for BreadcrumbView ' + navStack[i][0].class);
        }
      });
    }
  ]
});
