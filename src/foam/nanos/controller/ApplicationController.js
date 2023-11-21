/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
  Accessible through browser at location path static/foam3/src/foam/nanos/controller/index.html
  Available on browser console as ctrl. (exports axiom)
*/
foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationController',
  extends: 'foam.u2.Element',
  mixins: ['foam.u2.memento.Memorable'],

  documentation: 'FOAM Application Controller.',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.controller.AppStyles',
    'foam.nanos.controller.Fonts',
    'foam.nanos.controller.WindowHash',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.menu.VerticalMenu',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.ToastState',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.u2.navigation.NavigationController',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.nanos.u2.navigation.FooterView',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.u2.LoadingSpinner',
    'foam.u2.crunch.CapabilityInterceptView',
    'foam.u2.crunch.CrunchController',
    'foam.u2.crunch.WizardRunner',
    'foam.u2.wizard.WizardType',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackBlock',
    'foam.u2.stack.DesktopStackView',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.session.SessionTimer',
    'foam.u2.dialog.Popup',
    'foam.core.Latch'
  ],

  imports: [
    'capabilityDAO',
    'installCSS',
    'notificationDAO',
    'sessionSuccess',
    'window'
  ],

  exports: [
    'agent',
    'appConfig',
    'as ctrl',
    'buildingStack',
    'crunchController',
    'currentMenu',
    'displayWidth',
    'group',
    'initLayout',
    'isMenuOpen',
    'lastMenuLaunched',
    'lastMenuLaunchedListener',
    'layoutInitialized',
    'loginSuccess',
    'loginVariables',
    'loginView',
    'menuListener',
    'notify',
    'prefersMenuOpen',
    'pushMenu',
    'requestLogin',
    'returnExpandedCSS',
    'routeTo',
    'sessionID',
    'sessionTimer',
    'showFooter',
    'showNav',
    'signUpEnabled',
    'stack',
    'subject',
    'theme',
    'user',
    'wrapCSS as installCSS'
  ],

  topics: [
    'themeChange',
    // Published by reloadClient(), can be subbed to by client side services
    // that need to refresh or cleanup on client reload
    'clientReloading'
  ],

  constants: [
    {
      name: 'MACROS',
      value: [
        'customCSS',
        'logoBackgroundColour',
        'font1',
        'DisplayWidth.XS',
        'DisplayWidth.SM',
        'DisplayWidth.MD',
        'DisplayWidth.LG',
        'DisplayWidth.XL',
        'primary1',
        'primary2',
        'primary3',
        'primary4',
        'primary5',
        'approval1',
        'approval2',
        'approval3',
        'approval4',
        'approval5',
        'secondary1',
        'secondary2',
        'secondary3',
        'secondary4',
        'secondary5',
        'warning1',
        'warning2',
        'warning3',
        'warning4',
        'warning5',
        'destructive1',
        'destructive2',
        'destructive3',
        'destructive4',
        'destructive5',
        'grey1',
        'grey2',
        'grey3',
        'grey4',
        'grey5',
        'black',
        'white',
        'inputHeight',
        'inputVerticalPadding',
        'inputHorizontalPadding'
      ]
    },
    {
      name: 'THEME_OVERRIDE_REGEXP',
      factory: function() { return new RegExp(/\/\*\$(.*)\*\/[^;!]*/, 'g'); }
    }
  ],

  messages: [
    { name: 'GROUP_FETCH_ERR',         message: 'Error fetching group' },
    { name: 'GROUP_NULL_ERR',          message: 'Group was null' },
    { name: 'LOOK_AND_FEEL_NOT_FOUND', message: 'Could not fetch look and feel object' },
    { name: 'LANGUAGE_FETCH_ERR',      message: 'Error fetching language' },
    { name: 'GC_ERROR',                message: 'Please complete general requirements to login' },
    { name: 'GC_ERROR_TITLE',          message: 'Missing Login Requirement'}
  ],

  css: `
    .truncate-ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'sessionName',
      value: 'defaultSession'
    },
    {
      name: 'sessionID',
      factory: function() {
        var urlSession = '';
        try {
          urlSession = window.location.search.substring(1).split('&')
           .find(element => element.startsWith("sessionId")).split('=')[1];
        } catch { };
        return urlSession !== "" ? urlSession : localStorage[this.sessionName] ||
          ( localStorage[this.sessionName] = foam.uuid.randomGUID() );
      }
    },
    {
      name: 'loginVariables',
      expression: function(client$userDAO) {
        return {
          dao_: client$userDAO || null,
          imgPath: ''
        };
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'loginView'
    },
    {
      class: 'Enum',
      of: 'foam.u2.layout.DisplayWidth',
      name: 'displayWidth',
      value: foam.u2.layout.DisplayWidth.XL
    },
    {
      name: 'clientPromise',
      factory: function() {
        /* ignoreWarning */
        var self = this;
        return self.ClientBuilder.create({}, this).promise.then(function(cls) {
          self.client = cls.create(null, self);
          return self.client;
        });
      }
    },
    {
      name: 'languageInstalled',
      documentation: 'Latch to denote language has been installed',
      factory: function() { return this.Latch.create(); }
    },
    {
      name: 'client',
    },
    {
      name: 'appConfig',
      expression: function(client$appConfig) {
        return client$appConfig || null;
      }
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'agent',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      factory: function() { return this.Subject.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Group',
      name: 'group',
      menuKeys: ['admin.groups']
    },
    {
      class: 'Boolean',
      name: 'signUpEnabled',
      adapt: function(_, v) {
        return foam.String.isInstance(v) ? v !== 'false' : v;
      }
    },
    {
      class: 'Boolean',
      name: 'loginSuccess'
    },
    {
      class: 'Boolean',
      name: 'showFooter',
      value: true
    },
    {
      class: 'Boolean',
      name: 'showNav',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isMenuOpen',
    },
    {
      class: 'Boolean',
      name: 'prefersMenuOpen',
      documentation: 'Stores the menu preference of the user',
      factory: function() {
        return localStorage['prefersMenuOpen'] ? localStorage['prefersMenuOpen'] == 'true' : ( localStorage['prefersMenuOpen'] = true);
      },
      postSet: function(_, n) {
        localStorage['prefersMenuOpen'] = n;
      }
    },
    {
      class: 'Boolean',
      name: 'capabilityAcquired',
      documentation: `
        The purpose of this is to handle the intercept flow for a capability that was granted,
        via the InterceptView from this.requestCapability(exceptionCapabilityType).
      `
    },
    {
      class: 'Boolean',
      name: 'capabilityCancelled'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.session.SessionTimer',
      name: 'sessionTimer',
      factory: function() {
        return this.SessionTimer.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.CrunchController',
      name: 'crunchController',
      factory: function() {
        return this.CrunchController.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Theme',
      name: 'theme',
      postSet: function(o, n) {
        if ( o && n && o.equals(n)) return;
        this.__subContext__.cssTokenOverrideService.maybeReload();
        this.pub('themeChange');
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'topNavigation_',
      factory: function() {
        return this.TopNavigation;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'footerView_',
      factory: function() {
        return this.FooterView;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'sideNav_'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Language',
      name: 'defaultLanguage',
      factory: function() {
        return foam.nanos.auth.Language.create({code: 'en'})
      }
    },
    {
      name: 'route',
      memorable: true,
      postSet: function(_, n) {
        // only pushmenu on route change after the fetchsubject process has been initiated
        // as the init process will also check the route and pushmenu if required
        if ( this.initSubject && n ) {
          if ( ! this.currentMenu?.id ) this.buildingStack = true;
          this.pushMenu(n);
        }
      }
    },
    {
      class: 'Boolean',
      name: 'buildingStack',
      documentation: 'when set to true, memento tails are not cleared when pushing menus'
    },
    'currentMenu',
    'lastMenuLaunched',
    {
      name: 'languageDefaults_',
      factory: function() { return []; }
    },
    {
      name: 'styles',
      factory: function() { return {}; }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.Latch',
      name: 'initLayout',
      documentation: 'A latch used to wait on layout initialization.',
      factory: function() {
        return this.Latch.create();
      }
    },
    {
      class: 'Boolean',
      name: 'layoutInitialized',
      documentation: 'True if layout has been initialized.',
    },
    {
      class: 'Boolean',
      name: 'initSubject'
    },
    //TODO: temporary fix, remove when client signin service is fixed/added
    {
      name: 'groupLoadingHandled',
      class: 'Boolean'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // done to start using SectionedDetailViews instead of DetailViews
      this.__subContext__.register(foam.u2.detail.SectionedDetailView, 'foam.u2.DetailView');

      var self = this;

      this.clientPromise.then(async function(client) {
        self.originalSubContext = self.__subContext__;
        self.setPrivate_('__subContext__', { name: 'ApplicationControllerProxy', __proto__: client.__subContext__});

        // For testing purposes only. Do not use in code.
        globalThis.x     = self.__subContext__;
        globalThis.MLang = foam.mlang.Expressions.create();

        await self.fetchTheme();
        foam.locale = localStorage.getItem('localeLanguage') || self.theme.defaultLocaleLanguage || foam.locale;

        await client.translationService.initLatch;
        self.installLanguage();

        self.onDetach(self.__subContext__.cssTokenOverrideService?.cacheUpdated.sub(self.reloadStyles));

        let ret = await self.initMenu();
        if ( ret ) return;

        await self.fetchSubject();

        if ( self.client != client ) {
          console.log('Stale Client in ApplicationController, waiting for update.');
          await self.client.promise;
        }

        await self.fetchGroup();

        // For anonymous users, we shouldn't reinstall the language
        // because the user's language setting isn't meaningful.
        if ( self?.subject?.realUser && ! ( await client.auth.isAnonymous() ) ) {
          await self.maybeReinstallLanguage(self.client);
        }

        self.languageInstalled.resolve();
        // add user and agent for backward compatibility
        Object.defineProperty(self, 'user', {
          get: function() {
            console.info("Deprecated use of user. Use Subject to retrieve user");
            return this.subject.user;
          },
          set: function(newValue) {
            console.warn("Deprecated use of user setter");
            this.subject.user = newValue;
          }
        });
        Object.defineProperty(self, 'agent', {
          get: function() {
            console.warn("Deprecated use of agent");
            return this.subject.realUser;
          }
        });

        // Fetch the group only once the user has logged in. That's why we await
        // the line above before executing this one.
        await self.fetchTheme();
        if ( ! self.groupLoadingHandled ) await self.onUserAgentAndGroupLoaded();
      });

      // Reload styling on theme change
      this.onDetach(this.sub('themeChange', this.reloadStyles));
    },

    async function initMenu() {
      var menu;

      // TODO Interim solution to pushing unauthenticated menu while applicationcontroller refactor is still WIP
      if ( this.route ) {
        menu = await this.__subContext__.menuDAO.find(this.route);
      }
      // Check route again so that default theme menu doesnt override an auth menu the user is trying to go to
      if ( ! this.route && ! menu && this.theme.unauthenticatedDefaultMenu ) {
        menu = await this.__subContext__.menuDAO.find(this.theme.unauthenticatedDefaultMenu)
      }

      // explicitly check that the menu is unauthenticated
      // since if there is a user session on refresh, this would also
      // find authenticated menus to try to push before fetching subject
      if ( menu && menu.authenticate === false ) {
        await this.fetchSubject(false);
        if ( ! this.subject?.user || ( await this.__subContext__.auth.isAnonymous() ) ) {
          // only push the unauthenticated menu if there is no subject
          // if client is authenticated, go on to fetch theme and set loginsuccess before pushing menu
          // use the route instead of the menu so that the menu could be re-created under the updated context
          this.pushMenu(menu.id);
          this.languageInstalled.resolve();
          this.subToNotifications();
          return 1;
        }
      }
   },

    function render() {
      var self = this;
      this.initLayout.then(() => {
        this.layoutInitialized = true;
      });
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();


      self.AppStyles.create();
      self.Fonts.create();

      self.addMacroLayout();
    },

    async function reloadClient() {
      this.clientReloading.pub();
      var newClient = await this.ClientBuilder.create({}, this.originalSubContext).promise;
      this.client = newClient.create(null, this.originalSubContext);
      this.__subContext__.__proto__ = this.client.__subContext__;
      // TODO: find a better way to resub on client reloads
      this.onDetach(this.__subContext__.cssTokenOverrideService?.cacheUpdated.sub(this.reloadStyles));
      this.subject = await this.client.auth.getCurrentSubject(null);
    },

    function installLanguage() {
      for ( var i = 0 ; i < this.languageDefaults_.length ; i++ ) {
        var ld = this.languageDefaults_[i];
        ld[0][ld[1]] = ld[2];
      }
      this.languageDefaults_ = undefined;

      var map = this.__subContext__.translationService.localeEntries;
      for ( var key in map ) {
        try {
          var node = globalThis;
          var path = key.split('.');

          for ( var i = 0 ; node && i < path.length-1 ; i++ ) node = node[path[i]];
          if ( node ) {
            this.languageDefaults_.push([node, path[path.length-1], node[path[path.length-1]]]);
            node[path[path.length-1]] = map[key];
          }
        } catch (x) {
          console.error('Error installing locale message.', key, x);
        }
      }
    },

    async function maybeReinstallLanguage(client) {
      // Is only called if the user exists and isn't the SPID's anonymousUser
      if ( this.subject.realUser.language.toString() != foam.locale ) {
        let languages = (await client.languageDAO
          .where(foam.mlang.predicate.Eq.create({
            arg1: foam.nanos.auth.Language.ENABLED,
            arg2: true
          })).select()).array;

        let userPreferLanguage = languages.find(e => e.id.compareTo(this.subject.realUser.language) === 0);
        // TODO: don't update language setting for anonymous users
        // Can tell if a user is anonymous if their id === their spid's.anonymousUser
        if ( ! userPreferLanguage ) {
          foam.locale = this.defaultLanguage.toString()
          let user = this.subject.realUser;
          user.language = this.defaultLanguage.id;
          await client.userDAO.put(user);
        } else if ( foam.locale != userPreferLanguage.toString() ) {
          foam.locale = userPreferLanguage.toString();
        }
        client.translationService.maybeReload();
        await client.translationService.initLatch;
        this.installLanguage();
      }
    },

    async function fetchGroup() {
      try {
        var group = await this.client.auth.getCurrentGroup();
        if ( group == null ) throw new Error(this.GROUP_NULL_ERR);
        this.group = group;
      } catch (err) {
        this.notify(this.GROUP_FETCH_ERR, '', this.LogLevel.ERROR, true);
        console.error(err.message || this.GROUP_FETCH_ERR);
      }
    },

    async function fetchSubject(promptLogin = true) {
      /** Get current user, else show login. */
      try {
        this.initSubject = true;
        var result = await this.client.auth.getCurrentSubject(null);
        if ( result && result.user ) await this.reloadClient();

        promptLogin = promptLogin && await this.client.auth.check(this, 'auth.promptlogin');
        var authResult =  await this.client.auth.check(this, '*');
        if ( ! result || ! result.user ) throw new Error();
      } catch (err) {
        if ( ! promptLogin || authResult ) return;
        this.languageInstalled.resolve();
        await this.requestLogin();
        return await this.fetchSubject();
      }
    },

    function expandShortFormMacro(css, m) {
      /* A short-form macros is of the form %PRIMARY_COLOR%. */
      const M = m.toUpperCase();
      var prop = m.startsWith('DisplayWidth') ? m + '.minWidthString' : m
      var val = this.theme ? foam.util.path(this.theme, prop, false) : undefined;

      // NOTE: We add a negative lookahead for */, which is used to close a
      // comment in CSS. We do this because if we don't, then when a developer
      // chooses to include a long form CSS macro directly in their CSS such as
      //
      //                       /*%EXAMPLE%*/ #abc123
      //
      // then we don't want this method to expand the commented portion of that
      // CSS because it's already in long form. By checking if */ follows the
      // macro, we can tell if it's already in long form and skip it.
      return val ? css.replace(
        new RegExp('%' + M + '%(?!\\*/)', 'g'),
        '/*%' + M + '%*/ ' + val) : css;
    },

    function expandLongFormMacro(css, m) {
      // A long-form macros is of the form "/*%PRIMARY_COLOR%*/ blue".
      const M = m.toUpperCase();
      var prop = m.startsWith('DisplayWidth') ? m + '.minWidthString' : m
      var val = this.theme ? foam.util.path(this.theme, prop, false) : undefined;
      return val ? css.replace(
        new RegExp('/\\*%' + M + '%\\*/[^);!]*', 'g'),
        '/*%' + M + '%*/ ' + val) : css;
    },

    function wrapCSS(text, id) {
      /** CSS preprocessor, works on classes instantiated in subContext. */
      if ( ! text ) return;
      var eid = 'style' + foam.next$UID();
      this.styles[eid] = { text: text, cls: id };
      for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
        const m = this.MACROS[i];
        text = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);
      }
      this.installCSS(text, id, eid);
    },

    function returnExpandedCSS(text) {
      var text2 = text;
      for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
        let m = this.MACROS[i];
        text2 = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);
        text = text2;
      }
      return text;
    },

    async function pushMenu(menu, opt_forceReload) {
      /** Setup **/
      let idCheck = menu && menu.id ? menu.id : menu;
      let currentMenuCheck = this.currentMenu?.id;
      var realMenu = menu;
      /** Used to stop any duplicating recursive calls **/
      if ( currentMenuCheck === idCheck && ! opt_forceReload ) {
        this.buildingStack = false;
        return;
      }
      /**  Used for menus that are constructed on the fly (data management, support, legal)
       * required as those menus are not put in menuDAO and hence fail the
       * find call in pushMenu_.
       * This approach allows any generated menus to be permissioned/loaded as long as
       * they are a child of a real menuDAO menu
       * **/
      if ( idCheck.includes('/') )
        realMenu = idCheck.split('/')[0];
      /** Used to checking validity of menu push and launching default on fail **/
      var dao;
      if ( this.client ) {
        return this.pushMenu_(realMenu, menu, opt_forceReload);
      } else {
        return await this.clientPromise.then(async () => {
          await this.pushMenu_(realMenu, menu, opt_forceReload);
        });
      }
    },

    async function pushMenu_(realMenu, menu, opt_forceReload) {
      dao = this.client.menuDAO;
      let m = this.memento_.str;
      realMenu = await dao.find(realMenu);
      if ( ! realMenu ) {
        if ( ! this.loginSuccess ) {
          await this.fetchSubject();
          this.memento_.str = m;
          return;
        }
        menu = await this.findFirstMenuIHavePermissionFor(dao);
        let newId = (menu && menu.id) || '';
        this.pushMenu(newId, opt_forceReload);
        return;
      }
      const preserveMem = this.buildingStack || (
        typeof menu === 'string' ?
        foam.nanos.menu.LinkMenu.isInstance(realMenu?.handler) :
        foam.nanos.menu.LinkMenu.isInstance(menu?.handler)
      );
      if ( ! preserveMem )
        this.memento_.removeMementoTail();
      if ( typeof menu == 'string' && ! menu.includes('/') )
        menu = realMenu;
      this.buildingStack = false;
      return menu && menu.launch && menu.launch(this.__subContext__);
    },

    async function findDefaultMenu(dao) {
      var menu;
      var menuArray = this.theme?.defaultMenu.concat(this.theme?.unauthenticatedDefaultMenu)
      if ( ! menuArray || ! menuArray.length ) return null;
      for ( menuId in menuArray ) {
        menu = await dao.find(menuArray[menuId]);
        if ( menu ) break;
      };
      return menu;
    },

    async function findFirstMenuIHavePermissionFor(dao) {
      // dao is expected to be the menuDAO
      // arg(dao) passed in cause context handled in calling function
      var maybeMenu = await this.findDefaultMenu(dao);
      if ( maybeMenu ) return maybeMenu;
      return await dao.orderBy(foam.nanos.menu.Menu.ORDER).limit(1)
        .select().then(a => a.array.length && a.array[0])
        .catch(e => console.error(e.message || e));
    },

    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash && location.hash === '#reset' ) {
        return new Promise(function(resolve, reject) {
          self.stack.push(self.StackBlock.create({ view: {
            class: 'foam.nanos.auth.ChangePasswordView',
            modelOf: 'foam.nanos.auth.resetPassword.ResetPasswordByToken'
           }}));
          self.loginSuccess$.sub(resolve);
        });
      }

      return new Promise(function(resolve, reject) {
        self.stack.push(self.StackBlock.create({ view: { ...(self.loginView ?? { class: 'foam.u2.view.LoginView' }), mode_: 'SignIn' }, parent: self }));
        self.loginSuccess$.sub(resolve);
      });
    },

    function notify(toastMessage, toastSubMessage, severity, transient, icon) {
      var notification = this.Notification.create();
      notification.userId = this.subject && this.subject.realUser ?
        this.subject.realUser.id : this.user.id;
      notification.toastMessage    = toastMessage;
      notification.toastSubMessage = toastSubMessage;
      notification.toastState      = this.ToastState.REQUESTED;
      notification.severity        = severity || this.LogLevel.INFO;
      notification.transient       = transient;
      notification.icon            = icon;
      this.__subContext__.myNotificationDAO?.put(notification);
    },

    function displayToastMessage(sub, on, put, obj) {
      if ( obj.toastState == this.ToastState.REQUESTED ) {
        this.add(this.NotificationMessage.create({
          message: obj.toastMessage,
          type: obj.severity,
          description: obj.toastSubMessage,
          icon: obj.icon
        }));
        // only update and save non-transient messages
        if ( ! obj.transient ) {
          var clonedNotification = obj.clone();
          clonedNotification.toastState = this.ToastState.DISPLAYED;
          this.__subSubContext__.notificationDAO.put(clonedNotification);
        }
      }
    }
  ],

  listeners: [
    async function onUserAgentAndGroupLoaded() {
      /**
       * Called whenever the group updates.
       *   - Updates the portal view based on the group
       *   - Update the look and feel of the app based on the group or user
       *   - Go to a menu based on either the hash or the group
       */
      this.subToNotifications();

      this.loginSuccess = true;
      let check = await this.checkGeneralCapability();
      if ( ! check ) return;

      await this.fetchTheme();
      this.initLayout.resolve();
      this.stack.resetStack();
      var hash = this.window.location.hash;
      if ( hash ) hash = hash.substring(1);
      if ( hash && hash != 'null' /* How does it even get set to null? */ && hash != this.currentMenu?.id ) {
        this.window.onpopstate();
      } else {
        this.pushMenu('');
      }

//      this.__subContext__.localSettingDAO.put(foam.nanos.session.LocalSetting.create({id: 'homeDenomination', value: localStorage.getItem("homeDenomination")}));
    },

    // TODO: simplify in NP-8928
    async function checkGeneralCapability() {
      var groupDAO = this.__subContext__.groupDAO;
      if ( ! this.subject.realUser || ! groupDAO ) return false;
      var group = await groupDAO.find(this.subject.realUser.group);

      if ( ! group || ! group.generalCapability ) return true;

      const ucjCheck = async () => await this.__subContext__.crunchService.getJunction(null, group.generalCapability);
      var ucj = await ucjCheck();
      if ( ucj != null && ucj.status == this.CapabilityJunctionStatus.GRANTED ) {
        return true;
      }

      const wizardRunner = this.WizardRunner.create({
        wizardType: this.WizardType.UCJ,
        source: group.wizardFlow || group.generalCapability,
        options: {inline: false, returnCompletionPromise: true}
      });
      // TODO: figure out why this cant be inlined
      let retPromise = await wizardRunner.launch();
      await retPromise;
      return await this.doGeneralCapabilityPostCheck(ucjCheck);
    },

    async function doGeneralCapabilityPostCheck (ucjCheck) {
      this.__subContext__.userCapabilityJunctionDAO.cmd_(this, foam.dao.DAO.PURGE_CMD);
      this.__subContext__.userCapabilityJunctionDAO.cmd_(this, foam.dao.DAO.RESET_CMD);
      let postCheck = await ucjCheck();
      if ( postCheck == null || postCheck.status != this.CapabilityJunctionStatus.GRANTED ) {
        this.add(foam.u2.dialog.ConfirmationModal.create({
          title: this.GC_ERROR_TITLE,
          modalStyle: 'DESTRUCTIVE',
          primaryAction: { name: 'close', code: () => this.pushMenu('sign-out') },
          closeable: false,
          showCancel: false
        }, this)
          .start()
          .style({ 'min-width': '25vw'})
          .add(this.GC_ERROR)
          .end());
        return false;
      } else {
        this.__subContext__.menuDAO.cmd_(this, foam.dao.DAO.PURGE_CMD);
        this.__subContext__.menuDAO.cmd_(this, foam.dao.DAO.RESET_CMD);
        return true;
      }
    },

    function addMacroLayout() {
      var theme = this.document.querySelector(`meta[name='theme-color']`);
      var color = theme ? theme.getAttribute('content') : 'red';
      this
        .addClass(this.myClass())
        .tag(this.NavigationController, {
          topNav$: this.topNavigation_$,
          mainView: {
            class: 'foam.u2.stack.DesktopStackView',
            data: this.stack,
            stackDefault: {
              class:     'foam.u2.LoadingSpinner',
              size:      32,
              text:      'Loading...',
              showText:  true,
              color:     color
            },
            showActions: false,
            nodeName:    'main'
          },
          footer$: this.footerView_$,
          sideNav$: this.sideNav_$
        });
    },

    function subToNotifications() {
      this.__subContext__.myNotificationDAO?.on.put.sub(this.displayToastMessage.bind(this));
    },

    function menuListener(m) {
      /**
       * This listener should be called when a Menu item has been launched
       * by some Menu View. Is exported.
       */
      this.currentMenu = m;
      this.route = m.id;
    },

    function lastMenuLaunchedListener(m) {
      /**
       * This listener should be called when a Menu has been launched but does
       * not navigate to a new screen. Typically for SubMenus.
       */
      this.lastMenuLaunched = m;
    },

    async function fetchTheme() {
      /**
       * Get the most appropriate Theme object from the server and use it to
       * customize the look and feel of the application.
       */
      var lastTheme = this.theme;
      try {
        this.theme = await this.Themes.create().findTheme(this);
        this.appConfig.copyFrom(this.theme.appConfig)
      } catch (err) {
        this.notify(this.LOOK_AND_FEEL_NOT_FOUND, '', this.LogLevel.ERROR, true);
        console.error(err);
        return;
      }

      if ( ! lastTheme || ! lastTheme.equals(this.theme) ) this.useCustomElements();
    },

    function useCustomElements() {
      /** Use custom elements if supplied by the Theme. */
      if ( ! this.theme )
        throw new Error(this.LOOK_AND_FEEL_NOT_FOUND);

      if ( this.theme.topNavigation )
        this.topNavigation_ = this.theme.topNavigation;

      if ( this.theme.footerView )
        this.footerView_ = this.theme.footerView;

      if ( this.theme.sideNav )
        this.sideNav_ = this.theme.sideNav;
      if ( this.theme.loginView )
        this.loginView = this.theme.loginView;
    },
    {
      name: 'updateDisplayWidth',
      isFramed: true,
      code: function() {
        this.displayWidth = foam.u2.layout.DisplayWidth.VALUES
          .concat()
          .sort((a, b) => b.minWidth - a.minWidth)
          .find(o => o.minWidth <= Math.min(window.innerWidth, window.screen.width) );
      }
    },
    function replaceStyleTag(text, eid) {
      if ( ! text ) return;
      text = this.returnExpandedCSS(text);
      this.styles[eid].text = text;
      const el = this.getElementById(eid);
      if ( text !== el?.textContent )
        el.textContent = text;
    },
    {
      name: 'reloadStyles',
      isMerged: true,
      mergeDelay: 500,
      code: function() {
        for ( const eid in this.styles ) {
          const style = this.styles[eid];
          text = foam.CSS.replaceTokens(style.text, style.cls, this.__subContext__, this.THEME_OVERRIDE_REGEXP);
          this.replaceStyleTag(text, eid);
        }
      }
    },
    function routeTo(link) {
      /**
       * Replaces the url to redirect to the new menu without cleared tails
       */
      this.buildingStack = true;
      this.memento_.str = link;
    }
  ]
});
