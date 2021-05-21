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
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'QuestionnaireForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Questionnaire answers',

  imports: [
    'notify',
    'questionnaireDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.onboarding.model.Question'
  ],

  css: `
    ^ question {
      width: 218px;
      height: 16px;
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
    ^ .response {
      padding-top: 8px;
      padding-bottom: 20px;
    }

    ^ .foam-u2-TextField {
      width:540px;
      height: 40px;

      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-radius: 0;

      padding: 12px 13px;

      box-sizing: border-box;
      outline: none;

      -webkit-appearance: none;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .foam-u2-TextField:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField:disabled {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      color: #a4b3b8 !important;
    }

  `,

  properties: [
    'id',
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      factory: function () {
        return ( this.viewData.user.questionnaire ) ?
          this.viewData.user.questionnaire : null;
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

      this.getQuestionnaire().then(function () {
        var questions = self.questionnaire.questions;
        self
          .addClass(self.myClass())
          .forEach(questions, function (question) {
            self
              .start().addClass('question')
                .add(question.question)
              .end()
              .start().addClass('response')
                .start(self.Question.RESPONSE, { data$: question.response$ }).end()
              .end()
          });
      })
      .catch(function (err) {
        self.notify(err.message, '', self.LogLevel.ERROR, true);
      })
    },

    /**
     * Loads the questionnaire
     */
    function getQuestionnaire() {
      var self = this;
      if ( this.questionnaire ) {
        return Promise.resolve();
      }

      return this.questionnaireDAO.find(this.id).then(function (result) {
        self.questionnaire = result;
        return Promise.resolve();
      });
    }
  ]
});
