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
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurityQuestionAnswer',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Screen to answer Multi-Factor authentication',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.tag.Input',
    'foam.u2.view.ChoiceView',
    'foam.u2.view.PasswordView',
    'foam.u2.view.StringArrayView',
    'net.nanopay.flinks.view.element.StringArrayInput',
    'foam.u2.LoadingSpinner'
  ],

  exports: [
    'as model'
  ],

  imports: [
    'connectingMessage',
    'notify',
    'isConnecting',
    'institution',
  ],

  css: `
    ^ {
      box-sizing: border-box;
      min-width: 615px;
      max-height: 80vh;
      overflow-y: auto;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^shrink {
      /*max height - titlebar - navigationbar - content padding*/
      max-height: calc(80vh - 77px - 88px - 24px);
      overflow: hidden;
    }
    ^choice-text {
      margin: 0;
      font-size: 14px;
    }
    ^multiple-choice-box {
      width: 100%;
      height: 40px;

      border: 1px solid /*%GREY5%*/ #f5f7fa;
      border-radius: 2px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      margin-top: 8px;
      padding: 10px 8px;

      box-sizing: border-box;
      cursor: pointer;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^multiple-choice-box:first-child {
      margin-top: 0;
    }
    ^multiple-choice-box:hover,
    ^multiple-choice-box.selected {
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    }
    ^multiple-choice-box.selected {
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;

      margin: 0;
      margin-bottom: 24px;
    }
    ^method-box {
      display: inline-block;
      vertical-align: top;
      margin-right: 16px;
      padding-left: 36px;

      width: 218px;
      height: 40px;

      background-repeat: no-repeat;
      background-position-x: 12px;
      background-position-y: 12px;
    }
    ^method-box:last-child {
      margin-right: 0;
    }
    ^call-box {
      background-image: url(images/ic-call.svg);
    }
    ^text-box {
      background-image: url(images/ic-text.svg);
    }
    ^ .foam-u2-tag-Input {
      width: 100%;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 40px;
    }
  `,

  messages: [
    { name: 'INVALID_FORM', message: 'Please answer all questions' },
    { name: 'INSTRUCTIONS', message : 'To verify that you own this account, please answer the following question(s).' },
    { name: 'TWO_FACTOR_METHOD', message: 'How would you like to receive your one-time security code?' },
    { name: 'CALL_METHOD', message: 'Call' },
    { name: 'TEXT_METHOD', message: 'Text' }
  ],

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'Array',
      name: 'answerCheck',
    },
    {
      name: 'answersForPrompt',
      factory: function() {
        return {};
      }
    },
    {
      class: 'Int',
      name: 'tick',
      value: - 1000000
    },
    {
      class: 'Boolean',
      name: 'multipleQuestions',
      value: false
    },
    {
      class: 'String',
      name: 'selectedPhoneNumber'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.questions =
        new Array(this.viewData.securityChallenges.length);
      this.viewData.answers =
        new Array(this.viewData.securityChallenges.length);
      this.answerCheck =
        new Array(this.viewData.securityChallenges.length).fill(false);
      this.multipleQuestions = this.viewData.securityChallenges.length > 1;
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start().addClass(this.myClass('content'))
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.connectingMessage$.map((m) => { return m; })).addClass('spinner-text').end()
            .end()
          .end()
          .start().enableClass(this.myClass('shrink'), this.isConnecting$)
            .start('p').addClass(this.myClass('instructions')).add(this.INSTRUCTIONS).end()
            .forEach(this.viewData.securityChallenges, function(data, index) {
              var prompt = self.multipleQuestions ? (index + 1) + '. ' + data.Prompt : data.Prompt;
              this.start('p').addClass('field-label').add(prompt).end();
              switch ( data.Type ) {
                case 'QuestionAndAnswer' :
                  self.viewData.questions[index] = data.Prompt;

                  self.createQuestionAndAnswer(data, index, this);
                  break;
                case 'MultipleChoice' :
                  self.viewData.questions[index] = data.Prompt;
                  self.createSingleChoice(data, index, this);
                  break;
                case 'MultipleChoiceMultipleAnswers' :
                  self.viewData.questions[index] = data.Prompt;
                  self.createMultipleChoice(data, index, this);
                  break;
                case 'TextOrCall' :
                  // question is set by selected phone number.
                  self.createTextOrCall(data, index, this);
                  break;
                default:
                  break;
              }
            })
          .end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    function createQuestionAndAnswer(data, promptIndex, scope) {
      var self = this;

      this.answersForPrompt[data.Prompt] = [];

      var input = this.Input.create({ type: 'password', onKey: true });
      input.setAttribute('autocomplete', 'off');
      input.data$.sub(function() {
        self.answersForPrompt[data.Prompt] = [input.data];
        self.updateAnswers(data, promptIndex);
        // special case since it is just a string
        self.answerCheck[promptIndex] = input.data.trim().length > 0;
      });
      scope.start(input).end();
    },

    function createSingleChoice(data, promptIndex, scope) {
      var self = this;
      var choices = data.Iterables;

      this.answersForPrompt[data.Prompt] = [];

      scope.forEach(choices, function(choice, choiceIndex) {
        this.start().addClass(self.myClass('multiple-choice-box')).enableClass('selected', self.tick$.map((v) => self.isChoiceSelected(data, choice)))
          .start('p').addClass(self.myClass('choice-text')).add(choice).end()
          .on('click', function() {
            self.selectSingleChoice(data, choice, promptIndex);
          })
        .end()
      });

    },

    function selectSingleChoice(data, choice, promptIndex) {
      // Not allowing toggle
      this.answersForPrompt[data.Prompt] = [choice];
      this.updateAnswers(data, promptIndex);
    },

    function createMultipleChoice(data, promptIndex, scope) {
      var self = this;
      var choices = data.Iterables;

      this.answersForPrompt[data.Prompt] = [];

      scope.forEach(choices, function(choice, choiceIndex) {
        this.start().addClass(self.myClass('multiple-choice-box')).enableClass('selected', self.tick$.map((v) => self.isChoiceSelected(data, choice)))
          .start('p').addClass(self.myClass('choice-text')).add(choice).end()
          .on('click', function() {
            self.selectMultipleChoice(data, choice, promptIndex);
          })
        .end()
      });
    },

    function selectMultipleChoice(data, choice, promptIndex) {
      var self = this;
      var selectedChoices = this.answersForPrompt[data.Prompt];

      var selectedIndex = selectedChoices.indexOf(choice);

      if ( selectedIndex >= 0 ) { //remove if selected
        this.answersForPrompt[data.Prompt].splice(selectedIndex, 1);
        this.updateAnswers(data, promptIndex);
        return;
      }

      this.answersForPrompt[data.Prompt].splice(0, 0, choice);
      this.updateAnswers(data, promptIndex);
    },

    function isChoiceSelected(data, choice) {
      return this.answersForPrompt[data.Prompt].includes(choice);
    },

    function createTextOrCall(data, promptIndex, scope) {
      var self = this;

      this.selectedPhoneNumber$.sub(this.phoneNumberSelected);
      this.selectedPhoneNumber = data.Iterables[0];
      this.answersForPrompt[this.selectedPhoneNumber] = [];
      scope.start({
        class: 'foam.u2.view.ChoiceView',
        choices: data.Iterables,
        data$: this.selectedPhoneNumber$
      }).end();
      scope.start('p').addClass('field-label').add(this.TWO_FACTOR_METHOD).end()
        .start()
          .addClass(self.myClass('multiple-choice-box'))
          .addClass(self.myClass('method-box'))
          .addClass(self.myClass('call-box'))
          .enableClass('selected', self.tick$.map((v) => self.isMethodSelected('Call')))
          .start('p').addClass(self.myClass('choice-text')).add(self.CALL_METHOD).end()
          .on('click', function() {
            self.methodSelected('Call');
          })
        .end()
        .start()
          .addClass(self.myClass('multiple-choice-box'))
          .addClass(self.myClass('method-box'))
          .addClass(self.myClass('text-box'))
          .enableClass('selected', self.tick$.map((v) => self.isMethodSelected('Text')))
          .start('p').addClass(self.myClass('choice-text')).add(self.TEXT_METHOD).end()
          .on('click', function() {
            self.methodSelected('Text');
          })
        .end();
    },

    function methodSelected(method) {
      this.answersForPrompt[this.selectedPhoneNumber] = [method];
      this.viewData.answers[0] = this.answersForPrompt[this.selectedPhoneNumber];
      this.answerCheck[0] = this.viewData.answers[0].length > 0;
      this.tick++;
    },

    function isMethodSelected(method) {
      return this.answersForPrompt[this.selectedPhoneNumber].includes(method);
    },

    function updateAnswers(data, promptIndex) {
      this.viewData.answers[promptIndex] = this.answersForPrompt[data.Prompt];
      this.answerCheck[promptIndex] = this.viewData.answers[promptIndex].length > 0;
      this.tick++;
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Continue',
      code: function(X) {
        var self = this;
        var model = X.model;
        if ( X.isConnecting ) return;
        var isAllAnswered  = model.answerCheck.reduce((allAnswered, val) => allAnswered && val);
        if ( ! isAllAnswered ) {
          X.notify(model.INVALID_FORM, '', self.LogLevel.ERROR, true);
          return;
        }
        X.viewData.submitChallenge();
      }
    }
  ],

  listeners: [
    {
      name: 'phoneNumberSelected',
      code: function() {
        // Theoretically, we only ever get to this point if TD is asking for 2-auth
        // Escape `•` character to be sent to the BE
        this.viewData.questions[0] = this.selectedPhoneNumber.replace(/•/g, '\\u2022');
      }
    }
  ]
});
