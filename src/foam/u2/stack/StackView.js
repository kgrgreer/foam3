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
  name: 'StackView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.controller.Memento',
    'foam.u2.stack.Stack'
  ],

  imports: [ 'ctrl' ],

  exports: [ 'data as stack' ],

  properties: [
    {
      name: 'data',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'Boolean',
      name: 'showActions',
      value: true
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'stackDefault',
      documentation: 'Default view for the stack, rendered when the stack is empty'
    },
    'defaultView_'
  ],

  css: `
    %CUSTOMCSS%
    ^pos {
      height:100%;
    }
    ^pos > * {
      height: 100%;
    }
  `,

  methods: [
    // TODO: Why is this init() instead of render()? Investigate and maybe fix.
    function init() {
      this.addClass();
      this.addClass('foam-u2-stack-StackView')
        .enableClass(this.myClass('pos'), this.data.pos$.map(v => v < 0));

      if ( this.showActions ) {
        this.start('actions')
          .add(this.data.cls_.getAxiomsByClass(foam.core.Action))
        .end();
      }
      if ( this.data.pos < 0 && this.stackDefault) {
        this.tag(this.stackDefault, {}, this.defaultView_$);
      }
      this.data.pos$.sub(() => { 
        if ( this.data.pos >= 0 && this.defaultView_) this.defaultView_.remove() 
      })

      this.listenStackView();
    },
    function listenStackView() {
      this.add(this.slot(s => this.renderStackView(s), this.data$.dot('top')));
    },
    function renderStackView(s, opt_popup) {
      if ( ! s ) return this.E('span');

      var view   = s.view;
      var parent = s.parent;

      var X = opt_popup ? opt_popup.__subContext__ : this.data.getContextFromParent(parent, this);
      var v;
      var ctrlMem = this.ctrl.memento_;
      if ( s.currentMemento ) {
        this.ctrl.window.location = '#' + s.currentMemento;
        v = foam.u2.ViewSpec.createView(view, null, this, X);
        console.log('setting memento', s.currentMemento);
      } else {
        v = foam.u2.ViewSpec.createView(view, null, this, X);
      }
      if ( v.viewTitle$ || v.children[0]?.viewTitle$ /*need to do this for menu with border*/ ) {
        this.data.top.breadcrumbTitle$.follow(v.viewTitle$ || v.children[0].viewTitle$);
      }

      return v;
    },

    function shouldMementoValueBeChanged(mementoValue, mementoHead) {
      if ( ! mementoValue )
        return false;

      return ! decodeURI(mementoValue).includes(mementoHead);
    }
  ]
});
