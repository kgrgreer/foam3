foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksInstitutionForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form'
  ],
  
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 520px;
        }

        ^ .optionSpacer {
          display: inline-block;
          width: 120px;
          height: 65px;
          margin-right: 10px;
        }

        ^ .optionSpacer:last-child {
          margin-right: 0;
        }

        ^ .institution {
          margin-bottom: 10px
        }

        ^ .institution:hover {
          cursor: pointer;
        }
        ^ .institution.selected {
          border: solid 1px #1CC2B7;
        }
        ^ .subContent {
          width: 522px;
          height: 292px;
          background-color: #edf0f5;
          border: 1px solid #edf0f5;
        }
        ^ .image {
          width: 120px;
          height: 65px;
        }
      */}
    })
  ],

  properties: [
    {
      //decide which bank will connect
      class: 'Int',
      name: 'selectedOption',
      value: -1,
      postSet: function(oldValue, newValue) {
        this.viewData.selectedOption = newValue;
      },
      validateObj: function(selectedOption) {
        if ( selectedOption == -1 ) return this.Error;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Please choose your institution below.'},
    { name: 'Error', message: 'Invalid Institution'},
    { name: 'NameLabel', message: 'Institution *'}
  ],
  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Next';
      this.form.isEnabledButtons(true);
      if ( ! this.viewData.selectedOption ) { return; }
      this.selectedOption = this.viewData.selectedOption;
    },

    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .forEach(this.bankImgs, function(e){
            this.start('div').addClass('optionSpacer').addClass('institution')
              .addClass(self.selectedOption$.map(function(o) { return o == e.index ? 'selected' : '';}))
              .start({class: 'foam.u2.tag.Image', data: e.image}).addClass('image').end()
              .on('click', function() {
                self.selectedOption = e.index;
              })
            .end()
          })
        .end()
        // .start('p')
        //     .addClass('inputErrorLabel')
        //     .add(this.slot(this.SELECTED_OPTION.validateObj))
        // .end()
    }
  ]
})