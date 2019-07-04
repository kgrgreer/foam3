foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurity',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'The main router for dealing with the Multi-Factor Authentication in Flinks',

  imports: [
    'connectingMessage',
    'closeDialog',
    'flinksAuth',
    'institution',
    'isConnecting',
    'notify',
    'user'
  ],

  messages: [
    { name: 'UNKNOWN_SECURITY_TYPE', message: 'An unknown error occurred. Please try again.' },
    { name: 'CONNECTING_SECURITY', message: 'Securely connecting to your account. This may take up to 10 minutes. Please do not close this window.' },
    { name: 'CONNECTING_POLLING_1', message: 'Still connecting to your account. Thank you for your patience. Please do not close this window.' }
  ],

  constants: {
    'POLL_TIMER_MS': 30000
  },

  methods: [
    function init() {
      this.SUPER();
      // passing the lambda to preserve context
      this.viewData.submitChallenge = () => this.submitChallenge();
      this.connectingMessage = this.CONNECTING_SECURITY;
    },

    function initE() {
      var securityChallenges = this.viewData.securityChallenges[0];

      switch ( securityChallenges.Type ) {
        case 'QuestionAndAnswer':
          var iterables = securityChallenges.Iterables;
          if ( !! iterables && iterables.length != 0 ) {
            this.pushToId('securityReset');
          } else {
            this.pushToId('securityQuestionAnswer');
          }
          break;
        case 'MultipleChoice':
          this.pushToId('securityQuestionAnswer');
          break;
        case 'MultipleChoiceMultipleAnswers':
          this.pushToId('securityQuestionAnswer');
          break;
        case 'ImageSelection':
          this.pushToId('securityImage');
          break;
        case 'TextOrCall':
          this.pushToId('securityQuestionAnswer');
          break;
        default:
          this.notify(this.UNKNOWN_SECURITY_TYPE, 'error');
          this.subStack.back();
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
        case 202:
          var self = this;
          this.isConnecting = true;
          this.connectingMessage = this.CONNECTING_POLLING_1;
          this.viewData.pollTimer = setTimeout(function() {
            self.pollAsync(response);
          }, this.POLL_TIMER_MS);
          break;
        case 203:
          // new security challenge.
          if ( this.viewData.securityChallenges[0].Type === 'TextOrCall' ) {
            // TextOrCall completed. Do not reload as this flow is missing information
            this.viewData.redoOnFail = false;
          }
          this.redoChallenge(response);
          break;
        case 401:
          this.notify(response.Message, 'error');
          if ( this.viewData.redoOnFail ) this.redoChallenge(response);
          break;
        default:
          this.notify(this.UNKNOWN_SECURITY_TYPE, 'error');
          this.pushToId('connect');
      }
    },

    async function pollAsync(response) {
      try {
        var response = await this.flinksAuth.pollAsync(
          null,
          response.RequestId,
          this.user
        );
      } catch (error) {
        this.notify(`${error.message} Please try again.`, 'error');
        this.pushToId('connect');
        return;
      }
      var status = response.HttpStatusCode;
      switch ( status ) {
      case 200:
        this.isConnecting = false;
        this.viewData.accounts = response.Accounts;
        this.pushToId('accountSelection');
        break;
      case 202:
        var self = this;
        this.viewData.pollTimer = setTimeout(function() {
         self.pollAsync(response);
        }, this.POLL_TIMER_MS);
        break;
      default:
        this.isConnecting = false;
        this.notify(this.UNKNOWN_SECURITY_TYPE, 'error');
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
