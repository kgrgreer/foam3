foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksInstitutionForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'nSpecDAO',
    'pushViews',
    'stack'
  ],

  exports: [
    'bankInstitutions'
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
      name: 'bankInstitutions',
      factory: function() {
        return [
          { index: 0, name: 'ATB', image: 'images/banks/atb.svg' },
          { index: 1, name: 'Bank of Montreal', image: 'images/banks/bmo.svg' },
          { index: 2, name: 'Candian Imperial Bank of Canada', image: 'images/banks/cibc.svg' },
          { index: 3, name: 'CoastCapital', image: 'images/banks/coast.svg' },
          { index: 4, name: 'Desjardins', image: 'images/banks/desjardins.svg' },
          { index: 5, name: 'HSBC', image: 'images/banks/hsbc.svg' },
          { index: 6, name: 'Meridian', image: 'images/banks/meridian.png' },
          { index: 7, name: 'National', image: 'images/banks/national.svg' },
          { index: 8, name: 'Laurentienne', image: 'images/banks/laurentienne.svg' },
          { index: 9, name: 'President\'s Choice', image: 'images/banks/simplii@3x.png' },
          { index: 10, name: 'Royal Bank of Canada', image: 'images/banks/rbc.svg' },
          { index: 11, name: 'ScotiaBank', image: 'images/banks/scotia.svg' },
          { index: 12, name: 'Tangerine', image: 'images/banks/tangerine.svg' },
          { index: 13, name: 'Toronto Dominion', image: 'images/banks/td.svg' },
          { index: 14, name: 'Vancity', image: 'images/banks/vancity.svg' },
          { index: 15, name: 'FlinksCapital', image: 'images/banks/flinks.svg' }
        ];
      }
    },
    {
      class: 'Object',
      name: 'selectedInstitution',
      value: null,
      postSet: function(oldValue, newValue) {
        this.viewData.selectedInstitution = newValue;
      }
    },
    'mode',
    // It is an Element that refer to subContent
    'subContent'
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Please choose your institution below.' },
    { name: 'Error', message: 'Invalid Institution' },
    { name: 'NameLabel', message: 'Institution *' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Next';
      this.selectedInstitution = this.viewData.selectedInstitution ?
        this.viewData.selectedInstitution : null;
    },

    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
        .add(this.Step)
        .end()
        .start('div').addClass('subContent')
        .forEach(this.bankInstitutions, function(institution, index) {
          this.start('div').addClass('optionSpacer').addClass('institution')
            .enableClass('selected', self.selectedInstitution$.map((t) => t === institution))
            .start({ class: 'foam.u2.tag.Image', data: institution.image }).addClass('image').end()
            .on('click', () => self.selectedInstitution = institution)
            .end();
        })
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
        .tag(this.NEXT_BUTTON)
        .tag(this.CLOSE_BUTTON)
        .end()
        .start('p').style({ 'margin-top': '30px', 'text-decoration': 'underline' }).addClass('link')
        .add('Can\'t find your institution? Click here.')
        .on('click', this.otherBank)
        .end()
        .start('div').style({ 'clear': 'both' }).end();

      // get mode of appConfig, use mode to define if it is in Production, Demo, Test, Development, and Staging.
      // do not show Flinks demo in Production mode
      //         this.nSpecDAO.find('appConfig').then(function(response) {
      //           self.mode = response.service.mode.label;
      //           if ( self.mode && self.mode !== 'Production' ) {
      //             self.subContent.start('div').addClass('optionSpacer').addClass('institution')
      //             .addClass(self.selectedOption$.map(function(o) {
      // return o == self.bankImgs[15].index ? 'selected' : '';
      // }))
      //             .start({ class: 'foam.u2.tag.Image', data: self.bankImgs[15].image }).addClass('image').end()
      //             .on('click', function() {
      //               self.selectedOption = self.bankImgs[15].index;
      //             })
      //           .end();
      //           }
      // });
    }
  ],

  listeners: [
    function otherBank() {
      this.form.stack.push({
        class: 'net.nanopay.cico.ui.bankAccount.AddBankView',
        wizardTitle: 'Add Bank Account',
        startAtValue: 0
      }, this.parentNode);
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(isConnecting, selectedInstitution) {
        return ! isConnecting && selectedInstitution;
      },
      code: function(X) {
        this.pushViews('FlinksConnectForm');
      }
    },
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        X.form.stack.back();
      },
    }
  ]
});
