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

  implements: [
    'foam.mlang.Expressions',
    'foam.u2.Progressable'
  ],

  imports: [
    'displayWidth?',
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
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.layout.GridColumns',
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
      width: 65vw;
      flex-direction: column;
      overflow: hidden;
    }

    ^bodyWrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 0 4rem;
      align-self: center;
      width: 100%;
      overflow: auto;
    }
    ^actionBar {
      padding: 2.4rem;
    }
    ^fullscreen ^actionBar {
      padding: 2.4rem;
    }

    ^header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 12px;
    }
    ^header.showBorder {
      border-bottom: 1px solid $grey300;
    }

    ^header-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    ^header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    ^header-center {
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
    }

    ^body {
      max-height: 90vh;
      overflow: auto;
      display: flex;
      align-items: center;
      flex-direction: column;
    }
    ^fullHeightBody {
      flex-grow: 1;
    }

    ^fullscreen ^bodyWrapper {
      max-height: var(--max-height, 100vh);
      padding: 0 2rem;
    }

    ^logo img, ^logo svg {
      display: flex;
      max-height: 4rem;
      /* remove and override any image styling to preserve aspect ratio */
      width: unset;
    }

    ^header-button-placeholder {
      min-width: 56px;
    }

    ^footer {
      display: grid;
      grid-template-columns: auto;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6em 1em;
      text-align: center;
      border-top: 1px solid $grey300;
      flex-shrink: 0;
      white-space: nowrap;
    }
    ^footer-right, ^footer-left {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ^footer-center a:link,
    ^footer-center a:visited,
    ^footer-center a:active {
      color: /*%BLACK%*/ #1E1F21;
      text-decoration: none;
    }
    ^footer-center a:hover {
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

    ^footer.p-legal-light {
      color: #6F6F6F;
    }

    ^info-text {
      color: /*%BLACK%*/ #1e1f21;
    }

    ^footer-center img {
      height: 1em;
      display: inline-block;
      vertical-align: top;
    }

    ^dialogActionsView-with-footer .foam-u2-dialog-DialogActionsView-actions {
      padding: 1.2rem 0 0 0;
    }

    @media only screen and (max-width: /*%DISPLAYWIDTH.MD%*/ 768px) {
      ^bodyWrapper {
        padding: 0 2rem;
      }
    }

    @media only screen and (min-width: /*%DISPLAYWIDTH.MD%*/ 768px) {
      ^:not(^fullscreen) ^inner {
        width: 65vw;
      }
      ^fullscreen ^bodyWrapper {
        width: 56%;
      }
      ^footer {
        grid-template-columns: 1fr auto 1fr;
      }
      ^footer-right {
        justify-content: flex-end;
      }
      ^footer-left {
        justify-content: flex-start;
      }
    }
    @media only screen and (min-width: /*%DISPLAYWIDTH.XL%*/ 986px) {
      ^:not(^fullscreen) ^inner {
        width: 35vw;
      }
      ^fullscreen ^bodyWrapper {
        width: 36%;
      }
    }
  `,

  messages: [
    { name: 'SUPPORT_TITLE', message: 'Support: '}
  ],

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
      name: 'footerHTML'
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
      name: 'progressView',
      value: { class: 'foam.u2.ProgressView' }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'dynamicFooter'
    },
    [ 'forceFullscreen', false ],
    [ 'includeSupport', false ],
    [ 'forceFullHeightBody', false]
  ],

  methods: [
    function init() {
      var content;
      const self = this;
      window.thepopup = this;
      this.helpMenu$find.then( menu => {
        self.help_ = menu;
      });
      const updateWidth = () => {
        if ( this.displayWidth?.ordinal <= foam.u2.layout.DisplayWidth.MD.ordinal ) {
          this.forceFullscreen = true;
        } else {
          this.forceFullscreen = false;
        }
      }
      updateWidth();
      this.onDetach(this.displayWidth$.sub(updateWidth))
      this.addClass()

        // These methods come from ControlBorder
        .setActionList(this.EQ(this.Action.NAME, "goPrev"), 'leadingActions')
        .setActionProp(this.EQ(this.Action.NAME, "discard"), 'closeAction')
        .setActionList(this.TRUE, 'primaryActions')

        .enableClass(this.myClass('fullscreen'), this.fullscreen$.or(this.forceFullscreen$))
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.closeModal.bind(this) : null)
        .end()
        .start()
          .enableClass(this.myClass('inner'), this.isStyled$)
          .style({ 'background-color': this.isStyled ? this.backgroundColor : ''})
          .start()
            .show(this.showActions$)
            .enableClass('showBorder', this.progressMax$, true)
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
                    var isLastWizardlet_ = ar.data.currentWizardlet.isLastWizardlet;
                    this
                      .start(ar.action, { label: '', buttonStyle: 'TERTIARY', data$: ar.data$ }).show(!isLastWizardlet_)
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
          .add(this.slot(function(progressView) {
            return this.E()
              .tag(progressView, {
                max$: self.progressMax$,
                data$: self.progressValue$
              });
          }))
          .start()
            .addClass(this.myClass('bodyWrapper'))
            .add(this.slot(function(content$childNodes) {
              if ( ! content$childNodes ) return;
              this.forceFullHeightBody = false;
              let titleSlot = null;
              for ( const child of content$childNodes ) {
                if ( ! child.viewTitle ) continue;
                titleSlot = child.viewTitle$;
                break;
              }
              if ( ! titleSlot ) return this.E();
              return this.E()
                .addClass(self.myClass('inner-title'))
                .addClass('h300')
                .enableClass(self.myClass('inner-title-small'), this.isScrolled$)
                .enableClass('h500', this.isScrolled$)
                .show(titleSlot)
                .add(titleSlot);
            }))
            .start(this.ScrollBorder, { topShadow$: this.isScrolled$ })
              .addClass(this.myClass('body'))
              .enableClass(this.myClass('fullHeightBody'), this.forceFullHeightBody$.or(this.fullscreen$.or(this.forceFullscreen$).not()))
              .call(function() { content = this.content; })
            .end()
            .start()
              .enableClass(this.myClass('dialogActionsView-with-footer'), this.dynamicFooter$.map(footer => !! footer))
              .tag(this.DialogActionsView, {
                data$: this.primaryActions$
              })
            .end()
            .add(this.slot(function (dynamicFooter) {
              if ( ! dynamicFooter ) return;
              return this.E()
                .addClass(this.myClass('dynamicFooter'))
                .tag(dynamicFooter);
            }))
          .end()
          .callIf((this.footerHTML || this.includeSupport ), function() {
            this.start()
              .addClass(self.myClass('footer'), 'p-legal-light')
              // empty space
              .start().addClass(self.myClass('footer-left'))
                .end()
              // link
              .start().addClass(self.myClass('footer-center'))
                .tag(foam.u2.HTMLView.create({ nodeName: 'div', data$: self.footerHTML$ })) 
              .end()
              // support info
              .start().addClass(self.myClass('footer-right'))
                .callIf(self.includeSupport, function() {
                  this
                    .start()
                      .start('span')
                        .addClass('')
                        .add(self.SUPPORT_TITLE)
                        .start('a')
                          .addClass(self.myClass('info-text'), self.myClass('footer-link'))
                          .attrs({ href: `mailto:${self.theme.supportConfig.supportEmail}`})
                          .add(self.theme.supportConfig.supportEmail)
                        .end()
                        .add(' | ')
                        .start('a')
                          .addClass(self.myClass('info-text'), self.myClass('footer-link'))
                          .attrs({ href: `tel:${self.theme.supportConfig.supportPhone}`})
                          .add(self.theme.supportConfig.supportPhone)
                        .end()
                      .end()
                    .end()
                })
              .end()
            .end()
          })
        .end();

      this.content = content;
    }
  ]
});
