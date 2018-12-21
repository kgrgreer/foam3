// TODO: move to CC project when project-specific builds available
foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'CCTransferView',
  extends: 'net.nanopay.ui.TransferView',

  imports: [ 'userDAO as userDAO_' ],

  documentation: 'CC customized TransferView which only displays users in the "business" group.',

  properties: [
    {
      name: 'userDAO',
      factory: function() {
        return this.userDAO_.where(this.EQ(this.User.GROUP, "business"));
      }
    }
  ]
});
