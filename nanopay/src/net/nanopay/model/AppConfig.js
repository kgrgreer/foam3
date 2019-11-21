foam.CLASS({
  package: 'net.nanopay.model',
  name: 'AppConfigRefine',
  refines: 'foam.nanos.app.AppConfig',
  properties: [
    {
      class: 'String',
      name: 'appLink',
      value: 'https://itunes.apple.com/ca/app/mintchip/id1051748158?mt=8'
    },
    {
      class: 'String',
      name: 'playLink',
      value: 'https://play.google.com/store/apps/details?id=net.nanopay.mintchip_android'  
    },
    {
      class: 'Boolean',
      name: 'whiteListEnabled',
      documentation: `Enables white labeling on ablii sign up.`
    },
    {
      class: 'Boolean',
      name: 'afexEnabled',
      documentation: `Enable AFEX Service.`
    },
    // {
    //   class: 'FObjectProperty',
    //   of: 'net.nanopay.meter.AdminAccessConfig',
    //   name: 'adminAccessConfig',
    //   documentation: `AdminAccessConfig object that stores user Ids for users that can keep admin access.`,
    //   view: {
    //     class: 'foam.u2.view.FObjectPropertyView',
    //     writeView: { class: 'foam.u2.detail.SectionedDetailView' }
    //   },
    //   factory: function() {
    //     return net.nanopay.meter.AdminAccessConfig.create();
    //   }
    // }
  ]
});
