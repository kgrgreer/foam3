/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'ColorToken',
  extends: 'foam.u2.CSSToken',
  requires: ['foam.u2.CSSToken'],
  documentation: 'SubClass of CSS tokens that installs convenience tokens for different states',

  properties: [
    {
      class: 'Int',
      name: 'hoverModifier',
      value: -20
    },
    {
      class: 'Int',
      name: 'activeModifier',
      value: -40
    },
    {
      class: 'Int',
      name: 'disabledModifier',
      value: 60
    },
    {
      class: 'String',
      name: 'onLight',
      value: '$Black'
    },
    {
      class: 'String',
      name: 'onDark',
      value: '$White'
    }
  ],
  methods: [
    function installInClass(cls) {
      this.SUPER(cls);
      let ax = this;
      ['hover', 'active', 'disabled'].forEach(a => {
        let n = `${ax.name}$${a}`;
        Object.defineProperty(cls, foam.String.constantize(n),
          {
            get: function() { 
              return foam.u2.CSSToken.create({
                name: n,
                value: function(e) { return e.LIGHTEN(e.TOKEN('$' + ax.name), ax[`${a}Modifier`]); },
                fallback: ax.fallback
              });
            }
          }
        );
      });
      ['', 'hover', 'active', 'disbaled'].forEach(a => {
        let n = a ? `${ax.name}$${a}$foreground` : ax.name + '$foreground';
        Object.defineProperty(cls, foam.String.constantize(n),
          {
            get: function() {
              return foam.u2.CSSToken.create({
                name: n,
                value: function(e) { return e.FOREGROUND(e.TOKEN(a ? `$${ax.name}$${a}` : '$' + ax.name), e.TOKEN(ax.onLight), e.TOKEN(ax.onDark)); }
              });
            }
          }
        );
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ColorTokenView',
  extends: 'foam.u2.View',
  documentation: '',
  cssTokens: [
    {
      class: 'foam.u2.ColorToken',
      name: 'test',
      value: 'red'
    }
  ],
  css: `
    ^box {
      height: 100px;
      width: 100px;
    }
  `,
  properties: [
    ...foam.u2.ColorToken.getAxiomsByClass(foam.core.Property),
    {
      name: 'data',
      class: 'String',
      label: 'Token Value',
      value: 'red'
    }
  ],
  methods: [
    function render() {
      const e = foam.css.TokenUtilsBuilder.create({}, this);
      var self = this;
      this
        .startContext({ data: this, controllerMode: 'CREATE' })
          .tag(this.DATA.__)
          .tag(this.HOVER_MODIFIER.__)
          .tag(this.ACTIVE_MODIFIER.__)
          .tag(this.DISABLED_MODIFIER.__)
        .endContext()
            .start({ class: 'foam.u2.tag.Button', label: 'Test' }).addClasses([this.myClass('box')]).style({ 'background-color': this.data$.map(d => e.TOKEN(d).f({ cls_: self.cls_, __subContext__: self.__subContext__ }) )}).end().add(this.data$.map(d => e.TOKEN(d).f({ cls_: self.cls_, __subContext__: self.__subContext__ }) )).br()
            .start({ class: 'foam.u2.tag.Button', label: 'Test' }).addClasses([this.myClass('box')]).style({ 'background-color': this.slot(function(data, hoverModifier) { return e.LIGHTEN(e.TOKEN(data), hoverModifier).f({ cls_: self.cls_, __subContext__: self.__subContext__ }); } ) }).end().add(this.slot(function(data, hoverModifier) { return e.LIGHTEN(e.TOKEN(data), hoverModifier).f({ cls_: self.cls_, __subContext__: self.__subContext__ }); } )).br()
            .start({ class: 'foam.u2.tag.Button', label: 'Test' }).addClasses([this.myClass('box')]).style({ 'background-color': this.slot(function(data, activeModifier) { return e.LIGHTEN(e.TOKEN(data), activeModifier).f({ cls_: self.cls_, __subContext__: self.__subContext__ }); } ) }).end().add(this.slot(function(data, activeModifier) { return e.LIGHTEN(e.TOKEN(data), activeModifier).f({ cls_: self.cls_, __subContext__: self.__subContext__ }); } )).br()
            .start({ class: 'foam.u2.tag.Button', label: 'Test' }).addClasses([this.myClass('box')]).style({ 'background-color': this.slot(function(data, disabledModifier) { return e.LIGHTEN(e.TOKEN(data), disabledModifier).f({ cls_: self.cls_, __subContext__: self.__subContext__ }); } ) }).end().add(this.slot(function(data, disabledModifier) { return e.LIGHTEN(e.TOKEN(data), disabledModifier).f({ cls_: self.cls_, __subContext__: self.__subContext__ }); } )).br();
    }
  ]
});
