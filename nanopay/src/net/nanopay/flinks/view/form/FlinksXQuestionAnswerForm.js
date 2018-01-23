foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksXQuestionAnswerForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form',
    'isConnecting',
    'viewData'
  ],
  requires: [
    'foam.u2.view.StringArrayView',
    'foam.u2.tag.Input'
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
        ^ .input {
          width: 400px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
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
        ^ .question {
          height: 13px;
          font-family: Roboto;
          font-size: 13px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-top: 15px;
        }
        ^ .question:first-child {
          margin-top: 0px;
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
        ^ .net-nanopay-ui-ActionView-nextButton {
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

        ^ .net-nanopay-ui-ActionView-closeButton {
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
      */}
    })
  ],

  properties: [
    {
      Class: 'Array',
      name: 'answerCheck',
    },
    {
      Class: 'Array',
      name: 'questionCheck',
    },
    {
      Class: 'Int',
      name: 'tick',
      value: -10000000
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 3: Please respond to the security challenges below.' },
    { name: 'header1', message: 'Please answer the security question: '},
    { name: 'answerError', message: 'Invalid answer'}
  ],

  methods: [
    function init() {
      var self = this;
      this.SUPER();
      this.viewData.questions = [
        'What is your mother maiden name','What is your age','cccc','dddd ddddd ddddddd dddddd'
      ];
      this.viewData.questions = new Array(this.viewData.SecurityChallenges.length);
      this.viewData.answers = new Array(this.viewData.SecurityChallenges.length);
      this.answerCheck = new Array(this.viewData.SecurityChallenges.length).fill(false);
      this.questionCheck = new Array(this.viewData.SecurityChallenges.length).fill(false);
    },

    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader'})
          .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
          .start('div').addClass('qa-block')
            .forEach(this.viewData.SecurityChallenges, function(data, index){
              self.viewData.questions[index] = data.Prompt;
              var text = self.Input.create({'onKey':true});
              text.data$.sub(function(){
                //console.log('stringArray.data', text.data);
                self.viewData.answers[index] = new Array(1).fill(text.data);
                //console.log(self.viewData);
                if ( text.data.trim().length === 0 ) {
                  self.answerCheck[index] = false;
                } else {
                  self.answerCheck[index] = true;
                }
                self.tick++;
              });
              this.start('p').addClass('question').add('Q' + (index+1) + ': ').add(data.Prompt).end();
              this.start(text).style({'margin-top':'10px'}).addClass('input').end();
            })
          .end()
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.NEXT_BUTTON, {label: 'Next'})
          .tag(this.CLOSE_BUTTON, {label: 'Close'})
        .end()
        .start('div').style({'clear' : 'both'}).end()
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'Next',
      isEnabled: function(tick, isConnecting, answerCheck) {
        for ( var x in answerCheck ) {
          if ( answerCheck[x] === false ) return false;
        }
        if ( isConnecting == true ) return false;
        return true;
      },
      code: function(X) {
        //console.log('nextButton');
        this.isConnecting = true;
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        //console.log('close the form');
        //console.log(X.form.goBack);
        X.form.goBack();
      }
    }
  ]
})
