/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//TODO: Maybe have this and emailVerificationView extend a common view/css
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

  requires: [
    'foam.u2.stack.StackBlock',
    'foam.u2.borders.StatusPageBorder',
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ {
      height: 100%;
    }
    ^flex {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
      gap: 3rem;
      padding-top: 5rem;
    }
    ^sectionView{
      width: 100%;
      display: flex;
      justify-content: center;
    }
    ^title {
      text-align:center;
    }
    ^subTitle, ^sectionView > *{
      width: 75%;
    }
    ^subTitle {
      padding: 0 15px;
      text-align: center;
    }
    ^ .foam-u2-detail-SectionView .foam-u2-detail-SectionView-actionDiv {
      justify-content: center;
      flex-direction: column;
      gap: 0.5rem;
    }
    /* mobile */
    @media only screen and (min-width: /*%DISPLAYWIDTH.MD%*/ 786px ) {
      ^subTitle, ^sectionView > * {
        width: 50%;
      }
      ^subTitle {
        padding: 0;
      }
    }
    @media only screen and (min-width: /*%DISPLAYWIDTH.LG%*/ 960px ) {
      ^subTitle, ^sectionView > * {
        width: 25%;
      }
    }
  `,

  properties: [
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
      name: 'data',
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

      this.addClass()
        .start(this.StatusPageBorder, { showBack: false })
          .start()
            .addClass(this.myClass('flex'))
            .callIf(this.data.TITLE, function() {
              this.start('h1').addClass(self.myClass('title')).add(self.data.TITLE).end();
            })
            .callIf(this.data.INSTRUCTION, function() {
              this.start('p').addClass(self.myClass('subTitle')).add(self.data.INSTRUCTION).end();
            })
            .start(this.SectionView, {
              data$: this.data$,
              sectionName: 'resetPasswordSection',
              showTitle: false
            })
              .addClass(this.myClass('sectionView'))
            .end()
            .start()
              .add(this.BACK)
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Back to Sign In',
      buttonStyle: 'TEXT',
      code: function(X) {
        X.pushMenu('sign-in', true);
      }
    }
  ]
});
