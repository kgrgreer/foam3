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
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.merchant.ui.AppStyles'
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
    'serialNumber',
    'webApp',
    'wrapCSS as installCSS'    
  ],

  imports: [
    'installCSS'    
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
    },
    'primaryColor',
    'webApp'
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      if ( ! localStorage.serialNumber ) {
        this.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupView' });
        return;
      }

      this.deviceDAO.find(localStorage.serialNumber).then(function (result) {
        if ( ! result || result.status !== self.DeviceStatus.ACTIVE ) {
          throw new Error('Device not active');
        }

        self.device.copyFrom(result);
        return self.userDAO.find(result.owner);
      })
      .then(function (result) {
        if ( ! result ) {
          throw new Error('Owner not found');
        }

        self.user.copyFrom(result);
        self.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
      })
      .catch(function (err) {
        console.log('err = ', err);
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupView' });
      });
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
    function wrapCSS(text, id) {
      if ( text ) {
        if ( ! this.accentColor ) {
          var self = this;
          this.accentColor$.sub(function(s) {
            self.wrapCSS(text, id);
            s.detach();
          });
        }

        this.installCSS(text.
          replace(/%PRIMARYCOLOR%/g, this.primaryColor).
          replace(/%SECONDARYCOLOR%/g, this.secondaryColor).
          replace(/%TABLECOLOR%/g, this.tableColor).          
          replace(/%ACCENTCOLOR%/g, this.accentColor),
          id);
      }
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
