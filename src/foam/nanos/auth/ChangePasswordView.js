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
    'foam.u2.borders.StatusPageBorder',
    'foam.u2.detail.SectionView',
    'foam.u2.stack.StackBlock'
  ],

  messages: [
    { name: 'BACK_LABEL', message: 'Back to'}
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
      gap: 1rem;
      padding: 2.4rem 3.2rem;
    }
    ^flex^popup {
      gap: 3rem;
      padding: 5rem 0 0 0;
    }
    ^sectionView{
      width: 100%;
      display: flex;
      justify-content: center;
    }
    ^title {
      text-align:center;
    }
    ^popup ^subTitle,^popup ^sectionView > *{
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
    ^ form {
      margin-bottom: 0;
    }
    /* mobile */
    @media only screen and (min-width: /*%DISPLAYWIDTH.MD%*/ 786px ) {
      ^popup ^subTitle,^popup ^sectionView > * {
        width: 50%;
      }
      ^subTitle {
        padding: 0;
      }
    }
    @media only screen and (min-width: /*%DISPLAYWIDTH.LG%*/ 960px ) {
      ^popup  ^subTitle,^popup ^sectionView > * {
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
          .create({ isHorizontal: this.isHorizontal }, ctrl);
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      class: 'Boolean',
      name: 'popup',
      value: true
    }
  ],

  methods: [
    function render() {
      const self = this;
      this.addClass()
        .start(this.popup ? this.StatusPageBorder : '', { showBack: false })
          .start()
            .enableClass(self.myClass('popup'), this.popup$)
            .addClass(this.myClass('flex'))
            .callIf(this.data.TITLE, function() {
              this.start().addClass(self.myClass('title'), 'h400').add(self.data.TITLE).end();
            })
            .callIf(this.data.INSTRUCTION, function() {
              this.start().addClass(self.myClass('subTitle'), 'p').add(self.data.INSTRUCTION).end();
            })
            .start(this.SectionView, {
              nodeName: 'form',
              data$: this.data$,
              sectionName: 'resetPasswordSection',
              showTitle: false
            })
              .addClass(this.myClass('sectionView'))
            .end()
            .callIf(this.popup, function() {
              let label = self.stack?.stack_[self.stack.pos - 1]?.breadcrumbTitle
              this.tag(self.BACK,
                { label: self.BACK_LABEL + ' ' +  (label || (self.theme?.appName ?? 'home')) }
              );
            })
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      buttonStyle: 'TEXT',
      code: function(X) {
        if ( X.stack.pos > 0 ) {
          X.stack.back();
        } else {
          X.pushMenu('', true);
        }
      }
    }
  ]
});
