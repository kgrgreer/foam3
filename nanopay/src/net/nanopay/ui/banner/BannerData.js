foam.CLASS({
  package: 'net.nanopay.ui.banner',
  name: 'BannerData',
  documentation: 'Data for banner display',

  properties: [
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'Boolean',
      name: 'isDismissed',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isDismissable',
      value: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.ui.banner.BannerMode',
      name: 'mode'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.ui.banner',
  name: 'BannerMode',

  documentation: 'Mode that determines banner color',

  values: [
    { name: 'ALERT', label: 'Alert' },
    { name: 'NOTICE', label: 'Notice' },
    { name: 'ACCOMPLISHED', label: 'Accomplished' }
  ]
});
