foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ActionView',
  extends: 'foam.u2.Element',

  documentation: function() {`
    ActionView for Nanopay platform. 
    A button View for triggering Actions.

    Icon Fonts
    If using icon-fonts a css stylesheet link to the fonts is required in index.html.
    The default of foam.core.Action.js is 'Material Icons' supported by the following
    link: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
  `},

  axioms: [
    foam.u2.CSS.create({code: function() {/*

      ^unavailable {
        visibility: hidden;
      }

      ^ img {
        vertical-align: middle;
      }

      ^:disabled { filter: grayscale(80%); }

      ^.material-icons {
        cursor: pointer;
      }
    */}})
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showLabel',
      expression: function(icon, iconFontName ) { return ! ( icon || iconFontName); }
    },
    {
      class: 'URL',
      name: 'icon',
      factory: function(action) { return this.action.icon; }
    },
    {
      class: 'String',
      name: 'iconFontFamily',
      factory: function(action) { return this.action.iconFontFamily; }
    },
    {
      class: 'String',
      name: 'iconFontClass',
      factory: function(action) { return this.action.iconFontClass; }
    },
    {
      class: 'String',
      name: 'iconFontName',
      factory: function(action) { return this.action.iconFontName; }
    },
    'data',
    'action',
    [ 'nodeName', 'button' ],
    {
      name: 'label',
      factory: function(action) { return this.action.label; }
    }
  ],

  methods: [
    function initE() {
      this.initCls();

      this.
        on('click', this.click);

      if ( this.icon ) {
        // this.nodeName = 'a';
        this.start('img').attr('src', this.icon).end();
      } else if ( this.iconFontName ) {
        this.nodeName = 'i';
        this.cssClass(this.action.name);
        this.cssClass(this.iconFontClass); // required by font package
        this.style({'font-family': this.iconFontFamily});
        this.add(this.iconFontName);
      }

      if ( this.showLabel ) {
        this.add(this.label$);
      }

      this.setAttribute('title', this.action.toolTip); // hover text

      if ( this.action ) {
        if ( this.action.isAvailable ) {
          this.enableClass(this.myClass('unavailable'), this.action.createIsAvailable$(this.data$), true);
        }

        if ( this.action.isEnabled ) {
          this.attrs({disabled: this.action.createIsEnabled$(this.data$).map(function(e) { return e ? false : 'disabled'; })});
        }
      }
    },

    function initCls() {
      this.addClass(this.myClass());
      this.addClass(this.myClass(this.action.name));
    }
  ],

  listeners: [
    function click(e) {
      this.action && this.action.maybeCall(this.__subContext__, this.data);
      e.stopPropagation();
    }
  ]
});
