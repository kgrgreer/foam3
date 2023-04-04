/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.login',
  name: 'LoginView',
  extends: 'foam.u2.View',

  imports: [
    'appConfig',
    'loginService',
    'loginVariables',
    'memento',
    'stack',
    'theme',
    'displayWidth?',
    'loginSuccess'
  ],

  requires: [
    'foam.nanos.auth.login.SignIn',
    'foam.nanos.auth.login.SignUp',
    'foam.u2.Element',
    'foam.u2.borders.SplitScreenGridBorder',
    'foam.u2.stack.StackBlock'
  ],

  css: `
  ^ .foam-u2-ActionView {
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

  /* TITLE TXT ON DATA */
  ^ .title-top {
    font-size: 2.5em;
    padding-top: 2vh;
    font-weight: bold;
  }

  /* ON DATA */
  ^content-form {
    align-self: center;
    width: 75%;
    padding: 2vw;
    box-sizing: border-box;
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

  ^center-footer > ^signupLink {
    margin-bottom: 2rem;
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

  /* DISCLAIMER */
      /* ON NO IMG SPLIT & IMG SPLIT */
  ^ .disclaimer-login {
    width: 35vw;
    font-size: 0.75em;
    color: #8e9090;
    margin-left: 12vw;
    line-height: 1.5;
    background: transparent;
  }

/* ON LEFT SIDE IMG */
  ^ .cover-img-block1 {
    /* align img with disclaimer */
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
  }
  ^image-one {
    width: 48vw;
    padding-top: 25px;
  }
  
  @media (min-width: /*%DISPLAYWIDTH.MD%*/ 786px ) {
    .foam-nanos-auth-login-LoginView .foam-u2-borders-SplitScreenGridBorder {
      padding: 0 4vw;
    }
  }
  @media (min-width: /*%DISPLAYWIDTH.LG%*/ 960px ) {
    .topBar-logo-Back {
      display: flex;
      justify-content: center;
      height: 6vh;
      background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
    }
    .foam-nanos-auth-login-LoginView-image-one {
      width: 28vw;
    }
  }
  `,

  constants: [
    { name: 'SIGN_IN', value: 0 },
    { name: 'SIGN_UP', value: 1 }
  ],

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
      name: 'mode_',
      value: 0,
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
      documentation: 'Allows using U2 views as left half of the login page, takes precedence over imgPath'
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
        if ( this.mode_ === this.SIGN_UP ) {
          return this.SignUp.id;
        } else {
          return this.SignIn.id;
        }
      }
    },
    { class: 'Boolean', name: 'showLogo', value: true },
    { class: 'Boolean', name: 'showTitle', value: true },
    { class: 'Boolean', name: 'showAction', value: true }
  ],

  messages: [
    { name: 'GO_BACK', message: 'Go to ' },
    { name: 'SWITCH_TO_SIGN_UP_TXT', message: 'Not a user yet?' },
    { name: 'SWITCH_TO_SIGN_IN_TXT', message: 'Already have an account?' }
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

      this.document.addEventListener('keyup', this.onKeyPressed);
      this.onDetach(() => {
        this.document.removeEventListener('keyup', this.onKeyPressed);
      });
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
        .callIf(self.showTitle, function() { this.start().addClass('title-top').add(self.data.TITLE).end(); })
        .addClass(self.myClass('content-form'))
        .callIf(self.displayWidth, function() { this.onDetach(self.displayWidth$.sub(self.resize)); })
        .startContext({ data: self }).tag(self.DATA).endContext()
        .start()
          .addClass('align-end')
          .startContext({ data: self })
            .callIf(self.mode_ == self.SIGN_IN, function() { this.tag(self.RESET_PASSWORD) })
          .endContext()
        .end()
        .add(
          this.slot(function(showAction) {
            return self.E().callIf(showAction, function() {
              this
                .startContext({ data: self })
                  .callIfElse(
                    self.mode_ == self.SIGN_IN,
                    function() { this.tag(self.SIGN_IN_ACTION) },
                    function() { this.tag(self.SIGN_UP_ACTION) }
                  )
                .endContext()
                .br()
                .br()
                .start()
                  .startContext({ data: self.data })
                  .addClass(self.myClass('center-footer'))
                  // first footer
                  .start()
                    .addClass(self.myClass('signupLink'))
                    .start('span')
                      .addClass('text-with-pad')
                      .callIfElse(
                        self.mode_ == self.SIGN_IN,
                        function() { this.add(self.SWITCH_TO_SIGN_UP_TXT) },
                        function() { this.add(self.SWITCH_TO_SIGN_IN_TXT) }
                      )
                    .end()
                    .start('span')
                      .callIfElse(
                        self.mode_ == self.SIGN_IN,
                        function() { this.add(self.SWITCH_TO_SIGN_UP) },
                        function() { this.add(self.SWITCH_TO_SIGN_IN) }
                      )
                    .end()
                  .end()
                  .endContext()
                .end();
            })
          })
        )
        

      // CREATE SPLIT VIEW
      if ( this.imgPath || this.leftView ) {
        var split = this.SplitScreenGridBorder.create();
        split.rightPanel.add(right);
      } else {
        right.addClass('centerVertical').start().addClass('disclaimer-login').add(this.data.DISCLAIMER).end();
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
        .callIfElse( !! (this.imgPath || this.leftView) && !! split, () => {
          if ( ! this.leftView ) {
            split.leftPanel
              .addClass('cover-img-block1')
              .start('img')
                .addClass(self.myClass('image-one'))
                .attr('src', this.imgPath$)
              .end()
              .callIf( !! this.data.disclaimer , () => {
                // add a disclaimer under img
                split.leftPanel.start('p')
                  .addClass('disclaimer-login').addClass('disclaimer-login-img')
                  .add(this.data.DISCLAIMER)
                .end();
              });
          } else {
            split.leftPanel.tag(this.leftView);
          }
          this.add(split);
        }, function() {
          this.add(right);
        });
    }
  ],

  actions: [
    {
      name: 'signInAction',
      label: 'Sign in',
      buttonStyle: 'PRIMARY',
      code: function(X) {
        this.loginService.signin(X, this.data);
      }
    },
    {
      name: 'signUpAction',
      label: 'Get started',
      buttonStyle: 'PRIMARY',
      code: function(X) {
        this.loginService.signup(X, this.data);
      }
    },
    {
      name: 'switchToSignIn',
      label: 'Sign in',
      buttonStyle: 'TEXT',
      code: function(X) {
        X.window.history.replaceState(null, null, X.window.location.origin);
        X.stack.push(foam.u2.stack.StackBlock.create({ view: { ...(X.loginView ?? { class: 'foam.nanos.auth.login.LoginView' }), mode_: 0, topBarShow_: X.topBarShow_, param: X.param }, parent: X }));
      }
    },
    {
      name: 'switchToSignUp',
      label: 'Create an account',
      buttonStyle: 'TEXT',
      code: function(X) {
        X.window.history.replaceState(null, null, X.window.location.origin);
        X.stack.push(foam.u2.stack.StackBlock.create({ view: { ...(X.loginView ?? { class: 'foam.nanos.auth.login.LoginView' }), mode_: 1, topBarShow_: X.topBarShow_, param: X.param }, parent: X }));
      }
    },
    {
      name: 'resetPassword',
      label: 'Forgot password?',
      buttonStyle: 'LINK',
      code: function(X) {
        X.stack.push(this.StackBlock.create({
          view: {
            class: 'foam.nanos.auth.ChangePasswordView',
            modelOf: 'foam.nanos.auth.RetrievePassword'
          }
        }));
      }
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
    },
    function onKeyPressed(e) {
      e.preventDefault();
      var key = e.key || e.keyCode;
      if ( key === 'Enter' || key === 13 ) {
          this.data.login();
      }
    }
  ]
});
