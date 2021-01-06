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
  name: 'FlinksMultipleChoiceForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'loadingSpinner',
    'rollBackView',
    'viewData'
  ],
  requires: [
    'foam.u2.view.RadioView',
    'net.nanopay.flinks.view.element.CheckBoxes'
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
    ^ .qa-block {
      border: 2px solid #ffffff;
      width: 436px;
      height: 155px;
      margin-left:20px;
      margin-top: 10px;
      overflow: auto;
      padding: 5px;
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
    ^ .question {
      height: 15px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 10px;
    }
    ^ .question:first-child {
      margin-top: 0px;
    }
  `,

  properties: [
    {
      Class: 'Array',
      name: 'answerCheck',
    },
    {
      Class: 'Int',
      name: 'tick',
      value: - 10000000
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please answer below multiple choices(may have multiple answers): ' },
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
    },
    function initE() {
      this.SUPER();
      var self = this;
      this
      .addClass(this.myClass())
      .start('div').addClass('subTitle')
        .add(this.Step)
      .end()
      .start('div').addClass('subTitleFlinks')
        .tag({
          class: 'net.nanopay.flinks.view.form.FlinksSubHeader',
          secondImg: this.viewData.selectedInstitution.image
        })
        .start('p').add(this.header1).addClass('header1').style({ 'margin-left': '20px' }).end()
        .start('div').addClass('qa-block')
          .forEach(this.viewData.SecurityChallenges, function(item, index) {
            self.viewData.questions[index] = item.Prompt;
            var attachElement;
            if ( item.Type === 'MultipleChoice' ) {
              attachElement = self.RadioView.create({
                choices: item.Iterables
              });
              attachElement.data$.sub(function() {
                var data = attachElement.data;
                self.viewData.answers[index] =
                new Array(1).fill(data);
                if ( ! data || data.trim().length === 0 ) {
                  self.answerCheck[index] = false;
                } else {
                  self.answerCheck[index] = true;
                }
                self.tick ++;
              });
            } else {
              attachElement = self.CheckBoxes.create({
                choices: item.Iterables
              });
              attachElement.data$.sub(function() {
                self.viewData.answers[index] = attachElement.data;
                if ( attachElement.data.length === 0 ) {
                  self.answerCheck[index] = false;
                } else {
                  self.answerCheck[index] = true;
                }
                self.tick ++;
              });
            }
            this.start('p').addClass('question').add(self.viewData.questions[index]).end();
            this.start(attachElement).style({ 'margin-top': '5px' }).end();
          })
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
      isEnabled: function(tick, isConnecting, answerCheck) {
        var isAllAnswered = answerCheck
          .reduce((allAnswered, val) => allAnswered && val);

        return ! isConnecting && isAllAnswered;
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
