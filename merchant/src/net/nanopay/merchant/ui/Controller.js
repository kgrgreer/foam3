foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',
  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },

  documentation: 'Top-level Merchant application controller.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.merchant.ui.AppStyles',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  exports: [
    'showAbout',
    'showHeader',
    'tipEnabled',
    'toolbarIcon',
    'toolbarTitle',
    'serialNumber',
    'copyright',
    'device'
  ],

  properties: [
    'copyright',
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
      value: 'Home'
    },
    {
      class: 'foam.core.FObjectProperty',
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
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
    },

    function initE() {
      var self = this;
      this.AppStyles.create();

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
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-home.svg' })
              .end()
              .add('Home')
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
          .start('div').addClass('sidenav-list-item')
            .start('a').attrs({ href: '#' })
              .start('i').addClass('sidenav-list-icon')
                .attrs({ 'aria-hidden': true })
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-transactions.svg' })
              .end()
              .add('Transactions')
            .end()
            .on('click', this.onMenuItemClicked)
          .end()
          .start('div').addClass('sidenav-list-item')
            .start('a').attrs({ href: '#' })
              .start('i').addClass('sidenav-list-icon')
                .attrs({ 'aria-hidden': true })
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-tip.svg' })
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
    },

    function setDefaultMenu() {
      // NOP: not used for Merchant app
    },

    function getCurrentUser() {
      var self = this;

      // get current user & device, else show login
      this.auth.getCurrentUser(null).then(function (result) {
        if ( ! result ) {
          throw new Error('User not found');
        }

        self.user.copyFrom(result);
        return self.deviceDAO.where(self.EQ(self.Device.SERIAL_NUMBER, self.serialNumber)).limit(1).select();
      })
      .then(function (result) {
        if ( ! result || ! result.array || result.array.length !== 1 ) {
          throw new Error('Device not found');
        }

        if ( result.array[0].status !== self.DeviceStatus.ACTIVE ) {
          throw new Error('Device not active');
        }

        self.loginSuccess = true;
        self.device.copyFrom(result.array[0]);
      })
      .catch(function (err) {
        self.loginSuccess = false;
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    function requestLogin() {
      var self = this;

      return new Promise(function (resolve, reject) {
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupView'});
        self.loginSuccess$.sub(resolve);
      });
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
