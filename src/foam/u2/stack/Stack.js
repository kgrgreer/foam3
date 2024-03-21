/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'Stack',

  requires: [
    'foam.nanos.controller.Memento',
    'foam.u2.stack.StackBlock'
  ],

  imports: [
    'currentMenu',
    'menuListener',
    'pushDefaultMenu',
    'topMemento_',
    'window'
  ],

  exports: [
    'memento_',
  ],

  constants: [
    { name: 'BCRMB_ID',  value: 'b' },
    { name: 'ACTION_ID', value: 'a' }
  ],

  properties: [
    {
      name: 'memento_',
      factory: function() {
        return this.topMemento_ || this.WindowHashMemento.create({obj: this}, this);
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.stack.StackBlock',
      name: 'stack_',
      hidden: true,
      factory: function() { return []; }
    },
    {
      class: 'Int',
      name: 'depth',
      value: 0
    },
    {
      class: 'Int',
      name: 'pos',
      value: -1,
      preSet: function(_, p) {
        if ( isNaN(p) || p > this.depth ) return this.depth - 1;
        if ( p < 0 ) return -1;
        return p;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.stack.StackBlock',
      name: 'top',
      hidden: true,
      expression: function(pos) {
        return this.stack_[pos] || null;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.stack.StackBlock',
      name: 'topNonPopup',
      hidden: true,
      expression: function(pos) {
        while ( pos >= 0 && this.stack_[pos].popup ) pos--;
        return this.stack_[pos] || null;
      }
    }
  ],

  methods: [
    function slotAt(i) {
      return this.StackSlot.create({
        pos:   i,
        stack: this
      });
    },

    function resetStack() {
      this.stack_ = [];
      this.pos    = -1;
    },

    function at(i) {
      return i < 0 ? this.stack_[this.pos + i + 1] : this.stack_[i];
    },

    async function push(block) {
      // Temporary code to mutate old function calls to stackBlock object
      if ( ! foam.u2.stack.StackBlock.isInstance(block) ) {
        console.warn('This function has been changed. Please pass in a StackBlock FObject');
        block = this.StackBlock.create({
          view: arguments[0],
          parent: arguments[1],
          id: arguments[2] || 'anon',
          // shouldResetBreadcrumbs: arguments[3] && arguments[3].menuItem,
          popup: arguments[3] && arguments[3].popup,
          breadcrumbTitle: arguments[3] && arguments[3].navStackTitle
        });
      }

      block.historyPos     = this.window.history.length;
      block.currentMemento = this.memento_.toString();
      console.log('************ currentMemento', block.currentMemento);

      if ( ! block.breadcrumbTitle && block.view.title ) block.breadcrumbTitle = block.view.title;

      // Push a default menu if opening a popup as the first view in a stack
      if ( this.pos == -1 && block.popup
        // Dont render a fallback view in iframes
         && this.window.top == this.window.self
      ) {
        let menu = this.currentMenu;
        await this.pushDefaultMenu();
        this.menuListener(menu)
      }

      if ( foam.u2.Element.isInstance(block.view) ) {
        console.warn("Views are not recommended to be pushed to a stack. Please use a viewSpec.");
      }
      // "parent" is the parent object for this view spec.  A view of this stack
      // should ensure that the context that "v" is rendered in extends from
      // both the u2.Element is it being rendered under, and from the "parent"
      // parameter.  This way views on the stack can export values to views
      // that get rendered after them.
      var pos = this.pos + 1;

      this.depth = pos + 1;
      this.stack_.length = this.depth;
      this.stack_[pos] = block;
      this.pos = pos;
    },

    function jump(jumpPos) {
      while ( this.pos > jumpPos ) {
        this.stack_[this.pos].removed.pub();
        this.pos--;
      }
    },

    function getContextFromParent(parent, ctx) {
      ctx = ctx || this;
      if ( ! parent ) return ctx.__subSubContext__;
      if ( parent.isContext ) return parent;
      if ( parent.__subContext__ ) return parent.__subContext__;


      // Do a bit of a dance with the context, to ensure that exports from
      // "parent" are available to "view"
      // TODO: revisit KGR's comment from earlier; this may not be needed
      console.warn('parent is neither an element nor a context');
      return ctx.__subSubContext__.createSubContext(parent);
    }
  ],

  actions: [
    {
      name: 'back',
      // icon: 'arrow_back',
      isEnabled: function(pos) { return pos >= 0; },
      code: function(X) {
        this.jump(this.pos-1, X);
      }
    },
    {
      name: 'forward',
      // icon: 'arrow_forward',
      isEnabled: function(pos, depth) { return pos < depth - 1; },
      code: function() { this.pos++; }
    }
  ],

  classes: [
    {
      name: 'StackSlot',

      implements: [ 'foam.core.Slot' ],

      properties: [
        {
          name: 'stack'
        },
        {
          class: 'Int',
          name: 'pos'
        }
      ],

      methods: [
        function init() {
          this.onDetach(this.stack.pos$.sub(this.onStackChange));
        },

        function get() {
          return this.stack.at(this.pos);
        },

        function set() {
          // unimplemnted.
        },

        function sub(l) {
          return this.SUPER('update', l);
        },

        function toString() {
          return 'StackSlot(' + this.pos + ')';
        }
      ],

      listeners: [
        function onStackChange(s) {
          if ( this.pos < 0 || this.pos === this.stack.pos ) {
            this.pub('update');
          }
        }
      ]
    }
  ]
});
