/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SubtitledCardSelectView',
  extends: 'foam.u2.view.CardSelectView',
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.view.SubtitledCardSelectViewData',
      name: 'testarray'
    }
  ],
  methods: [
    function render() {
      var self = this;
      cardData = this.testarray.find(d=> d.capaId==this.data);
      this
      .addClass(this.myClass())
      .addClass(this.myClass('innerFlexer'))
      .start(this.CardBorder)
        .addClass(this.myClass('base'))
        .enableClass(this.myClass('large-card'), this.largeCard$)
        .enableClass(this.myClass('selected'), this.isSelected$)
        .enableClass(this.myClass('disabled'), this.isDisabled$)
        .enableClass(this.myClass('selected-disabled'), this.slot((isSelected, isDisabled) => {
          return isSelected  && isDisabled;
        }))
        .on('click', this.onClick)
        .start().addClass(self.myClass('content'))
          .start().addClass(self.myClass('title')).add(foam.u2.HTMLView.create({data: cardData.title})).end()
          .start().addClass(self.myClass('subTitle')).add(foam.u2.HTMLView.create({data: cardData.subTitle})).end()
        .end()
      .end();
    }
  ],

  css: `
  ^title {
    font-weight: 800;
    font-size: large;
  }
  ^content {
    width: 90%;
    text-align: left;
  }
  `
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SubtitledCardSelectViewData',
  properties: ['capaId', 'title', 'subTitle']
});



