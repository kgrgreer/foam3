foam.CLASS({
  package: 'net.nanopay.ingenico.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'Top-level Ingenico application controller.',

  implements: [
    'foam.nanos.client.Client',
    'net.nanopay.transactionservice.client.Client'
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  exports: [
    'user',
    'stack',
    'toolbar'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background-color: #2c4389;
        }
        ^ .stack-wrapper {
          margin-top: 56px;
        }
        ^ .mdc-toolbar--fixed {
          -webkit-box-shadow: none;
          box-shadow: none;
        }
        ^ .mdc-list-item {
          min-height: 90px;
          background-color: #ffffff;
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.88;
          text-align: left;
          color: #595959;
          padding: 0px;
          margin: 0px;
        }
        ^ .mdc-list-item.back {
          min-height: 56px;
          background-color: #26a96c;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
        }
        ^ .mdc-list-item.selected {
          background-color: #f1f1f1;
        }
        ^ .mdc-list-item__start-detail {
          height: 90px;
          margin-left: 20px;
          margin-top: 50px;
        }
        ^ .mdc-list-item__start-detail img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
        ^ .mdc-list-item__start-detail.back {
          height: 90px;
          margin-left: 27px;
          margin-top: 70px;
          margin-right: 25px;
        }
        ^ .mdc-list-item__start-detail.back img {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
      */}
    })
  ],

  properties: [
    'title',
    'toolbar',
    'drawer',
    'drawerList',
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function () { return this.User.create(); }
    },
    {
      name: 'stack',
      factory: function () { return this.Stack.create(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      // Inject sample user
      this.userDAO.limit(1).select().then(function (a) {
        self.user.copyFrom(a.array[0]);
      });

      this.stack.push({ class: 'net.nanopay.ingenico.ui.SetupView' });
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
                .start('a').addClass('mdc-list-item back')
                  .attrs({ href: '#' })
                  .start('i').addClass('mdc-list-item__start-detail back')
                    .attrs({ 'aria-hidden': true })
                    .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-arrow-left.png' })
                  .end()
                  .add('Back')
                  .on('click', this.onMenuItemClicked)
                .end()

                .start('a').addClass('mdc-list-item selected')
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
        this.drawerList = document.getElementsByClassName('mdc-list')[0];
        this.toolbar = document.getElementsByClassName('mdc-toolbar')[0];
      });
    }
  ],

  listeners: [
    function onMenuClicked (e) {
      drawer.open = true;
    },

    function onMenuItemClicked (e) {
      var clicked = e.target.text;
      if ( title === clicked || clicked === 'Back' ) {
        drawer.open = false;
        return;
      }

      // remove selected class from current and add to new
      var selected = document.getElementsByClassName('mdc-list-item selected')[0];
      if ( selected ) {
        selected.classList.remove('selected');
        e.target.classList.add('selected')
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
