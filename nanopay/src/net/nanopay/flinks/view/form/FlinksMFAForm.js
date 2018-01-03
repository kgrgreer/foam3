foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksMFAForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  
  imports: [
    'bankImgs',
    'form'
  ],
  
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 492px;
        }
        ^ .subContent {
          height: 269px;
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
        ^ p {
          margin: 0;
        }
        ^ .input {
          width: 450px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
        }
        ^ .question {
          height: 14px;
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
        }
        ^ .forgetAnswer {
          width: 450px;
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          text-align: right;
          color: #59a5d5;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'answer',
      postSet: function(oldValue, newValue) {
        console.log(newValue);
        this.viewData.answers[0] = newValue;
      },
      validateObj: function(answer) {
        if ( answer.length == 0 ) return this.answerError;
        for ( var o in answer ) {
          if ( o.trim().length == 0) return this.answerError;
        } 
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 4: Please answer below security question'},
    { name: 'header1', message: 'Please answer the security question: '},
    { name: 'answerError', message: 'Invalid answer'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.form.isEnabledButtons(true);
      for ( var i = 0 ; i < this.viewData.securityChallenges.length ; i++ ) {
        this.viewData.questions[i] = this.viewData.securityChallenges[i].Prompt;
      }
      this.nextLabel = 'Submit';
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .start('div').addClass('subHeader')
            .start({class: 'foam.u2.tag.Image', data: 'images/banks/nanopay.svg'}).addClass('firstImg').end()
            .start({class: 'foam.u2.tag.Image', data: 'images/banks/ic-connected.svg'}).addClass('icConnected').end()
            .start({class: 'foam.u2.tag.Image', data: this.bankImgs[this.viewData.selectedOption].image}).addClass('secondImg').end()
          .end()
          .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
          //TODO: generate Input fields depend on the length of the array
          .start('p').add(( ! this.viewData.questions[0] ) ? '' : this.viewData.questions[0]).addClass('question').style({'margin-left':'20px', 'margin-top':'20px'}).end()
          .start(this.ANSWER, {onKey: true}).addClass('input').style({'margin-left':'20px', 'margin-top':'20px'}).end()
          .start('p').add('Forget security answer?').addClass('forgetAnswer').style({'margin-left':'20px', 'margin-top':'20px'}).end()
        .end()
    }
  ]
})