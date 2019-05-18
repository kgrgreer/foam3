foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  imports: [
    'stack'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      background-color: white;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      z-index: 950;
      margin: 0;
      padding: 0;
    }

    ^logo {
      height: 22px;
    }

    ^header {
      height: 64px;
      border: solid 1px #edf0f5;
      justify-content: space-between;
      align-items: center;
      display: flex;
      padding: 0 128px;
    }

    ^ .foam-u2-ProgressView {
      margin: 0;
      width: 100%;

      /* Reset the default appearance */
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
    }

    ^ progress[value]::-webkit-progress-bar {
      background-color: white;
    }

    ^ progress[value]::-webkit-progress-value {
      background-color: #604aff;
      -webkit-transition: all 0.1s ease-in;
      transition: all 0.1s ease-in;
    }

    ^ .net-nanopay-sme-onboarding-ui-WizardView-sections {
      flex-grow: 1;
    }

    ^ .net-nanopay-sme-onboarding-ui-WizardView-navigation-bar {
      height: 72px;

      background-color: white;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #edf0f5;

      align-items: center !important;
    }
  `,
  properties: [
    {
      class: 'Int',
      name: 'currentPage',
      expression: function(lastUpdate, currentIndex, sections) {
        var currentPage = 0;
        for ( var i = 0; i < currentIndex; i++ ) {
          if ( sections[i].createIsAvailableFor(this.data$).get() ) {
            currentPage++;
          }
        }
        return currentPage + 1;
      }
    },
    {
      class: 'Int',
      name: 'numPages',
      expression: function(lastUpdate, data, sections) {
        return sections
          .filter((s) => s.createIsAvailableFor(this.data$).get())
          .length;
      }
    },
    {
      name: 'progress',
      expression: function(currentPage, numPages) {
        if ( currentPage < 0 ) return 0;
        if ( currentPage > numPages ) return 100;
        return (currentPage / numPages) * 100;
      },
      view: { class: 'foam.u2.ProgressView' }
    },
    {
      name: 'sectionView',
      value: { class: 'net.nanopay.sme.onboarding.ui.WizardPageView' }
    }
  ],
  methods: [
    function initE() {
      this.addClass(this.myClass());

      this
        .start().addClass(this.myClass('header'))
          .start({ class: 'foam.u2.tag.Image', data: 'images/ablii-wordmark.svg' }).addClass(this.myClass('logo')).end()
          .start().add(this.SAVE_AND_EXIT).addClass(this.myClass('save-exit')).end()
        .end()
        .startContext({ data: this })
          .add(this.PROGRESS)
        .endContext();
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'saveAndExit',
      label: 'Save & Exit',
      code: function (x) {
        x.stack.back();
      }
    }
  ]
});
