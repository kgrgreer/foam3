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
    'foam.u2.tag.CircleIndicator'
  ],

  imports: [ 'theme?' ],

  css: `
    ^ {
      font: inherit;
      align-items: center;
      border: 1px solid transparent;
      border-radius: 4px;
      box-sizing: border-box;
      display: inline-flex;
      gap: 8px;
      justify-content: center;
      margin: 0;
      outline: none;
      text-align: center;
    }

    ^iconAfter {
      flex-direction: row-reverse;
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
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
    ^primary, ^primary svg {
      background-color: $primary400;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
      color: $white;
      fill: $white;
    }

    ^primary:hover:not(:disabled) {
      background-color: $primary500;
    }

    ^primary:focus {
      background-color: $primary500;
      border-color: $primary700;
    }

    ^primary:disabled {
      background-color: $primary200;
    }

    /* Primary destructive */

    ^primary-destructive,^primary-destructive svg {
      background-color: $red400;
      color: $white;
      fill: $white;
    }

    ^primary-destructive:hover:not(:disabled) {
      background-color: $red500;
    }

    ^primary-destructive:focus {
      background-color: $red500;
      border: 1px solid $red700;
      box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: $red700;
    }


    /* Secondary */

    ^secondary{
      background-color: $white;
      border: 1px solid $grey400;
      color: $grey700;
    }

    ^secondary svg { fill: $grey700; }

    ^secondary:hover:not(:disabled) {
      background-color: $grey50;
    }

    ^secondary:focus {
      background-color: $grey50;
      border: 1px solid $primary400;
    }

    ^secondary:disabled{
      background-color: $grey50;
      border-color: $grey200;
      color: $grey200;
    }

    ^secondary:disabled svg { fill: $grey200; }

    /* Secondary destructive */

    ^secondary-destructive{
      background-color: $white;
      border: 1px solid $grey400;
      color: $red500;
    }

    ^secondary-destructive svg { fill: $red500; }

    ^secondary-destructive:hover {
      background-color: $grey50;
    }

    ^secondary-destructive:focus {
      background-color: $grey50;
      border-color: $red500;
    }

    ^secondary-destructive:disabled {
      background-color: $grey50;
      border-color: $grey200;
      color: $red700;
    }

    ^secondary-destructive:disabled svg { fill: $red700; }

    /* Tertiary */

    ^tertiary{
      background: none;
      border: 1px solid transparent;
      color: $grey700;
    }

    ^tertiary svg { fill: $grey700; }

    ^tertiary:hover:not(:disabled) {
      background-color: $grey50;
    }

    ^tertiary:focus,^tertiary:focus svg {
      background-color: $grey50;
      color: $primary400;
      fill: $primary400;
    }

    ^tertiary:disabled,^tertiary:disabled svg {
      color: $grey200;
      fill: $grey200;
    }


    /* Tertiary destructive */

    ^tertiary-destructive{
      background-color: transparent;
      border-color: transparent;
      color: $red400;
    }

    ^tertiary-destructive svg { fill: $red400; }

    ^tertiary-destructive:hover:not(:disabled) {
      background-color: $grey50;
    }

    ^tertiary-destructive:focus,^tertiary-destructive:focus svg {
      background-color: $grey50;
      color: $red400;
      fill: $red400;
    }

    ^tertiary-destructive:disabled,^tertiary-destructive:diabled svg {
      color: $grey200;
      fill: $grey200;
    }

    /* Link */

    ^link,^link svg {
      background: none;
      color: $grey700;
      fill: $grey700;
    }

    ^link:hover:not(:disabled),^link:hover svg {
      text-decoration: underline;
      color: $grey500;
      fill: $grey500;
    }

    ^link:focus,^link:focus svg {
      color: $primary400;
      fill: $primary400;
    }

    /* Sizes */

    ^small {
      padding: 6px 10px;
    }

    ^medium {
      padding: 8px 12px;
      max-height: 34px;
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
      width: 1.71em;
      height: 1.71em;
    }
    ^large svg,
    ^large img {
      width: 2.25em;
      height: 2.25em;
    }
    ^link svg, link img {
      width: 1em;
      height: 1em;
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
    }
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
            .addClasses([this.myClass('SVGIcon'), this.myClass('imgSVGIcon')])
          .end();
      } else if ( this.iconFontName ) {
        this.nodeName = 'i';
        this.addClass(this.action.name);
        this.addClass(this.iconFontClass); // required by font package
        this.attr(role, 'presentation')
        this.style({ 'font-family': this.iconFontFamily });
        this.add(this.iconFontName);
      }

      if ( this.label ) {
        if ( foam.String.isInstance(this.label) ) {
          if ( this.buttonStyle == 'LINK' || this.buttonStyle == 'UNSTYLED' ) {
            this.start().addClass('p').add(this.label$).end();
          } else {
            this.start().addClass('h600').add(this.label$).end();
          }
        } else {
          this.add(this.label$);
        }
      }
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
