/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * TODO: There are a couple of known bugs with the current implementation of this view:
 *  - Creating a circular loop is not supported as mementos need to support adding the same view to the URL and removing the right one
 *  - Relationships have the same double stack push error that was seen with scroll tables
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
      if ( this.stack && this.stack.stack_ ) { 
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
            self.start(jumpAction, {
              label$: this.stack.stack_[index].breadcrumbTitle$,
              themeIcon: themeIcon,
              buttonStyle: 'LINK'
            }).show(this.stack.stack_[index].breadcrumbTitle$).end()
            .callIf(navStack.length != 1, () => { self.start('span').addClass(this.myClass('slash')).show(this.stack.stack_[index].breadcrumbTitle$).add('/').end(); });
          if ( ! this.stack.stack_[index].breadcrumbTitle )
            console.warn('Missing Title for BreadcrumbView ' + navStack[i].view.class);
        });
      }
    }
  ]
});
