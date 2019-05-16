foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardView',
  extends: 'foam.u2.detail.WizardSectionsView',
  properties: [
    {
      class: 'Int',
      name: 'currentPage',
      expression: function(lastUpdate, currentIndex, sections) {
        var currentPage = 0;
        for ( var i = 0; i <= currentIndex; i++ ) {
          if ( sections[i].createIsAvailableFor(this.data$).get() ) {
            currentPage++;
          }
        }
        return currentPage;
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
      name: 'sectionView',
      value: { class: 'net.nanopay.sme.onboarding.ui.WizardPageView' }
    }
  ],
  methods: [
    function initE() {
      this.add(this.slot(function(numPages, currentPage) {
        // TODO: Use these values to render a progress bar.
        return `${currentPage}/${numPages}`;
      }));
      this.SUPER();
    }
  ]
});
