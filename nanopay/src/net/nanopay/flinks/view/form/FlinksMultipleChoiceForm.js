foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksMultipleChoiceForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'isConnecting',
    'group',
    'logo'
  ],
  requires: [
    'foam.u2.view.RadioView'
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 492px;
        }
        ^ .subContent {
          height: 405px;
        }
        ^ .sub-header {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
        }
        ^ .header1 {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
        }
        ^ .qa-block {
          border: 2px solid #778899;
          width: 436px;
          height: 246px;
          margin-left:20px;
          margin-top: 10px;
          overflow: auto;
          padding: 5px;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          float: right;
          margin: 0;
          box-sizing: border-box;
          background-color: #A93226;
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

        ^ .net-nanopay-ui-ActionView-nextButton {
          float: right;
          margin: 0;
          outline: none;
          border:none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: #148F77;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
          margin-right: 40px;
        }

        ^ .net-nanopay-ui-ActionView-nextButton:disabled {
          background-color: #7F8C8D;
        }

        ^ .net-nanopay-ui-ActionView-nextButton:hover:enabled {
          cursor: pointer;
        }
        ^ .question {
          height: 15px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-top: 10px;
        }
        ^ .question:first-child {
          margin-top: 0px;
        }
      */}
    })
  ],

  properties: [
    {
      Class: 'Array',
      name: 'answerCheck'
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please answer below multiple choices(may have multiple answers): '},
    { name: 'answerError', message: 'Invalid answer'}
  ],

  methods: [
    function init() {
      var self = this;
      this.SUPER();
      this.viewData.questions = [
        'What is your mother maiden name','What is your age','cccc'
      ];
      this.iters = [
        ['aaaaa',
        'bbbbb',
        'ccccc'],
        ['aaaaa1',
        'bbbbb1',
        'ccccc1'],
        ['aaaaa2',
        'bbbbb2',
        'ccccc2'],
      ];
    },
    function initE() {
      this.SUPER();
      var self = this;
      var logoSlot = this.group.logo$.map(function(logo) { return logo || self.logo; });
      this
      .addClass(this.myClass())
      .start('div').addClass('subTitle')
        .add(this.Step)
      .end()
      .start('div').addClass('subContent')
        .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader', secondImg$: logoSlot})
        .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
        .start('div').addClass('qa-block')
          .forEach(this.iters, function(data, index){
            var radio = self.RadioView.create({choices : data});
            var checkBox = net.nanopay.flinks.view.element.CheckBoxes.create({choices: data})
            radio.data$.sub(function(){
              console.log('radio.data', radio.data);
            });
            checkBox.data$.sub(function(){
              console.log('checkboxes', checkBox.data);
            });
            this.start('p').addClass('question').add(self.viewData.questions[index]).end();
            //this.start(radio).style({ 'margin-left':'20px', 'margin-top':'10px'}).end();
            this.start(checkBox).style({'margin-top':'5px'}).end();
          })
        .end()
      .end()
      .start('div').style({'margin-top' : '15px', 'height' : '40px'})
        .tag(this.CLOSE_BUTTON, {label: 'close'})
        .tag(this.NEXT_BUTTON, {label: 'next'})
      .end()
      .start('div').style({'clear' : 'both'}).end();
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'next',
      isEnabled: function(isConnecting) {
        if ( isConnecting == true ) return false;
        return true;
      },
      code: function(X) {
        console.log('nextButton');
        this.isConnecting = true;
        //X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'close',
      code: function(X) {
        console.log('close the form');
        X.form.goBack();
      }
    }
  ]
})
