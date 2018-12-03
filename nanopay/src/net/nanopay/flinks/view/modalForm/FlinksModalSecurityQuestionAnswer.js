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
    }
    ^content {
      position: relative;
      padding: 24px;
    }
    ^ .foam-u2-tag-Input {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
  `,

  messages: [
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
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
      Class: 'Array',
      name: 'answerCheck',
    },
    {
      Class: 'Int',
      name: 'tick',
      value: - 10000000
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
          .forEach(this.viewData.securityChallenges, function(data, index) {
            self.viewData.questions[index] = data.Prompt;
            var text = self.StringArrayInput.create({
              max: 3,
              isPassword: true
            });
            text.data$.sub(function() {
              self.viewData.answers[index] = text.data;
              if ( text.data[0].trim().length === 0 ) {
                self.answerCheck[index] = false;
              } else {
                self.answerCheck[index] = true;
              }
              self.tick ++;
            });
            this.start('p').addClass('field-label').add(data.Prompt).end();
            this.start(text).end();
          })
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
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
        if ( X.isConnecting ) return;
        var isAllAnswered  = X.model.answerCheck.reduce((allAnswered, val) => allAnswered && val);
        if ( ! isAllAnswered ) {
          X.notify(X.model.InvalidForm, 'error');
          return;
        }

        X.viewData.submitChallenge();
      }
    }
  ]
});
