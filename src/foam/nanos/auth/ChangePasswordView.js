/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ChangePasswordView',
  extends: 'foam.u2.Controller',

  documentation: 'renders a password change model',

  imports: [
    'loginView?',
    'stack',
    'theme',
    'user'
  ],

  requires: [ 'foam.u2.stack.StackBlock' ],

  css: `
    ^ {
      margin-bottom: 24px
    }
    ^top-bar {
      background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
      width: 100%;
      height: 12vh;
      border-bottom: solid 1px #e2e2e3;
    }
    ^top-bar img {
      height: 8vh;
      padding-top: 2vh;
      display: block;
      margin: 0 auto;
    }
    ^content {
      padding-top: 4vh;
      margin: 0 auto;
    }
    ^content-horizontal {
      width: 90%;
    }
    ^content-vertical {
      width: 30vw;
    }
    ^section {
      margin-bottom: 10%;
    }
    /* subtitle */
    /* using nested CSS selector to give a higher sepcificy and prevent being overriden  */
    ^ ^section .subtitle {
      color: $grey500;
    }
    ^link {
      color: $primary400;
      cursor: pointer;
      text-align: center;
      padding-top: 1.5vh;
    }
    ^ .foam-u2-layout-Cols > .foam-u2-ActionView {
      width: 100%;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'showHeader',
      documentation: `This property toggles the view from having a top bar displayed.`,
      value: true,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: `Toggles the view from displaying input fields horizontally or vertically.
        Not recommended to set this to true if there are less than three input fields for password model.
      `,
      value: false,
      hidden: true
    },
    {
      class: 'String',
      name: 'modelOf',
      documentation: `Password model used for this view.
        Pass this property along when you create this view.
        e.g., stack.push({
          class: 'foam.nanos.auth.ChangePasswordView',
          modelOf: 'foam.nanos.auth.RetrievePassword'
        })
      `
    },
    {
      class: 'FObjectProperty',
      of: this.modelOf,
      name: 'model',
      documentation: 'instance of password model used for this view',
      factory: function() {
        return foam.lookup(this.modelOf)
          .create({ isHorizontal: this.isHorizontal }, this);
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    }
  ],

  methods: [
    function render() {
      const self = this;
      const logo = this.theme.largeLogo || this.theme.logo;

      this.addClass()
        // header
        .callIf(this.showHeader, function() {
          this.start().addClass(self.myClass('top-bar'))
            .start('img').attr('src', logo).end()
          .end();
        })
        // body
        .start()
          .addClass(this.myClass('content'))
          .callIfElse(this.isHorizontal, function() {
            this.addClass(self.myClass('content-horizontal'));
          }, function() {
            this.addClass(self.myClass('content-vertical'));
          })
          // section
          .start('form').addClass(this.myClass('section'))
            .start(this.MODEL).end()
          .end()
          // link
          .callIf(this.model.hasBackLink, function() {
            this.start().addClass(self.myClass('link'))
              .add(self.model.REDIRECTION_TO)
              .on('click', function() {
                self.stack.push(self.StackBlock.create({ view: { ...(self.loginView ?? { class: 'foam.u2.view.LoginView' }), mode_: 'SignIn' }, parent: self }));
              })
            .end();
          })
        .end();
    }
  ]
});
