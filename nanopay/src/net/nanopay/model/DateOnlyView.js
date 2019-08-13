foam.CLASS({
  package: 'net.nanopay.model',
  name: 'DateOnlyView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Date values.',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  properties: [
    [ 'placeholder', 'yyyy-mm-dd' ]
  ],

  listeners: [
    {
      name: 'onBlur',
      isFramed: true,
      code: function() {
        if ( ! this.el() ) return;
        this.el().value = this.dataToInput(this.data);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'date');
      this.setAttribute('placeholder', 'yyyy/mm/dd');
      this.on('blur', this.onBlur);
    },

    function link() {
      this.data$.relateTo(
        this.attrSlot(null, this.onKey ? 'input' : null),
        (d) => this.dataToInput(d),
        (d) => this.inputToData(d)
      );
    },

    function inputToData(input) {
      if ( ! input ) return input;
      let date = input.split('-');

      return net.nanopay.model.DateOnly.create({
        year: parseInt(date[0]),
        month: parseInt(date[1]),
        day: parseInt(date[2])
      });
    },

    function dataToInput(data) {
      if ( ! data ) return data;
      // let year = data.year;
      // let month = data.month;
      // let day = data.day;
      return '';
      // return `${year}-${month}-${day}`;
    }
  ]
});
