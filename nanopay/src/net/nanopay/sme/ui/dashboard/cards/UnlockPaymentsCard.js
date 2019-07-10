foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'UnlockPaymentsCard',
  extends: 'foam.u2.View',

  documentation: `
    The cards displayed to the user telling them if they have enabled domestic/international payments
  `,

  requires: [
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType',
    'net.nanopay.sme.onboarding.BusinessOnboarding'
  ],

  imports: [
    'agent',
    'menuDAO',
    'stack',
    'user'
  ],

  css: `
    ^ {
      width: 500px;
      height: 173px;
      box-sizing: border-box;

      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);

      position: relative;
      padding: 24px;

      background-size: cover;
      background-repeat: no-repeat;
    }

    ^info-box {
      display: inline-block;

      width: 245px;
      height: 100px;
    }

    ^title {
      height: 24px;
      margin: 0;

      font-family: Lato;
      font-size: 16px;
      font-weight: 900;
      line-height: 1.5;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^description {
      margin: 0;
      margin-top: 8px;

      font-family: Lato;
      font-size: 14px;
      line-height: 1.5;
      color: #525455;
    }

    ^ .net-nanopay-sme-ui-AbliiActionView-getStarted {
      margin-top: 16px;
    }

    ^complete-container {
      margin-top: 24px;
    }

    ^icon {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;

      margin-right: 8px;
    }

    ^complete {
      display: inline-block;
      vertical-align: middle;
      margin: 0;

      font-size: 14px;
      line-height: 1.71;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  messages: [
    {
      name: 'TITLE_DOMESTIC',
      message: 'Unlock domestic payments'
    },
    {
      name: 'TITLE_INTERNATIONAL',
      message: 'Unlock international payments'
    },
    {
      name: 'DESCRIPTION_DOMESTIC',
      message: 'Complete the requirements and unlock domestic payments'
    },
    {
      name: 'DESCRIPTION_INTERNATIONAL',
      message: 'We are adding the ability to make FX payments around the world using Ablii. '
    },
    {
      name: 'COMPLETE',
      message: 'Completed'
    },
    {
      name: 'PENDING',
      message: 'Coming soon!'
    }
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType',
      name: 'type',
      factory: function() {
        return this.UnlockPaymentsCardType.DOMESTIC;
      },
      documentation: `
        Type to be set by developer. Defaults to domestic.
      `
    },
    {
      class: 'String',
      name: 'flagImgPath',
      expression: function(user, type) {
        const country = user.address.countryId;
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL ) {
          return 'url(\'images/ablii/InternationalCard.png\')'
        }
        switch ( country ) {
          case 'CA':
            return 'url(\'images/ablii/CanadaCard.png\')';
          case 'US':
            return 'url(\'images/ablii/AmericaCard.png\')';
          default:
            return 'url(\'images/ablii/CanadaCard.png\')';
            break;
        }
      },
      documentation: `
        Image path based on user country (currently CA/US), and card type selected.
      `
    },
    {
      class: 'String',
      name: 'title',
      expression: function(type) {
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL ) {
          return this.TITLE_INTERNATIONAL;
        }
        return this.TITLE_DOMESTIC;
      },
      documentation: `
        The title to be used in the card based on card type
      `
    },
    {
      class: 'String',
      name: 'info',
      expression: function(type) {
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL ) {
          return this.DESCRIPTION_INTERNATIONAL;
        }
        return this.DESCRIPTION_DOMESTIC;
      },
      documentation: `
        The description to be used in the card based on card type
      `
    },
    {
      class: 'Boolean',
      name: 'isComplete'
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .style({ 'background-image': this.flagImgPath })
        .start().addClass(this.myClass('info-box'))
          .start('p').addClass(this.myClass('title')).add(this.title).end()
          .start('p').addClass(this.myClass('description')).add(this.info).end()
          .add(this.slot(function(isComplete, type) {
            if ( type === self.UnlockPaymentsCardType.INTERNATIONAL ) {
              return this.E().start().addClass(self.myClass('complete-container'))
                .start('p').addClass(self.myClass('complete')).add(self.PENDING).end()
              .end();
            }

            if ( ! isComplete ) {
              return this.E()
                .startContext({ data: self })
                  .start(self.GET_STARTED, { buttonStyle: 'SECONDARY' }).end()
                .endContext();
            }

            return this.E().start().addClass(self.myClass('complete-container'))
              .start({
                class: 'foam.u2.tag.Image',
                data: 'images/checkmark-small-green.svg'
              })
                .addClass(self.myClass('icon'))
              .end()
              .start('p')
                .addClass(self.myClass('complete'))
                .add(self.COMPLETE)
              .end()
            .end();
          }))
        .end();
    }
  ],

  actions: [
    {
      name: 'getStarted',
      label: 'Get started',
      code: function(x) {
        if ( this.type === this.UnlockPaymentsCardType.DOMESTIC ) {
          if ( ! this.user.onboarded ) {
            var userId = this.agent.id;
            var businessId = this.user.id;
            x.businessOnboardingDAO.find(userId).then((o) => {
              o = o || this.BusinessOnboarding.create({
                userId: userId,
                businessId: businessId
              });
              this.stack.push({
                class: 'net.nanopay.sme.onboarding.ui.WizardView',
                data: o
              });
            });
          } else {
            this.menuDAO.find('sme.accountProfile.business-settings').then((menu) => menu.launch());
          }
        }
      }
    }
  ]

});

foam.ENUM({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'UnlockPaymentsCardType',

  values: [
    {
      name: 'DOMESTIC',
      label: 'Domestic'
    },
    {
      name: 'INTERNATIONAL',
      label: 'International'
    }
  ]
});
