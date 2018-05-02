foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardView',
  extends: 'foam.u2.Controller',
  abstract: true,

  exports: [
    'viewData',
    'errors',
    'exitLabel',
    'saveLabel',
    'backLabel',
    'nextLabel',
    'exit',
    'save',
    'goTo',
    'goBack',
    'goNext',
    'complete',
    'as wizard'
  ],

  documentation: 'View that handles multi step procedures.',

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          background-color: #edf0f5;
          width: 1160px;
          height: calc(100% - 20px - 60px - 60px);
          margin: auto;
          padding-top: 30px;
          box-sizing: border-box;
        }

        ^ .title {
          margin: 0;
          line-height: 40px;
          margin-bottom: 30px;
          display: inline-block;
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          color: #093649;
        }

        ^ .subTitle {
          margin: 0;
          line-height: 40px;
          display: inline-block;
          font-size: 30px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          color: #093649;

          margin-bottom: 30px;
        }

        ^ .positionColumn {
          display: inline-block;
          width: 300px;
          vertical-align: top;
          box-sizing: border-box;
          padding: 20px;
          padding-left: 0;
          padding-top: 0;
        }

        ^ .stackColumn {
          display: inline-block;
          width: calc(100% - 300px);
          height: calc(100% - 65px);
          box-sizing: border-box;
          padding: 20px 0;
          padding-top: 4px;
          overflow-y: scroll;
          vertical-align: top;
        }

        ^ .navigationBar {
          position: fixed;
          width: 100%;
          height: 60px;
          left: 0;
          bottom: 0;
          background-color: white;
          z-index: 100;
        }

        ^ .navigationContainer {
          margin: 0 auto;
          width: 1160px;
          height: 100%;
          padding: 10px 0;
        }

        ^ .exitContainer {
          float: left;
        }

        ^ .backNextContainer {
          float: right;
        }

        ^ .net-nanopay-ui-ActionView-unavailable {
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        ^ .plainAction {
          display: inline-block;
          margin: 0;
          box-sizing: border-box;
          margin-right: 10px;
          background: none;
          outline: none;
          border:none;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          background-color: rgba(164, 179, 184, 0.1);
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #093649;
        }

        ^ .plainAction:last-child {
          margin-right: 0;
        }

        ^ .plainAction:disabled {
          background-color: #c2c9ce;
          opacity: 0.5;
          color: white;
        }

        ^ .plainAction:hover:enabled {
          cursor: pointer;
          background: none;
          background-color: rgba(164, 179, 184, 0.4);
        }

        ^ .net-nanopay-ui-ActionView-goNext {
          display: inline-block;
          margin: 0;
          background: none;
          outline: none;
          border:none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: %SECONDARYCOLOR%;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
        }

        ^ .net-nanopay-ui-ActionView-goNext:disabled {
          color: white;
          background-color: #c2c9ce;
        }

        ^ .net-nanopay-ui-ActionView-goNext:hover:enabled {
          cursor: pointer;
          background: none;
          background-color: #3783b3;
        }

    */}
    })
  ],

  messages: [
    { name: 'ButtonCancel', message: 'Cancel' },
    { name: 'ButtonBack',   message: 'Back' },
    { name: 'ButtonNext',   message: 'Next' },
    { name: 'ButtonSubmit', message: 'Submit' }
  ],

  properties: [
    // Title of the Wizard View
    {
      class: 'String',
      name: 'title',
      value: ''
    },

    // Array of ViewSpecs.
    'views',

    // The stack that is handled by this Wizard View.
    {
      name: 'subStack'
    },

    // Current view the user is viewing in the substack.
    'position',

    // The titles of the views extracted from the ViewSpecs into an array.
    {
      name: 'viewTitles',
      factory: function() { return []; }
    },

    // The common data shared between each screen.
    {
      name: 'viewData',
      factory: function() { return {}; }
    },

    // The errors thrown from the sub view.
    'errors',

    // If set, will start the wizard at a certain position
    'startAt',

    // If true, displays the Save Action
    {
      class: 'Boolean',
      name: 'hasSaveOption',
      value: false
    },

    // If true, displays the Exit Action
    {
      class: 'Boolean',
      name: 'hasExitOption',
      value: false
    },

    // Label for the back button
    {
      class: 'String',
      name: 'exitLabel',
      value: 'Exit'
    },

    // Label for the next button
    {
      class: 'String',
      name: 'saveLabel',
      value: 'Save'
    },

    // Label for the back button
    {
      class: 'String',
      name: 'backLabel',
      value: 'Back'
    },

    // Label for the next button
    {
      class: 'String',
      name: 'nextLabel',
      value: 'Next'
    },

    // When set to true, all circles in the overview will be filled in
    {
      class: 'Boolean',
      name: 'complete',
      value: false
    },

    //When set to true, the bottomBar will hide
    {
      class: 'Boolean',
      name: 'hideBottomBar',
      value: false
    },

    'pushView'
  ],

  methods: [
    function init() {
      var self = this;

      if ( ! this.title ) { console.warn('[WizardView] : No title provided'); }

      this.viewTitles = [];
      this.subStack = this.Stack.create();

      this.views.filter(function (view) {
        return ! view.hidden;
      }).forEach(function(viewData) {
        self.viewTitles.push(viewData.label);
      });

      this.subStack.pos$.sub(this.posUpdate);

      if ( this.startAt ) { // If startAt position has been specified, push straight to that view
        if ( this.startAt < 0 || this.startAt > this.views.length - 1 ) {
          console.error('[WizardView] : Invalid startAt value');
          this.subStack.push(this.views[0].view);
          return;
        }

        for ( var i = 0 ; i <= this.startAt ; i++ ) {
          this.subStack.push(this.views[i].view);
        }
      } else {
        this.subStack.push(this.views[0].view);
      }

      if( this.pushView ) {
        this.subStack.push(this.pushView.view);
        this.position = this.pushView.position;
        this.pushView = null;
      }
    },

    function initE(){
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('div')
          .start('div')
            .start('p').add(this.title || '').addClass('title').end()
          .end()
          .start('div').addClass('positionColumn')
            .tag({ class: 'net.nanopay.ui.wizard.WizardOverview', titles: this.viewTitles, position$: this.position$ })
          .end()
          .start('div').addClass('stackColumn')
            .start('div')
              .start('p').add(this.position$.map(function(p) {
                return self.views[p] ? self.views[p].label : '';
              }) || '').addClass('subTitle').end()
            .end()
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false })
          .end()
        .end()
        .callIf(!this.hideBottomBar, function(){
          this.start('div').addClass('navigationBar')
            .start('div').addClass('navigationContainer')
              .start('div').addClass('exitContainer')
                .callIf(this.hasExitOption, function() {
                  this.start(self.EXIT, {label$: self.exitLabel$}).addClass('plainAction').end();
                })
                .callIf(this.hasSaveOption, function() {
                  this.start(self.SAVE, {label$: self.saveLabel$}).addClass('plainAction').end();
                })
              .end()
              .start('div').addClass('backNextContainer')
                .start(this.GO_BACK, {label$: this.backLabel$}).addClass('plainAction').end()
                .tag(this.GO_NEXT, {label$: this.nextLabel$})
              .end()
            .end()
          .end();
        });
    },

    function goTo(index) {
      if ( index < this.position ) {
        while( this.position > index && this.position > 0 ) {
          this.subStack.back();
        }
      } else if ( index > this.position ) {
        while( this.position < index && this.position < this.subStack.depth ) {
          this.subStack.back();
        }
      }
    }
  ],

  listeners: [
    {
      name: 'posUpdate',
      code: function() {
        var self = this;
        self.position = this.subStack.pos;
      }
    }
  ],

  actions: [
    /*
      NOTE:
      If you intend on displaying any of the actions outside of the bottom bar,
      make sure to use:

      .startContext({data: this.wizard})
        .tag(<FULL PATH TO YOUR WIZARD.ACTION>, {label$: this.backLabel$})
      .endContext()
    */
    {
      name: 'goBack',
      code: function(X) {
        if ( this.position <= 0 ) {
          X.stack.back();
          return;
        }
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        return false;
      },
      code: function(X) {
        if ( this.position == this.views.length - 1 ) { // If last page
          X.stack.back();
          return;
        }

        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    },
    {
      name: 'exit',
      code: function(X) {
        X.stack.back();
      }
    },
    {
      name: 'save',
      code: function(X) {
        // TODO: Implement a save function or it has be overwritten
        X.stack.back();
      }
    }
  ]
});
