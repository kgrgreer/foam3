foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'QuestionnaireView',
  extends: 'foam.u2.View',

  imports: [
    'questionnaireDAO'
  ],

  requires: [
    'net.nanopay.invite.ui.QuestionView',
    'net.nanopay.invite.model.Questionnaire'
  ],

  css: `
    ^ h1 {
      width: 195px;
      height: 30px;
      font-family: Roboto;
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
  `,

  properties: [
    'id',
    {
      name: 'questions',
      factory: function () { return []; }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.getQuestions();
    },

    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('h1').add('Questionnaire').end()
        .start().addClass('questions')
          .add(this.slot(function (questions) {
            return questions.forEach(function (question) {
              return self.tag({
                class: 'net.nanopay.invite.ui.QuestionView',
                question: question
              });
            })
          }, this.questions$))
        .end()
    },

    /**
     * Get's list of questions from the questionnaire
     */
    function getQuestions() {
      var self = this;
      this.questionnaireDAO.find(this.id).then(function (questionnaire) {
        return questionnaire.questions.dao.select();
      }).then(function (result) {
        self.questions = result.array;
      });
    }
  ]
});