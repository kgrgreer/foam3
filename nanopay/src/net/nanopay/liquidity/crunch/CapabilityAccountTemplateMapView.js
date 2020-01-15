  
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountTemplateMapView',
  extends: 'foam.u2.view.MapView',
  classes: [
    {
      name: 'KeyValueRow',
      imports: [
        'data',
        'mode',
        'updateData'
      ],
      properties: [
        {
          name: 'key',
          class: 'Reference',
          of: 'net.nanopay.account.Account',
          postSet: function(o, n) {
            delete this.data[o];
            this.data[n] = this.value;
          }
        },
        {
          name: 'value',
          view: { class: 'foam.u2.view.FObjectView' },
          class: 'FObjectProperty',
          of: 'net.nanopay.liquidity.crunch.CapabilityAccountData',
          postSet: function(o, n) {
            this.data[this.key] = n;
          }
        }
      ],
      actions: [
        {
          name: 'remove',
          isAvailable: function(mode) {
            return mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            delete this.data[this.key];
            this.updateData();
          }
        }
      ]
    }
  ]
});
