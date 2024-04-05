/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Button',
  extends: 'foam.u2.View',

  documentation: 'Basic button view. Should be extended to add functionality',

  requires: [
    'foam.net.HTTPRequest',
    'foam.u2.ButtonSize',
    'foam.u2.ButtonStyle',
    'foam.u2.HTMLView',
    'foam.u2.LoadingSpinner',
    'foam.u2.tag.CircleIndicator'
  ],

  imports: [ 'theme?' ],

  cssTokens: [
    {
      name: 'buttonRadius',
      value: '4px'
    },
    {
      class: 'foam.u2.ColorToken',
      name: 'buttonPrimaryColor',
      value: '$primary400',
      disabledModifier: 90,
      onLight: '$grey50'
    },
    {
      class: 'foam.u2.ColorToken',
      name: 'buttonSecondaryColor',
      value: '$white',
      onLight: '$grey600',
      disabledModifier: -10,
      hoverModifier: -5,
      activeModifier: -15
    },
    {
      name: 'buttonSecondaryBorderColor',
      value: function(e) { return e.LIGHTEN(e.TOKEN('$buttonSecondaryColor'), -40) }
    },
    {
      name: 'buttonPrimaryLightColor',
      value: function(e) { return e.FROM_HUE(e.TOKEN('$buttonPrimaryColor'), 41, 90) }
    }
  ],
  css: `
    ^ {
      font: inherit;
      align-items: center;
      border: 1px solid transparent;
      border-radius: $buttonRadius;
      box-sizing: border-box;
      display: inline-flex;
      gap: 8px;
      justify-content: center;
      margin: 0;
      outline: none;
      position: relative;
      text-align: center;
    }

    ^:focus-visible {
      outline: 1px solid $primary700;
    }

    ^iconAfter {
      flex-direction: row-reverse;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
    }

    ^:hover^:disabled {
      cursor: not-allowed;
    }

    ^unavailable {
      display: none;
    }

    ^ img {
      vertical-align: middle;
    }

    ^ svg {
      width: 100%;
      max-height: 100%;
      vertical-align: middle;
    }

    ^.material-icons {
      cursor: pointer;
    }

    /* Unstyled */
    ^unstyled {
      background: none;
      border: none;
      color: inherit;
    }

    /* Primary */
    ^primary{
      background-color: $buttonPrimaryColor;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
      color: $buttonPrimaryColor$foreground;
    }

    ^primary svg {
      fill: $buttonPrimaryColor$foreground;
    }

    ^primary:hover:not(:disabled) {
      background-color: $buttonPrimaryColor$hover;
    }

    ^primary:active:not(:disabled) {
      background-color: $buttonPrimaryColor$active;
      border-color: $buttonPrimaryColor$hover;
    }

    ^primary:disabled {
      background-color: $buttonPrimaryColor$disabled;
      color: $buttonPrimaryColor$disabled$foreground;
    }

    /* Primary destructive */

    ^primary-destructive,^primary-destructive svg {
      background-color: $destructive400;
      color: $white;
      fill: $white;
    }

    ^primary-destructive:hover:not(:disabled) {
      background-color: $destructive500;
    }

    ^primary-destructive:active:not(:disabled) {
      background-color: $red500;
      border: 1px solid $red700;
      box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: $destructive50;
    }


    /* Secondary */

    ^secondary{
      background-color: $buttonSecondaryColor;
      border: 1px solid $buttonSecondaryBorderColor;
      color: $buttonSecondaryColor$foreground;
    }

    ^secondary svg { fill: $buttonSecondaryColor$foreground; }

    ^secondary:hover:not(:disabled):not(:active) {
      background-color: $buttonSecondaryColor$hover;
      color: $buttonSecondaryColor$hover$foreground;
    }

    ^secondary:hover:not(:disabled):not(:active) svg {
      fill: $buttonSecondaryColor$hover$foreground;
    }

    ^secondary:active:not(:disabled) {
      color: $buttonPrimaryColor;
      background-color: $buttonSecondaryColor$hover;
      border: 1px solid $buttonPrimaryColor;
    }

    ^secondary:disabled{
      background-color: $buttonSecondaryColor$disabled;
      border-color: $buttonSecondaryColor$disabled;
      color: $buttonSecondaryColor$active;
    }

    ^secondary:disabled svg { fill: $buttonSecondaryColor$disabled; }

    /* Secondary destructive */

    ^secondary-destructive{
      background-color: $white;
      border: 1px solid $destructive500;
      color: $destructive400;
    }

    ^secondary-destructive svg { fill: $destructive500; }

    ^secondary-destructive:hover:not(:disabled) {
      background-color: $buttonSecondaryColor$hover;
    }

    ^secondary-destructive:active:not(:disabled) {
      background-color: $buttonSecondaryColor$hover;
      border-color: $destructive500;
    }

    ^secondary-destructive:disabled {
      background-color: $buttonSecondaryColor$hover;
      border-color: $destructive100;
      color: $destructive100;
    }

    ^secondary-destructive:disabled svg { fill: $destructive50; }

    /* Tertiary */

    ^tertiary{
      background: none;
      border: 1px solid transparent;
      color: $buttonSecondaryColor$foreground;
    }

    ^tertiary svg { fill: $buttonSecondaryColor$foreground; }

    ^tertiary:hover:not(:disabled) {
      background-color: $buttonSecondaryColor$hover;
    }

    ^tertiary:active:not(:disabled) {
      background-color: $buttonSecondaryColor$hover;
      color: $buttonPrimaryColor;
    }

    ^tertiary:active:not(:disabled) svg {
      fill: $buttonPrimaryColor;
    }

    ^tertiary:disabled {
      color: $buttonSecondaryColor$active;
    }

    ^tertiary:disabled svg {
      fill: $buttonSecondaryColor$active;
    }

    /* Tertiary destructive */

    ^tertiary-destructive{
      background-color: transparent;
      border-color: transparent;
      color: $destructive400;
    }

    ^tertiary-destructive svg { fill: $destructive400; }

    ^tertiary-destructive:hover:not(:disabled):not(:active) {
      background-color: $buttonSecondaryColor$hover;
    }

    ^tertiary-destructive:active:not(:disabled) {
      background-color: $buttonSecondaryColor$hover;
      color: $red400;
    }

    ^tertiary-destructive:active:not(:disabled) svg {
      fill: $red400;
    }

    ^tertiary-destructive:disabled {
      color: $buttonSecondaryColor$disabled;
    }

    ^tertiary-destructive:diabled svg{
      fill: $buttonSecondaryColor$disabled;
    }

    /* Link */

    ^link,^link svg {
      background: none;
      color: $buttonSecondaryColor$foreground;
      fill: $buttonSecondaryColor$foreground;
    }

    ^link:hover:not(:disabled):not(:active),^link:hover:not(:disabled):not(:active) svg {
      text-decoration: underline;
      color: $buttonSecondaryColor$active$foreground;
      fill: $buttonSecondaryColor$active$foreground;
    }

    ^link:active:not(:disabled),^link:active:not(:disabled) svg {
      color: $buttonPrimaryColor;
      fill: $buttonPrimaryColor;
      text-decoration: underline;
    }

    /* Text */

    ^text{
      background: none;
      border: 1px solid transparent;
      color: $buttonPrimaryColor;
    }

    ^text svg { fill: $buttonPrimaryColor; }

    ^text:hover:not(:disabled) {
      background-color: $buttonPrimaryLightColor;
    }

    ^text:active:not(:disabled) {
      background-color: $buttonPrimaryLightColor;
      border-color: $buttonPrimaryColor;
    }

    ^text:disabled {
      color: $buttonSecondaryColor$active;
    }

    ^text:disabled svg {
      fill: $buttonSecondaryColor$active;
    }

    /* Sizes */

    ^small {
      padding: 6px 10px;
    }

    ^medium {
      padding: 8px 12px;
    }

    ^large {
      min-width: 100px;
      padding: 12px 12px;
    }

    ^iconOnly{
      padding: 8px;
      max-height: inherit;
    }

    ^link^small,
    ^link^medium,
    ^link^large {
      padding-left: 0;
      padding-right: 0;
    }

    ^link > .foam-u2-HTMLView{
      height: 1em;
    }

    ^svgIcon {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
    ^svgIcon svg {
      height: 100%;
    }

    /* SVGs outside themeGlyphs may have their own heights and widths,
    these ensure those are respected rather than imposing new dimensions */
    ^imgSVGIcon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ^imgSVGIcon svg {
      height: initial;
    }

    ^small svg,
    ^small img {
      width: 1.15em;
      height: 1.15em;
    }
    ^medium svg,
    ^medium img {
      width: 1.42em;
      height: 1.42em;
    }
    ^large svg,
    ^large img {
      width: 1.5em;
      height: 1.5em;
    }
    ^link svg, link img {
      width: 1em;
      height: 1em;
    }
    /* Loading indicator css */
    ^[data-loading] > :not(^loading) {
      opacity: 0;
    }
    ^loading {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ^primary ^loading svg, ^primary:disabled > ^loading svg {
      fill: $buttonPrimaryColor$foreground;
    }
    ^secondary ^loading svg, ^tertiary ^loading svg,  ^link ^loading svg,
    ^secondary:disabled ^loading svg, ^tertiary:disabled ^loading svg,  ^link:disabled ^loading svg {
      fill: $buttonSecondaryColor$foreground;
    }
    ^text > ^loading svg, ^text:disabled > ^loading svg {
      fill: $buttonPrimaryColor;
    }
  `,

  properties: [
    'name',
    {
      class: 'GlyphProperty',
      name: 'themeIcon'
    },
    {
      class: 'URL',
      name: 'icon'
    },
    {
      class: 'Boolean',
      name: 'isIconAfter'
    },
    {
      class: 'String',
      name: 'iconFontFamily'
    },
    {
      class: 'String',
      name: 'iconFontClass'
    },
    {
      class: 'String',
      name: 'iconFontName'
    },
    [ 'nodeName', 'button' ],
    {
      name: 'label'
    },
    {
      class: 'String',
      name: 'ariaLabel'
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonStyle',
      name: 'buttonStyle',
      value: 'SECONDARY'
    },
    {
      class: 'Boolean',
      name: 'isDestructive',
      documentation: `
        When set to true, this action should be styled in a way that indicates
        that data is deleted in some way.
      `,
      factory: function() {
        return false;
      }
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonSize',
      name: 'size',
      value: 'MEDIUM'
    },
    {
      class: 'String',
      name: 'styleClass_',
      expression: function(isDestructive, buttonStyle) {
        var s = buttonStyle.name.toLowerCase();
        return isDestructive ? s + '-destructive' : s;
      }
    },
    [ 'loading_', false]
  ],

  methods: [
    function render() {
      this.SUPER();

      this.initCls();

      this.on('click', this.click);

      this.addContent();

      this.attrs({ name: this.name || '', 'aria-label': this.ariaLabel });

      this.addClass(this.slot(function(styleClass_) {
        return this.myClass(styleClass_);
      }));

      this.addClass(this.myClass(this.size.label.toLowerCase()));
      this.enableClass(this.myClass('iconOnly'), ! (this.contents || this.label));
      this.enableClass(this.myClass('iconAfter'), this.isIconAfter$);
      this.enableClass('destructive', this.isDestructive$);
    },

    function initCls() {
      this.addClass();
    },

    async function addContent() {
      /** Add text or icon to button. **/
      var self = this;
      if ( ( this.themeIcon && this.theme ) ) {
        this
          .start({ class: 'foam.u2.tag.Image', glyph: this.themeIcon, role: 'presentation' })
            .addClass(this.myClass('SVGIcon'))
          .end();
      } else if ( this.icon ) {
        this
          .start({ class: 'foam.u2.tag.Image', data: this.icon, role: 'presentation', embedSVG: true })
            .addClass(this.myClass('SVGIcon'), this.myClass('imgSVGIcon'))
          .end();
      } else if ( this.iconFontName ) {
        this.nodeName = 'i';
        this.addClass(this.action.name);
        this.addClass(this.iconFontClass); // required by font package
        this.attr(role, 'presentation')
        this.style({ 'font-family': this.iconFontFamily });
        this.add(this.iconFontName);
      }

        if ( foam.String.isInstance(this.label) ) {
          if ( this.buttonStyle == 'LINK' || this.buttonStyle == 'UNSTYLED' ) {
            this.start().addClass('p').add(this.label$).end();
          } else {
            this.start().addClass('h600').add(this.label$).end();
          }
        } else if ( foam.Object.isInstance(this.label) && ! this.label.then ) {
          this.tag(this.label);
        } else {
          this.add(this.label$);
        }

      this.attrs({ 'data-loading': this.loading_$ })
      this.add(this.slot(function(loading_) {
        return loading_ ? this.E().tag(self.LoadingSpinner, {size: '100%'}).addClass(self.myClass('loading')) : this.E().hide();
      }));
    }
  ],

  listeners: [
    function click(e) {
      // Implemented by subclasses
      e.preventDefault();
      e.stopPropagation();
    }
  ]

});
