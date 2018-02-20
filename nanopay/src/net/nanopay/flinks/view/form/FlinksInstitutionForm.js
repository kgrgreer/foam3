foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksInstitutionForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form',
    'isConnecting',
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 520px;
        }
        ^ .optionSpacer {
          display: inline-block;
          width: 122px;
          height: 67px;
          margin-right: 10px;
          box-sizing: border-box;
          border: solid 1px white;
        }
        ^ .optionSpacer:last-child {
          margin-right: 0;
        }
        ^ .institution {
          margin-bottom: 10px
        }
        ^ .institution:hover {
          cursor: pointer;
        }
        ^ .optionSpacer.selected {
          border: solid 1px %ACCENTCOLOR%;
        }
        ^ .subContent {
          width: 528px;
          background-color: #edf0f5;
          border: 1px solid #edf0f5;
        }
        ^ .image {
          width: 120px;
          height: 65px;
        }
        ^ .net-nanopay-ui-ActionView-nextButton {
          float: right;
          margin: 0;
          box-sizing: border-box;
          background-color: #59a5d5;
          outline: none;
          border:none;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
        }
        ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
          cursor: pointer;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          float: left;
          margin-left : 2px;
          outline: none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          margin-right: 40px;
        }
        ^ .net-nanopay-ui-ActionView-nextButton:disabled {
          background-color: #7F8C8D;
        }
        ^ .net-nanopay-ui-ActionView-nextButton:hover:enabled {
          cursor: pointer;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Int',
      name: 'selectedOption',
      value: -1,
      postSet: function(oldValue, newValue) {
        this.viewData.selectedOption = newValue;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Please choose your institution below.'},
    { name: 'Error', message: 'Invalid Institution'},
    { name: 'NameLabel', message: 'Institution *'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Next';
      if ( ! this.viewData.selectedOption ) { return; }
      this.selectedOption = this.viewData.selectedOption;
    },

    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .forEach(this.bankImgs, function(e) {
            this.start('div').addClass('optionSpacer').addClass('institution')
              .addClass(self.selectedOption$.map(function(o) { return o == e.index ? 'selected' : ''; }))
              .start({class: 'foam.u2.tag.Image', data: e.image}).addClass('image').end()
              .on('click', function() {
                self.selectedOption = e.index;
              })
            .end()
          })
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('p').style({ 'margin-top': '30px' }).addClass('link')
          .add("Can't find your institution? Click here.")
          .on('click', self.otherBank)
        .end()
        .start('div').style({'clear' : 'both'}).end();
    }
  ],

  listeners: [
    function otherBank() {
    this.form.otherBank();
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(isConnecting, selectedOption) {
        if ( isConnecting === true ) return false;
        if ( selectedOption === -1 ) return false;
        return true;
      },
      code: function(X) {
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        X.form.goBack();
      },
    }
  ]
});
