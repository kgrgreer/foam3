foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'BusinessNameSearch',

  exports: [ 'as data' ],

  sections: [
    {
      name: 'search',
      title: 'Search by Business Name',
      subTitle: `Search a business on Ablii to add them to your
      contacts.  For better results, search using their registered
      business name and location.`
    },
    {
      name: 'confirm',
      title: ''
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: 'This property is the data binding for the search field',
      section: 'search',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Start typing to search',
        onKey: true,
        focused: true
      }
    },
    {
      class: 'String',
      name: 'connectedBusinesses',
      documentation: `
        This property is to query all connected businesses related to
        the current acting business.
      `,
      hidden: true,
      expression: function(filter) {
        debugger;
        return filter;
      }
    }
  ]
});