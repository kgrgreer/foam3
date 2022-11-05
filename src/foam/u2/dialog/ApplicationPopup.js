/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'ApplicationPopup',
  extends: 'foam.u2.dialog.Popup',
  documentation: `
    A full-featured popup with the application's branding on it.
  `,

  implements: ['foam.mlang.Expressions'],

  imports: [
    'theme'
  ],

  exports: [
    'as controlBorder'
  ],

  requires: [
    'foam.core.Action',
    'foam.u2.ActionReference',
    'foam.u2.borders.ScrollBorder',
    'foam.u2.dialog.DialogActionsView',
    'foam.u2.tag.Image'
  ],

  css: `
    ^header-action {
      z-index: 1000;
      cursor: pointer;
      transition: all ease-in 0.1s;
    }

    ^inner {
      height: 85vh;
      flex-direction: column;
      overflow: hidden;
    }

    ^header {
      display: flex;
      justify-content: space-between;
      flex-basis: 64px;
      border-bottom: 1px solid /*%GREY4%*/ #777777;
      padding: 12px;
    }

    ^header-left {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 12px;
    }

    ^header-right {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 12px;
    }

    ^header-center {
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    ^body {
      flex-grow: 1;
      max-height: 90vh;
      overflow: auto;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    ^fullscreen ^body {
      max-height: 100vh;
    }

    ^logo img, ^logo svg {
      display: flex;
      max-height: 40px;
      /* remove and override any image styling to preserve aspect ratio */
      width: unset;
    }

    ^header-button-placeholder {
      min-width: 56px;
    }

    ^footer {
      padding: 1em;
      text-align: center;
      border-top: 1px solid /*%GREY4%*/ #DADDE2;
      flex-shrink: 0;
    }
    ^footer-link:link,
    ^footer-link:visited,
    ^footer-link:active {
      color: /*%BLACK%*/ #1E1F21;
      text-decoration: none;
    }
    ^footer-link:hover {
      text-decoration: underline;
    }

    ^inner-title {
      display: flex;
      flex-direction: column;
      justify-contents: center;
      padding: 2.4rem 0;
      text-align: center;
      transition: all 150ms;
    }

    ^inner-title-small {
      padding: 1.2rem 0;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.ActionReference',
      name: 'customActions'
    },
    {
      name: 'closeAction'
    },
    {
      class: 'Reference',
      targetDAOKey: 'menuDAO',
      of: 'foam.nanos.menu.Menu',
      name: 'helpMenu'
    },
    'help_',
    {
      class: 'String',
      name: 'footerString'
    },
    {
      class: 'String',
      name: 'footerLink'
    },
    {
      class: 'Boolean',
      name: 'isScrolled'
    },
    {
      class: 'Array',
      name: 'leadingActions'
    },
    {
      class: 'Array',
      name: 'primaryActions'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'dynamicFooter'
    }
  ],

  methods: [
    function init() {
      var content;
      const self = this;
      window.thepopup = this;
      this.helpMenu$find.then( menu => {
        self.help_ = menu;
      });

      this.addClass()

        // These methods come from ControlBorder
        .setActionList(this.EQ(this.Action.NAME, "goPrev"), 'leadingActions')
        .setActionProp(this.EQ(this.Action.NAME, "discard"), 'closeAction')
        .setActionList(this.TRUE, 'primaryActions')

        .enableClass(this.myClass('fullscreen'), this.fullscreen$)
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.closeModal.bind(this) : null)
        .end()
        .start()
          .enableClass(this.myClass('inner'), this.isStyled$)
          .style({ 'background-color': this.isStyled ? this.backgroundColor : ''})
          .start()
            .show(this.showActions$)
            .addClass(this.myClass('header'))
            .start()
              .addClass(this.myClass('header-left'))
              .add(this.slot(function( leadingActions ) {
                if ( ! leadingActions || leadingActions.length === 0 ) {
                  return this.E().enableClass(this.myClass('header-button-placeholder'), self.closeable$);
                }
                let slots = [];
                leadingActions.forEach(a => {
                  slots.push(a.action.createIsAvailable$(self.__subContext__, a.data));
                });
                let s = foam.core.ArraySlot.create({ slots: slots }, self);
                let anyAvailable = this.slot(function(slots) {
                  for ( let slot of slots ) {
                    if ( slot ) return true;
                  }
                  return false;
                }, s);
                return this.E()
                  .enableClass(this.myClass('header-button-placeholder'), anyAvailable)
                  .forEach(leadingActions, function(ar) {
                    this
                      .start(ar.action, { label: '', buttonStyle: 'TERTIARY', data$: ar.data$ })
                        .addClass(self.myClass('header-action'))
                      .end();
                  });
              }))
            .end()
            .start()
              .addClass(this.myClass('header-center'))
              .start(this.Image, {
                data$: this.slot(function(theme$topNavLogo) {
                  return theme$topNavLogo;
                }),
                embedSVG: true
              })
                .addClass(this.myClass('logo'))
              .end()
            .end()
            .start()
              .addClass(this.myClass('header-right'))
              .add(this.slot(function(help_) {
                return help_ ? this.E().tag(help_, { label: '', buttonStyle: 'TERTIARY' }) : null;
              }))
              .add(this.slot(function(closeAction) {
                return closeAction ?
                this.E()
                  .start(closeAction.action, { label: '', buttonStyle: 'TERTIARY', data$: closeAction.data$ })
                    .show(self.closeable$.and(self.showActions$))
                    .addClass(self.myClass('header-action'))
                  .end() :
                this.E().startContext({ data: self })
                    .start(self.CLOSE_MODAL, { buttonStyle: 'TERTIARY' })
                      .show(self.closeable$.and(self.showActions$))
                      .addClass(self.myClass('header-action'))
                    .end()
                  .endContext();
              }))
            .end()
          .end()
          .add(this.slot(function (content$childNodes) {
            if ( ! content$childNodes ) return;
            let title = '';
            for ( const child of content$childNodes ) {
              if ( ! child.viewTitle ) continue;
              title = child.viewTitle$;
              break;
            }
            if ( ! title ) return this.E();
            return this.E()
              .addClass(self.myClass('inner-title'))
              .addClass('h300')
              .enableClass(self.myClass('inner-title-small'), this.isScrolled$)
              .enableClass('h500', this.isScrolled$)
              .show(title)
              .add(title);
          }))
          .start(this.ScrollBorder, { topShadow$: this.isScrolled$ })
            .addClass(this.myClass('body'))
            .call(function() { content = this.content; })
          .end()
          .tag(this.DialogActionsView, {
            data$: this.primaryActions$
          })
          .add(this.slot(function (dynamicFooter) {
            if ( ! dynamicFooter ) return;
            return this.E()
              .addClass(this.myClass('dynamicFooter'))
              .tag(dynamicFooter);
          }))
          .start(this.footerLink ? 'a' : '')
            .show(this.footerString$)
            .addClasses([this.myClass('footer'), 'p-legal-light'])
            .enableClass(this.myClass('footer-link'), this.footerLink$)
            .add(this.footerString$)
            .attrs({ href: this.footerLink, target: '_blank' })
          .end()
        .end();

      this.content = content;
    }
  ]
});
