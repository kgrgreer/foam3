/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'VerificationCodeView',
  extends: 'foam.u2.View',

  documentation: 'view to enter email verification code',

  imports: [
    'pushMenu'
  ],

  requires: [
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
    ^subTitle {
      width: 75%;
      padding: 0 15px;
      text-align: center;
    }
   /* mobile */
   @media (min-width: /*%DISPLAYWIDTH.MD%*/ 786px ) {
    ^subTitle {
      width: 50%;
    }
  }
  @media (min-width: /*%DISPLAYWIDTH.LG%*/ 960px ) {
    ^subTitle {
      width: 25%;
    }
  }
  `,


  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.email.EmailVerificationCode',
      name: 'data'
    }
  ],

  methods: [
    function render() {
      this
        .addClass(this.myClass(), this.myClass('flex'))
        .start('h1').addClass(this.myClass('title')).add(this.data.TITLE).end()
        .start('p').addClass(this.myClass('subTitle')).add(this.data.INSTRUCTION).end()
        .start(this.SectionView, { data$: this.data$, sectionName: 'verificationCodeSection', showTitle: false })
        .addClass(this.myClass('sectionView')).end()
        .startContext({ data: this.data })
          .addClass(this.myClass('flex'))
          .start()
            .add(this.BACK)
          .end()
        .endContext();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Back to Sign In',
      buttonStyle: 'LINK',
      code: function(X) {
        X.pushMenu('sign-in', true);
      }
    }
  ]
});
