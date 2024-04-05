/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'BreadcrumbView',
  extends: 'foam.u2.View',

  imports: [ 'breadcrumbs', 'stack' ],

  requires: [
    'foam.core.Action',
    'foam.u2.view.OverlayActionListView'
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
      this.breadcrumbs?.dynamic(function(pos, stack$pos, breadcrumbs$current) {
        self.removeAllChildren(); // Remove in U3
        let endPos = pos
        if ( self.stack.pos != self.breadcrumbs.current?.view.__subContext__.stackPos ) {
          endPos = pos + 1
        }
        let navStack  = self.breadcrumbs.crumbs?.slice(0, endPos);
        if ( ! navStack?.length ) {
          self.hide();
          return;
        } else {
          self.show();
        }
        self.addClass(self.myClass('display'));
        let themeIcon = navStack.length == 1 ? 'back' : '';
        navStack.forEach((v, i) => {
          let jumpAction = self.Action.create({
            name: 'back',
            code: () => {
              v.go();
            }
          });
          jumpAction.label$.follow(v.title$);
          if ( navStack.length <= self.collapseBreakpoint || i < self.maxHead || i >= navStack.length - self.maxTail ) {
            self.start(jumpAction, {
              themeIcon:   themeIcon,
              buttonStyle: 'LINK',
              size:        'SMALL'
            }).show(v.title$).addClass(self.myClass('breadCrumb')).end();
          } else if ( i == self.maxHead ) {
            self.tag(this.OverlayActionListView, {
              label:            '...',
              data$:            self.actionArray$,
              obj:              self,
              buttonStyle:      'LINK',
              showDropdownIcon: false
            });
            self.actionArray.push(jumpAction);
          } else {
            self.actionArray.push(jumpAction);
          }
          if ( navStack.length != 1 && i != navStack.length -1 && ( i <= self.maxHead || i >= navStack.length - self.maxTail ) ) {
            self.start('span').addClass(self.myClass('slash')).show(v.title$).add('/').end();
          }
        });
      });
    }
  ]
});
