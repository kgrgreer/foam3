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

/* ON LEFT SIDE IMG */
  ^ .cover-img-block1 {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
    border-radius: 8px;
  }
  ^image-one {
    width: 80%;
    padding-bottom: 8rem;
    max-width: 400px;
  }
  ^ .foam-u2-borders-SplitScreenGridBorder-grid {
    grid-gap: 0;
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
      name: 'imgPath',
      expression: function(loginVariables) {
        return loginVariables.imgPath || (this.theme.largeLogo ?? this.theme.logo);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'leftView',
      documentation: 'Allows using U2 views as left half of the login page, takes precedence over imgPath',
      factory: function() {
        return this.ctrl?.loginView?.leftView;
      }
    },
    { class: 'Boolean', name: 'shouldResize' },
    { class: 'Boolean', name: 'fullScreenLoginImage' },
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
    { class: 'Boolean', name: 'showLogo', value: true },
    { class: 'Boolean', name: 'showTitle', value: true }
  ],

  messages: [
    { name: 'GO_BACK', message: 'Go to ' },
    { name: 'MODE1', message: 'SignUp' },
    { name: 'DISCLAIMER_TEXT', message: 'By signing up, you accept our ' },
    { name: 'GPLAY_LEGAL', message: 'Google Play and the Google Play logo are trademarks of Google LLC.'}
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
      var right = this.E()
        // Title txt and Data
        .callIf(self.showTitle, function() { this.start().addClass('h300').add(self.data.TITLE).end(); })
        .addClass(self.myClass('content-form'))
        .callIf(self.displayWidth, function() { this.onDetach(self.displayWidth$.sub(self.resize)); })
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
            )
            .tag(self.AppBadgeView, {showAction: this.data.showAction, isReferral: this.data.referralToken})
          })
        )
        

      // CREATE SPLIT VIEW
      if ( this.imgPath || this.leftView ) {
        var split = this.SplitScreenGridBorder.create({
          columnsConfigRight: {
            class: 'foam.u2.layout.GridColumns',
            columns: 6,
            lgColumns: 4,
            xlColumns: 4
          }, 
          columnsConfigLeft: { 
            class: 'foam.u2.layout.GridColumns',
            columns: 6,
            lgColumns: 8,
            xlColumns: 8
          }});
        split.rightPanel
          .style({ position: 'relative', padding: '0 2rem' })
          .add(right)
      } else {
        this.add(right);
        return;
      }

      // RENDER EVERYTHING ONTO PAGE
      this.addClass();
      if ( ! this.leftView ) {
        split.leftPanel
          .addClass('cover-img-block1')
          .start('img')
            .addClass(self.myClass('image-one'))
            .attr('src', this.imgPath$)
          .end()
      } else {
        split.leftPanel.tag(this.leftView);
      }
      this.add(split);
    }
  ],

  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( this.displayWidth == 'MD' || this.displayWidth == 'SM' ||this.displayWidth == 'XS' || this.displayWidth == 'XXS' ) {
          this.shouldResize = true;
        } else {
          this.shouldResize = false;
        }
      }
    }
  ]
});
