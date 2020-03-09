foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardSectionController',
  extends: 'foam.u2.detail.WizardSectionsView',
  
  methods: [
    function initE() {
      this.SUPER();
      debugger;
      this.startContext({ data: this})
        .tag(this.SUBMIT, { size: 'LARGE'})
      .endContext()
    }
  ],

  actions: [
    {
      name: 'submit',
      label: 'Finish',
      isAvailable: function(data$errors_, nextIndex) {
        return ! data$errors_ && nextIndex === -1;
      },
      code: async function() {
        var dao = x[foam.String.daoize(this.data.model_.name)];
        dao.put(this.data.clone());
      }
    }
  ]
});