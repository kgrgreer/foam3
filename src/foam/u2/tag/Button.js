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
    'foam.u2.ButtonSize',
    'foam.u2.ButtonStyle'
  ],

  css: `
    ^ {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      border-radius: 4px;
      text-align: center;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      outline: none;
      border: 1px solid transparent;
      box-sizing: border-box;
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
    ^primary {
      background-color: /*%PRIMARY3%*/ #406dea;
      color: /*%WHITE%*/ white;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
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

    ^primary-destructive {
      background-color: /*%DESTRUCTIVE3%*/ #d9170e;
      color: /*%WHITE%*/ white;
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

    ^secondary {
      background-color: /*%WHITE%*/ white;
      border: 1px solid /*%GREY3%*/ #B2B6BD;
      color: /*%GREY1%*/ #494F59;
    }

    ^secondary:hover:not(:disabled) {
      background-color: /*%GREY5%*/ #B2B6BD;
    }

    ^secondary:focus {
      background-color: /*%GREY5%*/ #B2B6BD;
      border: 1px solid /*%PRIMARY3%*/ #406DEA;
    }

    ^secondary:disabled {
      background-color: /*%GREY5%*/ #F5F7FA;
      border-color: /*%GREY4%*/ #DADDE2;
      color: /*%GREY4%*/ #DADDE2;
    }


    /* Secondary destructive */

    ^secondary-destructive {
      background-color: white;
      border: 1px solid /*%GREY3%*/ #B2B6BD;
      color: /*%DESTRUCTIVE2%*/ #d9170e;
    }

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


    /* Tertiary */

    ^tertiary {
      background: none;
      border: 1px solid transparent;
      color: /*%GREY1%*/ #5E6061;
    }

    ^tertiary:hover:not(:disabled) {
      background-color: /*%GREY5%*/ #F5F7FA;
    }

    ^tertiary:focus {
      background-color: /*%GREY5%*/ #F5F7FA;
      color: /*%PRIMARY3%*/ #494F59;
    }

    ^tertiary:disabled {
      color: /*%GREY4%*/ #DADDE2;
    }


    /* Tertiary destructive */

    ^tertiary-destructive {
      background-color: transparent;
      border-color: transparent;
      color: /*%DESTRUCTIVE5%*/ #5E6061;
    }

    ^tertiary-destructive:hover:not(:disabled) {
      background-color: /*%GREY5%*/ #F5F7FA;
    }

    ^tertiary-destructive:focus {
      background-color: /*%GREY5%*/ #F5F7FA;
      color: /*%DESTRUCTIVE3%*/ #494F59;
    }

    ^tertiary-destructive:disabled {
      color: /*%GREY4%*/ #DADDE2;
    }

    /* Link */

    ^link {
      background: none;
      color: /*%GREY1%*/ #5E6061;
    }

    ^link:hover {
      text-decoration: underline;
      color: /*%GREY2%*/ #6B778C;
    }

    ^link:focus {
      color: /*%PRIMARY3%*/ #406DEA;
    }


    /* Sizes */

    ^small {
      padding: 6px 10px;
    }

    ^small > img {
      width: 16px;
      height: 16px;
    }

    ^medium {
      padding: 8px 12px;
    }

    ^medium > img {
      width: 24px;
      height: 24px;
    }

    ^large {
      padding: 12px 12px;
    }

    ^large > img {
      width: 32px;
      height: 32px;
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

    ^link^small > img,
    ^link^medium > img,
    ^link^large > img {
      width: 14px;
      height: 14px;
    }
  `,

  properties: [
    'name',
    {
      class: 'URL',
      name: 'icon'
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
      name: 'contents',
      documentation: 'Adds any element to the button'
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
      this.enableClass(this.myClass('iconOnly'), ! this.label);
    },

    function initCls() {
      this.addClass(this.myClass());
    },

    function addContent() {
      /** Add text or icon to button. **/
      if ( this.icon ) {
        this.start('img')
          .style({ 'margin-right': this.label ? '4px' : 0 })
          .attr('src', this.icon$)
        .end();
      } else if ( this.iconFontName ) {
        this.nodeName = 'i';
        this.cssClass(this.iconFontClass); // required by font package
        this.style({ 'font-family': this.iconFontFamily });
        this.add(this.iconFontName);
      }

      if ( this.label ) {
        if ( this.buttonStyle == 'LINK' || this.buttonStyle == 'UNSTYLED' ) {
          this.start().addClass('p').add(this.label$).end();
        } else {
          this.start().addClass('h600').add(this.label$).end();
        }
      }

      if ( this.contents ) {
        this.tag(this.contents$);
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
