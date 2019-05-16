foam.CLASS({
  package: 'net.nanopay.business',
  name: 'NatureOfBusiness',
  extends: 'foam.u2.View',
  requires: [
    'net.nanopay.model.BusinessSector',
    'foam.u2.layout.Cols',
    'foam.u2.view.RichChoiceView'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'businessSectorDAO'
  ],

  css: `
    ^ .foam-u2-view-RichChoiceView {
      width: 248px;
    }
  `,

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'parentChoice'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      expression: function(parentChoice) {
        return parentChoice ?
          this.EQ(this.BusinessSector.PARENT, parentChoice) :
          this.FALSE;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(businessSectorDAO, predicate) {
        return businessSectorDAO.where(predicate);
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.Cols)
          .tag(this.RichChoiceView, {
            data$: this.parentChoice$,
            sections: [
              {
                heading: 'Industries',
                dao: this.businessSectorDAO.where(this.EQ(this.BusinessSector.PARENT, 0))
              }
            ],
            search: true,
            searchPlaceholder: 'Search...',
            choosePlaceholder: 'Select...'
          })
          .add(this.parentChoice$.map((id) => {
            return this.E()
              .tag(this.RichChoiceView, {
                visibility: id != 0 ? 'RW' : 'DISABLED',
                data$: this.data$,
                sections: [
                  {
                    heading: 'Specific Industries',
                    dao: this.filteredDAO$proxy
                  }
                ],
                search: true,
                searchPlaceholder: 'Search...',
                choosePlaceholder: 'Select...'
              })
          }))
        .end();
    }
  ]
})