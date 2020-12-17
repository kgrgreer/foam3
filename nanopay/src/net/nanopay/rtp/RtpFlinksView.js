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
  name: 'RtpFlinksView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.rtp.RequestToPay',
    'net.nanopay.rtp.RtpView',
    'net.nanopay.rtp.RtpConfirmView',
    'net.nanopay.flinks.widget.FlinksWidgetView',
    'net.nanopay.flinks.external.FlinksLoginId'
  ],

  imports: [
    'appConfig',
    'flinksLoginIdDAO',
    'memento',
    'requestToPayDAO',
    'showFooter',
    'showNav',
    'stack',
    'user'
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
    height: 58%;
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

  ^ .pad-heading {
    font-weight: bold;
    padding-bottom: 10px;
    color: #1E1E1F;
  }

  ^ .pad-select {
    border-top: 1px solid #D3DCE5;
    margin-top: 20px;
    padding-top: 10px;
  }

  ^ .pad-sorry {
    margin-top: 50px;
    margin-left: 50px;
  }
  
  .application-stack {
    height: 100%;
  }
  `,

  properties: [
    'rtp',
    'rtpId'
  ],

  methods: [
    function initE() {
      this.SUPER();
      
      window.addEventListener('message', this.onMessage);
      
      var self = this;
      this.showFooter = false;
      this.showNav = false;
      this.addClass(this.myClass());
      var locationArr = window.location.hash.split(':');
      var invoice = locationArr[locationArr.length - 1];
      self.rtpId = invoice.split('=')[1];
      this.requestToPayDAO.find(self.rtpId).then(function(rtp) {
        if ( self.user.id != rtp.payer ) {

        }

        // Skip to second page logic for testing
        // self.start().add('NEXT').on('click', function() { self.stack.push(self.RtpConfirmView.create({ rtp: rtp, status: rtp.status, agreement: rtp.agreement })); });
        
        // Skip to the confirmation page if the payment has already been sent
        if ( rtp.status == 'SENT' ) {
          self.stack.push(self.RtpConfirmView.create({ rtp: rtp, status: rtp.status, agreement: rtp.agreement }));
          return;
        }
        
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
          .start()
            .start('div').addClass('main-content')
              .show(self.user.id == rtp.payer)
              .start('div').addClass('left-container')
                .start('div').addClass('pad-agreement')
                  .start().addClass('pad-heading')
                    .add('PayTechs of Canada: Annual Membership Dues')
                  .end()
                  .add('Thank you for your continued support and encouragement of PayTechs of Canada over this past year. Please log in to your online banking and select your bank account to process your payment.')
                  .start('div').addClass('pad-select')
                    .start('div')
                      .add(self.FlinksWidgetView.create({demo: self.appConfig.mode != 'PRODUCTION', theme: 'light'}))
                    .end()
                  .end()
                .end()
              .end()
              .start('div').addClass('right-container')
                .start('div').addClass('invoice-info')
                  .add(self.RtpView.create({rtp: rtp}))
                .end()
              .end()
            .end()
            .start()
              .show(self.user.id != rtp.payer)
              .start('div').addClass('pad-sorry')
                .start('h1')
                  .add('We Are Sorry...')
                .end()
                .start('div')
                  .add('There was an problem and your invoice could not be loaded.')
                .end()
              .end()
            .end()
          .end();
      });

    }
  ],

  listeners: [
    {
      name: 'onMessage',
      code: function(e) {
        var self = this;
        
        // Only handle messages with data
        if ( ! e.data ) {
          return;
        }
        
        if ( e.data.loginId && ! self.loginId ) {
          self.loginId = e.data.loginId;
        }
        if ( e.data.institution ) {
          self.institution = e.data.institution;
        }
        if ( e.data.accountId ) {
          self.accountId = e.data.accountId;
        }

        // Process redirect message
        if ( e.data.step == 'REDIRECT' ) {
          this.flinksLoginIdDAO.put(this.FlinksLoginId.create({
            loginId: self.loginId,
            accountId: self.accountId,
            institution: self.institution,
            user: self.user.id
          })).then(function(resp) {
            self.requestToPayDAO
              .put(self.RequestToPay.create({ id: self.rtpId, onboardingRequest: resp.id}))
              .then(function(rtpResponse) {
                self.stack.push(self.RtpConfirmView.create({ rtp: rtpResponse }));
              }).catch(function(err) {
                // TODO: there should be an error screen
                console.error(err);
              });
          }).catch(function(error) {
            console.error(error);
          });
        }
      }
    }
  ]
});
