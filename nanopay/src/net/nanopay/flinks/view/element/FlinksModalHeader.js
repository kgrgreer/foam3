foam.CLASS({
  package: 'net.nanopay.flinks.view.element',
  name: 'FlinksModalHeader',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 100%;
      padding: 24px;
      box-sizing: border-box;
      position: relative;
    }

    ^bank-name {
      display: inline-block;
      vertical-align: middle;
      margin: 0;
      font-size: 24px;
      font-weight: 900;
    }

    ^institution-image {
      position: absolute;
      max-height: 77px;
      top: 8px;
      right: 12px;
    }
  `,

  properties: [
    {
      name: 'institution',
      factory: function() {
        return { name: 'Placeholder Bank', description: '', image: 'images/banks/flinks.svg' }
      }
    }
  ],

  messages: [
    { name: 'ConnectTo', message: 'Connect to' }
  ],

  methods: [
    function initE() {
      var bankString = this.ConnectTo + ' ' + this.institution.name;
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('bank-name')).add(bankString).end()
        .start({ class: 'foam.u2.tag.Image', data: this.institution.image }).addClass(this.myClass('institution-image')).end()
    }
  ]
});
