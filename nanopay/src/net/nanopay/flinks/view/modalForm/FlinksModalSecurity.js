foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurity',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  imports: [
    'notify',
    'flinksAuth',
    'user',
    'institution',
    'isConnecting',
    'closeDialog'
  ],

  messages: [
    { name: 'UnknownSecurityType', message: 'An unknown error occured. Please try again or contact support.' }
  ],

  methods: [
    function init() {
      this.SUPER();
      // passing the lambda to preserve context
      this.viewData.submitChallenge = () => this.submitChallenge();
    },

    function initE() {
      var securityChallenges = this.viewData.securityChallenges[0];
      switch ( securityChallenges.Type ) {
        case 'QuestionAndAnswer':
          var iterables = securityChallenges.Iterables;
          if ( !! iterables && iterables.length != 0 ) {
            this.pushToId('securitySelection');
          } else {
            this.pushToId('securityQuestionAnswer');
          }
          break;
        case 'MultipleChoice':
          this.pushToId('securityMultipleChoice');
          break;
        case 'MultipleChoiceMultipleAnswers':
          this.pushToId('securityMultipleChoice');
          break;
        case 'ImageSelection':
          this.pushToId('securityImage');
          break;
        default:
          this.notify(this.UnknownSecurityType, 'error');
          this.closeDialog();
      }
    },

    async function submitChallenge() {
      this.isConnecting = true;
      var questionAndAnswerMap = {};
      this.viewData.questions
        .forEach((question, index) =>
          questionAndAnswerMap[question] = this.viewData.answers[index]);
      try {
        var response = await this.flinksAuth.challengeQuestion(
          null,
          this.institution.name,
          this.viewData.username,
          this.viewData.requestId,
          questionAndAnswerMap,
          this.viewData.securityChallenges[0].Type,
          this.user
        );
      } catch (error) {
        this.notify(`${error.message} Please try again.`, 'error');
        this.pushToId('connect');
        return;
      } finally {
        this.isConnecting = false;
      }
      var status = response.HttpStatusCode;
      switch ( status ) {
        case 200:
          this.viewData.accounts = response.Accounts;
          this.pushToId('accountSelection');
          break;
        case 203:
          // new security challenge.
          this.redoChallenge(response);
          break;
        case 401:
          this.notify(response.Message, 'error');
          this.redoChallenge(response);
          break;
        default:
          this.pushToId('connect');
      }
    },

    function redoChallenge(response) {
      this.viewData.requestId = response.RequestId;
      this.viewData.securityChallenges = response.SecurityChallenges;
      this.pushToId('security');
    }
  ]
});
