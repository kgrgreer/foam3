foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'AccountSelectionView',
    extends: 'foam.u2.Element',

    documentation: `The selection view for a RichChoiceView for account to display id, name and currency.`,

    properties: [
      'data', 'accountDAO',
    ],

    methods: [
      async function initE() {
        var display = 'Select an Account';
        var account = await this.accountDAO.find(this.data);
        if ( account ) {
          display = account.id + ' ' + account.name + ' ' + account.denomination;
        }
        return this.add(display);
      }
    ]
});
