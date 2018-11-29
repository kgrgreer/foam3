foam.CLASS({
  package: 'net.nanopay.sme.ui.banner',
  name: 'ComplianceBannerData',
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
      of: 'net.nanopay.sme.ui.banner.ComplianceBannerMode',
      name: 'mode'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.sme.ui.banner',
  name: 'ComplianceBannerMode',

  documentation: 'Mode that determines banner color',

  values: [
    { name: 'ALERT', label: 'Alert' },
    { name: 'NOTICE', label: 'Notice' },
    { name: 'ACCOMPLISHED', label: 'Accomplished' }
  ]
});
