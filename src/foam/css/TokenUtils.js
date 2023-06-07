/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.css',
  name: 'TokenExpr',

  documentation: `
    Expr for getting the value of the token from current context
  `,

  axioms: [foam.pattern.Multiton.create({ property: 'arg1' })],

  properties: [
    { name: 'arg1' }
  ],
  methods: [
    function f(o) {
      return foam.CSS.returnTokenValue(this.arg1, o.cls_, o.__subContext__);
    }
  ]
});

foam.CLASS({
  package: 'foam.css',
  name: 'LightenExpr',
  requires: [ 'foam.mlang.Constant'],
  properties: [
    {
      name: 'arg1',
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    },
    {
      name: 'arg2',
      adapt: function(_, n) {
        if ( foam.Number.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    }
  ],
  methods: [
    function f(o) {
      const color = this.arg1.f(o);
      const amount = this.arg2.f(o);
      return foam.Color.lighten(color, amount);
    }
  ]
});

foam.CLASS({
  package: 'foam.css',
  name: 'FromHueExpr',
  requires: ['foam.mlang.Constant'],
  properties: [
    {
      name: 'arg1',
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    },
    {
      name: 'arg2',
      adapt: function(_, n) {
        if ( foam.Number.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    },
    {
      name: 'arg3',
      adapt: function(_, n) {
        if ( foam.Number.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    }
  ],
  methods: [
    function f(o) {
      const color = this.arg1.f(o);
      const sat = this.arg2.f(o);
      const lig = this.arg3.f(o);
      return foam.Color.fromHue(color, sat, lig);
    }
  ]
});

foam.CLASS({
  package: 'foam.css',
  name: 'FindForegroundExpr',

  requires: [ 'foam.mlang.Constant'],
  properties: [
    {
      name: 'baseColor',
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    },
    {
      name: 'darkColor',
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    },
    {
      name: 'lightColor',
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) {
          return this.Constant.create({ value: n });
        }
        return n;
      }
    }
  ],
  methods: [
    function f(o) {
      const color = this.baseColor.f(o);
      const dark = this.darkColor.f(o);
      const light = this.lightColor.f(o);
      return foam.Color.getBestForeground(color, dark, light);
    }
  ]
});


foam.CLASS({
  package: 'foam.css',
  name: 'TokenUtilsBuilder',

  axioms: [ foam.pattern.Singleton.create() ],

  requires: [
    'foam.css.FindForegroundExpr',
    'foam.css.LightenExpr',
    'foam.css.TokenExpr',
    'foam.css.FromHueExpr'
  ],

  methods: [
    function TOKEN(name) { return this.TokenExpr.create({ arg1: name }); },
    function LIGHTEN(a, b) { return this.LightenExpr.create({ arg1: a, arg2: b }); },
    function FROM_HUE(a, b, c) { return this.FromHueExpr.create({ arg1: a, arg2: b, arg3: c }); },
    function FOREGROUND(a, b, c) { return this.FindForegroundExpr.create({ baseColor: a, darkColor: b, lightColor: c }); },
  ]
});
