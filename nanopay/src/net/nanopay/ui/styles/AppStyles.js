
foam.CLASS({
  package: 'net.nanopay.ui.style',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that is used through out the Nanopay platform. Please Reference when styling views. Implements to class use.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

        body {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #373a3c;
          background: #edf0f5;
          margin: 0;
        }
        table {
          border-collapse: collapse;
          margin: auto;
          width: 960px;
        }
        thead tr {
          height: 48px;
        }
        thead > tr > th {
          font-size: 14px;
          background: #dfe8ee;
          padding-left: 15px;
        }
        tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }
        tbody > tr {
          height: 60px;
          background: white;
        }
        tbody > tr > td {
          font-size: 12px;
          padding-left: 15px;
        }
        .foam-u2-ActionView-create{
          background: #59aadd !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
          font-weight: 100 !important;
          width: 135px;
          height: 39px;
          position: relative;
          top: -40;
        }
        .foam-u2-ActionView-back{
          position: absolute;
          top: 110px;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1) !important;
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: black;
        }
        .foam-u2-view-ReciprocalSearch-filter {
          margin-bottom: 8px;
        }
        .foam-u2-search-TextSearchView input {
          width: 340px;
          font-size: 10pt;
          padding: 3px;
        }
        .foam-u2-search-GroupBySearchView select {
          font-family: monospace;
          font-size: 10pt;
          width: 340px;
        }
        .foam-u2-ActionView {
          width: 135px;
          height: 40px;
          border-radius: 2px;
          text-align: center;
          display: inline-block;
          cursor: pointer;
          margin: 0px 5px 0px 0px;
          font-size: 14px;
          padding: 0;
        }
        .foam-u2-ActionView-deleteDraft {
          background-color: rgba(164, 179, 184, 0.1);
          border: solid 1px #8C92AC;
          color: #093649;
          font-size: 14px;
        }
        .foam-u2-ActionView-saveAndPreview {
          background-color: #59AADD;
          color: white;
          font-size: 14px;
          border: 1px solid #59AADD;
        }
        .foam-u2-ActionView-saveAsDraft {
          background-color: #EDF0F5;
          border: solid 1px #59A5D5;
          color: #59A5D5;
        }
        
        
        .input-box{
          width: 90%;
          height: 60px;
          margin-left: 5%;
          font-size: 12px;
          font-weight: 300;
          color: #093649;
          text-align: left;
        }
         .half-input-box {
           width: 50%;
           height: 60px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           padding-right: 5px;
           display: block;
           margin-top: 8px;
           outline: none;
         }
         .half-small-input-box {
           width: 50%;
           height: 40px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           padding-right: 5px;
           display: block;
           margin-top: 8px;
           outline: none;
         }
        .small-input-box{
          font-size: 12px;
          padding: 0px 5px;
          width: 215px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
        }
        .blue-button{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: #59aadd;
          cursor: pointer;
          text-align: center;
          color: #ffffff;
          font-size: 14px;
          line-height: 2.86;
          margin: 20px 20px;
          float: right;
        }
        .white-blue-button{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59A5D5;
          color: #59A5D5;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
        }
        .full-width-button{
          width: 90%;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59a5d5;
          margin-left: 20px;
          background-color: #59aadd;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
          color: #ffffff;
          margin-top: 10px;
        }
        .full-width-input{
          width: 90%;
          height: 40px;
          margin-left: 5%;
          margin-bottom: 15px;
        }
        .label{
          height: 16px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          text-align: left;
          color: #093649;
          margin-bottom: 8px;
          margin-left: 20px;
        }
        .link{
          color: #59a5d5;
          cursor: pointer;
        }
        .light-roboto-h2 {
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          color: #093649;
          opacity: 0.6;
          margin-bottom: 35px;
          display: inline-block;
          width: 200px;
        }
        .green-border-container{
          display: inline-block;
          border-radius: 4px;
          border: solid 1px #1cc2b7;
        }
         .button-row {
           width: 1004px;
           margin-bottom: 30px;
         }
         .white-container {
           width: 964px;
           background: white;
           padding: 20px;
         }
        .inline{
          display: inline-block;
        }
        .hide{
          display: none;
        }
        .float-right{
          float: right;
        }
        .float-left{
          float: left;
        }
        .thin-align{
          font-weight: 100;
          margin: 10px 0 0 0;
        }
        .blue-card-title{
          display: block;
          width: 135px;
          height: 70px;
          padding-top: 30px;
          border-radius: 2px;
          background-color: #59aadd;
          text-align: center;
          color: white;
          font-weight: 16px;
          display: inline-block;
        }
      */}
    })
  ]
});