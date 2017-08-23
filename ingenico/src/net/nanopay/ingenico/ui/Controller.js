foam.CLASS({
  package: 'net.nanopay.ingenico.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'Top-level Ingenico application controller.',

  implements: [
    'net.nanopay.ingenico.dao.Storage'
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  exports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          background-color: #2c4389;
        }
        ^ .stack-wrapper {
          margin-top: 56px;
        }
        ^ .mdc-toolbar--fixed {
          -webkit-box-shadow: none;
          box-shadow: none;
        }
        ^ .mdc-list-item__start-detail img {
          width: 25px;
          height: 25px;
          object-fit: contain;
        }
      */}
    })
  ],

  properties: [
    'drawer',
    'title',
    {
      name: 'stack',
      factory: function () {
        return this.Stack.create();
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.stack.push({ class: 'net.nanopay.ingenico.ui.HomeView' });
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('mdc-toolbar mdc-toolbar--fixed')
          .start('div').addClass('mdc-toolbar__row')
            .start('section').addClass('mdc-toolbar__section mdc-toolbar__section--align-start')
              .start('button').addClass('merchant-menu material-icons mdc-toolbar__icon--menu')
                .add('menu')
                .on('click', this.onMenuClicked)
              .end()
              .start('span').addClass('mdc-toolbar__title catalog-title').add('Home').end()
            .end()
          .end()
        .end()

        .start('aside').addClass('mdc-temporary-drawer')
          .start('nav').addClass('mdc-temporary-drawer__drawer')
            .start('nav').addClass('mdc-temporary-drawer__content mdc-list-group')
              .start('div').addClass('mdc-list')
                .start('a').addClass('mdc-list-item')
                  .attrs({ href: '#' })
                  .start('i').addClass('mdc-list-item__start-detail')
                    .attrs({ 'aria-hidden': true })
                    .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-home.png' })
                  .end()
                  .add('Home')
                  .on('click', this.onMenuItemClicked)
                .end()
                .start('a').addClass('mdc-list-item')
                  .attrs({ href: '#' })
                  .start('i').addClass('mdc-list-item__start-detail')
                    .attrs({ 'aria-hidden': true })
                    .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-transactions.png' })
                  .end()
                  .add('Transactions')
                  .on('click', this.onMenuItemClicked)
                .end()
              .end()
            .end()
          .end()
        .end()

        .start('div')
          .addClass('stack-wrapper')
          .tag({ class: 'foam.u2.stack.StackView', data: this.stack, showActions: false })
        .end()


      this.onload.sub(function () {
        var drawerEl = document.querySelector('.mdc-temporary-drawer');
        var MDCTemporaryDrawer = mdc.drawer.MDCTemporaryDrawer;
        this.drawer = new MDCTemporaryDrawer(drawerEl);
        this.title = document.getElementsByClassName('mdc-toolbar__title')[0];
      });
    }
  ],

  listeners: [
    function onMenuClicked (e) {
      drawer.open = true;
    },

    function onMenuItemClicked (e) {
      var clicked = e.target.text;
      if ( title === clicked ) {
        drawer.open = false;
        return;
      }

      title.innerHTML = clicked;
      switch ( clicked ) {
        case 'Home':
          this.stack.push({ class: 'net.nanopay.ingenico.ui.HomeView' });
          break;
        case 'Transactions':
          this.stack.push({ class: 'net.nanopay.ingenico.ui.transaction.TransactionListView' });
          break;
      }
      drawer.open = false;
    }
  ]
});
