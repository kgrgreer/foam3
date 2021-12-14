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

  documentation: 'FOAM Application Controller.',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.controller.AppStyles',
    'foam.nanos.controller.Memento',
    'foam.nanos.controller.WindowHash',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.ToastState',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.nanos.u2.navigation.FooterView',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.u2.crunch.CapabilityInterceptView',
    'foam.u2.crunch.CrunchController',
    'foam.u2.borders.MarginBorder',
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
    'crunchController',
    'currentMenu',
    'displayWidth',
    'group',
    'lastMenuLaunched',
    'lastMenuLaunchedListener',
    'loginSuccess',
    'loginVariables',
    'memento',
    'menuListener',
    'notify',
    'pushMenu',
    'requestLogin',
    'returnExpandedCSS',
    'sessionID',
    'sessionTimer',
    'signUpEnabled',
    'stack',
    'subject',
    'theme',
    'user',
    'webApp',
    'wrapCSS as installCSS'
  ],

  topics: [
    'themeChange'
  ],

  constants: {
    MACROS: [
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

  messages: [
    { name: 'GROUP_FETCH_ERR',         message: 'Error fetching group' },
    { name: 'GROUP_NULL_ERR',          message: 'Group was null' },
    { name: 'LOOK_AND_FEEL_NOT_FOUND', message: 'Could not fetch look and feel object' },
    { name: 'LANGUAGE_FETCH_ERR',      message: 'Error fetching language' },
  ],

  css: `
    .stack-wrapper {
      min-height: calc(80% - 60px);
    }
    .stack-wrapper:after {
      content: "";
      display: block;
    }

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
      name: 'memento',
      factory: function() {
        return this.Memento.create({ replaceHistoryState: false });
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
      postSet: function() {
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
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Language',
      name: 'defaultLanguage',
      factory: function() {
        return foam.nanos.auth.Language.create({code: 'en'})
      }
    },
    'currentMenu',
    'lastMenuLaunched',
    'webApp',
    {
      name: 'languageDefaults_',
      factory: function() { return []; }
    },
    {
      name: 'styles',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // done to start using SectionedDetailViews instead of DetailViews
      this.__subContext__.register(foam.u2.detail.SectionedDetailView, 'foam.u2.DetailView');

      var self = this;

      // Start Memento Support
      var windowHash = this.WindowHash.create();
      this.memento.value = windowHash.value;

      this.onDetach(windowHash.value$.sub(function() {
        if ( windowHash.feedback_ )
          return;
        self.memento.value = windowHash.value;
      }));

      this.onDetach(this.memento.changeIndicator$.sub(function () {
        self.memento.value = self.memento.combine();
        windowHash.valueChanged(self.memento.value, self.memento.replaceHistoryState);

        if ( ! self.memento.feedback_ )
          self.mementoChange();
      }));

      this.onDetach(this.memento.value$.sub(function () {
        self.memento.parseValue();

        if ( ! self.memento.feedback_ ) {
          self.mementoChange();
          windowHash.valueChanged(self.memento.value, self.memento.replaceHistoryState);
        }
      }));
      // End Memento Support

      this.clientPromise.then(async function(client) {
        self.setPrivate_('__subContext__', client.__subContext__);

        await self.fetchTheme();
        foam.locale = localStorage.getItem('localeLanguage') || self.theme.defaultLocaleLanguage || 'en';

        await client.translationService.initLatch;
        self.installLanguage();

        await self.fetchGroup();

        // TODO Interim solution to pushing unauthenticated menu while applicationcontroller refactor is still WIP
        if ( self.memento.head ) {
          var menu = await self.__subContext__.menuDAO.find(self.memento.head);
          // explicitly check that the menu is unauthenticated
          // since if there is a user session on refresh, this would also
          // find authenticated menus to try to push before fetching subject
          if ( menu && menu.authenticate === false ) {
            await self.fetchSubject(false);
            if ( ! self.subject?.user || ( await self.__subContext__.auth.isAnonymous() ) ) {
              // only push the unauthenticated menu if there is no subject
              // if client is authenticated, go on to fetch theme and set loginsuccess before pushing menu
              self.pushMenu(menu);
              self.languageInstalled.resolve();
              return;
            }
          }
        }

        await self.fetchSubject();

        await self.maybeReinstallLanguage(client);
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
        await self.onUserAgentAndGroupLoaded();
        self.mementoChange();
      });

      // Reload styling on theme change
      this.onDetach(this.sub('themeChange', () => {
        for ( const eid in this.styles ) {
          const text = this.returnExpandedCSS(this.styles[eid]);
          const el = this.getElementById(eid);
          if ( text !== el.textContent ) {
            el.textContent = text;
          }
        }
      }));
    },

    function render() {
      var self = this;
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();



//      this.__subSubContext__.notificationDAO.where(
//        this.EQ(this.Notification.USER_ID, userNotificationQueryId)
//      ).on.put.sub((sub, on, put, obj) => {
//        if ( obj.toastState == this.ToastState.REQUESTED ) {
//          this.add(this.NotificationMessage.create({
//            message: obj.toastMessage,
//            type: obj.severity,
//            description: obj.toastSubMessage
//          }));
//          var clonedNotification = obj.clone();
//          clonedNotification.toastState = this.ToastState.DISPLAYED;
//          this.__subSubContext__.notificationDAO.put(clonedNotification);
//        }
//      });

      this.clientPromise.then(() => {
        this.fetchTheme().then(() => {
          // Work around to ensure wrapCSS is exported into context before
          // calling AppStyles which needs theme replacement
          self.AppStyles.create();
          this
            .addClass(this.myClass())
              .add(this.slot(function (topNavigation_) {
                return this.E().tag(topNavigation_);
              }))
            .start()
              .addClass('stack-wrapper')
              .tag({
                class: 'foam.u2.stack.DesktopStackView',
                data: this.stack,
                showActions: false
              })
            .end()
            .start()
              .add(this.slot(function (footerView_) {
                return this.E().tag(footerView_);
              }))
            .end();
          });
      });
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
      if (
        this.subject &&
        this.subject.realUser &&
        this.subject.realUser.language.toString() != foam.locale
      ) {
        let languages = (await client.languageDAO
          .where(foam.mlang.predicate.Eq.create({
            arg1: foam.nanos.auth.Language.ENABLED,
            arg2: true
          })).select()).array;

        let userPreferLanguage = languages.find( e => e.id.compareTo(this.subject.realUser.language) === 0 )
        if ( ! userPreferLanguage ) {
          foam.locale = this.defaultLanguage.toString()
          let user = this.subject.realUser
          user.language = this.defaultLanguage.id
          await client.userDAO.put(user)
        } else if ( foam.locale != userPreferLanguage.toString() ) {
          foam.locale = userPreferLanguage.toString()
        }
        client.translationService.maybeReload()
        await client.translationService.initLatch
        this.installLanguage()
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
        var result = await this.client.auth.getCurrentSubject(null);
        this.subject = result;

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
      var val = foam.util.path(this.theme, prop, false);

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
      var val = foam.util.path(this.theme, prop, false);
      return val ? css.replace(
        new RegExp('/\\*%' + M + '%\\*/[^);!]*', 'g'),
        '/*%' + M + '%*/ ' + val) : css;
    },

    function wrapCSS(text, id) {
      /** CSS preprocessor, works on classes instantiated in subContext. */
      if ( text ) {
        var eid = 'style' + (new Object()).$UID;
        this.styles[eid] = text;

        for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
          const m = this.MACROS[i];
          text = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);
        }

        this.installCSS(text, id, eid);
      }
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
      let currentMenuCheck = this.currentMenu && this.currentMenu.id ? this.currentMenu.id : this.currentMenu;
      /** Used to stop any duplicating recursive calls **/
      if ( currentMenuCheck === idCheck && ! opt_forceReload ) return;
      /** Used to load a specific menus. **/
      // Do it this way so as to not reset mementoTail if set
      // needs to be updated prior to menu dao searchs - since some menus rely soley on the memento
      if ( this.memento.head !== idCheck || opt_forceReload ) {
        this.memento.value = idCheck;
        if  ( idCheck.includes(this.Memento.SEPARATOR) )
          menu = idCheck.split(this.Memento.SEPARATOR)[0];
      }
      /** Used to checking validity of menu push and launching default on fail **/
      var dao;
      if ( this.client ) {
        dao = this.client.menuDAO;
        menu = await dao.find(menu);
        if ( ! menu ) { 
          menu = await this.findFirstMenuIHavePermissionFor(dao);
          let newId = (menu && menu.id) || '';
          if ( this.memento.head !== newId ) 
            this.memento.value = newId;
        }
        menu && menu.launch(this);
        this.menuListener(menu);
      } else {
        await this.clientPromise.then(async () => {
          dao = this.client.menuDAO;
          menu = await dao.find(menu);
          if ( ! menu ) { 
            menu = await this.findFirstMenuIHavePermissionFor(dao);
            let newId = (menu && menu.id) || '';
            if ( this.memento.head !== newId ) 
              this.memento.value = newId;
          }
          menu && menu.launch(this);
          this.menuListener(menu);
        });
      }
    },

    async function findFirstMenuIHavePermissionFor(dao) {
      // dao is expected to be the menuDAO
      // arg(dao) passed in cause context handled in calling function
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
            modelOf: 'foam.nanos.auth.ResetPassword'
           }}));
          self.loginSuccess$.sub(resolve);
        });
      }

      return new Promise(function(resolve, reject) {
        self.stack.push(self.StackBlock.create({ view: { class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, parent: self }));
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
      this.__subContext__.myNotificationDAO.put(notification);
    }
  ],

  listeners: [
    async function mementoChange() {
      // TODO: make a latch instead
      this.pushMenu(this.memento.head);
    },

    async function onUserAgentAndGroupLoaded() {
      /**
       * Called whenever the group updates.
       *   - Updates the portal view based on the group
       *   - Update the look and feel of the app based on the group or user
       *   - Go to a menu based on either the hash or the group
       */
      this.__subSubContext__.myNotificationDAO
      .on.put.sub((sub, on, put, obj) => {
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
      });

      this.fetchTheme();

      var hash = this.window.location.hash;
      if ( hash ) hash = hash.substring(1);

      if ( hash ) {
        window.onpopstate();
      } else if ( this.theme ) {
        this.window.location.hash = this.theme.defaultMenu;
      }

//      this.__subContext__.localSettingDAO.put(foam.nanos.session.LocalSetting.create({id: 'homeDenomination', value: localStorage.getItem("homeDenomination")}));
    },

    function menuListener(m) {
      /**
       * This listener should be called when a Menu item has been launched
       * by some Menu View. Is exported.
       */
      this.currentMenu = m;
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
      if ( ! this.theme ) throw new Error(this.LOOK_AND_FEEL_NOT_FOUND);

      if ( this.theme.topNavigation ) {
        this.topNavigation_ = this.theme.topNavigation;
      }

      if ( this.theme.footerView ) {
        this.footerView_ = this.theme.footerView;
      }
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
    }
  ]
});
