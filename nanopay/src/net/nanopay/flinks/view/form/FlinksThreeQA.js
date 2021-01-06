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
  name: 'FlinksThreeQA',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form'
  ],

  css: `
    ^ {
      width: 492px;
    }
    ^ .subContent {
      height: 390px;
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .forgetAnswer {
      width: 450px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: right;
      color: #59a5d5;
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
    ^ .foam-u2-ActionView-closeButton {
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
    ^ .foam-u2-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }
    ^ .foam-u2-ActionView-nextButton {
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
    ^ .foam-u2-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }
    ^ .foam-u2-ActionView-nextButton:hover:enabled {
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isFinish0',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isFinish1',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isFinish2',
      value: false
    },
    {
      class: 'StringArray',
      name: 'answer0',
      postSet: function(oldValue, newValue) {
        this.viewData.answers[0] = newValue;
      },
      validateObj: function(answer0) {
        if ( answer0.length == 0 ) return this.isFinish0 = false;
        for ( var o in answer0 ) {
          if ( o.trim().length == 0 ) return this.isFinish0 = false;
        }
        this.isFinish0 = true;
      }
    },
    {
      class: 'StringArray',
      name: 'answer1',
      postSet: function(oldValue, newValue) {
        this.viewData.answers[1] = newValue;
      },
      validateObj: function(answer1) {
        if ( answer1.length == 0 ) return this.isFinish1 = false;
        for ( var o in answer1 ) {
          if ( o.trim().length == 0 ) return this.isFinish1 = false;
        }
        this.isFinish1 = true;
      }
    },
    {
      class: 'StringArray',
      name: 'answer2',
      postSet: function(oldValue, newValue) {
        this.viewData.answers[2] = newValue;
      },
      validateObj: function(answer2) {
        if ( answer2.length == 0 ) return this.isFinish2 = false;
        for ( var o in answer2 ) {
          if ( o.trim().length == 0 ) return this.isFinish2 = false;
        }
        this.isFinish2 = true;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please answer the security question: '},
    { name: 'answerError', message: 'Invalid answer'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.questions = [
        'What is your mothers maiden name','What is your age','cccc'
      ];
      this.nextLabel = 'next';
    },
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader'})
          .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
          .start('p').add(( ! this.viewData.questions[0] ) ? '' : this.viewData.questions[0]).addClass('question').style({'margin-left':'20px', 'margin-top':'20px'}).end()
          .start(this.ANSWER0, {onKey: true}).addClass('input').style({'margin-left':'20px', 'margin-top':'10px'}).end()
          .start('p').add(( ! this.viewData.questions[1] ) ? '' : this.viewData.questions[1]).addClass('question').style({'margin-left':'20px', 'margin-top':'20px'}).end()
          .start(this.ANSWER1, {onKey: true}).addClass('input').style({'margin-left':'20px', 'margin-top':'10px'}).end()
          .start('p').add(( ! this.viewData.questions[2] ) ? '' : this.viewData.questions[2]).addClass('question').style({'margin-left':'20px', 'margin-top':'20px'}).end()
          .start(this.ANSWER2, {onKey: true}).addClass('input').style({'margin-left':'20px', 'margin-top':'10px'}).end()
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.CLOSE_BUTTON, {label: 'close'})
          .tag(this.NEXT_BUTTON, {label: 'next'})
        .end()
        .start('div').style({'clear' : 'both'}).end()

    }
  ],

  actions: [
    {
      name: 'nextButton',

      isEnabled: function(isFinish0,isFinish1,isFinish2) {
        return (isFinish0 && isFinish1 && isFinish2) ? true : false;
      },
      code: function(X) {
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      code: function(X) {
        X.form.goBack();
      }
    }
  ]
});
