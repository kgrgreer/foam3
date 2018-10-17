foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CountTrait',

  properties: [
    {
      class: 'String',
      name: 'filter',
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
