  
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountTemplateMapView',
  extends: 'foam.u2.view.MapView',

  properties: [
    {
      name: 'isCapabilityAccountData',
      class: 'Boolean'
    }
  ],

  exports: [ 'isCapabilityAccountData' ],

  classes: [
    {
      name: 'KeyValueRow',
      imports: [
        'mode',
        'view',
        'isCapabilityAccountData'
      ],
      properties: [
        {
          name: 'key',
          class: 'Reference',
          of: 'net.nanopay.account.Account',
        },
        {
          name: 'value',
          class: 'FObjectProperty',
          view: function(_, X) {
            if ( X.isCapabilityAccountData )
              return { 
                class: 'foam.u2.view.FObjectView',
                of: 'net.nanopay.liquidity.crunch.CapabilityAccountData' 
              };
              
            return { 
              class: 'foam.u2.view.FObjectView',
              of: 'net.nanopay.liquidity.crunch.AccountData' 
            };
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
            var d2 = foam.Object.shallowClone(this.view.data);
            delete d2[this.key];
            this.view.data = d2;
          }
        }
      ]
    }
  ],
});
