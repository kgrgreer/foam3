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

  imports: ['theme?'],

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
    
    ^ > .foam-u2-HTMLView{
      padding: 0;
    }

    /* Unstyled */
    ^unstyled {
      background: none;
      border: none;
      color: inherit;
    }

    /* Primary */
    ^primary, ^primary svg {
      background-color: /*%PRIMARY3%*/ #406dea;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
      color: /*%WHITE%*/ white;
      fill: /*%WHITE%*/ white;
    }

    ^primary:hover:not(:disabled) {
      background-color: /*%PRIMARY2%*/ #144794;
    }

    ^primary:focus {
      background-color: /*%PRIMARY2%*/ #144794;
      border-color: /*%PRIMARY1%*/ #202341;
    }

    ^primary:disabled {
      background-color: /*%PRIMARY4%*/ #C6D2FF;
    }

    /* Primary destructive */

    ^primary-destructive,^primary-destructive svg {
      background-color: /*%DESTRUCTIVE3%*/ #d9170e;
      color: /*%WHITE%*/ white;
      fill: /*%WHITE%*/ white;
    }

    ^primary-destructive:hover:not(:disabled) {
      background-color: /*%DESTRUCTIVE2%*/ #a61414;
    }

    ^primary-destructive:focus {
      background-color: /*%DESTRUCTIVE2%*/ #a61414;
      border: 1px solid /*%DESTRUCTIVE1%*/ #631414;
      box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: /*%DESTRUCTIVE5%*/ #E5D2D0;
    }


    /* Secondary */

    ^secondary{
      background-color: /*%WHITE%*/ white;
      border: 1px solid /*%GREY3%*/ #B2B6BD;
      color: /*%GREY1%*/ #494F59;
    }

    ^secondary svg { fill: /*%GREY1%*/ #494F59; } 

    ^secondary:hover:not(:disabled) {
      background-color: /*%GREY5%*/ #B2B6BD;
    }

    ^secondary:focus {
      background-color: /*%GREY5%*/ #B2B6BD;
      border: 1px solid /*%PRIMARY3%*/ #406DEA;
    }

    ^secondary:disabled{
      background-color: /*%GREY5%*/ #F5F7FA;
      border-color: /*%GREY4%*/ #DADDE2;
      color: /*%GREY4%*/ #DADDE2;
    }

    ^secondary:disabled svg { fill: /*%GREY4%*/ #DADDE2; }

    /* Secondary destructive */

    ^secondary-destructive{
      background-color: white;
      border: 1px solid /*%GREY3%*/ #B2B6BD;
      color: /*%DESTRUCTIVE2%*/ #a61414;
    }

    ^secondary-destructive svg { fill: /*%DESTRUCTIVE2%*/ #a61414; }

    ^secondary-destructive:hover {
      background-color: /*%GREY5%*/ #B2B6BD;
    }

    ^secondary-destructive:focus {
      background-color: /*%GREY5%*/ #B2B6BD;
      border-color: /*%DESTRUCTIVE2%*/ #a61414;
    }

    ^secondary-destructive:disabled {
      background-color: /*%GREY5%*/ #F5F7FA;
      border-color: /*%GREY4%*/ #DADDE2;
      color: /*%DESTRUCTIVE5%*/ #E5D2D0;
    }

    ^secondary-destructive:disabled svg { fill: /*%DESTRUCTIVE5%*/ #E5D2D0; }

    /* Tertiary */

    ^tertiary{ 
      background: none;
      border: 1px solid transparent;
      color: /*%GREY1%*/ #5E6061;
    }

    ^tertiary svg { fill: /*%GREY1%*/ #5E6061; }

    ^tertiary:hover:not(:disabled) {
      background-color: /*%GREY5%*/ #F5F7FA;
    }

    ^tertiary:focus,^tertiary:focus svg {
      background-color: /*%GREY5%*/ #F5F7FA;
      color: /*%PRIMARY3%*/ #494F59;
      fill: /*%PRIMARY3%*/ #494F59;
    }

    ^tertiary:disabled,^tertiary:disabled svg {
      color: /*%GREY4%*/ #DADDE2;
      fill: /*%GREY4%*/ #DADDE2;
    }


    /* Tertiary destructive */

    ^tertiary-destructive{
      background-color: transparent;
      border-color: transparent;
      color: /*%DESTRUCTIVE3%*/ #D9170E;   
    }

    ^tertiary-destructive svg { fill: /*%DESTRUCTIVE3%*/ #D9170E; }

    ^tertiary-destructive:hover:not(:disabled) {
      background-color: /*%GREY5%*/ #F5F7FA;
    }

    ^tertiary-destructive:focus,^tertiary-destructive:focus svg {
      background-color: /*%GREY5%*/ #F5F7FA;
      color: /*%DESTRUCTIVE3%*/ #494F59;
      fill: /*%DESTRUCTIVE3%*/ #494F59;
    }

    ^tertiary-destructive:disabled,^tertiary-destructive:diabled svg {
      color: /*%GREY4%*/ #DADDE2;
      fill: /*%GREY4%*/ #DADDE2;
    }

    /* Link */

    ^link,^link svg {
      background: none;
      color: /*%GREY1%*/ #5E6061;
      fill: /*%GREY1%*/ #5E6061;
    }

    ^link:hover,^link:hover svg {
      text-decoration: underline;
      color: /*%GREY2%*/ #6B778C;
      fill: /*%GREY2%*/ #6B778C;
    }

    ^link:focus,^link:focus svg {
      color: /*%PRIMARY3%*/ #406DEA;
      fill: /*%PRIMARY3%*/ #406DEA;
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
    }

    ^link^small,
    ^link^medium,
    ^link^large {
      padding-left: 0;
      padding-right: 0;
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
    function initE() {
      this.SUPER();

      this.initCls();

      this.on('click', this.click);

      this.addContent();

      this.attrs({name: this.name || '', 'aria-label': this.ariaLabel });

      this.addClass(this.slot(function(styleClass_) {
        return this.myClass(styleClass_);
      }));

      this.addClass(this.myClass(this.size.label.toLowerCase()));
      this.enableClass(this.myClass('iconOnly'), ! (this.contents || this.label));
      this.enableClass(this.myClass('iconAfter'), this.isIconAfter$);
    },

    function initCls() {
      this.addClass(this.myClass());
    },

    async function addContent() {
      /** Add text or icon to button. **/
      var self = this;
      var size = this.buttonStyle == this.buttonStyle.LINK ? '1em' : this.size.iconSize;
      var iconStyle = { 'max-width': size, 'object-fit': 'contain' };
      
      if ( this.themeIcon && this.theme ) {
        var indicator = this.themeIcon.clone(this).expandSVG();
        this.start(this.HTMLView, { data: indicator }).attrs({ role: 'presentation' }).style(iconStyle).end();
      } else if ( this.icon ) {
        if ( this.icon.endsWith('.svg') ) {
          var req  = this.HTTPRequest.create({
            method: 'GET',
            path: this.icon
          });
          await req.send().then(function(payload) {
            return payload.resp.text();
          }).then(x => {
            self.start(this.HTMLView, { data: x }).attrs({ role: 'presentation' }).style(iconStyle).end();
          });
        } else {
          this.start('img').style(iconStyle).attrs({ src: this.icon$, role: 'presentation' }).end();
        }
      } else if ( this.iconFontName ) {
        this.nodeName = 'i';
        this.cssClass(this.action.name);
        this.cssClass(this.iconFontClass); // required by font package
        this.style(iconStyle);
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
