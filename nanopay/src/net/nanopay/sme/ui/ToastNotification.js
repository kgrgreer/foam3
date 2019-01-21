foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'ToastNotification',
  extends: 'foam.u2.View',

  documentation: `
    A toast notification is a UI element to give a user immediate
    feedback. Toast notifications are only visible for a few seconds.
  `,

  css: `
    ^ {
      width: 70vw;
      max-width: 1024px;
      margin: auto;
      padding: 8px 24px;
      position: fixed;
      animation-name: fade;
      animation-duration: 10s;
      top: 5px;
      left: calc(50% - 1024px / 2);
      font-size: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      z-index: 15000;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      background: #f6fff2;
      border: 1px solid #03cf1f;
    }
    @media only screen and (max-width: 1399px) {
      ^ {
        left: 13.5vw;
      }
    }
    @keyframes fade {
      0% { opacity: 0; }
      10% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }
    ^error-background {
      background: #fff6f6;
      border: 1px solid #f91c1c;
    }
    ^warning-background {
      background: #f5f4ff;
      border: 1px solid #604aff;
    }
    ^link-icon {
      display: inline-block;
      margin-top: 0px;
      vertical-align: middle;
      float: right;
      margin-right: 0 !important;
    }
    ^close-img{
      background-image: url("images/ic-cancel.svg");
      cursor:pointer;
      height: 20px;
      opacity: 0.5;
      width: 20px;
    }
    ^close-img:hover{
      opacity: 1;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'message'
    },
    'data'
  ],

  methods: [

    function initE() {
      var img;
      if ( this.type === 'error' ) {
        img = 'images/ablii/inline-error-icon.svg';
      } else if ( this.type === 'warning' ) {
        img = 'images/ablii/information-small-purple.svg';
      } else {
        img = 'images/ablii/checkmark-small-green.svg';
      }
      this
        .addClass(this.myClass())
        .enableClass(this.myClass('error-background'), this.type === 'error')
        .enableClass(this.myClass('warning-background'), this.type === 'warning')
        .start().style({ 'display': 'inline' })
          .start('img')
            .style({
              'vertical-align': 'middle',
              'display': 'inline-block',
              'margin-right': '10px'
            })
            .attrs({ src: img })
          .end()
          .start()
            .style({
              'vertical-align': 'middle',
              'display': 'inline-block'
            })
            .add(this.message)
          .end()
        .end()
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('link-icon'))
            .start()
              .addClass(this.myClass('align-top'))
              .addClass(this.myClass('close-img'))
              .attr('src', this.CLOSE_ICON)
              .on('click', () => this.remove())
            .end()
          .end()
        .endContext();

      setTimeout(() => {
        this.remove();
      }, 9900);
    }
  ]
});
