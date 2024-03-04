/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'LoginView',
  extends: 'foam.u2.View',

  documentation: `User View for SignUp or SignIn.

  DEPENDING ON MODEL PASSED IN:

  MESSAGEs possible for this view:
  TITLE: if exists will be ontop of data,
  FOOTER_TXT: if exists will be under data,
  FOOTER_LINK: if exists will be under FOOTER and the text associated to footerLink(),
  SUB_FOOTER_TXT: needed an additional option for the forgot password,
  SUB_FOOTER_LINK: needed an additional option for the forgot password
  DISCLAIMER: If true, add t&c and privacyPolicy under model

  METHODs possible for this view:
  footerLink: code associated to footer msg and link,
  subfooterLink: code associated to subfooter msg

  `,

  imports: [
    'appConfig',
    'ctrl',
    'loginVariables',
    'memento',
    'stack',
    'theme',
    'displayWidth?',
    'loginSuccess'
  ],

  requires: [
    'foam.u2.Element',
    'foam.u2.borders.SplitScreenGridBorder',
    'foam.nanos.u2.navigation.SignIn',
    'foam.nanos.u2.navigation.SignUp',
    'foam.nanos.app.AppBadgeView'
  ],

  css: `
  ^.foam-u2-ActionView {
    width: 100%;
  }

  .foam-u2-dialog-ApplicationPopup ^content-form {
    width: 100%;
    padding: 2vw 0;
  }

  /* ON DATA */
  ^content-form {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-self: center;
    padding: 2rem;
  }

  /* ON ALL FOOTER TEXT */
  ^ .text-with-pad {
    margin-right: 0.2em;
  }
  ^center-footer {
    text-align: center;
  }
  ^ .align-end {
    text-align: end;
  }

  ^disclaimer {
    text-align: center;
  }

  ^tc-link {
    background: none;
    border: 1px solid transparent;
    color: $primary400;
    text-decoration: none;
  }
  ^legal {
    position: absolute;
    bottom: 1.2rem;
    margin: 0 1rem;
    text-align: center;
    font-size: 0.8rem;
    width: 100%;
  }
  `,

  properties: [
    {
      name: 'data',
      factory: () => {
       return {};
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      name: 'param',
      factory: function() {
        return {};
      }
    },
    {
      class: 'String',
      name: 'mode_',
      hidden: true
    },
    {
      class: 'String',
      name: 'modelCls_',
      documentation: `
        If modelCls_ is provided, the data can be created directly from this instead of mode
      `,
      factory: function() {
        if ( this.mode_ === this.MODE1 ) {
          return this.SignUp.id;
        } else {
          return this.SignIn.id;
        }
      }
    },
    { class: 'Boolean', name: 'showTitle', value: true }
  ],

  messages: [
    { name: 'MODE1', message: 'SignUp' },
    { name: 'DISCLAIMER_TEXT', message: 'By signing up, you accept our ' }
  ],

  methods: [
    function init() {
      // Use passed in values or default loginVariables defined on ApplicationControllers
      this.param = Object.assign(this.loginVariables, this.param)
      try {
        var cls = foam.lookup(this.modelCls_);

        if ( this.data &&  cls.isInstance(this.data) ) return;

        this.data = cls.create(this.param, this);
      } catch (err) {
        console.warn('Error occurred when looking up modelCls_', this.modelCls_, err);
      }
    },

    function render() {
      this.SUPER();
      var self = this;

      // CREATE DATA VIEW
      this
        // Title txt and Data
        .callIf(self.showTitle, function() { this.start().addClass('h300').add(self.data.TITLE).end(); })
        .addClass(self.myClass('content-form'))
        .start('form')
          .setID('login')
          .startContext({ data: this }).tag(this.DATA).endContext()
          .start()
            .addClass('align-end')
            .start(this.data.SUB_FOOTER)
              .attr('type', 'button')
            .end()
          .end()
        .end()
        .start(this.data.LOGIN)
          .attrs({ type: 'submit', form: 'login' })
        .end()
        .add(
          this.slot(function(data$showAction, data$disclaimer, appConfig) {
            var disclaimer = self.E().style({ display: 'contents' }).callIf(data$disclaimer && appConfig, function() {
              this.start()
                .addClass(self.myClass('disclaimer'))
                .add(self.DISCLAIMER_TEXT)
                .start('a')
                  .addClasses([self.myClass('tc-link'), 'h600'])
                  .add(appConfig.termsAndCondLabel)
                  .attrs({
                    href: appConfig.termsAndCondLink,
                    target: '_blank'
                  })
                .end()
                .add(' and ')
                .start('a')
                  .addClasses([self.myClass('tc-link'), 'h600'])
                  .add(appConfig.privacy)
                  .attrs({
                    href: appConfig.privacyUrl,
                    target: '_blank'
                  })
                .end()
              .end();
            });
            return self.E().style({ display: 'contents' }).callIfElse(data$showAction,
              function() {
                this
                  .start()
                    .startContext({ data: self.data })
                    .addClass(self.myClass('center-footer'))
                    // first footer
                    .start()
                      .addClass(self.myClass('signupLink'))
                      .start('span')
                        .addClass('text-with-pad')
                        .add(self.data.FOOTER_TXT)
                      .end()
                      .start('span')
                        .add(self.data.FOOTER)
                      .end()
                    .end()
                    .endContext()
                  .end()
                  .add(disclaimer);
              },
              function() {
                this.start().add(disclaimer).end()
              }
            ).callIf(self.data.showAction && self.theme?.appBadgeView, function () {
              this.tag(self.theme.appBadgeView, {isReferral: self.data.referralToken})
            }) 
          })
        )
        
    }
  ]
});
