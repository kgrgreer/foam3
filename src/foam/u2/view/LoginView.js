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

  DEPENDING ON PASSED IN ARGUMENTS:

  Property functionality:
  imgPath: if present view uses SplitScreenGridBorder (-USED to toggle splitScreen - picked up from ApplicationController)
  backLink_: if on data uses string link from data, other wise gets appConfig.url (-USED for top-top nav- toggled by this.topBarShow_)
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

  /* ON RIGHT SIDE ALL **** */
  ^ .centerVertical {
    padding-top: 3vh;
    max-width: 30vw;
    margin: 0 auto;
  }


  .foam-u2-dialog-ApplicationPopup ^content-form {
    width: 100%;
    padding: 2vw 0;
  }
  .foam-u2-dialog-ApplicationPopup ^ .centerVertical {
    max-width: 100vw;
  }

  /* SET ABOVE DATA */
  ^.topBar-logo-Back {
    display: none;
  }

  /* SET ON LOGO IMG */
  ^ .logoCenterVertical {
    margin: 0 auto;
    text-align: center;
    display: block;
  }
  ^ .top-bar-img {
    height: 4vh;
  }

  /* ON DATA */
  ^content-form {
    width: 75%;
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

  /* TOP-TOP BAR NAV to go with backLink_ */
  ^ .top-bar-nav {
    background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
    width: 100%;
    height: 4vh;
    border-bottom: solid 1px #e2e2e3
  }
  /* ON TXT IN TOP-TOP NAV */
  ^ .topBar-txt-link {
    cursor: pointer;
    font-size: 2.5vh;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    letter-spacing: normal;
    color: #8e9090;
    margin-left: 2vw;
    margin-top: 1vw;
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
    width: 48vw;
    padding-bottom: 8rem;
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
  @media (min-width: /*%DISPLAYWIDTH.LG%*/ 960px ) {
    .topBar-logo-Back {
      display: flex;
      justify-content: center;
      height: 6vh;
    }
    .foam-u2-view-LoginView-image-one {
      width: 28vw;
    }
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'topBarShow_',
      factory: function() {
        return !! this.backLink_;
      },
      hidden: true
    },
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
        return loginVariables.imgPath || '';
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
    {
      class: 'String',
      name: 'backLinkTxt_',
      factory: function() {
        let temp = this.backLink_.includes('www.') ?
          this.backLink_.substring(this.backLink_.indexOf('www.') + 4) :
          this.backLink_;
        return temp.includes('://') ?
          temp.substring(temp.indexOf('://') + 3) :
          temp;
      }
    },
    {
      class: 'String',
      name: 'backLink_',
      factory: function() {
        return this.data.backLink_ || this.appConfig.externalUrl || undefined;
      },
      hidden: true
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

      let logo = self.imgPath || (this.theme.largeLogo ? this.theme.largeLogo : this.theme.logo);
      // CREATE DATA VIEW
      var right = this.E()
      // Header on-top of rendering data
        .start()
          .add(
            this.slot(function(shouldResize) {
              return self.E().show( self.showLogo && ( shouldResize || self.fullScreenLoginImage || ! self.imgPath ) )
              .addClass('topBar-logo-Back')
              .start('img')
                .attr('src', logo)
                .addClass('top-bar-img')
              .end();
          }))
        .end()
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
            ).callIf(self.data.showAction, function () {
              this.tag(self.AppBadgeView, {isReferral: self.data.referralToken})
            }) 
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
          .style({ position: 'relative' })
          .add(right)
      } else {
        this.add(right);
        return;
      }

      // RENDER EVERYTHING ONTO PAGE
      this.addClass()
      // full width bar with navigation to app landing page
        .start().addClass('top-bar-nav').show(this.topBarShow_)
          .start()
            .start().addClass('topBar-txt-link')
              .start('span')
                .addClass('horizontal-flip')
                .addClass('inline-block')
                .add('➔')
              .end()
              .start('span').add(this.GO_BACK).add(this.backLinkTxt_)
                .on('click', () => {
                  window.location = this.backLink_;
                })
              .end()
            .end()
          .end()
        .end()
      // deciding to render half screen with img and data or just centered data
        .callIfElse( (this.imgPath || this.leftView) && split, () => {
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
        }, function() {
          this.add(right);
        });
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
