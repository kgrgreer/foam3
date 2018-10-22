foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CountTrait',

  documentation: `
    Many different views have the structure of a table, search box, and some
    text that shows how many objects are being shown in the table out of the
    total amount when the table is being filtered. For brevity, that text is
    referred to as the "count text" in this file.

    This trait contains the properties and logic used to calculate the count
    text.

    If many views implement this trait, we can avoid having duplicate code
    across all of those views.
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: `
        Add to the view with .add(this.FILTER) to get a search box.
      `,
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Search',
        onKey: true
      }
    },
    {
      class: 'Int',
      name: 'totalCount',
      documentation: `The total number of objects.`
    },
    {
      class: 'Int',
      name: 'selectedCount',
      documentation: `The number of objects after filtering.`
    },
    {
      class: 'String',
      name: 'countMessage',
      documentation: `
        The count message.
        Use .add(this.countMessage$) to add the count message to the view.
      `,
      expression: function(filter, totalCount, selectedCount) {
        var word = totalCount === 1 ?
          this.OBJECT_SINGULAR :
          this.OBJECT_PLURAL;
        return filter.length > 0 ?
          `Showing ${selectedCount} out of ${totalCount} ${this.OBJECT_PLURAL}` :
          `${totalCount} ${word}`;
      }
    }
  ],

  listeners: [
    {
      name: 'updateTotalCount',
      isFramed: true,
      code: function() {
        this.data
          .select(this.COUNT())
          .then(({ value }) => {
            this.totalCount = value;
          });
      }
    },
    {
      name: 'updateSelectedCount',
      isFramed: true,
      code: function(_, __, ___, dao) {
        dao
          .get()
          .select(this.COUNT())
          .then(({ value }) => {
            this.selectedCount = value;
          });
      }
    }
  ]
});
