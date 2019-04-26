foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'UserSelectionView',
    extends: 'foam.u2.Element',

    documentation: `The selection view for a RichChoiceView for user to display id and legal name.`,

    properties: [
      'data', 'userDAO'
    ],

    methods: [
      async function initE() {
        var display = 'Select a User';
        var user = await this.userDAO.find(this.data);
        if ( user ) {
          display = user.id + ' ' + user.legalName;
        }
        return this.add(display);
      }
    ]
});
