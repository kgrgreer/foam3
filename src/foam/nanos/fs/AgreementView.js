/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'AgreementView',
  extends: 'foam.u2.Controller',

  imports: [
    'fileDAO'
  ],

  css: `
    ^text {
        overflow-y: auto;
        height: 500px;
        width: 100%;
        border: 1px solid #DDD;
        padding: 10px;
    }

    ^pdf embed {
      width: 100%;
      height: 500px;
    }
  `,

  properties: [
    {
      name: 'fileId'
    }
  ],

  methods: [
    async function render() {
      this.SUPER();
      // Temporary fix for agreement view. Update after
      // https://nanopay.atlassian.net/browse/NP-5158 done
      
//      let file = await this.fileDAO.find(this.fileId);
//      if ( file ) {
//        if ( file.mimeType === "application/pdf" ) {
          const url = window.location.origin + "/service/file/" + this.fileId;

            this.addClass(this.myClass("pdf"))
            .start('embed')
              .attrs({
//                'src': URL.createObjectURL(file.data.blob),
                'src': url,
                'type': 'application/pdf'
//                'type': file.mimeType
              })
            .end();
//        } else if ( file.mimeType === "plain/text" ) {
//          let text = await file.getText();
//          this
//            .addClass(this.myClass("text"))
//            .start("p")
//              .add(text)
//            .end();
//        }
//      }
    }
  ]
})
