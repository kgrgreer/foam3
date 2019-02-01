foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'SigningOfficerForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fourth step in the business registration wizard,
    responsible for collecting signing officer information.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'net.nanopay.model.PersonalIdentification',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'user',
    'menuDAO',
    'viewData'
  ],

  css: `
    ^ {
      width: 488px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-top: 5px;
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
      padding-left: 5px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
      margin-top: 8px;
    }
    ^ .foam-u2-md-CheckBox-label {
      margin-top: -5px;
      margin-left: 10px;
      position: absolute;
      width: 450px;
    }
    ^ .inline {
      margin: 5px;
    }
    ^ .blue-box {
      width: 100%;
      padding: 15px;
      background: #e6eff5;
    }
    ^ .label-width {
      width: 200px;
      margin-left: 0px;
      margin-bottom: 20px;
    }
    ^ .question-container {
      width: 200px;
      margin-left: 0;
      margin-bottom: 40px;
    }
    ^ .radio-button {
      margin-top: 50px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .net-nanopay-ui-ActionView-uploadButton {
      margin-top: 20px;
    }

    ^ .net-nanopay-ui-ActionView-addUsers {
      height: 40px;
      width: 250px;
      background: none;
      color: #8e9090;
      font-size: 16px;
      text-align: left;
    }

    ^ .net-nanopay-ui-ActionView-addUsers:hover {
      background: none;
      color: #8e9090;
    }

    ^ .termsAndConditionsBox {
      position: relative;
      padding: 13px 0;
      width: 200px;
      top: 15px;
    }

    ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
      background-color: white;
      margin-top: 16px;
      min-height: 264px;
    }

    ^ .checkBoxes {
      padding-top: 30px;
      padding-bottom: 30px;
    }

    ^ .property-birthdayField {
      width: 100%;
    }
    
    ^ input[type='checkbox']:checked:after {
      width: 16px;
      height: 18px;
      left: -2px;
      top: -2px;
    }

    ^ input[type='checkbox']:focus{
      border: solid 2px #5a5a5a;
    }
  `,

  properties: [
    {
      name: 'signingOfficer',
      documentation: 'Radio button determining if user is the signing officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        this.nextLabel = this.viewData.agent.signingOfficer ? 'Next' : 'Complete';
        this.hasSaveOption = this.viewData.agent.signingOfficer;
        return this.viewData.agent.signingOfficer ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.nextLabel = n === 'Yes' ? 'Next' : 'Complete';
        this.viewData.agent.signingOfficer = n === 'Yes';
        this.hasSaveOption = n === 'Yes';
      }
    },
    {
      name: 'politicallyExposed',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ],
        value: 'No'
      },
      factory: function() {
        return this.viewData.agent.PEPHIORelated ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.agent.PEPHIORelated = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'firstNameField',
      documentation: 'First name field.',
      postSet: function(o, n) {
        this.viewData.agent.firstName = n;
      },
      factory: function() {
        return this.viewData.agent.firstName;
      },
    },
    {
      class: 'String',
      name: 'lastNameField',
      documentation: 'Last name field.',
      postSet: function(o, n) {
        this.viewData.agent.lastName = n;
      },
      factory: function() {
        return this.viewData.agent.lastName;
      },
    },
    {
      class: 'String',
      name: 'jobTitleField',
      documentation: 'Job title field.',
      postSet: function(o, n) {
        this.viewData.agent.jobTitle = n;
      },
      factory: function() {
        return this.viewData.agent.jobTitle;
      },
    },
    {
      class: 'String',
      name: 'phoneNumberField',
      documentation: 'Phone number field.',
      postSet: function(o, n) {
        this.viewData.agent.phone.number = n;
      },
      factory: function() {
        return this.viewData.agent.phone.number;
      },
    },
    {
      class: 'String',
      name: 'emailField',
      documentation: 'Email address field.',
      postSet: function(o, n) {
        this.viewData.agent.email = n;
      },
      factory: function() {
        return this.viewData.agent.email;
      },
    },
    {
      class: 'FObjectProperty',
      name: 'addressField',
      factory: function() {
        return ! this.viewData.agent.address ? this.Address.create({}) : this.viewData.agent.address;
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      postSet: function(o, n) {
        this.viewData.agent.address = n;
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocs',
      documentation: 'Additional documents for identification of an agent.',
      factory: function() {
        return this.viewData.agent.additionalDocuments ? this.viewData.agent.additionalDocuments : [];
      },
      postSet: function(o, n) {
        this.viewData.agent.additionalDocuments = n;
      }
    },
    {
      name: 'principalTypeField',
      value: 'Shareholder',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['Shareholder', 'Owner', 'Officer']
      },
      postSet: function(o, n) {
        this.viewData.agent.principleType = n;
      },
      factory: function() {
        return this.viewData.agent.principleType.trim() !== '' ? this.viewData.agent.principleType :
          'Shareholder';
      },
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      view: { class: 'net.nanopay.ui.PersonalIdentificationView' },
      factory: function() {
        return this.viewData.agent.identification ? this.viewData.agent.identification : this.PersonalIdentification.create({});
      },
      postSet: function(o, n) {
        this.viewData.agent.identification = n;
      },
    },
    {
      class: 'Boolean',
      name: 'termsCheckBox',
      factory: function() {
        return this.viewData.termsCheckBox;
      },
      postSet: function(o, n) {
        this.viewData.termsCheckBox = n;
      }
    },
    {
      class: 'Date',
      name: 'birthdayField',
      factory: function() {
        return this.viewData.agent.birthday;
      },
      postSet: function(o, n) {
        this.viewData.agent.birthday = n;
      }
    },
    {
      class: 'Boolean',
      name: 'canadianScrollBoxOne',
      postSet: function(o, n) {
        this.viewData.canadianScrollBoxOne = n;
      },
      factory: function() {
        return this.viewData.canadianScrollBoxOne = false;
      }
    },
    {
      class: 'Boolean',
      name: 'canadianScrollBoxTwo',
      postSet: function(o, n) {
        this.viewData.canadianScrollBoxTwo = n;
      },
      factory: function() {
        return this.viewData.canadianScrollBoxTwo = false;
      }
    },
    {
      class: 'Boolean',
      name: 'americanScrollBox',
      postSet: function(o, n) {
        this.viewData.americanScrollBox = n;
      },
      factory: function() {
        return this.viewData.americanScrollBox = false;
      }
    },
    {
      class: 'Boolean',
      name: 'isCanadian',
      expression: function(viewData) {
        var areYouCAD = false;
        if ( foam.util.equals(viewData.user.businessAddress.countryId, 'CA') ) {
          areYouCAD = true;
        }
        viewData.isCanadian = areYouCAD;
        return areYouCAD;
      }
    },
    {
      class: 'String',
      name: 'triPartyAgreementCad',
      view: function(args, x) {
        var data = x.data$.dot('triPartyAgreementCad');
        return foam.u2.HTMLElement.create({ nodeName: 'div' }).
        style({ 'max-height': '200px', 'overflow-y': 'scroll', border: '1px inset', background: 'lightgray', 'border-radius': '5px', padding: '10px'}).
        add(data);
      },
      displayWidth: 60,
      value: `
      <p><strong>Tri-Party Agreement for Ablii Payments Service &ndash; Canada Agreement</strong></p>
<p>&nbsp;</p>
<p><span style="font-weight: 400;">This Agreement is a contract between you, nanopay corporation (&ldquo;</span><strong>nanopay</strong><span style="font-weight: 400;">&rdquo;) and our financial institution partner, AscendantFX Capital, Inc. (&ldquo;</span><strong>AFX</strong><span style="font-weight: 400;">&rdquo;), and applies to your use of nanopay&rsquo;s payment software platform and any AFX products and services you access via nanopay&rsquo;s payment software platform, such as &nbsp;foreign exchange services (the &ldquo;</span><strong>Foreign Exchange Services</strong><span style="font-weight: 400;">&rdquo;), i.e., the conversion of one currency into another (for example, US dollars into Canadian dollars) and for remittance services (the &ldquo;</span><strong>Remittance Services</strong><span style="font-weight: 400;">&rdquo;) (as defined below). &nbsp;</span></p>
<p><span style="font-weight: 400;">It is important that you carefully read and understand this Agreement and keep it for your records since its terms and conditions governs your interactions not only with nanopay but also with AFX. &nbsp;Capitalized terms used in this Agreement and not otherwise defined will have the meanings assigned to them by nanopay&rsquo;s Terms of Service located at: </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;">. &nbsp;Also, as set forth below, this Agreement contains a binding arbitration provision, which affects your legal rights and may be enforced by the parties.</span></p>
<ol>
<li style="font-weight: 400;"><strong>Definitions. </strong></li>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>AFX</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in the preamble. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>AFX Custodial Account</em></strong><span style="font-weight: 400;">&rdquo; means a deposit account maintained by AFX at a federally-or-provincially insured depository institution in which it will receive and hold all funds from Customers associated with Remittances (the &ldquo;</span><strong><em>AFX Custodial Account</em></strong><span style="font-weight: 400;">&rdquo;). &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Applicable Law</em></strong><span style="font-weight: 400;">&rdquo; means (a) the Rules, (b) the bylaws, operating rules and/or regulations of any System, and (c) any and all foreign, federal, state or local laws, treaties, rules, regulations, regulatory guidance, directives, policies, orders or determinations of (or agreements with), and mandatory written direction from (or agreements with), a Regulatory Authority, including, without limitation, the Bank Secrecy Act and the regulations promulgated thereunder, as well as the Proceeds of Crime (Money Laundering) and Terrorist Financing Act and the regulations promulgated thereunder, and also all statutes or regulations relating to money transmission, unfair or deceptive trade practices or acts, or privacy or data security, that are applicable to the remittance services (as set forth below), or otherwise applicable to all of the parties to this Agreement, as the same may be amended and in effect from time to time during the Term. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Bank</em></strong><span style="font-weight: 400;">&rdquo; means an entity chartered by a state or federal government which receives demand and time deposits, may pay interest on those deposits and makes loans and invests in securities based on those deposits.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Bank Draft</em></strong><span style="font-weight: 400;">&rdquo; means a check drawn by a Bank on itself authorizing the second Bank to make payment to the business named in the draft.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Business Day</em></strong><span style="font-weight: 400;">&rdquo; means any day, other than a Saturday, Sunday or any federal banking holiday observed in Canada. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Confidential Information</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section</span> <span style="font-weight: 400;">12.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Customer</em></strong><span style="font-weight: 400;">&rdquo; means a User that has access to and uses the Remittance Service.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Customer Account</em></strong><span style="font-weight: 400;">&rdquo; means the deposit account that you link through the Platform to your account at AFX for the Remittance Services. &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Currency</em></strong><span style="font-weight: 400;">&rdquo; means any form of money, including paper notes and coins, which is issued by a government and is used in public circulation.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Event of Default</em></strong><span style="font-weight: 400;">&rdquo; means an Event of Default as defined in Section 11.04.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>EFT</em></strong><span style="font-weight: 400;">&rdquo; means Electronic Funds Transfer which is a transaction that takes place over a computerized network (i.e. bank wire transfer; ACH, PAD) either between accounts at the same financial institution or between deposit accounts at separate financial institutions.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Financial Institution</em></strong><span style="font-weight: 400;">&rdquo; means an institution that collects funds from the public and places them into financial assets, such as deposits, loans, and bonds, rather than tangible property.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>FINTRAC</em></strong><span style="font-weight: 400;">&rdquo; means the Financial Transactions and Reports Analysis Centre of Canada. &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Foreign Exchange</em></strong><span style="font-weight: 400;">&rdquo; means the trade of one national Currency for another and takes place &ldquo;over the counter&rdquo; and centrally on an inter-bank system.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Foreign Exchange Rate</em></strong><span style="font-weight: 400;">&rdquo; means the rate at which one Currency may be converted into another Currency. &nbsp;Also known as rate of exchange or exchange rate or Currency exchange rate.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Foreign Exchange Services</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 8.05.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>nanopay</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in the preamble. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Person</em></strong><span style="font-weight: 400;">&rdquo; means any individual, corporation, limited liability company, partnership, firm, joint venture, association, trust, unincorporated organization or other entity. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Platform</em></strong><span style="font-weight: 400;">&rdquo; has the meaning set forth in Section 2.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Remittance</em></strong><span style="font-weight: 400;">&rdquo; means funds that are remitted electronically from your Customer Account to a Payee by AFX in accordance with this Agreement.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Remittance Instructions</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 8.03.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Remittance Services</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 8.01.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Settlement</em></strong><span style="font-weight: 400;">&rdquo; means the finalizing of the sale of a Currency, as its title is transferred from the seller to the buyer. &nbsp;Also known as closing.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Settlement Date</em></strong><span style="font-weight: 400;">&rdquo; means the date by which an executed Currency transaction must be settled, by paying for the Currency purchased and delivering the purchased Currency to the buyer.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Transaction</em></strong><span style="font-weight: 400;">&rdquo; means the movement of value using the Platform from payment initiation by a Payor to settlement, using the Platform and includes Remittances Services.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Transaction Confirmation</em></strong><span style="font-weight: 400;">&rdquo; means the transaction confirmation as defined in Section 8.04 of this Agreement.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>User</em></strong><span style="font-weight: 400;">&rdquo; has the meaning set forth in Section 2.</span></li>
</ol>
<li style="font-weight: 400;"><strong>Background.</strong><span style="font-weight: 400;"> &nbsp;You understand and agree that nanopay is a technology service provider that offers a payment software platform user interface through which, among other things, nanopay&rsquo;s business customers (each, a &ldquo;</span><strong><em>User</em></strong><span style="font-weight: 400;">&rdquo;) may access certain features and functionality, including the ability to upload and transmit invoices to other businesses for which they act as vendors, and the ability to communicate with third-party payment service providers for the purpose of utilizing payment services offered by such providers (the &ldquo;</span><strong><em>Platform</em></strong><span style="font-weight: 400;">&rdquo;). AFX is a registered as a Money Services Business with the Financial Transactions and Reports Analysis Centre of Canada (</span><strong>FINTRAC</strong><span style="font-weight: 400;">). AFX is engaged in the business of, among other things, providing domestic and cross-border remittance solutions and foreign exchanges services to businesses.</span></li>
<li style="font-weight: 400;"><strong>nanopay and AFX Duties.</strong><span style="font-weight: 400;"> You understand and agree that all funds transfers are performed by AFX based on instructions received through the Platform. </span><strong>nanopay is solely the Platform provider and does not receive, hold, or transmit funds</strong><span style="font-weight: 400;">. &nbsp;AFX holds the AFX Custodial Account that holds your funds and performs the Foreign Exchange Services and the Remittance Services. &nbsp;</span></li>
<li style="font-weight: 400;"><strong>Statutory Trust</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that any funds held for Remittance that are recorded on the Platform, are held by AFX in the AFX Custodial Account. &nbsp;</span></li>
<li style="font-weight: 400;"><strong>Compliance with Applicable Law and Regulation</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">By accessing and using the Platform and the associated AFX services and products, such as Foreign Exchange Services and Remittance Services, you agree to comply with all applicable laws and regulations and you further agree not to engage in any transaction involving any illegal activity, product or service. Without limiting the foregoing, you agree you will not violate: (i) any applicable domestic or foreign anti-corruption law or regulation, including the United Kingdom Bribery Act of 2010, the United States Foreign Corrupt Practices Act and the Canadian Corruption of Foreign Public Officials Act; (ii) any applicable domestic or foreign laws or regulations related to Anti-Money Laundering and anti-terrorist financing requirements, including the USA Bank Secrecy Act, as amended by the USA Patriot Act and the Financial Conduct Authority&rsquo;s Anti-Money Laundering Regulations, and the Canadian Proceeds of Crime (Money Laundering) and Terrorist Financing Act and Regulations; (iii) the sanctions laws and regulations administered by the U.S. Department of the Treasury&rsquo;s Office of Foreign Assets Control, the Canadian sanctions legislation overseen by Global Affairs; and (iv) applicable data protection and privacy laws such as the Canadian Personal Information Protection and Electronic Documents Act (&ldquo;</span><strong>PIPEDA</strong><span style="font-weight: 400;">&rdquo;) and the European Union&rsquo;s General Data Protection Regulations 2016/679. &nbsp;Furthermore, you and your affiliates and agents shall not utilize the Platform and the associated AFX products and services in a manner that could cause nanopay or AFX to violate any of the foregoing laws and regulations or other applicable laws and regulations to which nanopay and AFX may be subject.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that if either nanopay or AFX in their sole discretion suspect or believe you are violating or may violate applicable laws or regulations, then either nanopay or AFX may refuse to accept your instructions regarding a Transaction or complete a Remittance already in process.</span></li>
</ol>
</ol>
<ol>
<li style="font-weight: 400;"><strong>Your Representations</strong><span style="font-weight: 400;">.</span> <span style="font-weight: 400;">To access and use the Platform and the associated AFX products and services, you represent and warrant that:</span></li>
</ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">You have full authority to enter into this Agreement and carry out its obligations under the Agreement;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">This Agreement has been duly authorized by you;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">This Agreement is binding on you and does not conflict with or violate the terms of any constating documents of yours or of any other agreements pursuant to which you are bound;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">No Event of Default has occurred under the terms of this Agreement;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You hold a deposit account in your name, over which you exercise legal authority and control that will be the source of funds for Remittances using the Platform;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You are not an agent acting for an undisclosed principal or third-party beneficiary; </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">All information provided by you as part of your registration and use of the Platform and the associated AFX products and services is accurate and complete, and you undertake to promptly notify nanopay and AFX of changes to such information; </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You will ensure that your contact details provided at your registration remain accurate and up to date. Nanopay and AFX will use those contact details to contact you wherever required under this Agreement or in connection with the Platform and the associated AFX products and services; and</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">All representations and warranties made by you shall be true at the time the parties entered into this Agreement and at the time any Remittances are entered into pursuant to the terms of this Agreement.</span></li>
</ol>
<ol>
<li style="font-weight: 400;"><strong>Prohibited Uses</strong><span style="font-weight: 400;">. &nbsp;For avoidance of doubt, you agree</span><strong> not</strong><span style="font-weight: 400;"> to use the Platform and the associated AFX products and services in the following manner:</span></li>
</ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of any prohibited or illegal good or service or activity that requires a government license where you lack such a license;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of marijuana, marijuana paraphernalia, regardless of whether or not such sale is lawful in your jurisdiction;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of any material that promotes violence or hatred;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of adult content;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale and distribution of goods and services that violate the intellectual property rights of a third party;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or exchange of cryptocurrencies;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">As part of a Ponzi-scheme or pyramid selling</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">As part of any gambling or regulated financial services you may provide; or </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of firearms or weapons, military or semi-military goods, military software or technologies, chemicals, prescription medications, seeds or plants, dietary supplements, alcoholic beverages, tobacco goods, jewels, precious metals or stones.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">For avoidance of doubt, any attempt to use the Platform and the associated AFX products and services in a prohibited manner shall constitute an Event of Default as defined below.</span></li>
</ol>
<ol>
<li style="font-weight: 400;"><strong>Services</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<p><span style="font-weight: 400;">8.01 As a User, you may be eligible for the Foreign Exchange Services and the Remittance Services as follows:</span></p>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Domestic money remittances from one business to another within Canada;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">International ETFs EFTs (money remittances) from a business in Canada to a business in another country;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Foreign Exchange Services; and</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">International Receipt of Funds (the services set out in subsections 8.01(a), 8.01(b) and 8.01(d) are collectively the &ldquo;</span><strong>Remittance Services</strong><span style="font-weight: 400;">&rdquo; referred to in this Agreement).</span></li>
</ol>
<p><span style="font-weight: 400;">8.02 You can provide instructions to nanopay and AFX via the Platform according to the process set out below in Section 8.03. AFX (and nanopay) may modify or discontinue the available services set forth above from time to time. AFX and nanopay will not be liable to you for any damages resulting from the discontinuance or modification of any service provided pursuant to this Agreement. </span></p>
<p><span style="font-weight: 400;">8.03. You will access the Platform and you will send your remittance instructions via the Platform to &nbsp;AFX. Your instructions must include (i) the name, address, financial institution and account number of the payee, (ii) the amount you wish to send, (iii) the applicable transaction currency, (iv) your financial institution, name on the account and account number and, (v) such other information that may be requested by either nanopay or AFX from time to time (collectively, the &ldquo;</span><strong>Remittance Instructions</strong><span style="font-weight: 400;">&rdquo;). &nbsp;&nbsp;</span></p>
<p><span style="font-weight: 400;">8.04 The Platform will transmit your Remittance Instructions to AFX and AFX will perform the </span> <span style="font-weight: 400;">following actions: &nbsp;</span></p>
<ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Provide you with a confirmation of the Remittance Instructions by way of the Platform, including the date of the transaction, the currency and amount of the Remittance, the Payee name, the transaction number and a client ID number, the Foreign Exchange Rate and value date if applicable, any applicable fees or charges, and any relevant disclosure(s) as required by law (collectively, the &ldquo;</span><strong>Transaction Confirmation&rdquo;)</strong><span style="font-weight: 400;">. &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Deem you have accepted the contents of the Transaction Confirmation unless you inform AFX of any errors or omissions upon receiving it and prior to the execution of the transaction by AFX. You shall not thereafter be entitled to dispute the contents of the Transaction Confirmation. &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Receive funds by way of EFT from your Customer Account in an amount equal to the Remittance you are sending to the payee plus any applicable fees, into the AFX Custodial Account once you have authorized and accepted the Transaction Confirmation. </span></li>
</ol>
</ol>
</ol>
<ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Funds should be provided to AFX via EFT. &nbsp;If you send funds by wire transfer, AFX will provide you with instructions to send the funds to an FDIC insured AFX Custodial Account. The instructions will include the bank name and address, ABA routing number, SWIFT code, IBAN, account number and any additional information. &nbsp;For instructions by you to direct debit your account, and AFX consents, you will be required to give AFX written authorization. and provide a VOID check.</span></li>
</ol>
</ol>
</ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">To validate your account information, AFX may rely on one or more of the following:</span></li>
</ol>
<ol>
<ol>
<ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">A Void Cheque;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">A bank statement that is no older than ninety (90) days; &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Confirmation of a micro deposit made to your account; and, </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Instant Account Verification by way of an approved 3</span><span style="font-weight: 400;">rd</span><span style="font-weight: 400;"> party service provider. </span></li>
</ol>
</ol>
</ol>
</ol>
</ol>
<p>&nbsp;</p>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Effectuate a remittance from the AFX Custodial Account to the relevant payee account in such amounts and currency, and at such time(s), as set forth in such instructions. &nbsp;</span></li>
</ol>
</ol>
<p><strong>Transactions Requiring Foreign Exchange</strong><span style="font-weight: 400;">.</span></p>
<ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">For transactions requiring Foreign Exchange Services, the conversion of one Currency into another Currency, the terms of each such transactions will be set out in the Transaction Confirmation.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Deem you to have accepted the contents of the Transaction Confirmation, unless you inform AFX of any errors or omissions upon receiving it prior to the execution of the Remittance by AFX. &nbsp;You shall not thereafter be entitled to dispute the contents of the Transaction Confirmation. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Once you have authorized and accepted the Transaction Confirmation, AFX will receive funds by way of EFT from your Customer Account in an amount equal to the Remittance you are sending to the payee </span><strong>[</strong><span style="font-weight: 400;">plus any applicable fee(s) included in the Remittance Instructions, into the AFX Custodial Account. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">AFX reserves the right to correct any quoting error in the rate applicable to each transaction should an obvious error or mistake occur. &nbsp;In the event of an error stipulating the applicable rate for a transaction, the error shall be corrected by AFX with reference to the fair market of the Currency at the time that the error occurred, as determined by AFX acting fairly and reasonably according to the particular circumstances surrounding the transaction in question</span></li>
</ol>
</ol>
</ol>
<p>&nbsp;</p>
<ul>
<li><strong><strong>Monies Owing for Services</strong></strong></li>
</ul>
<p>&nbsp;</p>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Under any circumstances where you owe monies to AFX as a result of Services received pursuant to this Agreement or pursuant to any duly authorized and accepted Transaction Confirmation, AFX will set out in the Transaction Confirmation the sum of money that is outstanding. &nbsp;Upon receipt of the Transaction Confirmation, you shall have until 5:00 p.m. EST on the next business day to provide AFX the amount stipulated in the Transaction Confirmation.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Any deposits you provide to AFX will be applied by AFX in its sole discretion to any outstanding amounts you owe for completed Transactions, applied to other amounts you owe to AFX or nanopay, or the deposit shall be returned to you.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">AFX will hold such funds on your behalf pursuant to the terms of any instructions you have provided and the terms of the Transaction Confirmation until the Settlement Date or the other closing date.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">AFX will use commercially reasonable efforts to process Transactions on the day in which they are authorized however, AFX cannot guarantee that this will always be possible. &nbsp;Furthermore, AFX is not responsible for the time it takes any Financial Institution and the payee&rsquo;s Bank and/or Financial Institution to process transactions or any other delays related to international and domestic payment systems to process the Transactions.</span></li>
</ol>
</ol>
<p>&nbsp;</p>
<ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">If you wish to cancel, amend or reverse a Transaction for any reason, you may attempt to do so by contacting AFX via the Platform. &nbsp;AFX will use commercially reasonable efforts to try too effect such cancellation, amendment or reversal, all at your cost and account. &nbsp;However, you acknowledge that the requested change to the transaction may not be reasonably possible and that AFX is not required to cancel, amend or reverse any transactions once you have authorized and accepted the Transaction Confirmation. </span></li>
</ol>
</ol>
</ol>
<ol>
<li style="font-weight: 400;"><strong>Eligibility</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">For purposes of reviewing your eligibility to use the Platform and the associated AFX products and services, you understand and agree that nanopay or AFX may request at any time, and you agree to provide, any information about your business operations and/or financial condition. A primary reason for these requests is to help governments fight the funding of terrorism and money laundering activities. We are therefore required to obtain, verify and record information about each client to whom we provide services, such as names, addresses, email addresses, certificates or articles of incorporation, and, should we deem it necessary, government issued photo identification documents like drivers licenses and passports. &nbsp;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You agree in particular to providing AFX and nanopay with all necessary banking information, that AFX and nanopay reasonably require to carry out their obligations under this Agreement. &nbsp;In addition, you hereby authorize and consent to AFX and nanopay:</span></li>
</ol>
</ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Contacting your bank to verify your identity, account information and any other information that AFX or nanopay may reasonably require from your bank; and </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Obtaining a credit report about you from a recognized third-party provider to verify relevant information about you, including but not limited to your payment history; and</span></li>
</ol>
<ol>
<li style="font-weight: 400;"><strong>Continuous Risk Review Process</strong><span style="font-weight: 400;">. Both nanopay and AFX reserve the right to reassess your eligibility for any services and products and based on such reassessment and nanopay&rsquo;s or AFX&rsquo;s risk review processes deny your request to use the Platform and the associated AFX services and products or reassess your eligibility to use them even if your initial request is successful. &nbsp;Nanopay and AFX may modify eligibility standards for the Platform and the associated AFX products and services at any time.</span></li>
<li style="font-weight: 400;"><strong>Termination</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<p><span style="font-weight: 400;">11.01 nanopay and/or AFX may terminate this Agreement at any time without notice.</span></p>
<p><span style="font-weight: 400;">11.02 You may terminate this Agreement at any time by providing written notice to both nanopay and AFX (an email to the support functions of both companies will satisfy this obligation).</span></p>
<p><span style="font-weight: 400;">11.03 Provided that no Event of Default has occurred, all transactions that were entered into prior to the termination of this Agreement shall be carried out to completion and this Agreement shall not terminate until all obligations of the parties to this Agreement have been fully completed.</span></p>
<p><span style="font-weight: 400;">11.04 The following shall constitute an &ldquo;</span><strong>Event of Default</strong><span style="font-weight: 400;">&rdquo; under the terms of this Agreement:</span></p>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">You do not perform your obligations under this Agreement on time, including those obligations set out in Sections 5 and 6;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You perform one of the prohibited actions set out in Section 7;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You make a misrepresentation of any of the representations and warranties set out Section 6, or if you make a statement to AFX or nanopay that is untrue or misleading in any material respect, e.g., the source of funds, the identity of the recipient of funds, the purpose of the Transaction; and </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">You become bankrupt or insolvent or commit an act of bankruptcy.</span></li>
</ol>
</ol>
<p><span style="font-weight: 400;">11.05. In the event that there is an Event of Default by you, then AFX and nanopay may, at their sole option, either terminate your access to the Platform and withhold all further services and use of products or terminate this Agreement immediately and the parties to it shall be relieved of any further obligations under this Agreement, including obligations pursuant to any Transactions that were entered into prior to the occurrence of the Event of Default. &nbsp;Either AFX or nanopay may terminate this Agreement by providing written notice to the other parties (an email to other the parties will satisfy this obligation). </span></p>
<ol>
<li style="font-weight: 400;"><strong>Confidentiality</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<p><span style="font-weight: 400;">12.01 nanopay and AFX will use commercially reasonable precautions in order to ensure that any confidential information you provide to nanopay and AFX will be kept private and confidential.</span></p>
<p><span style="font-weight: 400;">12.02. &nbsp;nanopay and AFX shall maintain and protect all of your confidential information using the same standards of care and affording such confidential information the same treatment that they use to protect their own confidential information, but under no circumstances less than a reasonable standard of care.</span></p>
<p><span style="font-weight: 400;">12.03 With regard to confidential information that can be considered to be &ldquo;Personally Identifiable Information,&rdquo; both nanopay and AFX employ certain encryption technologies to ensure the upmost protection for such Personally Identifiable Information.</span></p>
<p><span style="font-weight: 400;">12.04 AFX and nanopay may use your information, whether confidential information, Personally Identifiable Information, or otherwise solely for their own internal business purposes.</span></p>
<p><span style="font-weight: 400;">12.05 AFX and nanopay may disclose your confidential information, Personally Identifiable Information or otherwise to their employees, agents, officers, or affiliates in the course of providing Services to you pursuant to the Agreement, provided that such employees, agents, officers, or affiliates are subject to confidentiality obligations no less stringent than the terms contained herein.</span></p>
<p><span style="font-weight: 400;">12.06. AFX and nanopay may disclose your information, whether confidential information, Personally Identifiable Information, or otherwise to any third party service provider, e.g., Amazon World Services (where necessary and only to the minimum extent required), governmental or regulatory body, or agency necessary for you to receive Services pursuant to this Agreement or to comply with any Applicable Laws, requirements, court orders or agency or regulatory body orders, demands or examinations, or otherwise.</span></p>
<ol>
<li style="font-weight: 400;"><strong>Your Security Obligations</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that you are responsible for the security of data in your possession or control and you are responsible for your compliance with all applicable laws and rules in connection with your collection of personal, financial, or transaction information on your website(s). &nbsp;You are also responsible for maintaining adequate security and control over your access to the Platform and the associated AFX products and services, including all credentials, e.g., passwords, and ensuring that your employees, contractors and/or agents comply with these security requirements and all other terms of this Agreement.</span></li>
<li style="font-weight: 400;"><strong>Multiple Registrations Are Prohibited</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that multiple registrations are prohibited. You may only register once and each User must maintain a separate registration. &nbsp;If nanopay or AFX detect multiple active registrations for a single User, we reserve the right to merge or terminate the registrations and refuse you all continued use of the Platform and the associated AFX products and services without notification to you.</span></li>
<li style="font-weight: 400;"><strong>Right of Set Off.</strong><span style="font-weight: 400;"> &nbsp;You agree that nanopay and AFX are authorized at any time to set-off funds deposited with AFX against your debts or liabilities owed to either nanopay and/or AFX. &nbsp;Neither AFX or nanopay shall be required to provide you prior notice of the exercise of such set off right.</span></li>
<li style="font-weight: 400;"><strong>Our Relationship Is One of Electronic Commerce</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">You understand that the Platform and the associated AFX products and services constitute an electronic commerce relationship. To provide you the Platform and the associated AFX products and services, we must have your consent to provide access to required disclosures in electronic format. &nbsp;If you do not consent to electronic disclosure of these documents, then you may not use the Platform and the associated AFX products and services. Your consent applies to all of the documents we provide to you electronically in connection with the Service, including receipts and notices. </span></li>
</ol>
</ol>
<p><span style="font-weight: 400;">16.02 Access to electronic disclosures will be provided by way of the Internet. Your history of use is available for viewing online from your account on the AFX and nanopay Websites. &nbsp;If you require a printed copy of your full printed copy of your transaction history, you can request this in writing by sending an email communication to: [</span><span style="font-weight: 400;">insert address</span><span style="font-weight: 400;">]</span></p>
<p><span style="font-weight: 400;">16.03 We recommend you download or print a copy of this Agreement for your records. &nbsp;You may download a copy of this Agreement in a pdf format. </span></p>
<p>&nbsp;</p>
<ul>
<li><strong><strong>Transmission of Information and Instructions. &nbsp;</strong></strong></li>
</ul>
<p>&nbsp;</p>
<p><span style="font-weight: 400;">17.01. You acknowledge and agree that AFX and nanopay are not liable to you for any loss or damage arising directly or in connection with the transmission of electronic data or electronic instructions through the Platform or through nanopay.net and AscendantFX.com or through any other electronic mean, or for any failure to receive any such electronic data or electronic instructions for any reason whatsoever.</span></p>
<p><span style="font-weight: 400;">17.02. &nbsp;Any electronic data or electronic instructions you send via the Platform, or to nanopay.net or AscendantFX.com received by nanopay and AFX will be deemed to be duly authorized by you and both AFX and nanopay will be entitled to rely on such electronic data or electronic instructions. &nbsp;The fact that you may not receive confirmation of receipt of such communications from AFX and/or nanopay shall not invalidate any Transactions entered into pursuant to such instructions from you.</span></p>
<ol>
<li style="font-weight: 400;"><strong>No Interest Paid</strong><span style="font-weight: 400;">. &nbsp;From time to time, AFX may receive and hold monies on your behalf in the course of providing services to you. &nbsp;You acknowledge that under such circumstances neither AFX nor nanopay will not pay interest on any such funds. These funds may be held by AFX in accounts maintained by AFX. &nbsp;You may direct the payment or application of funds by AFX but may not request the return of any funds held by AFX, if such funds are being held for an existing Transaction. </span></li>
<li style="font-weight: 400;"><strong>Privacy</strong><span style="font-weight: 400;">. &nbsp;Your privacy is very important to both nanopay and AFX. &nbsp;Given the close relationship between nanopay and AFX in providing you Services under this Agreement, you understand and affirmatively consent to allow nanopay and AFX to share information about you, including any Personally Identifiable Information and confidential information that you input into the Platform or otherwise provide to nanopay and AFX. &nbsp;In addition, both AFX and nanopay will share your information, including your Personally Identifiable Information and confidential information, with our agents, contractors and service providers so you can utilize the Platform and the associated AFX products and services, e.g., Amazon World Service, Plaid, and other parties. Please see nanopay&rsquo;s Privacy Policy, available at </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Privacy-Policy-November-28-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;">, and AFX&rsquo;s Privacy Policy Notice for Canada, available at: </span><a href="https://cdn2.hubspot.net/hubfs/1852881/Compliance/20170221" target="_blank"><span style="font-weight: 400;">https://cdn2.hubspot.net/hubfs/1852881/Compliance/20170221</span></a><span style="font-weight: 400;">, and AFX&rsquo;s Privacy Policy Notice for the United States, available at: </span><a href="https://cdn2.hubspot.net/hubfs/1852881/Compliance/AFX" target="_blank"><span style="font-weight: 400;">https://cdn2.hubspot.net/hubfs/1852881/Compliance/AFX</span></a><span style="font-weight: 400;">.</span></li>
<li style="font-weight: 400;"><strong>Our Records</strong><span style="font-weight: 400;">. </span></li>
</ol>
<p><span style="font-weight: 400;">20.01 You understand and agree that nanopay and AFX will retain a record of all the information you provide to us. &nbsp;Both nanopay and AFX will record and track your use of the nanopay Platform and AFX&rsquo;s services and products. You acknowledge and agree that both nanopay and AFX shall be entitled to use this information for their own internal business purposes.</span></p>
<ol>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that the records kept by AFX and nanopay shall be conclusive and binding on you and in the event of a dispute or formal legal action by you or nanopay and AFX.</span></li>
</ol>
</ol>
<ol>
<li style="font-weight: 400;"><strong>Limitation of Liability/Indemnity</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<p><span style="font-weight: 400;">21.01. NEITHER </span><span style="font-weight: 400;">NANOPAY OR AFX NOR THEIR RESPECTIVE AFFILIATES, EMPLOYEES, OFFICERS, DIRECTORS, AGENTS, CONTRACTORS OR AFFILIATES, INCLUDING THEIR SUCCESSORS AND ASSIGNS, SHALL BE LIABLE TO YOU OR YOUR RESPECTIVE AFFILIATES, WHETHER IN CONTRACT, TORT, EQUITY OR OTHERWISE, FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE OR EXEMPLARY DAMAGES, INCLUDING LOST PROFITS (EVEN IF SUCH DAMAGES ARE FORESEEABLE, AND WHETHER OR NOT ANY PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), ARISING FROM OR RELATING TO THIS AGREEMENT, INCLUDING, WITHOUT LIMITATION, THE WRONGFUL DEATH OR INJURY OF ANY PERSON.</span></p>
<p><span style="font-weight: 400;">21.02 The combined liability of AFX and nanopay to you shall at all times be limited to the value of the transaction from which the Claim arises.</span></p>
<p><span style="font-weight: 400;">21.03 Nanopay and AFX will use all commercially reasonable efforts to ensure that payment of monies as directed by you shall take place in a timely fashion. &nbsp;However, neither AFX Nor nor nanopay will be liable for any losses or damages suffered by you as a result of delays in the monies being received by the designated Payee.</span></p>
<p><span style="font-weight: 400;">21.04. You acknowledge and agree that the representations and warranties that you have provided in this Agreement will be relied upon by both nanopay and AFX for the purpose of determining whether or not nanopay and AFX will allow you to access and use the Platform and of the associated AFX products and services as a User. You agree to indemnify and hold nanopay and AFX and their respective officers, directors, employees, agents, contractors and security holders, including their successors and assigns, harmless from and against all losses, damages, or liabilities due to or arising out of a breach of any representation or warranty of yours as provided herein, or in any other document you have provided to either nanopay or AFX.</span></p>
<ol start="22">
<li><span style="font-weight: 400;"> &nbsp;</span><strong>Amendments To This Agreement</strong><span style="font-weight: 400;">. &nbsp;Both nanopay and AFX reserve the right to amend any of the terms and conditions in this Agreement at any time. &nbsp;All such amendments shall be effective immediately upon written notice to you (an email will satisfy this notice obligation) on a going forward basis.</span></li>
<li><span style="font-weight: 400;"> &nbsp;</span><strong>Notice</strong><span style="font-weight: 400;">. &nbsp;</span></li>
</ol>
<p><span style="font-weight: 400;">23.01 Any notice or communication in respect of this Agreement may be given in the following ways:</span></p>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">By mail or overnight courier (e.g., FedEx, UPS, DHL) to the address provided on the cover of this Agreement;</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">By facsimile to fax number provided on the cover page of this Agreement; </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">By electronic mail to the email address provided on the cover page of this Agreement; and</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">By means of a communication set via the Platform.</span></li>
</ol>
<p><span style="font-weight: 400;">23.02. Any notice sent by mail or by overnight courier shall be deemed to have been received on the date it is delivered. &nbsp;All notices sent by facsimile or by email shall be deemed to have been received on the date which the notice is sent, provided that no indication of service interruption is received by the notice sender at the time the notice is provided.</span></p>
<p><span style="font-weight: 400;">23.03 Any of the three parties to this Agreement may provide notice to the other two parties that it wishes to change its address, fax number or email address via the methods set out in Section 21.01 above at any time.</span></p>
<ol start="24">
<li><span style="font-weight: 400;"> &nbsp;</span><strong>Nanopay&rsquo;s Terms of Service Are Incorporated Into This Agreement</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that nanopay&rsquo;s Terms of Service found at</span> <a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;">.</span><span style="font-weight: 400;"> are incorporated into this Agreement by reference. In plain English, this means that all of the terms and conditions of nanopay&rsquo;s Terms of Service are part of this Agreement and are legally binding on you.</span></li>
<li><strong>Miscellaneous</strong><span style="font-weight: 400;">.</span></li>
</ol>
<p><span style="font-weight: 400;">25.01. </span><strong>Dispute Resolution</strong><span style="font-weight: 400;">. Any dispute, controversy or claim arising out of or related to this Agreement, or the interpretation, making, performance, breach, validity or termination thereof, shall be referred to finally resolved by binding arbitration in Toronto, Canada under the Canadian Arbitration Association Arbitration Rules for Arbitration by one or more neutral arbitrators appointed in accordance with said Rules. The language of the arbitration shall be English</span><span style="font-weight: 400;">. </span><span style="font-weight: 400;">At the request of any party, the arbitrator(s) will enter an appropriate protective order to maintain the confidentiality of information produced or exchanged in the course of the arbitration proceedings. Judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. The arbitrator(s) may also award to the prevailing party, if any, as determined by the arbitrator(s), its reasonable costs and fees incurred in connection with any arbitration or related judicial proceeding hereunder. Costs and fees awarded may include, without limitation, Canadian Arbitration Association administrative fees, arbitrator fees, attorneys' fees, court costs, expert fees, witness fees, travel expenses, and out-of-pocket expenses (including, without limitation, such expenses as copying, telephone, facsimile, postage, and courier fees). The arbitration proceedings contemplated by this Section 25.01 shall be as confidential and private as permitted by Applicable Law. To that end, the parties shall not disclose the existence, content or results of any proceedings conducted in accordance with this Section, and materials submitted in connection with such proceedings shall not be admissible in any other proceeding; </span><span style="font-weight: 400;">provided</span><span style="font-weight: 400;">, </span><span style="font-weight: 400;">however</span><span style="font-weight: 400;">, that this confidentiality provision shall not prevent a petition to vacate or enforce an arbitration award, and shall not bar disclosures required by Applicable Law. </span></p>
<p><span style="font-weight: 400;">25.02. </span><strong>Force Majeure</strong><span style="font-weight: 400;">. No party to this Agreement shall be liable to any other party for any failure or delay on its part to perform, and shall be excused from performing any of its non-monetary obligations hereunder if such failure, delay or non-performance results in whole or in part from any cause beyond the absolute control of the party, including without limitation, any act of God, act of war, riot, actions of terrorists, earthquake, fire, explosion, natural disaster, flooding, embargo, sabotage, government law, ordinance, rule, regulation, order or actions. A party desiring to rely upon any of the foregoing as an excuse for failure, default or delay in performance shall, when the cause arises, give to the other Party prompt notice in writing of the facts which constitute such cause; and, when the cause ceases to exist, give prompt notice thereof to the other Party. This Section 25.02 shall in no way limit the right of the other parties to make any claim against third parties for any damages suffered due to said cause. If the non-performing party&rsquo;s performance under this Agreement is postponed or extended for longer than thirty (30) days, the other two parties may, by written notice to the non-performing party, terminate this Agreement immediately.</span></p>
<p><span style="font-weight: 400;">25.03. </span><strong>Third Party Beneficiaries.</strong><span style="font-weight: 400;"> No other Customer or any other third party, other than an affiliate of a party, is a third-party beneficiary to this Agreement.</span></p>
<p><span style="font-weight: 400;">25.04. &nbsp;</span><strong>Communications Must be in English</strong><span style="font-weight: 400;">. &nbsp;All correspondence, agreements and other communications between you and nanopay and AFX shall be in the English language.</span></p>
<p><span style="font-weight: 400;">25.05. &nbsp;</span><strong>Assignment.</strong><span style="font-weight: 400;"> &nbsp;You may not assign your interest in this Agreement without the prior written consent of AFX and nanopay. &nbsp;You agree that any transaction whereby the effective control of your business changes, then such change shall be deemed an assignment for purposes of this Agreement. AFX and nanopay may assign this Agreement without prior notice to you and without your consent. &nbsp;This Agreement, including all interest in any transactions shall inure to the benefit of AFX and nanopay, their successors and assigns and shall remain binding on upon you and your respective successors and assigns. </span></p>
<p><span style="font-weight: 400;">25.06. &nbsp;</span><strong>Governing Law.</strong><span style="font-weight: 400;"> This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario without giving effect to the conflict of law principles thereof. Each party agrees that service of process in any action or proceeding hereunder may be made upon such party by certified mail, return receipt requested, to the address for notice set forth herein, as the same may be modified in accordance with the terms hereof. </span></p>
<p><span style="font-weight: 400;">25.07. &nbsp;</span><strong>Entire Agreement.</strong><span style="font-weight: 400;"> This Agreement and any schedules, attachments and exhibits hereto set forth the entire agreement and understanding between the parties as to the subject matter hereof and supersedes all prior discussions, agreements and understandings of any kind, and every nature between them. This Agreement shall not be changed, modified or amended except in writing and signed by each of the three parties to this Agreement.</span></p>
<p><span style="font-weight: 400;">25.08. &nbsp;</span><strong>Construction.</strong><span style="font-weight: 400;"> &nbsp;Captions contained in this Agreement are for convenience only and do not constitute a limitation of the terms hereof. The singular includes the plural, and the plural includes the singular. All references to &ldquo;herein,&rdquo; &ldquo;hereunder,&rdquo; &nbsp;&ldquo;hereinabove,&rdquo; or like words shall refer to this Agreement as a whole and not to any particular section, subsection, or clause contained in this Agreement. The terms &ldquo;include&rdquo; and &ldquo;including&rdquo; are not limiting. Reference to any agreement or other contract includes any permitted modifications, supplements, amendments, and replacements.</span></p>
<p><span style="font-weight: 400;">25.09. &nbsp;</span><strong>Severability; Waiver</strong><span style="font-weight: 400;">. If any provision of this Agreement (or any portion thereof) is determined to be invalid or unenforceable, the remaining provisions of this Agreement shall not be affected thereby and shall be binding upon the Parties and shall be enforceable, as though said invalid or unenforceable provision (or portion thereof) were not contained in this Agreement. The failure by any party to this Agreement to insist upon strict performance of any of the provisions contained in this Agreement shall in no way constitute a waiver of its rights as set forth in this Agreement, at law or in equity, or a waiver of any other provisions or subsequent default by any other party in the performance of or compliance with any of the terms and conditions set forth in this Agreement.</span></p>
<p><span style="font-weight: 400;">25.10. </span><strong>Headings</strong><span style="font-weight: 400;">. The headings, captions, headers, footers and version numbers contained in this Agreement are inserted for convenience only and shall not affect the meaning or interpretation of this Agreement.</span></p>
<p><span style="font-weight: 400;">25.11. &nbsp;</span><strong>Drafting</strong><span style="font-weight: 400;">. Each of the parties to this Agreement: (a) acknowledges and agrees that they fully participated in the drafting of this Agreement and, in the event that any dispute arises with respect to the interpretation of this Agreement, no presumption shall arise that any one party drafted this Agreement; and (b) represents and warrants to the other party that they have thoroughly reviewed this Agreement, understand and agree to undertake all of their obligations hereunder, and have obtained qualified independent legal advice with respect to the foregoing.</span></p>
<p><span style="font-weight: 400;">25.12. &nbsp;</span><strong>Survival.</strong><span style="font-weight: 400;"> The following sections of this Agreement shall survive its termination or expiration and continue in force: Sections 12, 15, 19, 21and 25.</span></p>
<p><span style="font-weight: 400;">23.13. </span><strong>Counterparts</strong><span style="font-weight: 400;">. This Agreement may be executed and then delivered via facsimile transmission, via the sending of PDF or other copies thereof via email and in one or more counterparts, each of which shall be an original but all of which taken together shall constitute one and the same Agreement.</span><br /><br /></p>
      `
    },
    {
      class: 'String',
      name: 'triPartyAgreementUsd',
      view: function(args, x) {
        var data = x.data$.dot('triPartyAgreementUsd');
        return foam.u2.HTMLElement.create({ nodeName: 'div' }).
        style({ 'max-height': '200px', 'overflow-y': 'scroll', border: '1px inset', background: 'lightgray', 'border-radius': '5px', padding: '10px'}).
        add(data);
      },
      displayWidth: 60,
      value: `
      <p><strong>Tri-Party Agreement for Ablii Payments Service </strong></p>
      <p><span style="font-weight: 400;">This Agreement is a &nbsp;contract between you, nanopay corporation (&ldquo;</span><strong>nanopay</strong><span style="font-weight: 400;">&rdquo;) and our financial institution partner, AscendantFX Capital USA, Inc (&ldquo;</span><strong>AFX</strong><span style="font-weight: 400;">&rdquo;), and applies to your use of nanopay&rsquo;s payment software platform and any AFX products and services you access via nanopay&rsquo;s payment software platform, such as &nbsp;foreign exchange services (the &ldquo;</span><strong>Foreign Exchange Services</strong><span style="font-weight: 400;">&rdquo;), i.e., the conversion of one currency into another (for example, US dollars into Canadian dollars) and for remittance services &nbsp;(the &ldquo;</span><strong>Remittance Services</strong><span style="font-weight: 400;">&rdquo;) (as defined below). &nbsp;</span></p>
      <p><span style="font-weight: 400;">It is important that you carefully read and understand this Agreement and keep it for your records since its terms and conditions governs your interactions not only with nanopay but also with AFX. &nbsp;Capitalized terms used in this Agreement and not otherwise defined will have the meanings assigned to them by nanopay&rsquo;s Terms of Service located at: </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;">. &nbsp;Also, as set forth below, this Agreement contains a binding arbitration provision, which affects your legal rights and may be enforced by the parties.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Definitions. </strong></li>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>AAA Rules</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 25.01.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>AFX</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in the preamble. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>AFX Custodial Account</em></strong><span style="font-weight: 400;">&rdquo; means a deposit account maintained by AFX at a federally-insured depository institution (e.g., the Federal Deposition Insurance Corporation</span> <span style="font-weight: 400;">or the Canadian Deposit Insurance Corporation) for the benefit of Customers in which it will receive and hold all funds from Customers associated with Remittances other than any portion thereof representing fees payable by the Customer.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Applicable Law</em></strong><span style="font-weight: 400;">&rdquo; means (a) the Rules, (b) the bylaws, operating rules and/or regulations of any System, and (c) any and all foreign, federal, state or local laws, treaties, rules, regulations, regulatory guidance, directives, policies, orders or determinations of (or agreements with), and mandatory written direction from (or agreements with), a Regulatory Authority, including, without limitation, the Bank Secrecy Act and the regulations promulgated thereunder, as well as the Proceeds of Crime (Money Laundering) and Terrorist Financing Act and the regulations promulgated thereunder, and also all statutes or regulations relating to money transmission, unfair or deceptive trade practices or acts, or privacy or data security, that are applicable to the remittance services (as set forth below), or otherwise applicable to all of the parties to this Agreement, as the same may be amended and in effect from time to time during the Term. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Bank</em></strong><span style="font-weight: 400;">&rdquo; means an entity chartered by a state or federal government which receives demand and time deposits, may pay interest on those deposits and makes loans and invests in securities based on those deposits.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Bank Draft</em></strong><span style="font-weight: 400;">&rdquo; means a check drawn by a Bank on itself authorizing the second Bank to make payment to the business named in the draft.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Business Day</em></strong><span style="font-weight: 400;">&rdquo; means any day, other than a Saturday, Sunday or any federal banking holiday observed in the United States. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Confidential Information</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section</span> <span style="font-weight: 400;">12.</span></li>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Customer</em></strong><span style="font-weight: 400;">&rdquo; means a User that has access to and uses the Remittance Service.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Customer Account</em></strong><span style="font-weight: 400;">&rdquo; means the deposit account that you link through the Platform to your account at AFX for the Remittance Services. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Currency</em></strong><span style="font-weight: 400;">&rdquo; means any form of money, including paper notes and coins, which is issued by a government and is used in public circulation.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Event of Default</em></strong><span style="font-weight: 400;">&rdquo; means an Event of Default as defined in Section 11.04.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>EFT</em></strong><span style="font-weight: 400;">&rdquo; means Electronic Funds Transfer which is a transaction that takes place over a computerized network (i.e. bank wire transfer; ACH) either between accounts at the same financial institution or between deposit accounts at separate financial institutions.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Financial Institution</em></strong><span style="font-weight: 400;">&rdquo; means an institution that collects funds from the public and places them into financial assets, such as deposits, loans, and bonds, rather than tangible property.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Foreign Exchange</em></strong><span style="font-weight: 400;">&rdquo; means the trade of one national Currency for another and takes place &ldquo;over the counter&rdquo; and centrally on an inter-bank system.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Foreign Exchange Rate</em></strong><span style="font-weight: 400;">&rdquo; means the rate at which one Currency may be converted into another Currency. &nbsp;Also known as rate of exchange or exchange rate or Currency exchange rate.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Foreign Exchange Services</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 8.05.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>nanopay</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in the preamble. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Person</em></strong><span style="font-weight: 400;">&rdquo; means any individual, corporation, limited liability company, partnership, firm, joint venture, association, trust, unincorporated organization or other entity. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Platform</em></strong><span style="font-weight: 400;">&rdquo; has the meaning set forth in Section 2.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Remittance</em></strong><span style="font-weight: 400;">&rdquo; means funds that are remitted electronically from your Customer Account to a Payee by AFX in accordance with this Agreement.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Remittance Instructions</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 8.03.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Remittance Services</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section 8.01.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Settlement</em></strong><span style="font-weight: 400;">&rdquo; means the finalizing of the sale of a Currency, as its title is transferred from the seller to the buyer. &nbsp;Also known as closing.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Settlement Date</em></strong><span style="font-weight: 400;">&rdquo; means the date by which an executed Currency transaction must be settled, by paying for the Currency purchased and delivering the purchased Currency to the buyer.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Transaction</em></strong><span style="font-weight: 400;">&rdquo; means the movement of value using the Platform from payment initiation by a Payor to settlement, using the Platform and includes Remittances Services.</span></li>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Transaction Confirmation</em></strong><span style="font-weight: 400;">&rdquo; means the transaction confirmation as defined in Section 8.04 of this Agreement.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>User</em></strong><span style="font-weight: 400;">&rdquo; has the meaning set forth in Section 2.</span></li>
      </ol>
      <li style="font-weight: 400;"><strong>Background.</strong><span style="font-weight: 400;"> &nbsp;You understand and agree that nanopay is a technology service provider that offers a payment software platform user interface through which, among other things, nanopay&rsquo;s business customers (each, a &ldquo;</span><strong><em>User</em></strong><span style="font-weight: 400;">&rdquo;) may access certain features and functionality, including the ability to upload and transmit invoices to other businesses for which they act as vendors, and the ability to communicate with third-party payment service providers for the purpose of utilizing payment services offered by such providers (the &ldquo;</span><strong><em>Platform</em></strong><span style="font-weight: 400;">&rdquo;). AFX is a registered with the Financial Crimes Enforcement Network of the United States, as a Money Services Business in the United States and is a state licensed money transmitter (or the statutory equivalent) in the United States. AFX is engaged in the business of, among other things, providing domestic and cross-border remittance solutions and foreign exchanges services to businesses.</span></li>
      <li style="font-weight: 400;"><strong>nanopay and AFX Duties.</strong><span style="font-weight: 400;"> You understand and agree that all funds transfers are performed by AFX based on instructions received through the Platform. </span><strong>nanopay is solely the Platform provider and does not receive, hold, or transmit funds</strong><span style="font-weight: 400;">. &nbsp;AFX holds the AFX Custodial Account that holds your funds and performs the Foreign Exchange Services and the Remittance Services. &nbsp;</span></li>
      <li style="font-weight: 400;"><strong>Statutory Trust</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that any funds held for Remittance that are recorded on the Platform, are held by AFX and are deemed to be held in a statutory trust for the benefit of the sender of outstanding money received for Remittance in the event of bankruptcy or receivership of AFX, or in the event of an action by a creditor against AFX who is not a beneficiary of the statutory trust. &nbsp;</span></li>
      <li style="font-weight: 400;"><strong>Compliance with Applicable Law and Regulation</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By accessing and using the Platform and the associated AFX services and products, such as Foreign Exchange Services and Remittance Services, you agree to comply with all applicable laws and regulations and you further agree not to engage in any transaction involving any illegal activity, product or service. Without limiting the foregoing, you agree you will not violate: (i) any applicable domestic or foreign anti-corruption law or regulation, including the United Kingdom Bribery Act of 2010, the United States Foreign Corrupt Practices Act and the Canadian Corruption of Foreign Public Officials Act; (ii) any applicable domestic or foreign laws or regulations related to Anti-Money Laundering and anti-terrorist financing requirements, including the USA Bank Secrecy Act, as amended by the USA Patriot Act and the Financial Conduct Authority&rsquo;s Anti-Money Laundering Regulations, and the Canadian Proceeds of Crime (Money Laundering) and Terrorist Financing Act; (iii) the sanctions laws and regulations administered by the U.S. Department of the Treasury&rsquo;s Office of Foreign Assets Control, the Canadian sanctions legislation overseen by Global Affairs; and (iv) applicable data protection and privacy laws such as the Canadian Personal Information Protection and Electronic Documents Act (&ldquo;</span><strong>PIPEDA</strong><span style="font-weight: 400;">&rdquo;) and the European Union&rsquo;s General Data Protection Regulations 2016/679. &nbsp;Furthermore, you and your affiliates and agents shall not utilize the Platform and the associated AFX products and services in a manner that could cause nanopay or AFX to violate any of the foregoing laws and regulations or other applicable laws and regulations to which nanopay and AFX may be subject.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that if either nanopay or AFX in their sole discretion suspect or believe you are violating or may violate applicable laws or regulations, then either nanopay or AFX may refuse to accept your instructions regarding a Transaction or complete a Remittance already in process.</span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Your Representations</strong><span style="font-weight: 400;">.</span> <span style="font-weight: 400;">To access and use the Platform and the associated AFX products and services, you represent and warrant that:</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You have full authority to enter into this Agreement and carry out its obligations under the Agreement;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">This Agreement has been duly authorized by you;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">This Agreement is binding on you and does not conflict with or violate the terms of any constating documents of yours or of any other agreements pursuant to which you are bound;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">No Event of Default has occurred under the terms of this Agreement;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You hold a deposit account in your name, over which you exercise legal authority and control that will be the source of funds for Remittances using the Platform;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You are not an agent acting for an undisclosed principal or third-party beneficiary; </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">All information provided by you as part of your registration and use of the Platform and the associated AFX products and services is accurate and complete, and you undertake to promptly notify nanopay and AFX of changes to such information; </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You will ensure that your contact details provided at your registration remain accurate and up to date. Nanopay and AFX will use those contact details to contact you wherever required under this Agreement or in connection with the Platform and the associated AFX products and services; and</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">All representations and warranties made by you shall be true at the time the parties entered into this Agreement and at the time any Remittances are entered into pursuant to the terms of this Agreement.</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Prohibited Uses</strong><span style="font-weight: 400;">. &nbsp;For avoidance of doubt, you agree</span><strong> not</strong><span style="font-weight: 400;"> to use the Platform and the associated AFX products and services in the following manner:</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of any prohibited or illegal good or service or activity that requires a government license where you lack such a license;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of marijuana, marijuana paraphernalia, regardless of whether or not such sale is lawful in your jurisdiction;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of any material that promotes violence or hatred;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of adult content;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale and distribution of goods and services that violate the intellectual property rights of a third party;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or exchange of cryptocurrencies;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">As part of a Ponzi-scheme or pyramid selling</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">As part of any gambling or regulated financial services you may provide; or </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of firearms or weapons, military or semi-military goods, military software or technologies, chemicals, prescription medications, seeds or plants, dietary supplements, alcoholic beverages, tobacco goods, jewels, precious metals or stones.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">For avoidance of doubt, any attempt to use the Platform and the associated AFX products and services in a prohibited manner shall constitute an Event of Default as defined below.</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Services</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">8.01 As a User, you may be eligible for the Foreign Exchange Services and the Remittance Services as follows:</span></p>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Domestic money remittances from one business to another within the United States;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">International EFTs (money remittances) from a business in the United States to a business in another country;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Foreign Exchange Services; and</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">International Receipt of Funds (the services set out in subsections 8.01(a), 8.01(b) and 8.01(d) are collectively the &ldquo;</span><strong>Remittance Services</strong><span style="font-weight: 400;">&rdquo; referred to in this Agreement).</span></li>
      </ol>
      <p><span style="font-weight: 400;">8.02 You can provide instructions to nanopay and AFX via the Platform according to the process set out below in Section 8.03. AFX (and nanopay) may modify or discontinue the available services set forth above from time to time. AFX and nanopay will not be liable to you for any damages resulting from the discontinuance or modification of any service provided pursuant to this Agreement. </span></p>
      <p><span style="font-weight: 400;">8.03. You will access the Platform and you will send your remittance instructions via the Platform to AFX. Your instructions must include (i) the name, address, financial institution and account number of the payee, (ii) the amount you wish to send, (iii) the applicable transaction currency, (iv) your financial institution, name on the account and account number and, (v) such other information that may be requested by either nanopay or AFX from time to time (collectively, the &ldquo;</span><strong>Remittance Instructions</strong><span style="font-weight: 400;">&rdquo;). &nbsp;&nbsp;</span></p>
      <p><span style="font-weight: 400;">8.04 The Platform will transmit your Remittance Instructions to AFX and AFX will perform the </span> <span style="font-weight: 400;">following actions: &nbsp;</span></p>
      <ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Provide you with a confirmation of the Remittance Instructions by way of the Platform, including the date of the transaction, the currency and amount of the Remittance, the Payee name, the transaction number and a client ID number, the Foreign Exchange Rate and value date if applicable, any applicable fees or charges, and any relevant disclosure(s) as required by law (collectively, the &ldquo;</span><strong>Transaction Confirmation&rdquo;)</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Deem you have accepted the contents of the Transaction Confirmation unless you inform AFX of any errors or omissions upon receiving it and prior to the execution of the transaction by AFX. You shall not thereafter be entitled to dispute the contents of the Transaction Confirmation. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Receive funds by way of EFT from your Customer Account in an amount equal to the Remittance you are sending to the payee plus any applicable fees, into the AFX Custodial Account once you have authorized and accepted the Transaction Confirmation. </span></li>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Funds should be provided to AFX via EFT. &nbsp;If you send funds by wire transfer, AFX will provide you with instructions to send the funds to an FDIC insured AFX Custodial Account. The instructions will include the bank name and address, ABA routing number, SWIFT code, IBAN, account number and any additional information. &nbsp;For instructions by you to direct debit your account, and AFX consents, you will be required to give AFX written authorization. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">To validate your account information, AFX may rely on one or more of the following:</span></li>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">A Void Check;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">A bank statement that is no older than ninety (90) days; &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Confirmation of a micro deposit made to your account; and, </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Instant Account Verification by way of an approved 3</span><span style="font-weight: 400;">rd</span><span style="font-weight: 400;"> party service provider. &nbsp;and provide a VOID check.</span></li>
      </ol>
      </ol>
      </ol>
      </ol>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Effectuate a remittance from the AFX Custodial Account to the relevant payee account in such amounts and currency, and at such time(s), as set forth in such instructions. &nbsp;</span></li>
      </ol>
      </ol>
      <p><strong>Transactions Requiring Foreign Exchange</strong><span style="font-weight: 400;">.</span></p>
      <ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">For transactions requiring Foreign Exchange Services, the conversion of one Currency into another Currency, the terms of each such transactions will be set out in the Transaction Confirmation.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Deem you to have accepted the contents of the Transaction Confirmation, unless you inform AFX of any errors or omissions upon receiving it prior to the execution of the Remittance by AFX. &nbsp;You shall not thereafter be entitled to dispute the contents of the Transaction Confirmation. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Once you have authorized and accepted the Transaction Confirmation, AFX will receive funds by way of EFT from your Customer Account in an amount equal to the Remittance you are sending to the payee plus any applicable fee(s) included in the Remittance Instructions, into the AFX Custodial Account. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">AFX reserves the right to correct any quoting error in the rate applicable to each transaction should an obvious error or mistake occur. &nbsp;In the event of an error stipulating the applicable rate for a transaction, the error shall be corrected by AFX with reference to the fair market of the Currency at the time that the error occurred, as determined by AFX acting fairly and reasonably according to the particular circumstances surrounding the transaction in question</span></li>
      </ol>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ul>
      <li><strong><strong>Monies Owing for Services</strong></strong></li>
      </ul>
      <p>&nbsp;</p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Under any circumstances where you owe monies to AFX as a result of Services received pursuant to this Agreement or pursuant to any duly authorized and accepted Transaction Confirmation, AFX will set out in the Transaction Confirmation the sum of money that is outstanding. &nbsp;&nbsp;Upon receipt of the Transaction Confirmation, you shall have until 5:00 p.m. EST on the next business day to provide AFX the amount stipulated in the Transaction Confirmation.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Any deposits you provide to AFX will be applied by AFX in its sole discretion to any outstanding amounts you owe for completed Transactions, applied to other amounts you owe to AFX or nanopay, or the deposit shall be returned to you.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">AFX will hold such funds on your behalf pursuant to the terms of any instructions you have provided and the terms of the Transaction Confirmation until the Settlement Date or the other closing date.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">AFX will use commercially reasonable efforts to process Transactions on the day in which they are authorized however, AFX cannot guarantee that this will always be possible. &nbsp;Furthermore, AFX is not responsible for the time it takes any Financial Institution and the payee&rsquo;s Bank and/or Financial Institution to process transactions or any other delays related to international and domestic payment systems to process the Transactions.</span></li>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">If you wish to cancel, amend or reverse a Transaction for any reason, you may attempt to do so by contacting AFX via the Platform. &nbsp;AFX will use commercially reasonable efforts to try too effect such cancellation, amendment or reversal, all at your cost and account. &nbsp;However, you acknowledge that the requested change to the transaction may not be reasonably possible and that AFX is not required to cancel, amend or reverse any transactions once you have authorized and accepted the Transaction Confirmation. </span></li>
      </ol>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Eligibility</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">For purposes of reviewing your eligibility to use the Platform and the associated AFX products and services, you understand and agree that nanopay or AFX may request at any time, and you agree to provide, any information about your business operations and/or financial condition. A primary reason for these requests is to help governments fight the funding of terrorism and money laundering activities. We are therefore required to obtain, verify and record information about each client to whom we provide services, such as names, addresses, email addresses, certificates or articles of incorporation and should we deem it necessary government issued photo identification documents like drivers licenses and passports. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You agree in particular to providing AFX and nanopay with all necessary banking information, that AFX and nanopay reasonably require to carry out their obligations under this Agreement. &nbsp;In addition, you hereby authorize and consent to AFX and nanopay:</span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Contacting your bank to verify your identity, account information and any other information that AFX or nanopay may reasonably require from your bank; and </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Obtaining a credit report about you from a recognized third-party provider to verify relevant information about you, including but not limited to your payment history; and</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Continuous Risk Review Process</strong><span style="font-weight: 400;">. &nbsp;Both nanopay and AFX reserve the right to reassess your eligibility for any services and products based on such reassessment and nanopay&rsquo;s or AFX&rsquo;s risk review processes. You understand that either nanopay or AFX may deny your request to use the Platform and the associated AFX services and products or reassess your eligibility to use them even if your initial request is successful, nanopay and AFX and may modify eligibility standards for the Platform and the associated AFX products and services at any time.</span></li>
      <li style="font-weight: 400;"><strong>Termination</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">11.01 nanopay and/or AFX may terminate this Agreement at any time without notice.</span></p>
      <p><span style="font-weight: 400;">11.02 You may terminate this Agreement at any time by providing written notice to both nanopay and AFX (an email to the support functions of both companies will satisfy this obligation).</span></p>
      <p><span style="font-weight: 400;">11.03 Provided that no Event of Default has occurred, all transactions that were entered into prior to the termination of this Agreement shall be carried out to completion and this Agreement shall not terminate until all obligations of the parties to this Agreement have been fully completed.</span></p>
      <p><span style="font-weight: 400;">11.04 The following shall constitute an &ldquo;</span><strong>Event of Default</strong><span style="font-weight: 400;">&rdquo; under the terms of this Agreement:</span></p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You do not perform your obligations under this Agreement on time, including those obligations set out in Sections 5 and 6;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You perform one of the prohibited actions set out in Section 7;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You make a misrepresentation of any of the representations and warranties set out Section 6, or if you make a statement to AFX or nanopay that is untrue or misleading in any material respect, e.g., the source of funds, the identity of the recipient of funds, the purpose of the Transaction; and </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You become bankrupt or insolvent or commit an act of bankruptcy.</span></li>
      </ol>
      </ol>
      <p><span style="font-weight: 400;">11.05. In the event that there is an Event of Default by you, then AFX and nanopay may, at their sole option, either terminate your access to the Platform and withhold all further services and use of products or terminate this Agreement immediately and the parties to it shall be relieved of any further obligations under this Agreement, including obligations pursuant to any Transactions that were entered into prior to the occurrence of the Event of Default. &nbsp;Either AFX or nanopay may terminate this Agreement by providing written notice to the other parties (an email to other the parties will satisfy this obligation). </span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Confidentiality</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">12.01 nanopay and AFX will use commercially reasonable precautions in order to ensure that any confidential information you provide to nanopay and AFX will be kept private and confidential.</span></p>
      <p><span style="font-weight: 400;">12.02. &nbsp;nanopay and AFX shall maintain and protect all of your confidential information using the same standards of care and affording such confidential information the same treatment that they use to protect their own confidential information, but under no circumstances less than a reasonable standard of care.</span></p>
      <p><span style="font-weight: 400;">12.03 With regard to confidential information that can be considered to be &ldquo;Personally Identifiable Information,&rdquo; both nanopay and AFX employ certain encryption technologies to ensure the upmost protection for such Personally Identifiable Information.</span></p>
      <p><span style="font-weight: 400;">12.04 AFX and nanopay may use your information, whether confidential information, Personally Identifiable Information, or otherwise solely for their own internal business purposes.</span></p>
      <p><span style="font-weight: 400;">12.05 AFX and nanopay may disclose your confidential information, Personally Identifiable Information or otherwise to their employees, agents, officers, or affiliates in the course of providing Services to you pursuant to the Agreement, provided that such employees, agents, officers, or affiliates are subject to confidentiality obligations no less stringent than the terms contained herein.</span></p>
      <p><span style="font-weight: 400;">12.06. AFX and nanopay may disclose your information, whether confidential information, Personally Identifiable Information, or otherwise to any third party service provider, e.g., Amazon World Services, Plaid, credit reporting agencies (where necessary and only to the minimum extent required), governmental or regulatory body, or agency necessary for you to receive Services pursuant to this Agreement or to comply with any Applicable Laws, requirements, court orders or agency or regulatory body orders, demands or examinations, or otherwise.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Your Security Obligations</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that you are responsible for the security of data in your possession or control and you are responsible for your compliance with all applicable laws and rules in connection with your collection of personal, financial, or transaction information on your website(s). &nbsp;You are also responsible for maintaining adequate security and control over your access to the Platform and the associated AFX products and services, including all credentials, e.g., passwords, and ensuring that your employees, contractors and/or agents comply with these security requirements and all other terms of this Agreement.</span></li>
      <li style="font-weight: 400;"><strong>Multiple Registrations Are Prohibited</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that multiple registrations are prohibited. You may only register once and each User must maintain a separate registration. &nbsp;If nanopay or AFX detect multiple active registrations for a single User, we reserve the right to merge or terminate the registrations and refuse you all continued use of the Platform and the associated AFX products and services without notification to you.</span></li>
      <li style="font-weight: 400;"><strong>Right of Set Off.</strong><span style="font-weight: 400;"> &nbsp;You agree that nanopay and AFX are authorized at any time to set-off funds deposited with AFX against your debts or liabilities owed to either nanopay or AFX. &nbsp;Neither AFX or nanopay shall be required to provide you prior notice of the exercise of such set off right.</span></li>
      <li style="font-weight: 400;"><strong>Our Relationship Is One of Electronic Commerce</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand that the Platform and the associated AFX products and services constitute an electronic commerce relationship. To provide you the Platform and the associated AFX products and services, we must have your consent to provide access to required disclosures in electronic format. &nbsp;If you do not consent to electronic disclosure of these documents, then you may not use the Platform and the associated AFX products and services. Your consent applies to all of the documents we provide to you electronically in connection with the Service, including receipts and notices. </span></li>
      </ol>
      </ol>
      <p><span style="font-weight: 400;">16.02 Access to electronic disclosures will be provided by way of the Internet. Your history of use is available for viewing online from your account on the AFX and nanopay Websites. &nbsp;If you require a printed copy of your full printed copy of your transaction history, you can request this in writing by sending an email communication to: [</span><span style="font-weight: 400;">insert address</span><span style="font-weight: 400;">]</span></p>
      <p><span style="font-weight: 400;">16.03 We recommend you download or print a copy of this Agreement for your records. &nbsp;You may download a copy of this Agreement in a pdf format. </span></p>
      <p>&nbsp;</p>
      <ul>
      <li><strong><strong>Transmission of Information and Instructions. &nbsp;</strong></strong></li>
      </ul>
      <p>&nbsp;</p>
      <p><span style="font-weight: 400;">17.01. You acknowledge and agree that AFX and nanopay are not liable to you for any loss or damage arising directly or in connection with the transmission of electronic data or electronic instructions through the Platform or through nanopay.net and AscendantFX.com or through any other electronic mean, or for any failure to receive any such electronic data or electronic instructions for any reason whatsoever.</span></p>
      <p><span style="font-weight: 400;">17.02. &nbsp;Any electronic data or electronic instructions you send via the Platform, or to nanopay.net or AscendantFX.com received by nanopay and AFX will be deemed to be duly authorized by you and both AFX and nanopay will be entitled to rely on such electronic data or electronic instructions. &nbsp;The fact that you may not receive confirmation of receipt of such communications from AFX and/or nanopay shall not invalidate any Transactions entered into pursuant to such instructions from you.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>No Interest Paid</strong><span style="font-weight: 400;">. &nbsp;From time to time, AFX may receive and hold monies on your behalf in the course of providing services to you. &nbsp;You acknowledge that under such circumstances neither AFX nor nanopay will not pay interest on any such funds. These funds may be held by AFX in accounts maintained by AFX. &nbsp;You may direct the payment or application of funds by AFX but may not request the return of any funds held by AFX, if such funds are being held for an existing Transaction. </span></li>
      <li style="font-weight: 400;"><strong>Privacy</strong><span style="font-weight: 400;">. &nbsp;Your privacy is very important to both nanopay and AFX. &nbsp;Given the close relationship between nanopay and AFX in providing you Services under this Agreement, you understand and affirmatively consent to allow nanopay and AFX to share information about you, including any Personally Identifiable Information and confidential information that you input into the Platform or otherwise provide to nanopay and AFX. &nbsp;In addition, both AFX and nanopay will share your information, including your Personally Identifiable Information and confidential information, with our agents, contractors and service providers so you can utilize the Platform and the associated AFX products and services, e.g., Amazon World Service, Plaid, and other parties. Please see nanopay&rsquo;s Privacy Policy, available at </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Privacy-Policy-November-28-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;">, and AFX&rsquo;s Privacy Policy Notice for Canada, available at: </span><a href="https://cdn2.hubspot.net/hubfs/1852881/Compliance/20170221" target="_blank"><span style="font-weight: 400;">https://cdn2.hubspot.net/hubfs/1852881/Compliance/20170221</span></a><span style="font-weight: 400;">, and AFX&rsquo;s Privacy Policy Notice for the United States, available at: </span><a href="https://cdn2.hubspot.net/hubfs/1852881/Compliance/AFX" target="_blank"><span style="font-weight: 400;">https://cdn2.hubspot.net/hubfs/1852881/Compliance/AFX</span></a><span style="font-weight: 400;">.</span></li>
      <li style="font-weight: 400;"><strong>Our Records</strong><span style="font-weight: 400;">. </span></li>
      </ol>
      <p><span style="font-weight: 400;">20.01 You understand and agree that nanopay and AFX will retain a record of all the information you provide to us. &nbsp;Both nanopay and AFX will record and track your use of the nanopay Platform and AFX&rsquo;s services and products. You acknowledge and agree that both nanopay and AFX shall be entitled to use this information for their own internal business purposes.</span></p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that the records kept by AFX and nanopay shall be conclusive and binding on you and in the event of a dispute or formal legal action by you or nanopay and AFX.</span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Limitation of Liability/Indemnity</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">21.01. NEITHER </span><span style="font-weight: 400;">NANOPAY OR AFX NOR THEIR RESPECTIVE AFFILIATES, EMPLOYEES, OFFICERS, DIRECTORS, AGENTS, CONTRACTORS OR AFFILIATES, INCLUDING THEIR SUCCESSORS AND ASSIGNS, SHALL BE LIABLE TO YOU OR YOUR RESPECTIVE AFFILIATES, WHETHER IN CONTRACT, TORT, EQUITY OR OTHERWISE, FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE OR EXEMPLARY DAMAGES, INCLUDING LOST PROFITS (EVEN IF SUCH DAMAGES ARE FORESEEABLE, AND WHETHER OR NOT ANY PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), ARISING FROM OR RELATING TO THIS AGREEMENT, INCLUDING, WITHOUT LIMITATION, THE WRONGFUL DEATH OR INJURY OF ANY PERSON.</span></p>
      <p><span style="font-weight: 400;">21.02 The combined liability of AFX and nanopay to you shall at all times be limited to the value of the Transaction from which the Claim arises.</span></p>
      <p><span style="font-weight: 400;">21.03 Nanopay and AFX will use all commercially reasonable efforts to ensure that payment of monies as directed by you shall take place in a timely fashion. &nbsp;However, neither AFX Nor nanopay will be liable for any losses or damages suffered by you as a result of delays in the monies being received by the designated Payee.</span></p>
      <p><span style="font-weight: 400;">21.04. You acknowledge and agree that the representations and warranties that you have provided in this Agreement will be relied upon by both nanopay and AFX for the purpose of determining whether or not nanopay and AFX will allow you to access and use the Platform and of the associated AFX products and services as a User. You agree to indemnify and hold nanopay and AFX and their respective officers, directors, employees, agents, contractors and security holders, including their successors and assigns, harmless from and against all losses, damages, or liabilities due to or arising out of a breach of any representation or warranty of yours as provided herein, or in any other document you have provided to either nanopay or AFX.</span></p>
      <ol start="22">
      <li><span style="font-weight: 400;"> &nbsp;</span><strong>Amendments To This Agreement</strong><span style="font-weight: 400;">. &nbsp;Both nanopay and AFX reserve the right to amend any of the terms and conditions in this Agreement at any time. &nbsp;All such amendments shall be effective immediately upon written notice to you (an email will satisfy this notice obligation) on a going forward basis.</span></li>
      <li><span style="font-weight: 400;"> &nbsp;</span><strong>Notice</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">23.01 Any notice or communication in respect of this Agreement may be given in the following ways:</span></p>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By mail or overnight courier (e.g., FedEx, UPS, DHL) to the address provided on the cover of this Agreement;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By facsimile to fax number provided on the cover page of this Agreement; </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By electronic mail to the email address provided on the cover page of this Agreement; and</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By means of a communication set via the Platform.</span></li>
      </ol>
      <p><span style="font-weight: 400;">23.02. Any notice sent by mail or by overnight courier shall be deemed to have been received on the date it is delivered. &nbsp;All notices sent by facsimile or by email shall be deemed to have been received on the date which the notice is sent, provided that no indication of service interruption is received by the notice sender at the time the notice is provided.</span></p>
      <p><span style="font-weight: 400;">23.03 Any of the three parties to this Agreement may provide notice to the other two parties that it wishes to change its address, fax number or email address via the methods set out in Section 21.01 above at any time.</span></p>
      <ol start="24">
      <li><span style="font-weight: 400;"> &nbsp;</span><strong>Nanopay&rsquo;s Terms of Service Are Incorporated Into This Agreement</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that nanopay&rsquo;s Terms of Service found at </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here.</span></a><span style="font-weight: 400;"> are incorporated into this Agreement by reference. In plain English, this means that all of the terms and conditions of nanopay&rsquo;s Terms of Service are part of this Agreement and are legally binding on you.</span></li>
      <li><strong>Miscellaneous</strong><span style="font-weight: 400;">.</span></li>
      </ol>
      <p><span style="font-weight: 400;">25.01. </span><strong>Dispute Resolution</strong><span style="font-weight: 400;">. Any dispute or claim arising out of or related to this Agreement, or the interpretation, making, performance, breach, validity or termination thereof, shall be finally settled by binding arbitration in New York, New York under the American Arbitration Association Commercial Arbitration Rules (&ldquo;</span><strong><em>AAA Rules</em></strong><span style="font-weight: 400;">&rdquo;) by one or more neutral arbitrators appointed in accordance with the AAA Rules. &nbsp;At the request of any party, the arbitrator(s) will enter an appropriate protective order to maintain the confidentiality of information produced or exchanged in the course of the arbitration proceedings. Judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. The arbitrator(s) may also award to the prevailing party, if any, as determined by the arbitrator(s), its reasonable costs and fees incurred in connection with any arbitration or related judicial proceeding hereunder. Costs and fees awarded may include, without limitation, American Arbitration Association administrative fees, arbitrator fees, attorneys' fees, court costs, expert fees, witness fees, travel expenses, and out-of-pocket expenses (including, without limitation, such expenses as copying, telephone, facsimile, postage, and courier fees). The arbitration proceedings contemplated by this Section 25.01</span> <span style="font-weight: 400;">shall be as confidential and private as permitted by Applicable Law. To that end, the parties shall not disclose the existence, content or results of any proceedings conducted in accordance with this Section, and materials submitted in connection with such proceedings shall not be admissible in any other proceeding; </span><span style="font-weight: 400;">provided</span><span style="font-weight: 400;">, </span><span style="font-weight: 400;">however</span><span style="font-weight: 400;">, that this confidentiality provision shall not prevent a petition to vacate or enforce an arbitration award, and shall not bar disclosures required by Applicable Law. </span></p>
      <p><span style="font-weight: 400;">25.02. </span><strong>Force Majeure</strong><span style="font-weight: 400;">. No party to this Agreement shall be liable to any other party for any failure or delay on its part to perform, and shall be excused from performing any of its non-monetary obligations hereunder if such failure, delay or non-performance results in whole or in part from any cause beyond the absolute control of the party, including without limitation, any act of God, act of war, riot, actions of terrorists, earthquake, fire, explosion, natural disaster, flooding, embargo, sabotage, government law, ordinance, rule, regulation, order or actions. A party desiring to rely upon any of the foregoing as an excuse for failure, default or delay in performance shall, when the cause arises, give to the other Party prompt notice in writing of the facts which constitute such cause; and, when the cause ceases to exist, give prompt notice thereof to the other Party. This Section 25.02 shall in no way limit the right of the other parties to make any claim against third parties for any damages suffered due to said cause. If the non-performing party&rsquo;s performance under this Agreement is postponed or extended for longer than thirty (30) days, the other two parties may, by written notice to the non-performing party, terminate this Agreement immediately.</span></p>
      <p><span style="font-weight: 400;">25.03. </span><strong>Third Party Beneficiaries.</strong><span style="font-weight: 400;"> No other Customer or any other third party, other than an affiliate of a party, is a third-party beneficiary to this Agreement.</span></p>
      <p><span style="font-weight: 400;">25.04. &nbsp;</span><strong>Communications Must be in English</strong><span style="font-weight: 400;">. &nbsp;All correspondence, agreements and other communications between you and nanopay and AFX shall be in the English language.</span></p>
      <p><span style="font-weight: 400;">25.05. &nbsp;</span><strong>Assignment.</strong><span style="font-weight: 400;"> &nbsp;You may not assign your interest in this Agreement without the prior written consent of AFX and nanopay. You agree that any transaction whereby the effective control of your business changes, then such change shall be deemed an assignment for purposes of this Agreement. &nbsp;AFX and nanopay may assign this Agreement without prior notice to you and without your consent. This Agreement, including all interest in any transactions shall inure to the benefit of AFX and nanopay, their successors and assigns and shall remain binding on upon you and your respective successors and assigns. </span></p>
      <p><span style="font-weight: 400;">25.06. &nbsp;</span><strong>Governing Law.</strong><span style="font-weight: 400;"> This Agreement shall be governed by and construed in accordance with the laws of the State of New York without giving effect to the conflict of law principles thereof. Each party agrees that service of process in any action or proceeding hereunder may be made upon such party by certified mail, return receipt requested, to the address for notice set forth herein, as the same may be modified in accordance with the terms hereof. </span></p>
      <p><span style="font-weight: 400;">25.07. &nbsp;</span><strong>Entire Agreement.</strong><span style="font-weight: 400;"> This Agreement and any schedules, attachments and exhibits hereto set forth the entire agreement and understanding between the parties as to the subject matter hereof and supersedes all prior discussions, agreements and understandings of any kind, and every nature between them. This Agreement shall not be changed, modified or amended except in writing and signed by each of the three parties to this Agreement.</span></p>
      <p><span style="font-weight: 400;">25.08. &nbsp;</span><strong>Construction.</strong><span style="font-weight: 400;"> Captions contained in this Agreement are for convenience only and do not constitute a limitation of the terms hereof. The singular includes the plural, and the plural includes the singular. All references to &ldquo;herein,&rdquo; &ldquo;hereunder,&rdquo; &nbsp;&ldquo;hereinabove,&rdquo; or like words shall refer to this Agreement as a whole and not to any particular section, subsection, or clause contained in this Agreement. The terms &ldquo;include&rdquo; and &ldquo;including&rdquo; are not limiting. Reference to any agreement or other contract includes any permitted modifications, supplements, amendments, and replacements.</span></p>
      <p><span style="font-weight: 400;">25.09. &nbsp;</span><strong>Severability; Waiver</strong><span style="font-weight: 400;">. If any provision of this Agreement (or any portion thereof) is determined to be invalid or unenforceable, the remaining provisions of this Agreement shall not be affected thereby and shall be binding upon the Parties and shall be enforceable, as though said invalid or unenforceable provision (or portion thereof) were not contained in this Agreement. The failure by any party to this Agreement to insist upon strict performance of any of the provisions contained in this Agreement shall in no way constitute a waiver of its rights as set forth in this Agreement, at law or in equity, or a waiver of any other provisions or subsequent default by any other party in the performance of or compliance with any of the terms and conditions set forth in this Agreement.</span></p>
      <p><span style="font-weight: 400;">25.10. </span><strong>Headings</strong><span style="font-weight: 400;">. The headings, captions, headers, footers and version numbers contained in this Agreement are inserted for convenience only and shall not affect the meaning or interpretation of this Agreement.</span></p>
      <p><span style="font-weight: 400;">25.11. &nbsp;</span><strong>Drafting</strong><span style="font-weight: 400;">. Each of the parties to this Agreement: (a) acknowledges and agrees that they fully participated in the drafting of this Agreement and, in the event that any dispute arises with respect to the interpretation of this Agreement, no presumption shall arise that any one party drafted this Agreement; and (b) represents and warrants to the other party that they have thoroughly reviewed this Agreement, understand and agree to undertake all of their obligations hereunder, and have obtained qualified independent legal advice with respect to the foregoing.</span></p>
      <p><span style="font-weight: 400;">25.12. &nbsp;</span><strong>Survival.</strong><span style="font-weight: 400;"> The following sections of this Agreement shall survive its termination or expiration and continue in force: Sections 12, 15, 19, 21and 25.</span></p>
      <p><span style="font-weight: 400;">23.13. </span><strong>Counterparts</strong><span style="font-weight: 400;">. This Agreement may be executed and then delivered via facsimile transmission, via the sending of PDF or other copies thereof via email and in one or more counterparts, each of which shall be an original but all of which taken together shall constitute one and the same Agreement.</span></p>
      `
    },
    {
      class: 'String',
      name: 'dualPartyAgreementCad',
      view: function(args, x) {
        var data = x.data$.dot('dualPartyAgreementCad');
        return foam.u2.HTMLElement.create({ nodeName: 'div' }).
        style({ 'max-height': '200px', 'overflow-y': 'scroll', border: '1px inset', background: 'lightgray', 'border-radius': '5px', padding: '10px'}).
        add(data);
      },
      displayWidth: 60,
      value: `
      <p><strong>Dual Party Agreement for Canadian Only Payments</strong></p>
      <p>&nbsp;</p>
      <p><span style="font-weight: 400;">This Agreement is a contract between you and nanopay corporation (&ldquo;</span><strong>nanopay</strong><span style="font-weight: 400;">&rdquo;) and applies to your use of nanopay&rsquo;s payment software platform only in Canada and only with regard to payments sent and received in Canadian dollars (the &ldquo;</span><strong>Payment Services</strong><span style="font-weight: 400;">&rdquo;) (as defined below). &nbsp;</span></p>
      <p><span style="font-weight: 400;">It is important that you carefully read and understand this Agreement and keep it for your records since its terms and conditions govern your interactions with nanopay. &nbsp;Capitalized terms used in this Agreement and not otherwise defined will have the meanings assigned to them by nanopay&rsquo;s Terms of Service located at:</span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;">. &nbsp;Also, as set forth below, this Agreement contains a binding arbitration provision, which affects your legal rights and may be enforced by the nanopay and you.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Definitions. </strong></li>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Account</em></strong><span style="font-weight: 400;">&rdquo; means a deposit account maintained by nanopay at a federally-or-provincially insured depository institution in which it will receive and hold all funds from Customers associated with payments (the &ldquo;</span><strong><em>Account</em></strong><span style="font-weight: 400;">&rdquo;). &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Applicable Law</em></strong><span style="font-weight: 400;">&rdquo; means (a) the Rules, (b) the by-laws, operating rules and/or regulations of any System, and (c) any and all federal, provincial or local laws, treaties, rules, regulations, regulatory guidance, directives, policies, orders or determinations of (or agreements with), and mandatory written direction from (or agreements with), a Regulatory Authority. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Bank</em></strong><span style="font-weight: 400;">&rdquo; means an entity, including a treasury branch, credit union, financial services cooperative or league, or caisse populaire, that in each case, is authorized by an enactment of Canada or a jurisdiction of Canada to carry on business in Canada or a jurisdiction of Canada. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Business Day</em></strong><span style="font-weight: 400;">&rdquo; means any day, other than a Saturday, Sunday or any federal banking holiday observed in Canada. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Confidential Information</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in Section</span> <span style="font-weight: 400;">12.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Customer</em></strong><span style="font-weight: 400;">&rdquo; means a User that has access to and uses the Payments Services.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Customer Account</em></strong><span style="font-weight: 400;">&rdquo; means the deposit account that you link through the Platform to your account to make and receive payments. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Event of Default</em></strong><span style="font-weight: 400;">&rdquo; means an Event of Default as defined in Section 11.04.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>EFT</em></strong><span style="font-weight: 400;">&rdquo; means Electronic Funds Transfer, which is a transaction that takes place over a computerized network (i.e. bank wire transfer; PAD) either between deposit accounts at the same financial institution or between deposit accounts at separate financial institutions.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>FINTRAC</em></strong><span style="font-weight: 400;">&rdquo; means the Financial Transactions and Reports Analysis Centre of Canada. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>nanopay</em></strong><span style="font-weight: 400;">&rdquo; shall have the meaning set forth in the preamble. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Payee&rdquo;</em></strong> <span style="font-weight: 400;">means a Person to whom a payment is paid or is to be paid. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Person</em></strong><span style="font-weight: 400;">&rdquo; means any individual, corporation, limited liability company, partnership, firm, joint venture, association, trust, unincorporated organization or other entity. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Platform</em></strong><span style="font-weight: 400;">&rdquo; has the meaning set forth in Section 2.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>Transaction</em></strong><span style="font-weight: 400;">&rdquo; means the movement of value using the Platform from payment initiation by a Payor to settlement, using the Platform (as defined below) and includes Payment Services.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">&ldquo;</span><strong><em>Transaction Confirmation</em></strong><span style="font-weight: 400;">&rdquo; means the transaction confirmation as defined in Section 8.04 of this Agreement.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> &ldquo;</span><strong><em>User</em></strong><span style="font-weight: 400;">&rdquo; has the meaning set forth in Section 2.</span></li>
      </ol>
      <li style="font-weight: 400;"><strong>Background.</strong><span style="font-weight: 400;"> &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that nanopay is payment services provider that offers an online platform through which, among other things, nanopay&rsquo;s business customers (each, a &ldquo;</span><strong><em>User</em></strong><span style="font-weight: 400;">&rdquo;) may access certain features and functionality, including the ability to upload and transmit invoices to other businesses for which they act as vendors, and the ability to facilitate the payment of those invoices (the &ldquo;</span><strong><em>Platform</em></strong><span style="font-weight: 400;">&rdquo;).</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that you will only be permitted to use the Platform to initiate Transactions to other Canadian-domiciled Payees. To initiate payments to Payees domiciled outside of Canada, you must execute an additional agreement, which we can provide you at your request</span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>nanopay Duties.</strong><span style="font-weight: 400;"> You understand and agree that all Transactions are performed by nanopay based on instructions received through the Platform. </span><strong>Nanopay acts solely as the payment service provider through the Platform with regard to all payments made pursuant to this Agreement</strong><span style="font-weight: 400;">. &nbsp;&nbsp;</span></li>
      <li style="font-weight: 400;"><strong>Compliance with Applicable Law and Regulation</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By accessing and using the Platform, you agree to comply with all Applicable Law and you further agree not to engage in any transaction involving any illegal activity, product or service. Without limiting the foregoing, you agree you will not violate: (i) the Canadian Corruption of Foreign Public Officials Act; (ii) any applicable domestic or foreign laws or regulations related to Anti-Money Laundering and anti-terrorist financing requirements, Proceeds of Crime (Money Laundering) and Terrorist Financing Act and Regulations; (iii) the Canadian sanctions legislation overseen by Global Affairs; and (iv) applicable data protection and privacy laws such as the Canadian Personal Information Protection and Electronic Documents Act (&ldquo;</span><strong>PIPEDA</strong><span style="font-weight: 400;">&rdquo;). &nbsp;Furthermore, you and your affiliates and agents shall not utilize the Platform and the associated Payments Service in a manner that could cause nanopay to violate any of the foregoing laws and regulations or other applicable laws and regulations to which nanopay may be subject.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that if nanopay in its sole discretion suspects or believes you are violating or may violate applicable laws or regulations, then nanopay may refuse to accept your instructions regarding a Transaction or complete a Transaction already in process.</span><span style="font-weight: 400;"></span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Your Representations</strong><span style="font-weight: 400;">.</span> <span style="font-weight: 400;">To access and use the Platform, you represent and warrant that:</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You have full authority to enter into this Agreement and carry out its obligations under the Agreement;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">This Agreement has been duly authorized by you;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">This Agreement is binding on you and does not conflict with or violate the terms of any constating documents of yours or of any other agreements pursuant to which you are bound;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">No Event of Default has occurred under the terms of this Agreement;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You exercise legal authority and control over the deposit account that will be the source of funds for Transaction made using the Platform;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You are not an agent acting for an undisclosed principal or third-party beneficiary; </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">All information provided by you as part of your registration and use of the Platform is accurate and complete, and you undertake to promptly notify nanopay of changes to such information; </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You will ensure that your contact details provided at your registration remain accurate and up to date. Nanopay will use those contact details to contact you wherever required under this Agreement or in connection with the Platform; and</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">All representations and warranties made by you shall be true at the time the parties entered into this Agreement and at the time any Transactions are initiated pursuant to the terms of this Agreement.</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Prohibited Uses</strong><span style="font-weight: 400;">. &nbsp;For avoidance of doubt, you agree</span><strong> not</strong><span style="font-weight: 400;"> to use the Platform in the following manner:</span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of any prohibited or illegal good or service or activity that requires a government license where you lack such a license;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of cannabis, cannabis-related paraphernalia, regardless of whether or not such sale is lawful in your jurisdiction;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of any material that promotes violence or hatred;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of adult content;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale and distribution of goods and services that violate the intellectual property rights of a third party;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or exchange of cryptocurrencies;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">As part of a Ponzi-scheme, pyramid selling, other &ldquo;get rich quick&rdquo; schemes or certain multi-level marketing programs;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">As part of any gambling, gaming or regulated financial services you may provide; or </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In connection with the sale or distribution of firearms or weapons, military or semi-military goods, military software or technologies, chemicals, prescription medications, seeds or plants, dietary supplements, alcoholic beverages, tobacco goods, jewels, precious metals or stones.</span></li>
      </ol>
      <p><span style="font-weight: 400;">For avoidance of doubt, any attempt to use the Platform and the Payments Services in a prohibited manner shall constitute an Event of Default as defined below.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Payment Services</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">7.01. &nbsp;You can access the Platform according to the process set out below in Section 7.03. Nanopay may modify or discontinue the available Payment Services set forth in this Agreement at any time. Nanopay will not be liable to you for any damages resulting from the discontinuance or modification of any Payments Services and any related services provided pursuant to this Agreement.</span></p>
      <p><span style="font-weight: 400;">7.02. &nbsp;To initiate a transaction, you will access the Platform and include the following information: (i) the name, address, financial institution and account number of the payee, (ii) the amount you wish to send, (iii) your financial institution, name on the account and account number and, (iv) such other information that may be requested by nanopay from time to time (collectively, the &ldquo;</span><strong>Payment Instructions</strong><span style="font-weight: 400;">&rdquo;). &nbsp;</span></p>
      <p><span style="font-weight: 400;">7.03. Upon you initiating a Transaction, the Platform will perform following actions: &nbsp;</span></p>
      <ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Provide you with the following Transaction-related information by way of the Platform, including Transaction date and amount, the Payee name, and the transaction number, and any applicable fees or charges, and any relevant disclosure(s) as required by law (collectively, the &ldquo;</span><strong>Transaction Confirmation&rdquo;)</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Deem you have accepted the contents of the Transaction Confirmation unless you inform nanopay via the Platform of any errors or omissions upon receiving it and prior to the execution of the transaction. You shall not thereafter be entitled to dispute the contents of the Transaction Confirmation. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Receive funds by way of EFT from your Customer Account in an amount equal to the payment you are sending to the Payee plus any applicable fees, into the Account once you have authorized and accepted the Transaction Confirmation. </span></li>
      </ol>
      </ol>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;"> Funds should be provided to nanopay via pre-authorized debit to send a payment to the Payee&rsquo;s Customer Account according to the instructions set out in your Transaction Confirmation. To allow us to debit your account directly, you will be required to give us authorization as per the terms of the by Pre-Authorized Debit agreement: </span></li>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ol>
      <li style="font-weight: 400;">
      <span style="font-weight: 100;">You authorize nanopay or its successors, assigns and agents acting on its behalf to debit your validated bank account (the &ldquo;Bank Account&rdquo;), in the amounts and with the frequency that you authorize from time to time based on this Agreement (your &ldquo;Authorization&rdquo;).YOU WAIVE YOUR RIGHT TO RECEIVE PRE-NOTIFICATION OF THE AMOUNT OF THE WITHDRAWAL AND AGREE THAT YOU DO NOT REQUIRE ADVANCE NOTICE OF THE AMOUNT OF PADS BEFORE THE DEBIT IS PROCESSED.</span>
      </li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">nanopay is required to obtain authorization from you for each Sporadic PAD. You acknowledge that to subsequently authorize Sporadic PADs, you must confirm your identity by logging into the Services as well as verifying your logging on credentials, which shall constitute valid authorization for each Sporadic PAD.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">In the event the debit made pursuant to this Agreement is not accepted by the Payee within 30 days of initiation, the transaction will expire and the funds will be returned to your account.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You may cancel or revoke this authorizations at any time, either in writing or verbally within 30 days. You may obtain a sample cancellation form, or further information on their right to cancel a PAD Agreement, at your financial institution or by visiting www.payments.ca.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You have certain recourse rights if any debit does not comply with this Authorization. For example, you have the right to receive reimbursement for any debit that you have not authorized or that is not consistent with this Authorization. To obtain more information on your recourse rights, you may contact your financial institution or visit Payments Canada at www.payments.ca.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">nanopay may cancel the PAD immediately without notice if any PAD is not honoured by the Financial Institution because there are insufficient funds in your Bank Account, or for any other reason whatsoever that prevents the transfer of funds.</span></li>
      </ol>
      <p>&nbsp;</p>
      <p><span style="font-weight: 400;">7.05. </span><strong>Monies Owing for Services</strong></p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Under any circumstances where you owe monies to nanopay as a result of the Payments Services received pursuant to this Agreement or pursuant to any duly authorized and accepted Transaction Confirmation, nanopay will set out in the Transaction Confirmation the sum of money that is outstanding. &nbsp;Upon receipt of the Transaction Confirmation, you shall have until 5:00 p.m. EST on the next business day to provide nanopay the amount stipulated in the Transaction Confirmation.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Any amounts you provide to nanopay will be applied in nanopay&rsquo;s sole discretion to any outstanding amounts you owe for completed Transactions, applied to other amounts you owe to nanopay, or the funds received shall be returned to you.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Nanopay will hold such funds on your behalf pursuant to the terms of any instructions you have provided and the terms of the Transaction Confirmation.</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Nanopay will use commercially reasonable efforts to process Transactions on the day in which they are authorized however, we cannot guarantee that this will always be possible. &nbsp;Furthermore, nanopay is not responsible for the time it takes any Bank, including the Payee&rsquo;s Bank, to process transactions, or any other delays related to payment systems used to process the Transactions.</span></li>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">If you wish to cancel, amend or reverse a Transaction for any reason, you may attempt to do so by contacting nanopay via the Platform. Nanopay will use commercially reasonable efforts to try to effect such cancellation, amendment or reversal, all at your cost and account. However, you acknowledge that the requested change to the transaction may not be reasonably possible and that nanopay is not required to cancel, amend or reverse any transactions once you have authorized and accepted the Transaction Confirmation. </span></li>
      </ol>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Eligibility</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">For purposes of reviewing your eligibility to use the Platform and the Payment Services, you understand and agree that nanopay may request at any time, and you agree to provide, any information about your business operations and/or financial condition. A primary reason for these requests is to help governments fight the funding of terrorism and money laundering activities. We are therefore required to obtain, verify and record information about each client to whom we provide services, such as names, addresses, email addresses, certificates or articles of incorporation, and, should we deem it necessary, government issued photo identification documents like drivers licenses and passports. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You agree in particular to providing nanopay with all necessary banking information, that nanopay reasonably requires to carry out our obligations under this Agreement. &nbsp;In addition, you hereby authorize and consent to nanopay:</span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Contacting your Bank to verify your identity, account information and any other information that nanopay may reasonably require from your Bank; and </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Obtaining a credit report about you from a recognized third-party provider to verify relevant information about you, including but not limited to your identity. </span></li>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Continuous Risk Review Process</strong><span style="font-weight: 400;">. Nanopay reserves the right to reassess your eligibility for any services and products and based on such reassessment and nanopay&rsquo;s risk review processes deny your request to use the Platform and the Payment Services or reassess your eligibility to use them even if your initial request is successful. &nbsp;Nanopay may modify eligibility standards for the Platform and the Payment Services at any time.</span></li>
      <li style="font-weight: 400;"><strong>Termination</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">10.01. Nanopay may terminate this Agreement at any time without notice.</span></p>
      <p><span style="font-weight: 400;">10.02. You may terminate this Agreement at any time by providing written notice to nanopay (an email to the address provided in this Agreement is sufficient).</span></p>
      <p><span style="font-weight: 400;">10.03. &nbsp;Provided that no Event of Default has occurred, all Transactions that were initiated prior to the termination of this Agreement shall be carried out to completion and this Agreement shall</span><strong> not</strong><span style="font-weight: 400;"> terminate until all obligations of the parties to this Agreement have been fully completed.</span></p>
      <p><span style="font-weight: 400;">10.04. The following shall constitute an &ldquo;</span><strong>Event of Default</strong><span style="font-weight: 400;">&rdquo; under the terms of this Agreement:</span></p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You do not perform your obligations under this Agreement on time, including those obligations set out in Sections 4 and 5;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You perform one of the prohibited actions set out in Section 6;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You make a misrepresentation of any of the representations and warranties set out Section 5, or if you make a statement to nanopay that is untrue or misleading in any material respect, e.g., the source of funds, the identity of the recipient of funds, the purpose of the Transaction; and </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You become bankrupt or insolvent or commit an act of bankruptcy.</span></li>
      </ol>
      </ol>
      <p><span style="font-weight: 400;">10.05. In the event that there is an Event of Default by you, then nanopay may, at its sole option, either terminate your access to the Platform and withhold all further Payment Services and use of products or terminate this Agreement immediately and the parties to it shall be relieved of any further obligations under this Agreement, including obligations pursuant to any Transactions that were entered into prior to the occurrence of the Event of Default. &nbsp;</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Confidentiality</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">11.01. Nanopay will use commercially reasonable precautions to ensure that any confidential information you provide to nanopay will be kept private and confidential.</span></p>
      <p><span style="font-weight: 400;">11.02. &nbsp;Nanopay shall maintain and protect all of your confidential information using the same standards of care and affording such confidential information the same treatment that they use to protect their own confidential information, but under no circumstances less than a reasonable standard of care.</span></p>
      <p><span style="font-weight: 400;">11.03. With regard to confidential information that can be considered to be &ldquo;Personally Identifiable Information,&rdquo; nanopay employs certain encryption technologies to ensure the upmost protection for such Personally Identifiable Information.</span></p>
      <p><span style="font-weight: 400;">11.04. Nanopay may use your information, whether confidential information, Personally Identifiable Information, or otherwise solely for their own internal business purposes.</span></p>
      <p><span style="font-weight: 400;">11.05. Nanopay may disclose your confidential information, Personally Identifiable Information or otherwise to their employees, agents, officers, or affiliates in the course of providing Payment Services to you pursuant to the Agreement, provided that such employees, agents, officers, or affiliates are subject to confidentiality obligations no less stringent than the terms contained herein.</span></p>
      <p><span style="font-weight: 400;">11.06. Nanopay may disclose your information, whether confidential information, Personally Identifiable Information, or otherwise to any third-party service provider (where necessary and only to the minimum extent required), governmental or regulatory body, or agency necessary for you to use the Platform pursuant to this Agreement or to comply with any Applicable Laws, requirements, court orders or agency or regulatory body orders, demands or examinations, or otherwise.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>Your Security Obligations</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that you are responsible for the security of data in your possession or control and you are responsible for your compliance with all applicable laws and rules in connection with your collection of personal, financial, or transaction information on your website(s). &nbsp;You are also responsible for maintaining adeNquate security and control over your access to the Platform and the related services , including all credentials, e.g., passwords, and ensuring that your employees, contractors and/or agents comply with these security requirements and all other terms of this Agreement.</span></li>
      <li style="font-weight: 400;"><strong>Multiple Registrations Are Prohibited</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that multiple registrations are prohibited. You may only register once and each User must maintain a separate registration. &nbsp;If nanopay detects multiple active registrations for a single User, we reserve the right to merge or terminate the registrations and refuse you all continued use of the Platform and the Payments Services without notification to you.</span></li>
      <li style="font-weight: 400;"><strong>Right of Set Off.</strong><span style="font-weight: 400;"> &nbsp;You agree that nanopay is authorized at any time to setoff or recoup any liability for which it determines you are liable to us. Nanopay shall not be required to provide you prior notice of the exercise of such set off right.</span></li>
      <li style="font-weight: 400;"><strong>Our Relationship Is One of Electronic Commerce</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You consent to the provision of required disclosures to you in electronic format. &nbsp;If you do not consent to electronic disclosure of these documents, then you may not use the Platform. &nbsp;Your consent applies to all of the documents we provide to you electronically in connection with this Agreement, including receipts and notices. </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">Access to electronic disclosures will be provided by way of the Internet. Your history of use is available for viewing online through the Platform. &nbsp;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">We recommend you download or print a copy of this Agreement for your records. &nbsp;You may download a copy of this Agreement in a pdf format. </span></li>
      </ol>
      </ol>
      <p>&nbsp;</p>
      <ul>
      <li><strong><strong>Transmission of Information and Instructions. &nbsp;</strong></strong></li>
      </ul>
      <p>&nbsp;</p>
      <p><span style="font-weight: 400;">16.01. &nbsp;You acknowledge and agree that nanopay is not liable to you for any loss or damage arising directly or in connection with the transmission of electronic data or electronic instructions through the Platform or through nanopay.net or through any other electronic mean, or for any failure to receive any such electronic data or electronic instructions for any reason whatsoever.</span></p>
      <p><span style="font-weight: 400;">16.02. Any electronic data or electronic instructions you send via the Platform, or to nanopay.net received by nanopay will be deemed to be duly authorized by you and nanopay will be entitled to rely on such electronic data or electronic instructions. The fact that you may not receive confirmation of receipt of such communications from nanopay shall not invalidate any Transactions entered into pursuant to such instructions from you.</span></p>
      <ol>
      <li style="font-weight: 400;"><strong>No Interest Paid</strong><span style="font-weight: 400;">. &nbsp;From time to time, nanopay may receive and hold monies on your behalf in the course of providing services to you. &nbsp;You acknowledge that under such circumstances nanopay will not pay interest on any such funds. These funds may be held your Account. You may direct the payment or application of funds by nanopay but may not request the return of any funds in the Account if such funds are being held for an existing Transaction. </span></li>
      <li style="font-weight: 400;"><strong>Privacy</strong><span style="font-weight: 400;">. &nbsp;Your privacy is very important to us. Please see nanopay&rsquo;s Privacy Policy, available at </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Privacy-Policy-November-28-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a></li>
      <li style="font-weight: 400;"><strong>Our Records</strong><span style="font-weight: 400;">. </span></li>
      </ol>
      <p><span style="font-weight: 400;">19.01. You understand and agree that nanopay will retain a record of all the information you provide to us. &nbsp;Nanopay will record and monitor your use of the nanopay Platform and the Payments Services. You acknowledge and agree that nanopay shall be entitled to use any information collected pursuant to this Section 19 for its own internal business purposes.</span></p>
      <ol>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">You understand and agree that the records kept by nanopay shall be conclusive and binding on you and in the event of a dispute or formal legal action between you and nanopay.</span></li>
      </ol>
      </ol>
      <ol>
      <li style="font-weight: 400;"><strong>Limitation of Liability/Indemnity</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">20.01. </span><span style="font-weight: 400;">NANOPAY ITS AFFILIATES, EMPLOYEES, OFFICERS, DIRECTORS, AGENTS, CONTRACTORS OR AFFILIATES, INCLUDING THEIR SUCCESSORS AND ASSIGNS, SHALL BE LIABLE TO YOU OR YOUR RESPECTIVE AFFILIATES, WHETHER IN CONTRACT, TORT, EQUITY OR OTHERWISE, FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE OR EXEMPLARY DAMAGES, INCLUDING LOST PROFITS (EVEN IF SUCH DAMAGES ARE FORESEEABLE, AND WHETHER OR NOT ANY PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), ARISING FROM OR RELATING TO THIS AGREEMENT, INCLUDING, WITHOUT LIMITATION, THE WRONGFUL DEATH OR INJURY OF ANY PERSON.</span></p>
      <p><span style="font-weight: 400;">20.02. The liability of nanopay to you shall at all times be limited to the value of the Transaction from which the claim arises.</span></p>
      <p><span style="font-weight: 400;">20.03. Nanopay will use all commercially reasonable efforts to ensure that payment of monies as directed by you shall take place in a timely fashion. &nbsp;However, nanopay will not be liable for any losses or damages suffered by you as a result of delays in the monies being received by the designated Payee.</span></p>
      <p><span style="font-weight: 400;">20.04. You acknowledge and agree that the representations and warranties that you have provided in this Agreement will be relied upon by nanopay for the purpose of determining whether or not nanopay will allow you to access and use the Platform and the Payments Services as a User. You agree to indemnify and hold nanopay and its respective officers, directors, employees, agents, contractors and security holders, including their successors and assigns, harmless from and against all losses, damages, or liabilities due to or arising out of a breach of any representation or warranty of yours as provided herein, or in any other document you have provided to nanopay.</span></p>
      <ol start="21">
      <li><span style="font-weight: 400;"> &nbsp;</span><strong>Amendments To This Agreement</strong><span style="font-weight: 400;">. &nbsp;Nanopay reserves the right to amend any of the terms and conditions in this Agreement at any time. &nbsp;All such amendments shall be effective immediately upon written notice to you (an email will satisfy this notice obligation) on a going forward basis.</span></li>
      <li><span style="font-weight: 400;"> &nbsp;</span><strong>Notice</strong><span style="font-weight: 400;">. &nbsp;</span></li>
      </ol>
      <p><span style="font-weight: 400;">22.01. Any notice or communication in respect of this Agreement may be given in the following ways:</span></p>
      <ol>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By mail or overnight courier (e.g., FedEx, UPS, DHL) to the address provided on the cover of this Agreement;</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By facsimile to fax number provided on the cover page of this Agreement; </span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By electronic mail to the email address provided on the cover page of this Agreement; and</span></li>
      <li style="font-weight: 400;"><span style="font-weight: 400;">By means of a communication set via the Platform.</span></li>
      </ol>
      <p><span style="font-weight: 400;">22.02. All notices sent by email shall be deemed to have been received on the date which the notice is sent, provided that no indication of service interruption is received by the notice sender at the time the notice is provided.</span></p>
      <p><span style="font-weight: 400;">22.03. A party may provide notice to the other party that it wishes to change its email address via the methods set out in Section 22.01 above at any time.</span></p>
      <ol start="23">
      <li><span style="font-weight: 400;"> &nbsp;</span><strong>Nanopay&rsquo;s Terms of Service Are Incorporated Into This Agreement</strong><span style="font-weight: 400;">. &nbsp;You understand and agree that nanopay&rsquo;s Terms of Service found at </span><a href="https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf" target="_blank"><span style="font-weight: 400;">Click here</span></a><span style="font-weight: 400;"> are incorporated into this Agreement by reference. In plain English, this means that all of the terms and conditions of nanopay&rsquo;s Terms of Service are part of this Agreement and are legally binding on you.</span></li>
      <li><strong>Miscellaneous</strong><span style="font-weight: 400;">.</span></li>
      </ol>
      <p><span style="font-weight: 400;">24.01. &nbsp;</span><strong>Dispute Resolution</strong><span style="font-weight: 400;">. Any dispute, controversy or claim arising out of or related to this Agreement, or the interpretation, making, performance, breach, validity or termination thereof, shall be referred to finally resolved by binding arbitration in Toronto, Canada under the Canadian Arbitration Association Arbitration Rules for Arbitration by one or more neutral arbitrators appointed in accordance with said Rules. The language of the arbitration shall be English</span><span style="font-weight: 400;">. </span><span style="font-weight: 400;">At the request of any party, the arbitrator(s) will enter an appropriate protective order to maintain the confidentiality of information produced or exchanged in the course of the arbitration proceedings. Judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. The arbitrator(s) may also award to the prevailing party, if any, as determined by the arbitrator(s), its reasonable costs and fees incurred in connection with any arbitration or related judicial proceeding hereunder. Costs and fees awarded may include, without limitation, Canadian Arbitration Association administrative fees, arbitrator fees, attorneys' fees, court costs, expert fees, witness fees, travel expenses, and out-of-pocket expenses (including, without limitation, such expenses as copying, telephone, facsimile, postage, and courier fees). The arbitration proceedings contemplated by this Section 24.01 shall be as confidential and private as permitted by Applicable Law. To that end, the parties shall not disclose the existence, content or results of any proceedings conducted in accordance with this Section, and materials submitted in connection with such proceedings shall not be admissible in any other proceeding; </span><span style="font-weight: 400;">provided</span><span style="font-weight: 400;">, </span><span style="font-weight: 400;">however</span><span style="font-weight: 400;">, that this confidentiality provision shall not prevent a petition to vacate or enforce an arbitration award, and shall not bar disclosures required by Applicable Law. </span></p>
      <p><span style="font-weight: 400;">24.02. </span><strong>Force Majeure</strong><span style="font-weight: 400;">. No party to this Agreement shall be liable to any other party for any failure or delay on its part to perform, and shall be excused from performing any of its non-monetary obligations hereunder if such failure, delay or non-performance results in whole or in part from any cause beyond the absolute control of the party, including without limitation, any act of God, act of war, riot, actions of terrorists, earthquake, fire, explosion, natural disaster, flooding, embargo, sabotage, government law, ordinance, rule, regulation, order or actions. A party desiring to rely upon any of the foregoing as an excuse for failure, default or delay in performance shall, when the cause arises, give to the other Party prompt notice in writing of the facts which constitute such cause; and, when the cause ceases to exist, give prompt notice thereof to the other Party. This Section 24.02 shall in no way limit the right of the other parties to make any claim against third parties for any damages suffered due to said cause. If the non-performing party&rsquo;s performance under this Agreement is postponed or extended for longer than thirty (30) days, the other two parties may, by written notice to the non-performing party, terminate this Agreement immediately.</span></p>
      <p><span style="font-weight: 400;">24.03. </span><strong>Third Party Beneficiaries.</strong><span style="font-weight: 400;"> No other Customer or any other third party, other than an affiliate of a party, is a third-party beneficiary to this Agreement.</span></p>
      <p><span style="font-weight: 400;">24.04. </span><strong>Communications in English</strong><span style="font-weight: 400;">. &nbsp;The parties have expressly requested and required that this Agreement and all other related documents be drawn up in the English language. Les parties conviennent et exigent expressement que ce Contrat et tous les documents qui s'y rapportent soient redig&eacute;s en anglais.</span></p>
      <p><span style="font-weight: 400;">24.05. &nbsp;</span><strong>Assignment.</strong><span style="font-weight: 400;"> &nbsp;You may not assign your interest in this Agreement without the prior written consent of nanopay. &nbsp;You agree that any transaction whereby the effective control of your business changes, then such change shall be deemed an assignment for purposes of this Agreement. Nanopay may assign this Agreement without prior notice to you and without your consent. &nbsp;This Agreement, including all interest in any transactions shall inure to the benefit of nanopay, its successors and assigns and shall remain binding on upon you and your respective successors and assigns. </span></p>
      <p><span style="font-weight: 400;">24.06. &nbsp;</span><strong>Governing Law.</strong><span style="font-weight: 400;"> This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario without giving effect to the conflict of law principles thereof. Each party agrees that service of process in any action or proceeding hereunder may be made upon such party by certified mail, return receipt requested, to the address for notice set forth herein, as the same may be modified in accordance with the terms hereof. </span></p>
      <p><span style="font-weight: 400;">24.07. &nbsp;</span><strong>Entire Agreement.</strong><span style="font-weight: 400;"> This Agreement and any schedules, attachments and exhibits hereto set forth the entire agreement and understanding between the parties as to the subject matter hereof and supersedes all prior discussions, agreements and understandings of any kind, and every nature between them. This Agreement shall not be changed, modified or amended except in writing and signed by each of the three parties to this Agreement.</span></p>
      <p><span style="font-weight: 400;">24.08. &nbsp;</span><strong>Construction.</strong><span style="font-weight: 400;"> &nbsp;Captions contained in this Agreement are for convenience only and do not constitute a limitation of the terms hereof. The singular includes the plural, and the plural includes the singular. All references to &ldquo;herein,&rdquo; &ldquo;hereunder,&rdquo; &nbsp;&ldquo;hereinabove,&rdquo; or like words shall refer to this Agreement as a whole and not to any particular section, subsection, or clause contained in this Agreement. The terms &ldquo;include&rdquo; and &ldquo;including&rdquo; are not limiting. Reference to any agreement or other contract includes any permitted modifications, supplements, amendments, and replacements.</span></p>
      <p><span style="font-weight: 400;">24.09. &nbsp;</span><strong>Severability; Waiver</strong><span style="font-weight: 400;">. If any provision of this Agreement (or any portion thereof) is determined to be invalid or unenforceable, the remaining provisions of this Agreement shall not be affected thereby and shall be binding upon the Parties and shall be enforceable, as though said invalid or unenforceable provision (or portion thereof) were not contained in this Agreement. The failure by any party to this Agreement to insist upon strict performance of any of the provisions contained in this Agreement shall in no way constitute a waiver of its rights as set forth in this Agreement, at law or in equity, or a waiver of any other provisions or subsequent default by any other party in the performance of or compliance with any of the terms and conditions set forth in this Agreement.</span></p>
      <p><span style="font-weight: 400;">24.10. </span><strong>Headings</strong><span style="font-weight: 400;">. The headings, captions, headers, footers and version numbers contained in this Agreement are inserted for convenience only and shall not affect the meaning or interpretation of this Agreement.</span></p>
      <p><span style="font-weight: 400;">24.11. &nbsp;</span><strong>Drafting</strong><span style="font-weight: 400;">. Each of the parties to this Agreement: (a) acknowledges and agrees that they fully participated in the drafting of this Agreement and, in the event that any dispute arises with respect to the interpretation of this Agreement, no presumption shall arise that any one party drafted this Agreement; and (b) represents and warrants to the other party that they have thoroughly reviewed this Agreement, understand and agree to undertake all of their obligations hereunder, and have obtained qualified independent legal advice with respect to the foregoing.</span></p>
      <p><span style="font-weight: 400;">24.12. &nbsp;</span><strong>Survival.</strong><span style="font-weight: 400;"> The following sections of this Agreement shall survive its termination or expiration and continue in force: Sections 11, 14, 18, 20 and 24.</span></p>
      <p><span style="font-weight: 400;">24.13. </span><strong>Counterparts</strong><span style="font-weight: 400;">. This Agreement may be executed and then delivered via facsimile transmission, via the sending of PDF or other copies thereof via email and in one or more counterparts, each of which shall be an original but all of which taken together shall constitute one and the same Agreement.</span></p>
      `
    },
  ],

  messages: [
    { name: 'TITLE', message: 'Signing officer information' },
    { name: 'SIGNING_OFFICER_QUESTION', message: 'Are you a director of your company?' },
    { name: 'INFO_MESSAGE', message: `A signing officer must complete the rest of your business profile. You're all done!` },
    { name: 'INVITE_TITLE', message: 'Invite users to your business' },
    { name: 'FIRST_NAME_LABEL', message: 'First Name' },
    { name: 'LAST_NAME_LABEL', message: 'Last Name' },
    { name: 'PRINCIPAL_LABEL', message: 'Principal Type' },
    { name: 'JOB_LABEL', message: 'Job Title' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'BIRTHDAY_LABEL', message: 'Date of birth' },
    { name: 'RESIDENTIAL_ADDRESS_LABEL', message: 'Residential Address:' },
    { name: 'IDENTIFICATION_TITLE', message: 'Identification' },
    { name: 'SUPPORTING_TITLE', message: 'Add supporting files' },
    { name: 'CANADIAN_BOX_ONE', message: 'I acknowledge that I have read and accept the above Tri-Party Agreement for Ablii Payment Services - Canada Agreement' },
    { name: 'CANADIAN_BOX_TWO', message: 'I acknowledge that I have read and accept the above Dual Party Agreement for Ablii Canadian Only Payment Services Agreement' },
    { name: 'AMERICAN_BOX', message: 'I acknowledge that I have read and accept the above Tri-Party Agreement for Ablii Payment Services - United States “US” Agreement' },
    {
      name: 'DOMESTIC_QUESTION',
      message: `Are you a domestic or foreign Politically Exposed Person (PEP),
          Head of an International Organization (HIO), or a close associate or
          family member of any such person?`
    },
    {
      name: 'INVITE_INFO',
      message: `Invite a signing officer or other employees in your business.
          Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_INFORMATION',
      message: `A signing officer is a person legally authorized to act
          on behalf of the business. (e.g. CEO, COO, board director)`
    },
    {
      name: 'ADD_USERS_LABEL',
      message: '+ Add Users'
    },
    {
      name: 'INVITE_USERS_HEADING',
      message: 'Invite users to your business'
    },
    {
      name: 'INVITE_USERS_EXP',
      message: `Invite a signing officer or other employees in your business.
              Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_OFFICER_UPLOAD_DESC',
      message: `Please provide a copy of the front of your valid Government
                issued Driver’s License or Passport. The image must be clear in order
                to be accepted. If your name has changed since either it was issued
                you will need to prove your identity, such as a marriage certificate.`
    }
  ],

  methods: [
    function initE() {
      this.nextLabel = 'Next';
      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header').add(this.TITLE).end()
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.SIGNING_INFORMATION })
        .start().addClass('label-input')
          .start().addClass('inline').addClass('question-container').add(this.SIGNING_OFFICER_QUESTION).end()
          .start(this.SIGNING_OFFICER).end()
        .end()
        .start().show(this.signingOfficer$.map(function(v) {
          return v == 'Yes';
        }))
          .start().addClass('label-input')
            .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
            .start(this.FIRST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.LAST_NAME_LABEL).end()
            .start(this.LAST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PRINCIPAL_LABEL).end()
            .start(this.PRINCIPAL_TYPE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.JOB_LABEL).end()
            .start(this.JOB_TITLE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PHONE_NUMBER_LABEL).end()
            .start(this.PHONE_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.EMAIL_LABEL).end()
            .start(this.EMAIL_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.BIRTHDAY_LABEL).end()
            .start(this.BIRTHDAY_FIELD).end()
          .end()
          .start().addClass('label').add(this.RESIDENTIAL_ADDRESS_LABEL).end()
          .start(this.ADDRESS_FIELD).end()
          .start().addClass('label-input')
            .start().addClass('inline').addClass('label-width').add(this.DOMESTIC_QUESTION).end()
            .start(this.POLITICALLY_EXPOSED).addClass('radio-button').end()
          .end()
          .start().addClass('medium-header').add(this.IDENTIFICATION_TITLE).end()
          .start(this.IDENTIFICATION).end()
          // Terms and Services and Compliance stuff
            .start(this.TRI_PARTY_AGREEMENT_CAD).style({ 'margin-top': '30px', 'margin-bottom': '30px' }).show(this.isCanadian$).end()
            .start(this.DUAL_PARTY_AGREEMENT_CAD).style({ 'margin-top': '30px' }).show(this.isCanadian$).end()
            .start(this.TRI_PARTY_AGREEMENT_USD).style({ 'margin-top': '30px' }).hide(this.isCanadian$).end()
            .start().addClass('checkBoxes').show(this.isCanadian$)
              .start({ class: 'foam.u2.md.CheckBox', label: this.CANADIAN_BOX_ONE, data$: this.canadianScrollBoxOne$ }).end()
            .end()
            .start().addClass('checkBoxes').show(this.isCanadian$)
              .start({ class: 'foam.u2.md.CheckBox', label: this.CANADIAN_BOX_TWO, data$: this.canadianScrollBoxTwo$ }).end()
            .end()
            .start().addClass('checkBoxes').hide(this.isCanadian$)
              .start({ class: 'foam.u2.md.CheckBox', label: this.AMERICAN_BOX, data$: this.americanScrollBox$ }).end()
            .end()
          // End of Terms and Services and Compliance stuff
          .start().addClass('medium-header').add(this.SUPPORTING_TITLE).end()
          .start().add(this.SIGNING_OFFICER_UPLOAD_DESC).end()
          .start({
            class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
            files$: this.additionalDocs$,
            supportedFormats: {
              'image/jpg': 'JPG',
              'image/jpeg': 'JPEG',
              'image/png': 'PNG',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
              'application/msword': 'DOC',
              'application/pdf': 'PDF'
            }
          }).end()
        .end()
      .end()
      .start() .hide(this.signingOfficer$.map(function(v) {
        return v == 'Yes';
      }))
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.INFO_MESSAGE })
        .start().addClass('borderless-container')
          .start().addClass('medium-header').add(this.INVITE_USERS_HEADING).end()
          .start().addClass('body-paragraph').addClass('subdued-text')
            .add(this.INVITE_USERS_EXP)
          .end()
        .end()
          .tag(this.ADD_USERS, { label: this.ADD_USERS_LABEL })
      .end();
    }
  ],

  actions: [
    {
      name: 'addUsers',
      isEnabled: (signingOfficer) => signingOfficer === 'No',
      code: function() {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.sme.ui.AddUserToBusinessModal' }));
      }
    }
  ]
});
