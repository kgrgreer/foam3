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
    'foam.u2.HTMLView'
  ],

  imports: [
    'ctrl',
    'document',
    'theme'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
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
    ^disabled > button {
      color: /*%GREY4%*/ grey;
    }

    ^button-container>button {
      border: 1px solid transparent;
      background-color: /*%WHITE%*/ #FFFFFF;
      justify-content: flex-start;
      text-align: left;
      white-space: nowrap;
      width: fill-available;
      width: -webkit-fill-available;
    }

    ^button-container > button > img{
      height: 100%;
    }

    ^button-container>button:hover {
      background-color: /*%PRIMARY5%*/ #E5F1FC;
    }

    ^button-container>button:focus {
      border-color: /*%PRIMARY4%*/ #C6D2FF;
      background-color: /*%PRIMARY5%*/ #E5F1FC;
    }

    ^button-container>button:focus:not(:focus-visible){
      border-color: transparent;
    }

    ^iconOnly{
      padding: 0px;
    }

    ^dropdownIcon {
      margin-left: 4px;
      width: 1.5em;
    }
  `,

  methods: [
    function initE() {
      var dataSlots = this.data.map((action) => action.createIsAvailable$(this.__context__, this.obj));
      if  ( ! dataSlots.filter(slot => slot.get()).length > 0 ) {
        this.shown = false; return;
      }
      this.SUPER();
    },

    function addContent() {
      this.SUPER();
      this.showDropdownIcon && this.start().addClass(this.myClass('dropdownIcon')).add(this.theme ?
        this.HTMLView.create({ data: this.theme.glyphs.dropdown.expandSVG() }):
        this.start('img').attr('src', this.dropdownIcon$).end()
      ).end();
    },

    async function initializeOverlay() {
      var self = this;

      if ( this.obj && this.dao ) {
        this.obj = await this.dao.inX(this.__context__).find(this.obj.id);
      }

      this.onDetach(this.disabled_$.follow(this.ExpressionSlot.create({
        args: this.data.map((action) => action.createIsAvailable$(this.__context__, this.obj)),
        code: (...rest) => ! rest.reduce((l, r) => l || r, false)
      })));

      this.onDetach(() => { this.overlay_ && this.overlay_.remove(); });

      self.obj.sub(function() {
        self.overlay_.close();
      });

      this.overlay_.startContext({ data: self.obj })
        .forEach(self.data, function(action) {
          if ( action.createIsAvailable$(self.__context__, self.obj).value ) {
            this
              .start()
                .addClass(self.myClass('button-container'))
                .addClass(action.createIsEnabled$(self.__context__, self.obj).map( e => ! e && self.myClass('disabled')))
                .tag(action, { buttonStyle: 'UNSTYLED' })
                .attrs({
                  disabled: action.createIsEnabled$(self.__context__, self.obj).map(function(e) {
                    return ! e;
                  }),
                  tabindex: -1
                })
              .end();
          }
        })
      .endContext();

      // Moves focus to the modal when it is open and keeps it in the modal till it is closed
      
      this.overlay_.on('keydown', this.onKeyDown);
      var actionElArray_ = this.overlay_.dropdownE_.childNodes;
      this.firstEl_ = actionElArray_[0].childNodes[0];
      this.lastEl_ = actionElArray_[actionElArray_.length - 1].childNodes[0];
      (this.firstEl_ && ! this.isMouseClick) && this.firstEl_.focus();

      // Add the overlay to the controller so if the table is inside a container
      // with `overflow: hidden` then this overlay won't be cut off.
      this.ctrl.add(this.overlay_);
      this.overlayInitialized_ = true;
    }
  ],

  listeners: [
    function click(evt) {
      this.SUPER(evt);
      this.overlay_.parentEl = this;
      this.isMouseClick = !! evt.detail;
      var x = evt.clientX || this.getBoundingClientRect().x;
      var y = evt.clientY || this.getBoundingClientRect().y;
      if ( this.disabled_ ) return;
      if ( ! this.overlayInitialized_ ) this.initializeOverlay();
      this.overlay_.open(x, y);
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
    }
  ]
});
