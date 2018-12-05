foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurityQuestionAnswer',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner',
    'foam.u2.view.StringArrayView',
    'foam.u2.tag.Input',
    'net.nanopay.flinks.view.element.StringArrayInput',
    'foam.u2.view.PasswordView'
  ],

  exports: [
    'as model'
  ],

  imports: [
    'notify',
    'isConnecting',
    'institution',
  ],

  css: `
    ^ {
      width: 504px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^shrink {
      height: 50vh;
      overflow: hidden;
    }
    ^choice-text {
      margin: 0;
      font-size: 14px;
    }
    ^multiple-choice-box {
      width: 100%;
      height: 40px;

      border: 1px solid #edf0f5;
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
      border: 1px solid %SECONDARYCOLOR%;
    }
    ^ .foam-u2-tag-Input {
      width: 100%;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
  `,

  messages: [
    { name: 'Connecting', message: 'Connecting... This may take a few minutes. Please do not close this window.'},
    { name: 'InvalidForm', message: 'Please answer all questions.' }
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
        .start('div').addClass(this.myClass('content'))
          .start('div').addClass('spinner-container').show(this.isConnecting$)
            .start('div').addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.Connecting).addClass('spinner-text').end()
            .end()
          .end()
          .start('div').enableClass(this.myClass('shrink'), this.isConnecting$)
            .forEach(this.viewData.securityChallenges, function(data, index) {
              self.viewData.questions[index] = data.Prompt;
              var prompt = self.multipleQuestions ? (index + 1) + '. ' + data.Prompt : data.Prompt;
              this.start('p').addClass('field-label').add(prompt).end();
              switch ( data.Type ) {
                case 'QuestionAndAnswer' :
                  self.createQuestionAndAnswer(data, index, this);
                  break;
                case 'MultipleChoice' :
                  self.createSingleChoice(data, index, this);
                  break;
                case 'MultipleChoiceMultipleAnswers' :
                  self.createMultipleChoice(data, index, this);
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
        this.start('div').addClass(self.myClass('multiple-choice-box')).enableClass('selected', self.tick$.map((v) => self.isChoiceSelected(data, choice)))
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
        this.start('div').addClass(self.myClass('multiple-choice-box')).enableClass('selected', self.tick$.map((v) => self.isChoiceSelected(data, choice)))
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
        var model = X.model;
        if ( X.isConnecting ) return;
        var isAllAnswered  = model.answerCheck.reduce((allAnswered, val) => allAnswered && val);
        if ( ! isAllAnswered ) {
          X.notify(model.InvalidForm, 'error');
          return;
        }

        X.viewData.submitChallenge();
      }
    }
  ]
});
