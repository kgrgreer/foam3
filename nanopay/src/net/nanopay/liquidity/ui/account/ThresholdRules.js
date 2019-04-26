foam.CLASS({
  package: 'net.nanopay.liquidity.ui.account',
  name: 'ThresholdRules',

  imports: [
    "data"
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'liquiditySettings',
      factory: function() {
        this.data.liquiditySetting$find.then(res => {
          this.liquiditySettings = res;
        })
        return null;
      }
    }
  ],
  actions: [
    {
      name: 'edit',
      code: function() {
        // Open the dao controller for liquidity settings.
        alert('todo');
      }
    }
  ]
});
