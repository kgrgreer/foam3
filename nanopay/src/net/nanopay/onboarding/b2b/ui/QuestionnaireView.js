foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'QuestionnaireView',
  extends: 'foam.u2.View',

  documentation: 'Questionnaire View',

  requires: [
    'net.nanopay.onboarding.model.Question',
  ],

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .add(this.slot(function (questions) {
          self.forEach(questions, function (question) {
            self
              .start().addClass('question')
                .add(question.question$)
              .end()
              .start().addClass('response')
                .start(self.Question.RESPONSE, { data$: question.response$ }).end()
              .end()
          })
        }, this.data.questions$));
    }
  ]
});