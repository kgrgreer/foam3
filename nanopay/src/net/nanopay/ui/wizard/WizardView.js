foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardView',
  extends: 'foam.u2.Controller',
  abstract: true,
  exports: [
    'viewData',
    'errors',
    'backLabel',
    'nextLabel',
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
          width: 992px;
          height: 600px;
          margin: auto;
        }

        ^ .topRow {
          padding: 20px;
        }

        ^ .title {
          margin: 0;
          line-height: 40px;
          display: inline-block;
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          color: #093649;
        }

        ^ .positionColumn {
          display: inline-block;
          width: 25%;
          vertical-align: top;
          box-sizing: border-box;
          padding: 20px;
          padding-top: 0;
        }

        ^ .stackColumn {
          display: inline-block;
          width: 75%;
          max-height: 600px;
          box-sizing: border-box;
          padding: 20px 0;
          padding-top: 4px;
          padding-right: 20px;
          overflow-y: scroll;
        }

        ^ .stackView {
          width: 75%;
          vertical-align: top;
        }

        ^ .navigationContainer {
          display: inline-block;
          width: 75%;
          height: 40px;
          float: right;
          margin-bottom: 20px;
        }

        ^ .net-nanopay-ui-ActionView-unavailable {
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        ^ .net-nanopay-ui-ActionView-goBack {
          display: inline-block;
          margin: 0;
          box-sizing: border-box;
          margin-right: 30px;
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

        ^ .net-nanopay-ui-ActionView-goBack:disabled {
          color: rgba(9, 54, 73, 0.5);
        }

        ^ .net-nanopay-ui-ActionView-goBack:hover:enabled {
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
          color: rgba(88, 165, 213, 0.5);
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
    { name: 'ButtonCancel', message: 'Cancel'},
    { name: 'ButtonBack',   message: 'Back'},
    { name: 'ButtonNext',   message: 'Next'},
    { name: 'ButtonSubmit', message: 'Submit'}
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

    // If true, will not include the back/next buttons
    {
      class: 'Boolean',
      name: 'isCustomNavigation',
      value: false
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
      value: 'I Agree'
    },

    // When set to true, all circles in the overview will be filled in
    {
      class: 'Boolean',
      name: 'complete',
      value: false
    }
  ],

  methods: [
    function init() {
      var self = this;

      if ( ! this.title ) { console.warn('[WizardView] : No title provided'); }
      
      this.viewTitles = [];
      this.subStack = this.Stack.create();

      this.views.forEach(function(viewData){
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
    },

    function initE(){
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('topRow')
          .start('p').add(this.title || '').addClass('title').end()
        .end()
        .start('div')
          .start('div').addClass('positionColumn')
            .tag({ class: 'net.nanopay.ui.wizard.WizardOverview', titles: this.viewTitles, position$: this.position$ })
          .end()
          .start('div').addClass('stackColumn')
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false }).addClass('stackView')
          .end()
        .end();

      if ( ! this.isCustomNavigation ) {
        this.start('div')
          .start('div').addClass('navigationContainer')
            .tag(this.GO_BACK, {label$: this.backLabel$})
            .tag(this.GO_NEXT, {label$: this.nextLabel$})
          .end()
        .end();
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
      If you intend on displaying the goBack and goNext actions in a custom way
      by using isCustomNavigation, make sure to use:

      .startContext({data: this.wizard})
        .tag(//FULL PATH TO YOUR WIZARD//.GO_//BACK or NEXT//, {label$: this.backLabel$})
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
    }
  ]
});
