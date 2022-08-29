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
    'as actionProvider'
  ],

  requires: [
    'foam.u2.ActionReference',
    'foam.u2.tag.Image'
  ],

  css: `
    ^header-action {
      z-index: 1000;
      cursor: pointer;
      transition: all ease-in 0.1s;
    }

    ^inner {
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
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    ^fullscreen ^body {
      max-height: var(--max-height, 100vh);
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
    }
  ],

  methods: [
    function init() {
      var content;
      const self = this;
      this.helpMenu$find.then( menu => {
        self.help_ = menu;
      });

      this.addClass()
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
              .add(this.slot(function( customActions ) {
                if ( ! customActions || customActions.length === 0 ) {
                  return this.E().enableClass(this.myClass('header-button-placeholder'), self.closeable$);
                }
                let slots = [];
                customActions.forEach(a => {
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
                  .forEach(customActions, function(ar) {
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
          .start()
            .addClass(this.myClass('body'))
            .call(function() { content = this; })
          .end()
          .start()
            .addClasses([this.myClass('footer'), 'p-legal-light'])
            .add(this.footerString$)
          .end()
        .end();

      this.content = content;
    },

    function addAction(actionRef) {
      this.customActions$push(actionRef);
    },

    function removeAction(actionRef) {
      this.customActions$remove(this.EQ(
        this.DOT(this.ActionReference.ACTION, foam.core.Action.NAME),
        actionRef.action.name));
    }
  ]
});
