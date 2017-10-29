foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'Top-level Merchant application controller.',

  implements: [
    'net.nanopay.merchant.client.Client'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus'
  ],

  exports: [
    'user',
    'device',
    'stack',
    'showHeader',
    'tipEnabled',
    'toolbarIcon',
    'toolbarTitle',
    'serialNumber'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background-color: #2C4389;
        }
        ^ .sidenav {
          display: none;
          height: 100%;
          width: 250px;
          position: fixed;
          z-index: 1;
          top: 0;
          left: 0;
          background-color: #FFFFFF;
          overflow-x: hidden;
          box-shadow: 10px 8px 10px -5px rgba(0, 0, 0, 0.2),
            0px 16px 24px 2px rgba(0, 0, 0, 0.14),
            0px 6px 30px 5px rgba(0, 0, 0, 0.12);
        }
        ^ .sidenav.open {
          display: block;
        }
        ^ .toolbar {
          height: 56px;
          background-color: #4054B5;
          -webkit-box-shadow: none;
          box-shadow: none;
          position: relative;
        }
        ^ .toolbar-icon {
          height: 100%;
          padding-left: 20px;
          padding-right: 20px;
          float: left;
        }
        ^ .toolbar-title {
          font-size: 16px;
          line-height: 56px;
        }
        ^ .sidenav-list-item {
          height: 90px;
        }
        ^ .sidenav-list-item.selected {
          background-color: #f1f1f1;
        }
        ^ .sidenav-list-item a {
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          color: #595959;
          line-height: 90px;
          text-decoration: none;
        }
        ^ .sidenav-list-icon i {
          display: inline-block;
          height: 100%;
          vertical-align: middle;
        }
        ^ .sidenav-list-icon img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          vertical-align: middle;
        }
        ^ .sidenav-list-item.back {
          height: 56px;
          background-color: #26A96C;
        }
        ^ .sidenav-list-item.back a {
          color: #FFFFFF;
          line-height: 56px;
          text-decoration: none;
        }
        ^ .sidenav-list-icon.back img {
          width: 20px;
          height: 20px;
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
        }
        ^ .mdc-list-item__start-detail {
          height: 90px;
          margin-left: 20px;
          margin-top: 50px;
        }
        ^ .mdc-list-item__start-detail img {

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
        ^ .net-nanopay-ui-ToggleSwitch {
          padding-left: 60px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showHeader',
      value: true
    },
    {
      class: 'Boolean',
      name: 'tipEnabled',
      value: false
    },
    {
      class: 'String',
      name: 'toolbarIcon',
      value: 'menu'
    },
    {
      class: 'String',
      name: 'toolbarTitle',
      value: 'Home'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function () { return this.User.create(); }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.retail.model.Device',
      name: 'device',
      factory: function () { return this.Device.create(); }
    },
    {
      class: 'String',
      name: 'serialNumber',
      factory: function () {
        if ( ! localStorage.serialNumber ) {
          // remove hyphens, use 16 characters, convert to upper case
          localStorage.serialNumber = foam.uuid.randomGUID()
            .replace(/-/g, '')
            .substring(0, 16)
            .toUpperCase()
            .trim();
        }
        return localStorage.serialNumber;
      }
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

      if ( localStorage.serialNumber ) {
        this.deviceDAO.find(localStorage.serialNumber).then(function (result) {
          if ( ! result || result.status !== self.DeviceStatus.ACTIVE ) {
            self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupView' });
          } else {
            self.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
          }
        })
        .catch(function (err) {
          self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupView' });
        })
      } else {
        this.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupView' });
      }
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        // sidebar
        .start('div').addClass('sidenav')
          .start('div').addClass('sidenav-list-item back')
            .start('a').attrs({ href: '#' })
              .start('i').addClass('sidenav-list-icon back')
                .attrs({ 'aria-hidden': true })
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-arrow-left.png' })
              .end()
              .add('Back')
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
          .start('div').addClass('sidenav-list-item selected')
            .start('a').attrs({ href: '#' })
              .start('i').addClass('sidenav-list-icon')
                .attrs({ 'aria-hidden': true })
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-home.png' })
              .end()
              .add('Home')
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
          .start('div').addClass('sidenav-list-item')
            .start('a').attrs({ href: '#' })
              .start('i').addClass('sidenav-list-icon')
                .attrs({ 'aria-hidden': true })
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-transactions.png' })
              .end()
              .add('Transactions')
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
          .start('div').addClass('sidenav-list-item')
            .start('a').attrs({ href: '#' })
              .start('i').addClass('sidenav-list-icon')
                .attrs({ 'aria-hidden': true })
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-tip.png' })
              .end()
              .add('Tip')
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
        .end()

        // toolbar
        .start('div').addClass('toolbar')
          .start('button').addClass('toolbar-icon material-icons')
            .add(this.toolbarIcon$)
            .on('click', this.onMenuClicked)
          .end()
          .start('div').addClass('toolbar-title').add(this.toolbarTitle$).end()
        .end()

//        .start('div').addClass('mdc-toolbar mdc-toolbar--fixed').show(this.showHeader$)
//          .start('div').addClass('mdc-toolbar__row')
//            .start('section').addClass('mdc-toolbar__section mdc-toolbar__section--align-start')

//              .start('span').addClass('mdc-toolbar__title catalog-title').add(this.toolbarTitle$).end()
//            .end()
//          .end()
//        .end()
//
//        .start('aside').addClass('mdc-temporary-drawer')
//          .start('nav').addClass('mdc-temporary-drawer__drawer')
//            .start('nav').addClass('mdc-temporary-drawer__content mdc-list-group')
//              .start('div').addClass('mdc-list')
//                .start('a').addClass('mdc-list-item back')
//                  .attrs({ href: '#' })
//                  .start('i').addClass('mdc-list-item__start-detail back')
//                    .attrs({ 'aria-hidden': true })
//                    .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-arrow-left.png' })
//                  .end()
//                  .add('Back')
//                  .on('click', this.onMenuItemClicked)
//                .end()
//
//                .start('a').addClass('mdc-list-item selected')
//                  .attrs({ href: '#' })
//                  .start('i').addClass('mdc-list-item__start-detail')
//                    .attrs({ 'aria-hidden': true })
//                  .end()
//                  .add('Home')
//                  .on('click', this.onMenuItemClicked)
//                .end()
//                .start('a').addClass('mdc-list-item')
//                  .attrs({ href: '#' })
//                  .start('i').addClass('mdc-list-item__start-detail')
//                    .attrs({ 'aria-hidden': true })
//
//                  .end()
//                  .add('Transactions')
//                  .on('click', this.onMenuItemClicked)
//                .end()
//
//                .start('a').addClass('mdc-list-item')

//                  .add('Tip')
//                  .on('click', this.onMenuItemClicked)
//                  .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.tipEnabled$ })
//                .end()
//
//              .end()
//            .end()
//          .end()
//        .end()

      this
        .start('div')
          .addClass('stack-wrapper')
          .tag({ class: 'foam.u2.stack.StackView', data: this.stack, showActions: false })
        .end()
    }
  ],

  listeners: [
    function onMenuClicked (e) {
      if ( this.toolbarTitle === 'Back' ) {
        this.toolbarTitle = 'Home';
        this.toolbarIcon = 'menu';
        this.stack.back();
      } else {
        var sidenav = document.querySelector('.sidenav');
        sidenav.classList.add('open');
      }
    },

    function onMenuItemClicked (e) {
      e = ( ! e.target.textContent ) ? e.path[3] : e.target;
      var clicked = e.textContent.trim();
      // if clicked is null, don't do anything
      if ( ! clicked ) {
        return;
      }

      var sidenav = document.querySelector('.sidenav');
      // if we are on the same screen or have clicked the back button, close drawer
      if ( this.toolbarTitle === clicked || clicked === 'Back' ) {
        sidenav.classList.remove('open');
        return;
      }

      // if clicking the tip button, enable tip and don't close
      if ( clicked === 'Tip' ) {
        this.tipEnabled = ! this.tipEnabled;
        return;
      }

      // remove selected class from current and add to new
      var selected = document.getElementsByClassName('sidenav-list-item selected')[0];
      if ( selected ) {
        selected.classList.remove('selected');
        e.classList.add('selected')
      }

      this.toolbarTitle = clicked;
      this.stack.back();
      switch ( clicked ) {
        case 'Home':
          this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
          break;
        case 'Transactions':
          this.stack.push({ class: 'net.nanopay.merchant.ui.transaction.TransactionListView' });
          break;
      }
      sidenav.classList.remove('open');
    }
  ]
});
