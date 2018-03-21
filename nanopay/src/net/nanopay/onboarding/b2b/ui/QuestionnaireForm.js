foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'QuestionnaireForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Questionnaire answers',

  imports: [
    'questionnaireDAO'
  ],

  requires: [
    'net.nanopay.onboarding.b2b.ui.QuestionView',
    'net.nanopay.onboarding.model.Questionnaire'
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
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      factory: function () {
        if ( this.viewData.user.questionnaire ) {
          this.viewData.user.questionnaire = this.Questionnaire.create();
        }
        return this.viewData.user.questionnaire;
      },
      postSet: function (_, newValue) {
        this.viewData.user.questionnaire = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.getQuestionnaire();

      this
        .addClass(this.myClass())
        .start().addClass('questions')
          .tag({
            class: 'net.nanopay.onboarding.b2b.ui.QuestionnaireView',
            data$: this.questionnaire$
          })
        .end()
    },

    /**
     * Get's the questionnaire
     */
    function getQuestionnaire() {
      var self = this;
      this.questionnaireDAO.find(this.id).then(function (result) {
        self.questionnaire.copyFrom(result);
      });
    }
  ]
});