/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'OverlayActionListView',
  extends: 'foam.u2.tag.Button',

  documentation: 'An overlay that presents a list of actions a user can take.',

  requires: [
    'foam.core.ConstantSlot',
    'foam.core.ExpressionSlot',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.HTMLView',
    'foam.u2.LoadingSpinner'
  ],

  imports: [
    'ctrl',
    'document',
    'theme'
  ],

  exports: [
    'overlay_ as dropdown'
  ],

  cssTokens: [
    {
      class: 'foam.u2.ColorToken',
      name: 'overlayButtonHighlight',
      value: '$primary50'
    }
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'data'
    },
    {
      name: 'obj'
    },
    {
      class: 'Boolean',
      name: 'disabled_'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'overlay_',
      factory: function() {
        return this.OverlayDropdown.create();
      }
    },
    {
      class: 'Boolean',
      name: 'overlayInitialized_'
    },
    'dao',
    {
      class: 'Boolean',
      name: 'showDropdownIcon',
      documentation: 'Hide/Show dropdown arrow',
      value: true
    },
    {
      name: 'dropdownIcon',
      documentation: 'fallback dropdown icon that can be specified for non-nanos apps',
      value: '/images/dropdown-icon.svg'
    },
    // Used for keyboard navigation
    'firstEl_', 'lastEl_',
    [ 'isMouseClick_', true ]
  ],

  css: `
    ^disabled button {
      color: $buttonSecondaryColor$disabled$foreground;
    }

    ^button-container button {
      border: 1px solid transparent;
      background-color: $white;
      justify-content: space-between;
      text-align: left;
      white-space: nowrap;
      width: fill-available;
      width: -webkit-fill-available;
    }

    ^button-container button svg {
      fill: currentcolor;
    }

    ^button-container button > img{
      height: 100%;
    }

    ^button-container button:hover:not(:disabled) {
      background-color: $overlayButtonHighlight;
      color: $overlayButtonHighlight$foreground;
    }

    ^button-container button:focus {
      border-color: $overlayButtonHighlight$hover;
      background-color: $overlayButtonHighlight;
      color: $overlayButtonHighlight$foreground;
    }

    ^button-container button:focus:not(:focus-visible){
      border-color: transparent;
    }

    /* destructive */

    ^button-container .destructive{
      color: $destructive500;
    }

    ^button-container .destructive svg { fill: $destructive500; }

    ^button-container .destructive:hover:not(:disabled) {
      background-color: $destructive50;
    }

    ^button-container .destructive:focus {
      border-color: $destructive500;
      background-color: $destructive50;
    }

    ^button-container .destructive:disabled {
      color: $destructive50;
    }

    ^button-container .destructive:disabled svg { fill: $destructive50; }

    ^iconOnly{
      padding: 0px;
    }

    ^dropdown svg {
      font-size: 0.6rem;
      fill: currentcolor;
    }

    ^iconContainer {
      margin-left: auto;
    }
  `,

  methods: [
    async function render() {
      this.SUPER();

      this.shown = false;
      this.onDetach(this.data$.sub(this.recheckShown));
      await this.recheckShown();
    },

    function addContent() {
      this.SUPER();
      var self = this;
      if ( this.showDropdownIcon ) {
        this.add(this.shown$.map(function(shown) {
          var e = self.E().addClass(self.myClass('iconContainer'));
          if ( shown ) {
            e.callIfElse(self.theme,
              function() {
                this.start(self.HTMLView, { data: self.theme.glyphs.dropdown.expandSVG() })
                  .addClass(self.myClass('SVGIcon'), self.myClass('dropdown'))
                .end();
              },
              function() {
                this.start('img').attr('src', this.dropdownIcon$).end();
              }
            );
          }
          return e;
        }));
      }
    },

    async function initializeOverlay(x, y) {
      var self = this;
      this.overlayInitialized_ = true;
      var spinner = this.E().style({ padding: '1em' }).tag(self.LoadingSpinner, { size: 24 });
      this.overlay_.add(spinner);
      // Add the overlay to the controller so if the table is inside a container
      // with `overflow: hidden` then this overlay won't be cut off.
      this.ctrl.add(this.overlay_);
      this.overlay_.open(x, y);

      if ( this.obj && this.dao ) {
        this.obj = await this.dao.inX(this.__context__).find(this.obj.id);
      }

      this.onDetach(this.disabled_$.follow(this.ExpressionSlot.create({
        args: this.data.map(action => {
          if (  foam.u2.ActionReference.isInstance(action) ) action.action.createIsAvailable$(this.__context__, action.data)
          if ( ! foam.core.Action.isInstance(action) ) return foam.core.SimpleSlot.create({ value: true }, this);
          return action.createIsAvailable$(this.__context__, this.obj)
        }),
        code: (...rest) => ! rest.reduce((l, r) => l || r, false)
      })));

      this.onDetach(() => { this.overlay_ && this.overlay_.remove(); });

      self.obj?.sub(function() {
        self.overlay_.close();
      });

      // a list where element at i stores whether ith action in data is enabled or not
      const enabled = await Promise.all(this.data.map(action => {
        if ( ! foam.core.Action.isInstance(action) ) return true;
        return this.isEnabled.bind(this);
      }));
      // a list where element at i stores whether ith action in data is available or not
      const availabilities = await Promise.all(this.data.map(action => {
        if ( ! foam.core.Action.isInstance(action) ) return true;
        return this.isAvailable.bind(this);
      }));

      var el = this.E().startContext({ data: self.obj, dropdown: self.overlay_ })
        .forEach(self.data, function(action, index) {
          if ( availabilities[index] ) {
            this
              .start()
                .addClass(self.myClass('button-container'))
                .callIfElse(foam.u2.ActionReference.isInstance(action), function() { 
                  this.tag(action.action, { buttonStyle: 'UNSTYLED', data$: action.data$})
                }, function() {
                  this.tag(action, { buttonStyle: 'UNSTYLED' })
                })
                .attrs({ tabindex: -1 })
                .callIf(! enabled[index], function() {
                  this
                    .addClass(self.myClass('disabled'))
                    .attrs({ disabled: true })
                })
              .end();
          }
        })
      .endContext();
      spinner.remove();
      this.overlay_.add(el);
      this.overlay_.open(x, y);

      // Moves focus to the modal when it is open and keeps it in the modal till it is closed

      this.overlay_.on('keydown', this.onKeyDown);
      var actionElArray_ = this.overlay_.dropdownE_.childNodes;
      this.firstEl_ = actionElArray_[0].childNodes[0];
      this.lastEl_ = actionElArray_[actionElArray_.length - 1].childNodes[0];
      (this.firstEl_ && ! this.isMouseClick) && this.firstEl_.focus();
    },

    async function isEnabled(action) {
      /*
       * checks if action is enabled
       */
      let slot;
      if (  foam.u2.ActionReference.isInstance(action) ) {
        slot = action.action.createIsEnabled$(this.__context__, action.data)
      }
      else {
        slot = action.createIsEnabled$(this.__context__, this.obj);
      }
      if ( slot.get() ) return true;
      return slot.args[1].promise || false;
    },

    async function isAvailable(action) {
      /*
       * checks if action is available
       */
      if (  foam.u2.ActionReference.isInstance(action) ) {
        slot = action.action.createIsAvailable$(this.__context__, action.data)
      }
      else {
        slot = action.createIsAvailable$(this.__context__, this.obj);
      }
      if ( slot.get() ) return true;
      return slot.promise || false;
    }
  ],

  listeners: [
    function click(evt) {
      this.SUPER(evt);
      this.overlay_.parentEl = this.el_();
      this.isMouseClick = !! evt.detail;
      var x = evt.clientX || this.getBoundingClientRect().x;
      var y = evt.clientY || this.getBoundingClientRect().y;
      if ( this.disabled_ ) return;
      if ( ! this.overlayInitialized_ ) {
        this.initializeOverlay(x, y);
      } else {
        this.overlay_.open(x, y);
      }
      (this.firstEl_ && ! this.isMouseClick) && this.firstEl_.focus();
    },

    function onKeyDown(e) {
      var isTabPressed = (e.key === 'Tab' || e.keyCode === 9);

      if ( ! isTabPressed ) {
        return;
      }

      if ( e.shiftKey ) {
        if ( this.document.activeElement === this.firstEl_.el_() ) {
          this.lastEl_.focus();
          e.preventDefault();
        }
      } else {
        if ( this.document.activeElement === this.lastEl_.el_() ) {
          this.firstEl_.focus();
          e.preventDefault();
        }
      }
    },

    async function recheckShown() {
      for ( let action of this.data ) {
        if ( ! foam.core.Action.isInstance(action) || await this.isAvailable(action) ) {
          this.shown = true;
          break;
        }
      }
    }
  ]
});
