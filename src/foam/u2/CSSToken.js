/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'CSSToken',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      name: 'value',
      preSet: function(o, d) {
        var f = ! d || foam.util.isPrimitive(d) || foam.Function.isInstance(d);
        if ( ! f ) {
          this.__context__.warn('Trying to set invalid token value:' + d);
          return o;
        }
        return d;
      }
    },
    {
      name: 'fallback',
      preSet: function(o, d) {
        var f = ! d || foam.util.isPrimitive(d);
        if ( ! f ) {
          this.__context__.warn('Set Token fallback to non-primitive:' + d);
          return o;
        }
        return d;
      }
    },
    'sourceCls_'
  ],

  methods: [
    function toSummary() {
      return `name: ${this.name}, value: ${this.value}, fallback: ${this.fallback}`;
    },
    function installInClass(cls) {
      var axiom = this;
      axiom.sourceCls_ = cls;
      Object.defineProperty(
        cls,
        foam.String.constantize(this.name),
        {
          get: function() { return axiom; }
        }
      );
    },
    function installInProto(proto) {
      this.installInClass(proto);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CSSTokenRefinement',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'cssTokens',
      class: 'AxiomArray',
      of: 'foam.u2.CSSToken',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a ) {
            cs.push(foam.u2.CSSToken.create({name: key, value: a[key]}));
          }
          return cs;
        }
        return foam.core.AxiomArray.ADAPT.value.call(this, _, a, prop);
      },
      adaptArrayElement: function(o, prop) {
        if ( Array.isArray(o) ) {
          return foam.u2.CSSToken.create({ name: o[0], value: o[1] });
        }

        return foam.core.AxiomArray.ADAPT_ARRAY_ELEMENT.value.call(this, o, prop);
      }
    }
  ]
});


/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'TokenTest',
  extends: 'foam.u2.View',

  imports: ['ctrl?'],

  exports: [
    'tokenDAO as cssTokenOverrideDAO',
    'tokenService as cssTokenOverrideService'
  ],
  css: `
    ^test1 {
      background: $test1;
      color: $test1$foreground;
    }
    ^test2 {
      background: $test1$hover;
      color: $test1$hover$foreground;
    }
    // ^myButton {
    //   background: $test1;
    //   color: $test1$foreground;
    // }
    // ^myButton.foam-u2-ActionView:hover:not(:disabled) {
    //   background: $test1$hover;
    //   color: $test1$hover$foreground;
    // }
    // ^myButton.foam-u2-ActionView:focus {
    //   background: $test1$active;
    //   color: $test1$active$foreground;
    //   border-color: $test1;
    // }
  `,
  cssTokens: [
    {
      class: 'foam.u2.ColorToken',
      name: 'test1',
      value: 'red'
    }
  ],

  properties: [
    'color', 'color2',
    {
      name: 'disabled',
      class: 'Boolean',
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonStyle',
      name: 'style'
    },
    {
      name: 'tokenDAO',
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: foam.nanos.theme.customisation.CSSTokenOverride,
          daoType: 'MDAO'
        }, this);
      }
    },
    {
      name: 'tokenService',
      factory: function() {
        return foam.nanos.theme.customisation.CSSTokenOverrideService.create({}, this);
      }
    }
  ],
  methods: [
    function render() {
      this.tokenService.sub('cacheUpdated', () => {
        if ( this.ctrl ) return;
        let a = foam.u2.CSS.create({ code: this.cls_.model_.css  }, this);
        let b = foam.u2.CSS.create({ code: foam.u2.tag.Button.model_.css  }, this);
        this.__subContext__.installCSS(a.expandCSS(this.cls_, a.code, this.__subContext__));
        this.__subContext__.installCSS(a.expandCSS(foam.u2.ActionView, b.code, this.__subContext__));
      });
      this
      .start()
        .addClass(this.myClass('test1'))
        .add('Token test1 as background, auto-generated foreground')
      .end()
      .start()
        .addClass(this.myClass('test2'))
        .add('Token test2 as background (auto generated as 20% darker version of test1, also generates foreground based on current background)')
      .end()
      .br().br()
      .startContext({ data: this })
      .tag(this.COLOR.__, { config: { label: 'Color for buttonPrimaryColor token' } })
      .tag(this.COLOR2.__, { config: { label: 'Color for buttonSecondaryColor token' } })
      .add(this.DISABLED.__)
      .add(this.STYLE.__)
      .tag(this.SAVE)
      .br().br()
      .start()
      .add('Interact with this action to see auto generated hover and clicked states')
      .br()
      .start(this.TEST_ACTION, { buttonStyle$: this.style$ }).addClass(this.myClass('myButton')).end()
      .end()
      .endContext();
    }
  ],
  actions: [
    {
      name: 'testAction',
      isEnabled: function(disabled) { return ! disabled; },
      code: () => {}
    },
    {
      name: 'save',
      code: function(X) {
        X.cssTokenOverrideDAO.put(foam.nanos.theme.customisation.CSSTokenOverride.create({ theme: '', source: 'buttonPrimaryColor', target: this.color }, this));
        X.cssTokenOverrideDAO.put(foam.nanos.theme.customisation.CSSTokenOverride.create({ theme: '', source: 'buttonSecondaryColor', target: this.color2 }, this));
      }
    }
  ]
});
