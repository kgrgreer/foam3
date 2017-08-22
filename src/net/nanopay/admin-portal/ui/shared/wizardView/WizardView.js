foam.CLASS({
  package: 'net.nanopay.admin.ui.shared.wizardView',
  name: 'WizardView',
  extends: 'foam.u2.Controller',

  imports: [
    'closeDialog'
  ],

  exports: [
    'viewData',
    'errors',
    'goNext'
  ],

  documentation: `
    View that handles multi step procedures. If the next and back buttons require specific instructions aside from moving between views (such as API calls),
    please subclass this WizardView and override goNext() functions.
    Parameters:
    title: -
      Title of the Wizard itself.
    views: -
      Takes an array of ViewSpecs to populate the wizard. The label of the ViewSpec will be used as the title of the view in the subStack. But not the Wizard.
    startAt: -
      If you want to start at a certain view, pass in the appropriate index number.
    viewData: -
      If the view requires data to be displayed without fetching, viewData can be used to distinguish it from the usual foam.u2.View data.
  `,

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
          height: 694px;
          margin: auto;
          overflow: scroll;
        }
        ^ .title {
          margin: 0;
          margin-left: 180px;
          display: inline-block;
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          color: #093649;
        }
        ^ .titleRow div {
          display: inline;
        }
        ^ .titleRow {
          margin-top: 63px;
        }
        ^ .columnRow {
          margin-top: 42px;
        }
        ^ .foam-u2-ActionView-closeBtn {
          display: inline-block;
          margin: 0;
          float: right;
          margin-right: 68px;
          background: none;
          border: none;
          outline: none;
        }
        ^ .foam-u2-ActionView-closeBtn:hover {
          background: none;
          cursor: pointer;
        }
        ^ .close {
          display: inline-block;
          float: right;
          margin-right: 12px;
        }
        ^ .close:hover {
          cursor: pointer;
        }
        ^ .positionColumn {
          display: inline-block;
          width: 18%;
          max-height: 300px;
          overflow: scroll;
          vertical-align: top;
          box-sizing: border-box;
          margin-left: 15.7%;
        }
        ^ .stackColumn {
          display: inline-block;
          width: 75%;
          box-sizing: border-box;
          padding: 12px 0;
          overflow: scroll;
        }
        ^ .stackView {
          width: 55%;
          vertical-align: top;
          padding-top: 0px;
        }
        ^ .navigationContainer {
          margin-top: 50px;
          display: inline-block;
          width: 100%;
          height: 40px;
          float: right;
          margin-bottom: 16px;
        }
        ^ .pDefault {
          font-size: 12px;
          color: #093649;
          line-height: 1.33;
        }
        ^ .foam-u2-ActionView-unavailable {
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        ^ .foam-u2-ActionView-goNext {
          display: inline-block;
          background: none;
          outline: none;
          border:none;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: #5e91cb;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #FFFFFF;
        }
        ^ .foam-u2-ActionView-goNext:disabled {
          color: rgba(88, 165, 213, 0.5);
        }
        ^ .foam-u2-ActionView-goNext:hover:enabled {
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
    {
      class: 'String',
      name: 'title',
      value: ''
    },
    'views',
    {
      name: 'subStack',
      factory: function() { return this.Stack.create(); }
    },
    'position',
    {
      name: 'viewTitles',
      factory: function() { return []; }
    },
    {
      name: 'viewData',
      factory: function() { return {}; }
    },
    'errors',
    {
      class: 'Boolean',
      name: 'inDialog',
      value: false
    },
    'startAt'
  ],

  methods: [
    function init() {
      var self = this;

      if ( ! this.title ) { console.warn('[WizardView] : No title provided'); }

      this.views.forEach(function(viewData){
        self.viewTitles.push(viewData.label);
      });

      this.subStack.pos$.sub(this.posUpdate);

      if ( this.startAt ) { // If startAt position has been specified, push straight to that view
        if ( this.startAt < 0 || this.startAt > this.views.length - 1 ) { console.error('[WizardView] : Invalid startAt value'); }
        for ( var i = 0 ; i <= this.startAt ; i++ ) {
          this.subStack.push(this.views[i].view);
        }
      } else {
        this.subStack.push(this.views[0].view);
      }

      // Displays Close Button (X) on the top right or not
      this.inDialog = this.closeDialog ? true : false;
    },

    function initE(){
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('row').addClass('titleRow')
          .start('p').add(this.title || '').addClass('title').end()
          .add(this.CLOSE_BTN)
        .end()
        .start('div').addClass('row').addClass('columnRow')
          .start('div').addClass('positionColumn')
            .tag({ class: 'net.nanopay.admin.ui.shared.wizardView.WizardViewOverview', titles: this.viewTitles, position$: this.position$ })
          .end()
          .start('div').addClass('stackColumn')
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false }).addClass('stackView')
            .start('div').addClass('row')
              .start('div').addClass('navigationContainer')
                .add(this.GO_NEXT)
              .end()
            .end()
          .end()
        .end()
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
    {
      name: 'closeBtn',
      isAvailable: function(inDialog) { return inDialog; },
      icon: 'images/ic-cancel.svg',
      code: function() {
        this.closeDialog();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        if ( position < this.views.length - 1 ) return true; // Valid next
        if ( position == this.views.length - 1 && this.inDialog) return true; // Last Page & in dialog
        return false; // Not in dialog
      },
      code: function() {
        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          if ( this.inDialog ) this.closeDialog();
          return;
        }

        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    }
  ]
})
