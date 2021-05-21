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
  name: 'FlinksSecurityChallenge',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'viewData',
    'pushViews',
    'loadingSpinner',
    'flinksAuth',
    'isConnecting',
    'notify',
    'success',
    'fail',
    'user'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.LoadingSpinner'
  ],

  exports: [
    'submitChallenge'
  ],

  methods: [
    function init() {
      this.SUPER();
      // passing the lambda to preserve context
      this.viewData.submitChallenge = () => this.submitChallenge();
      this.loadingSpinner = this.LoadingSpinner.create();
      this.loadingSpinner.hide();
    },

    function initE() {
      var securityChallenges = this.viewData.securityChallenges[0];
      switch ( securityChallenges.Type ) {
        case 'QuestionAndAnswer':
          var iterables = securityChallenges.Iterables;
          if ( !! iterables && iterables.length != 0 ) {
            this.pushViews('FlinksXSelectionAnswerForm');
          } else {
            this.pushViews('FlinksXQuestionAnswerForm');
          }
          break;
        case 'MultipleChoice':
          this.pushViews('FlinksMultipleChoiceForm');
          break;
        case 'MultipleChoiceMultipleAnswers':
          this.pushViews('FlinksMultipleChoiceForm');
          break;
        case 'ImageSelection':
          this.pushViews('FlinksImageForm');
          break;
        default:
          this.fail();
      }
    },
    async function submitChallenge() {
      this.isConnecting = true;
      this.loadingSpinner.show();
      var questionAndAnswerMap = {};
      this.viewData.questions
        .forEach((question, index) =>
          questionAndAnswerMap[question] = this.viewData.answers[index]);
      try {
        var response = await this.flinksAuth.challengeQuestion(
          null,
          this.viewData.selectedInstitution.name,
          this.viewData.username,
          this.viewData.requestId,
          questionAndAnswerMap,
          this.viewData.securityChallenges[0].Type,
          this.user
        );
      } catch (error) {
        this.notify(`${error.message} Please try again.`, '', this.LogLevel.ERROR, true);
        this.fail();
        return;
      } finally {
        this.isConnecting = false;
        this.loadingSpinner.hide();
      }
      var status = response.HttpStatusCode;
      switch ( status ) {
        case 200:
          this.viewData.accounts = response.Accounts;
          this.success();
          break;
        case 203:
          // new security challenge.
          this.redoChallenge(response);
          break;
        case 401:
          this.notify(response.Message, '', this.LogLevel.ERROR, true);
          this.redoChallenge(response);
          break;
        default:
          this.fail(function (){
            throw new Error('Unhandled response status code [' + status + ']');
          });
      }
    },
    function redoChallenge(response) {
      this.viewData.requestId = response.RequestId;
      this.viewData.securityChallenges = response.SecurityChallenges;
      this.pushViews('FlinksSecurityChallenge');
    }
  ]
});
