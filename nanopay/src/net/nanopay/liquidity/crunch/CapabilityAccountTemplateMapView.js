  
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
          view: function(_, X) {
            const e = foam.mlang.Expressions.create();
            const Account = net.nanopay.account.Account;
            const LifecycleState = foam.nanos.auth.LifecycleState;
            return {
              class: 'foam.u2.view.RichChoiceView',
              search: true,
              sections: [
                {
                  heading: 'Accounts',
                  dao: X.accountDAO
                    .where(e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE))
                    .orderBy(Account.NAME)
                }
              ]
            };
          },
          adapt: function(oldVal, newVal) {
            if ( typeof newVal === 'string' ) {
              return parseInt(newVal);
            }
            return newVal;
          }
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
