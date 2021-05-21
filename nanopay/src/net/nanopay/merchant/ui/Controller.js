/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  documentation: 'Top-level Merchant application controller.',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.CurrencyFormatter',
    'net.nanopay.util.AddCommaFormatter'
  ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.merchant.ui.AppStyles',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
  ],

  exports: [
    'showAbout',
    'showHeader',
    'tipEnabled',
    'toolbarIcon',
    'toolbarTitle',
    'serialNumber',
    'password',
    'copyright',
    'device',
    'currentAccount'
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
      factory: function () {
        if ( ! localStorage.tipEnabled ) {
          return false;
        }
        return localStorage.tipEnabled == 'true';
      },
      postSet: function(oldValue, newValue) {
        localStorage.tipEnabled = newValue;
      }
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
    },
    {
      class: 'String',
      name: 'password',
      value: '',
      factory: function () {
        return ( localStorage.password ) ?
          localStorage.password : '';
      },
      postSet: function(oldValue, newValue) {
        localStorage.password = newValue;
      }
    },
    'currentAccount'
  ],

  methods: [
    function init() {
      var self = this;

      self.SUPER();
      self.clientPromise.then(function() {
        self.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
      });
    },

    function initE() {
      var self = this;
      self.clientPromise.then(function() {
        self.AppStyles.create();

        self
          .addClass(self.myClass())
          // sidebar
          .start('div').addClass('sidenav')
            .start('div').addClass('sidenav-list-item').addClass('back')
              .start('a').attrs({ href: '#' })
                .start('i').addClass('sidenav-list-icon').addClass('back').addClass('material-icons')
                  .attrs({ 'aria-hidden': true })
                  .add('arrow_back')
                .end()
                .add('Back')
              .end()
              .on('click', self.onMenuItemClicked)
            .end()
            .start('div').addClass('sidenav-list-item').addClass('selected')
              .start('a').attrs({ href: '#' })
                .start('i').addClass('sidenav-list-icon')
                  .attrs({ 'aria-hidden': true })
                  .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-home.svg' })
                .end()
                .add('Home')
              .end()
              .on('click', self.onMenuItemClicked)
            .end()
            .start('div').addClass('sidenav-list-item')
              .start('a').attrs({ href: '#' })
                .start('i').addClass('sidenav-list-icon')
                  .attrs({ 'aria-hidden': true })
                  .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-transactions.svg' })
                .end()
                .add('Transactions')
              .end()
              .on('click', self.onMenuItemClicked)
            .end()
            .start('div').addClass('sidenav-list-item')
              .start('a').attrs({ href: '#' })
                .start('i').addClass('sidenav-list-icon')
                  .attrs({ 'aria-hidden': true })
                  .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-tip.svg' })
                .end()
                .add('Tip')
                .start({ class: 'net.nanopay.ui.ToggleSwitch', data$: self.tipEnabled$ }).end()
              .end()
              .on('click', self.onMenuItemClicked)
            .end()
          .end()

          // main content
          .start('div')
            .addClass('stack-wrapper')
            .tag({ class: 'foam.u2.stack.StackView', data: self.stack, showActions: false })
          .end()

          // toolbar
          .start('div').addClass('toolbar').show(self.showHeader$)
            .start('button').addClass('toolbar-icon').addClass('material-icons')
              .add(self.toolbarIcon$)
              .on('click', self.onMenuClicked)
            .end()
            .start('div').addClass('toolbar-title').add(self.toolbarTitle$).end()
            .start('button').addClass('toolbar-icon').addClass('about').addClass('material-icons').show(self.showAbout$)
              .add('info_outline')
              .on('click', self.onAboutClicked)
            .end()
          .end()
      });
    },

    function setDefaultMenu() {
      // NOP: not used for Merchant app
    },

    function getCurrentUser() {
      var self = this;

      Promise.resolve().then(function () {
        if ( ! self.serialNumber ) {
          throw new Error('Invalid serial number');
        }

        if ( ! self.password ) {
          throw new Error('Invalid password');
        }

        return self.client.deviceAuth.login(null, 'device-' + self.serialNumber, self.password);
      })
      .then(function (result) {
        if ( ! result ) {
          throw new Error('Device login failed');
        }

        self.user.copyFrom(result);
        return self.client.deviceDAO.where(
          self.EQ(self.Device.SERIAL_NUMBER, self.serialNumber)
        ).limit(1).select();
      })
      .then(function (result) {
        if ( ! result || ! result.array || result.array.length !== 1 ) {
          throw new Error('Device login failed');
        }

        if ( result.array[0].status !== self.DeviceStatus.ACTIVE ) {
          throw new Error('Device login failed');
        }

        self.device.copyFrom(result.array[0]);

        return self.client.accountDAO
        .where(
          self.AND(
            // self.INSTANCE_OF('net.nanopay.account.DigitalAccount'),
            self.EQ(self.Account.DENOMINATION, 'CAD'),
            self.EQ(self.Account.IS_DEFAULT, true),
            self.EQ(self.Account.OWNER, self.user.id)
          )
        )
        .select();
      })
      .then(function (result) {
        if ( ! result || ! result.array ) {
          throw new Error('Device login failed');
        }
        result.array.forEach(function(acc){
          if ( acc.type == 'DigitalAccount' ) {
            self.currentAccount = acc.id;
          }
        });

        self.loginSuccess = true;
      })
      .catch(function (err) {
        self.loginSuccess = false;
        self.requestLogin().then(function () {
          self.getCurrentUser();
        });
      });
    },

    function requestLogin() {
      var self = this;
      this.password = '';

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
