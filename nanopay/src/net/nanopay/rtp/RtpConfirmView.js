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
  package: 'net.nanopay.rtp',
  name: 'RtpConfirmView',
  extends: 'foam.u2.View',

  requires: [
    'foam.log.LogLevel',
    'foam.util.Timer',
    'foam.u2.LoadingSpinner',
    'net.nanopay.rtp.RtpView',
    'net.nanopay.rtp.RequestToPay'
  ],

  imports: [
    'showFooter',
    'showNav',
    'memento',
    'notify',
    'requestToPayDAO',
    'flinksLoginIdDAO',
    'accountDAO'
  ],

  css: `
  ^ {
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    position: fixed;
    color: #4A5568;
  }

  ^ .top {
    height: 6%;
    width: 100%;
    padding-left: 6%;
    background-color: /*%PRIMARY1%*/ #202341;
    color: white;
    display: flex;
    align-items: center;
  }

  ^ .left-container {
    width: 40%;
    padding-right: 10%;
  }

  ^ .right-container {
    width: 50%;
  }

  ^ .pad-agreement {
    color: #4A5568;
    color: #4A5568;
  }

  ^ .invoice-info {
    height: 100%;
  }

  ^ .main-content {
    margin: 0 auto;
    width: 60%;
    height: 100%;
    display: flex;
    padding-top: 5%;
  }

  ^ .pad-heading, .flinks-heading {
    font-weight: bold;
    padding-bottom: 10px;
    color: #1E1E1F;
  }

  ^ .pad-checkbox {
    font-size: smaller;
    font-weight: 300;
    display: flex;
    align-items: center;
    border-top: 1px solid #D3DCE5;
    border-bottom: 1px solid #D3DCE5;
    margin-top: 20px;
    height: 45px;
  }

  ^ .foam-u2-CheckBox {
    margin-right: 10px;
    float: left;
  }

  ^ .pad-account {
    border-bottom: 1px solid #D3DCE5;
    margin-top: 20px;
    padding-top: 10px;
    background-color: #F7F7F7;
  }

  ^ .pad-submit {
    margin-top: 20px;
    padding-left: 30%;
  }

  ^ .pad-submission-status {
    margin-top: 20px;
    text-align: center;
  }

  ^ a {
    color: #F69679;
    margin-left: 3px;
    margin-right: 3px;
  }

  ^ .foam-u2-LoadingSpinner img {
    height: 60px;
  }

  ^ .checkmark-img {
    display: inline-block;
    margin-bottom: 16px;
  }

  ^ status-div {
    display: inline-block;
  }

  ^ .acc-label {
    text-align: center;
    font-size: large;
    font-weight: 500;
  }

  ^ .acc-info {
    background-color: #FCFCFC;
    display: grid;
    margin: 20px 10px 30px;
    padding: 20px;
  }
  ^ .acc-name {
    font-weight: 600;
    padding-bottom: 20px;
  }
  ^ .foam-u2-ActionView {
    background-color: #F69679;
    border: none;
    color: #212341;
  }
  ^ .foam-u2-ActionView:hover {
    background-color: #f9c6b7;
    border: none;
  }
  ^ .span-link {
    color: #F69679;
  }
  `,

  properties: [
    'rtp',
    'accountNumber',
    'accountName',
    {
      class: 'Boolean',
      name: 'submitInProgress'
    },
    {
      class: 'Boolean',
      name: 'padAgreement',
      factory: function() {
        return this.rtp.agreement;
      },
      postSet: function(o, n) {
        this.rtp.agreement = n;
      }
    },
    {
      class: 'Enum',
      name: 'status',
      of: 'net.nanopay.tx.model.TransactionStatus',
      value: 'PENDING'
    },
    {
      class: 'Boolean',
      name: 'isLoading_',
      documentation: `Condition to synchronize code execution and user response.`,
      value: false
    },
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      self.showFooter = false;
      self.showNav = false;
      self.addClass(self.myClass());

      var timer = this.timer;
      timer.time$.sub(function() {
        var t = timer.time;
        if ( t > 1500 ) {
          self.isLoading_ = false;
          self.timer.stop();
        }
      });

      self.flinksLoginIdDAO.find(self.rtp.onboardingRequest)
        .then(function(flinksLoginId) {
          self.accountDAO.find(flinksLoginId.account)
            .then(function(account) {
              self.accountNumber = account.summary;
              self.accountName = account.name;
            })
        }).catch(function(err) {
          console.log('Failure...');
          console.log(err);
        });

      self
        .start('div').addClass('top')
          .start('div').addClass('home-logo')
            .start('img').addClass('home-img')
              .attrs({
                src: '/images/paytechs.png'
              })
            .end()
          .end()
        .end()
        .start('div').addClass('main-content')
          .start('div').addClass('left-container')
            .start('div').addClass('pad-agreement')
              .start().addClass('pad-heading')
                .add('PayTechs of Canada: Annual Membership Dues')
              .end()
              .add('Thank you for your continued support and encouragement of PayTechs of Canada over this past year. Please log in to your online banking and select your bank account to process your payment.')
              .start('div').addClass('pad-checkbox')
                .start({ class: 'foam.u2.CheckBox' },
                      { data$: this.padAgreement$ })
                .end()
                .start().addClass('chbx-text')
                  .add('I accept the ')
                  .start('a').addClass('span-link').add('PAD Agreement')
                    .attrs({href: 'https://nanopay.net/wp-content/uploads/2020/10/nanopay-Pre-Authorized-Debit-Agreement.pdf', target: '_blank'})
                  .end()
                  .add(' and ')
                  .start('a').addClass('span-link').add('Terms of Service')
                    .attrs({href: 'https://nanopay.net/wp-content/uploads/2019/04/nanopay-Terms-of-Service.pdf', target: '_blank'})
                  .end()
                .end()
              .end()
            .end()
            .start('div').addClass('pad-account')
              .start().addClass('acc-label').add('Bank Account').end()
              .start().addClass('acc-info')
                .start('span').addClass('acc-name').add(self.accountName$).end()
                .add(self.accountNumber$)
              .end()
            .end()
            .start()
              .addClass('submit-card')
              .show(this.slot(function(submitInProgress, status) {
                return ( status != 'SENT' ) && ( ! submitInProgress );
              }))
              .startContext({ data: this })
                .start('div').addClass('pad-submit')
                  .start(this.SUBMIT_PAYMENT).end()
                .end()
              .endContext()
            .end()
            .start()
              .addClass('submission-complete-card')
              .show(self.slot(function(submitInProgress, status) {
                return ( status == 'SENT') || submitInProgress;
              }))
              .start('div').addClass('pad-submission-status')
                .add(this.slot(function(isLoading_) {
                  if ( isLoading_ ) {
                    return this.E().start().addClass(self.myClass('loading-spinner'))
                      .add(this.loadingSpinner)
                      .end();
                  }
                }))
                .start()
                  .add(this.slot(function(isLoading_) {
                    if ( !isLoading_ ) {
                      return this.E().start('img').addClass('checkmark-img')
                      .attrs({
                          src: '/images/checkmark-large-green.svg'
                      })
                    .end()
                    .start().addClass('status-div')
                      .start().add('Payment').end()
                      .start().add(this.slot(function(status, isLoading_) {
                        return status && status.label ? status.label : 'Error';
                        }))
                      .end()
                    .end();
                    }
                  }))
                .end()
              .end()
            .end()
          .end()
          .start('div').addClass('right-container')
            .start('div').addClass('invoice-info')
              .add(self.RtpView.create({rtp: self.rtp}))
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'submitPayment',
      label: 'Submit Payment',
      code: function(X) {
        var self = this;
        if ( ! this.rtp.agreement ) {
          this.notify('Please accept the PAD agreement and Terms of Service.', '', self.LogLevel.ERROR, true);
          return;
        }
        this.isLoading_ = true;
        this.timer.start();

        self.submitInProgress = true;
        self.requestToPayDAO.put(this.RequestToPay.create({ id: self.rtp.id, agreement: self.rtp.agreement, status: 3 }))
          .then(function(result) {
            self.status = result.status;
          }).catch(function(error) {
            console.log('Failure...');
            console.log(error);
            self.isLoading_ = false;
            // TODO: display error text to the user .. is it recoverable?
          });
      }
    }
  ]
});
