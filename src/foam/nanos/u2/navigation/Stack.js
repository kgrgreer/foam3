/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'Stack',
  extends: 'foam.u2.View',
  documentation: `
    A simple stack view for use with nested dao controllers and detailViews
  `,
  css:`
    ^ {
      position: relative;
    }
    @keyframes stackfade-out {
      0% { position: absolute; }
      100% { 
        opacity: 0; 
        // transform: translateX(-300px); 
        position: absolute;
      }
    }
    @keyframes stackfade-in {
      0% { 
        opacity: 0; 
        // transform: translateX(300px); 
        position: absolute; top: 0;
      }
      100% {
        opacity: 1; 
        // transform: translateX(0px);
        position: absolute; top: 0;
      }
    }
    .fancy-hide {
      animation-name: stackfade-out;
      animation-duration: 0.2s;
    }
    .fancy-show {
      animation-name: stackfade-in;
      animation-duration: 0.2s;
    }
  `,
  topics: ['stackReset', 'posUpdated'],
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.Element',
      name: 'stack_'
    },
    {
      class: 'Int',
      name: 'pos',
      value: -1
    },
    {
      name: 'current',
      expression: function(stack_, pos) {
        return stack_[pos];
      }
    }
    // TODO: add stack default
  ],
  methods: [
    function render() {
      this.addClass()
      this.stackReset.sub(() => { this.removeAllChildren(); })
      this.posUpdated.sub((_, p, type) => {
        this.current.hide();
        if ( type == 'new' )
          this.add(this.current);
        this.stack_.forEach(v => { 
          if ( v !== this.current ) {
            this.fancyHide(v);
          } else {
            this.fancyShow(v);
          }
        })
      })
    },
    function resetStack() {
      this.stack_ = [];
      this.pos = -1;
      this.stackReset.pub();
    },
    function push(v, parent) {
      if ( foam.u2.stack.StackBlock.isInstance(v) ) {
        console.warn('**************** Replace with just a view push');
        parent = v.parent;
        v = v.view;
      }
      if ( ! foam.u2.Element.isInstance(v) ) {
        // In case a view spec is pushed
        v = foam.u2.ViewSpec.createView(v, {}, parent, parent);
      }
      this.pos++;
      // if a view is overridden in the stack, actually remove it
      this.stack_[this.pos]?.remove();
      this.stack_[this.pos] = v;
      this.posUpdated.pub('new');
      return this.pos;
    },
    function fancyHide(v) {
      v.addClass('fancy-hide');
      v.addEventListener('animationend', () => {
        v.hide(); 
        v.removeClass('fancy-hide');
      }, {once : true})
    },
    function fancyShow(v) {
      v.addClass('fancy-show').show();
      v.addEventListener('animationend', () => {
        v.removeClass('fancy-show'); 
      }, {once : true})
    },
    function set() {
      this.resetStack();
      return this.push(...arguments);
    },
    function jump(p) {
      this.pos = p;
      this.posUpdated.pub('jump');
    }
  ]
});