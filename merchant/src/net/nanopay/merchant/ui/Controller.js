foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',
  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },

  documentation: 'Top-level Merchant application controller.',

  implements: [
    'foam.nanos.client.Client'
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
    'showAbout',
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
          background-color: #2C4389;
        }
        ^ .stack-wrapper {
          padding-top: 56px;
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
          width: 100%;
          height: 56px;
          background-color: #4054B5;
          -webkit-box-shadow: none;
          box-shadow: none;
          position: fixed;
          top: 0;
        }
        ^ .toolbar-icon {
          height: 56px;
          padding-left: 20px;
          padding-right: 20px;
          float: left;
        }
        ^ .toolbar-icon.about {
          height: 56px;
          padding-left: 20px;
          padding-right: 20px;
          float: right;
        }
        ^ .toolbar-title {
          font-size: 16px;
          line-height: 56px;
          position: absolute;
          margin-left: 64px;
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
        ^ .sidenav-list-item.about {
          height: 56px;
          width: 250px;
          position: fixed;
          bottom: 0px;
        }
        ^ .sidenav-list-item.about a {
          line-height: 56px;
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
          padding-left: 20px;
          padding-right: 10px;
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
        ^ .sidenav-list-icon.material-icons {
          height: 100%;
          padding-left: 25px;
          padding-right: 20px;
          float: left;
          line-height: 56px;
        }
        ^ .net-nanopay-ui-ToggleSwitch {
          float: right;
          padding-top: 33px;
          padding-bottom: 33px;
          padding-right: 43px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showAbout',
      value: true
    },
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
      value: 'MintChip Home'
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
          localStorage.serialNumber = 'D224E98C71EF42CA';
//          // remove hyphens, use 16 characters, convert to upper case
//          localStorage.serialNumber = foam.uuid.randomGUID()
//            .replace(/-/g, '')
//            .substring(0, 16)
//            .toUpperCase()
//            .trim();
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
              .start('i').addClass('sidenav-list-icon back material-icons')
                .attrs({ 'aria-hidden': true })
                .add('arrow_back')
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
              .add('MintChip Home')
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
              .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.tipEnabled$ })
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
        .end()

        // main content
        .start('div')
          .addClass('stack-wrapper')
          .tag({ class: 'foam.u2.stack.StackView', data: this.stack, showActions: false })
        .end()

        // toolbar
        .start('div').addClass('toolbar').show(this.showHeader$)
          .start('button').addClass('toolbar-icon material-icons')
            .add(this.toolbarIcon$)
            .on('click', this.onMenuClicked)
          .end()
          .start('div').addClass('toolbar-title').add(this.toolbarTitle$).end()
          .start('button').addClass('toolbar-icon about material-icons').show(this.showAbout$)
            .add('info_outline')
            .on('click', this.onAboutClicked)
          .end()
        .end()
    }
  ],

  listeners: [
    function onAboutClicked (e) {
      this.stack.push({ class: 'net.nanopay.merchant.ui.AboutView' });
    },

    function onMenuClicked (e) {
      if ( this.toolbarTitle === 'Back' ) {
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

      // fix issue with clicking back button
      if ( clicked === 'arrow_back' || clicked === 'arrow_backBack' ) {
        clicked = 'Back';
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
        case 'MintChip Home':
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
