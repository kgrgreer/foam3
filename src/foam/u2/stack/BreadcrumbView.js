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

  requires: [
    'foam.core.Action',
    'foam.u2.view.OverlayActionListView',
  ],

  css: `
  ^display {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }
  ^slash{
    padding: 8px;
    vertical-align: middle;
  }
  ^breadCrumb > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  `,

  properties: [
    { 
      name: 'maxHead',
      documentation: 'maximum number of breadcrumbs to be displayed before the dropdown',
      value: 3
    },
    {
      name: 'maxTail',
      documentation: 'maximum number of breadcrumbs to be displayed after the dropdown',
      value: 3
    },
    {
      name: 'collapseBreakpoint',
      documentation: `If the number of breadcrumbs goes over this value they will start collapsing into a dropdown,
      default value is sum of maxHead and maxTail + 1 to avoid a single breadcrumb collapsing into a dropdown `,
      factory: function() { return this.maxHead + this.maxTail + 1; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actionArray'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass('display'));
      if ( this.stack && this.stack.stack_ ) {
        var navStack = this.stack.stack_.slice(this.stack.navStackBottom, this.stack.pos);
        var themeIcon = navStack.length == 1 ? 'back' : '';
        navStack.map((v, i) => {
          var index = i + this.stack.navStackBottom;
          var jumpAction  = self.Action.create({
            name: 'back',
            code: () => {
              self.stack.jump(index, self);
            }
          });
          var labelSlot = this.stack.stack_[index].breadcrumbTitle$;
          jumpAction.label$ = labelSlot;
          if ( navStack.length <= self.collapseBreakpoint || i < self.maxHead || i >= navStack.length - self.maxTail ) {
            self.start(jumpAction, {
              themeIcon: themeIcon,
              buttonStyle: 'LINK',
              size: 'SMALL'
            }).show(labelSlot).addClass(this.myClass('breadCrumb')).end();
          } else if ( i == self.maxHead ) {
            self.tag(this.OverlayActionListView, {
              label: '...',
              data$: self.actionArray$,
              obj: self,
              buttonStyle: 'LINK',
              showDropdownIcon: false,
            });
            self.actionArray.push(jumpAction);
          } else {
            self.actionArray.push(jumpAction);
          }
          self.callIf(navStack.length != 1 && ( i <= self.maxHead || i >= navStack.length - self.maxTail ), () => {
            self.start('span').addClass(this.myClass('slash')).show(labelSlot).add('/').end();
          });
          if ( ! this.stack.stack_[index].breadcrumbTitle )
            console.warn('Missing Title for BreadcrumbView ' + navStack[i].view);
        });
      }
    }
  ]
});
