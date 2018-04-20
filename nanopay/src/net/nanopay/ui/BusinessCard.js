foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'BusinessCard',
  extends: 'foam.u2.View',

  documentation: 'Display business information & user info.',

  css: `
    ^ {
      width: 450px;
    }
    ^ .boxless-for-drag-drop{
      border: none !important;
    }
  `,

  properties: [
    {
      name: 'business',
      value: {}
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('profileImgDiv')
            .tag({
              class: 'foam.nanos.auth.ProfilePictureView',
              placeholderImage: 'images/business-placeholder.png',
              // data$: this.business.businessProfilePicture$,
              uploadHidden: true
            })
            .start().add(this.business.businessName$).addClass('companyName').end()
          .end()
        .end()
    }
  ]
});
