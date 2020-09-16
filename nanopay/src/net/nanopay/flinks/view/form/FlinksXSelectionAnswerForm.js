/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksXSelectionAnswerForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'loadingSpinner',
    'rollBackView',
    'viewData'
  ],

  requires: [
    'foam.u2.view.ChoiceView',
    'foam.u2.view.StringArrayView',
    'foam.u2.tag.Input'
  ],

  css: `
    ^ {
      width: 492px;
    }
    ^ .subContent {
      height: 285px;
    }
    ^ .sub-header {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-tag-Input {
      width: 100%;
      height: 30px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      outline: none;
      padding-left: 10px;
      padding-top: 5px;
      padding-bottom: 5px;
    }
    ^ .qa-block {
      border: 2px solid #ffffff;
      width: 436px;
      height: 155px;
      margin-left:20px;
      margin-top: 10px;
      overflow: auto;
      padding: 5px;
    }
    ^ .header1 {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-ActionView-nextButton {
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
    ^ .foam-u2-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }
    ^ .foam-u2-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-right: 40px;
      margin-left: 1px;
    }
    ^ .foam-u2-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }

    ^ .foam-u2-ActionView-nextButton:hover:enabled {
      cursor: pointer;
    }
    ^ select {
      width: 100%;
      height: 30px;
      background-color: #ffffff;
      border: solid 1px rgba(29, 100, 123, 0.5);
    }
    ^ .select:first-child {
      margin-top: 0px;
    }
    ^ .select {
      width: 100%;
      height: 30px;
      background-color: #ffffff;
      margin-top: 15px;
    }
  `,

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
      value: - 10000000
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please reset the security question: ' },
    { name: 'answerError', message: 'Invalid answer' }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.viewData.questions =
        new Array(this.viewData.SecurityChallenges.length);
      this.viewData.answers =
        new Array(this.viewData.SecurityChallenges.length);
      this.answerCheck =
        new Array(this.viewData.SecurityChallenges.length).fill(false);
      this.questionCheck =
        new Array(this.viewData.SecurityChallenges.length).fill(false);
    },

    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({
            class: 'net.nanopay.flinks.view.form.FlinksSubHeader',
            secondImg: this.viewData.selectedInstitution.image
          })
          .start('p').add(this.header1).addClass('header1').style({ 'margin-left': '20px' }).end()
          .start('div').addClass('qa-block')
            .forEach(this.viewData.SecurityChallenges, function(item, index) {
              var selection = self.ChoiceView.create({ choices: item.Iterables, placeholder: 'Q'+(index+1)+': Please select a question' });
              var input = self.Input.create({ onKey: true });
              selection.data$.sub(function() {
                self.viewData.questions[index] = selection.data;
                if ( selection.index == - 1 ) {
                  self.questionCheck[index] = false;
                } else {
                  self.questionCheck[index] = true;
                }
                self.tick ++;
              });
              input.data$.sub(function() {
                self.viewData.answers[index] = new Array(1).fill(input.data);
                if ( input.data.trim().length == 0 ) {
                  self.answerCheck[index] = false;
                } else {
                  self.answerCheck[index] = true;
                }
                self.tick ++;
              });
              this.start(selection).addClass('select').end();
              this.start(input).style({ 'margin-top': '10px' }).end();
            })
          .end()
          .start()
            .start(this.loadingSpinner).addClass('loadingSpinner')
              .start('h6').add('Connecting, please wait...').addClass('spinnerText').end()
            .end()
          .end()
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({ 'clear': 'both' }).end();
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(tick, isConnecting, questionCheck, answerCheck) {
        var isAllAnswered = answerCheck
          .reduce((allAnswered, val) => allAnswered && val);
        var isAllQuestions = questionCheck
          .reduce((allQuestion, val) => allQuestion && val);
        return ! isConnecting && isAllAnswered && isAllQuestions;
      },
      code: function(X) {
        this.isConnecting = true;
        this.viewData.submitChallenge();
      }
    },
    {
      name: 'closeButton',
      label: 'Cancel',
      code: function(X) {
        this.rollBackView();
      }
    }
  ]
});
