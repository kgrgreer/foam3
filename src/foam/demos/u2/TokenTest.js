/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
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
      color: $foreground1;
    }
    ^test2 {
      background: $test2;
      color: $foreground2;
    }
    ^myButton.foam-u2-ActionView {
      background: $test1;
      color: $foreground1;
    }
    ^myButton.foam-u2-ActionView:hover:not(:disabled) {
      background: $test2;
      color: $foreground2;
    }
    ^myButton.foam-u2-ActionView:focus {
      background: $test3;
      color: $foreground2;
      border-color: $test1;
    }
  `,
  cssTokens: [
    {
      name: 'test1',
      value: 'red'
    },
    {
      name: 'test2',
      value: function(e) { return e.LIGHTEN(e.TOKEN('$test1'), -20); }
    },
    {
      name: 'test3',
      value: function(e) { return e.LIGHTEN(e.TOKEN('$test2'), -20); }
    },
    {
      name: 'foreground1',
      value: function(e) { return e.FOREGROUND(e.TOKEN('$test1'), 'black', 'white'); }
    },
    {
      name: 'foreground2',
      value: function(e) { return e.FOREGROUND(e.TOKEN('$test2'), 'black', 'white'); }
    }
  ],

  properties: [
    'color',
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
      .tag(this.COLOR.__, { config: { label: 'Color for test1 token' } })
      .tag(this.SAVE)
      .endContext()
      .br().br()
      .start()
        .add('Interact with this action to see auto generated hover and clicked states')
        .br()
        .start(this.TEST_ACTION, { buttonStyle: 'PRIMARY' }).addClass(this.myClass('myButton')).end()
      .end();
    }
  ],
  actions: [
    { name: 'testAction', code: () => {} },
    {
      name: 'save',
      code: function(X) {
        X.cssTokenOverrideDAO.put(foam.nanos.theme.customisation.CSSTokenOverride.create({ theme: '', source: 'test1', target: this.color }, this))
          .then(() => {
            if ( this.ctrl ) {
              return;
            }
            // Trying to imitate ApplicationController's fancy CSS live update
            let a = foam.u2.CSS.create({ code: this.cls_.model_.css }, this);
            X.installCSS(a.expandCSS(this.cls_, a.code, X));
          });
      }
    }
  ]
});
