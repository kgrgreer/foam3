/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PayrollDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.LifecycleState',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.liquidity.Liquidity',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.payment.Payroll',
    'net.nanopay.payment.PayrollEntry',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.util.Frequency'
  ],

  messages: [
    { name: 'TOTAL_PAYROLL_MSG', message: 'Total payroll: ' },
    { name: 'CREATING_USER_MSG', message: 'Creating user: ' },
    { name: 'CREATING_ACCOUNT_FOR_MSG', message: 'Creating account for ' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'localServiceProviderDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'userDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'accountDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'liquiditySettingsDAO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PayrollDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setLocalServiceProviderDAO((DAO) x.get("localServiceProviderDAO"));
            setUserDAO((DAO) x.get("userDAO"));
            setTransactionDAO((DAO) x.get("transactionDAO"));
            setAccountDAO((DAO) x.get("accountDAO"));
            setLiquiditySettingsDAO((DAO) x.get("liquiditySettingsDAO"));
            setLogger((Logger) x.get("logger"));
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Payroll payroll               = (Payroll) obj;
        PayrollEntry[] payrollEntries = payroll.getPayrollEntries();
        getLogger().log("Processing ", payrollEntries.length, " employees");
        prepareSPID(payroll);
        double totalPayroll = 0;
        String group        = payroll.getGroup();
        String spid         = payroll.getSpid();
        String sourceAccount  = payroll.getSourceAccount();
        String note         = payroll.getNote();
        String firstName, lastName, institutionNo, branchId, bankAccountNo;
        long payeeId;
        String dcaNo;
        double pay;
        Transaction transaction;
        String transactionId;
        for ( int i = 0; i < payrollEntries.length; ++i ) {
          PayrollEntry entry = payrollEntries[i];
          payeeId            = entry.getOwner();
          pay                = entry.getAmount();
          firstName          = entry.getFirstName();
          lastName           = entry.getLastName();
          bankAccountNo      = entry.getBankAccountNo();
          institutionNo      = entry.getInstitutionNo();
          branchId           = entry.getBranchId();
          getLogger().info("Processing User ", i, ", id: ", payeeId, ", email: ", entry.getEmail());

          totalPayroll += pay;
          findOrCreateUser(payeeId, group, firstName, lastName, spid, bankAccountNo);
          transaction = createTransaction(sourceAccount, payeeId, (long) pay, note);
          transactionId = transaction.getId();
          dcaNo = transaction.getDestinationAccount();
          findOrCreateBankAccount(payeeId, institutionNo, branchId, bankAccountNo, dcaNo);

          entry.setDcaNo(dcaNo);
          entry.setTransactionId(transactionId);
          entry.setStatus(transaction.getStatus());
          payrollEntries[i] = entry;
        }

        getLogger().log(TOTAL_PAYROLL_MSG, totalPayroll);

        payroll.setPayrollEntries(payrollEntries);
        return getDelegate().put_(x, payroll);
      `
    },
    {
      name: 'prepareSPID',
      type: 'void',
      args: [
        { type: 'Payroll', name: 'payroll' }
      ],
      javaCode: `
        ServiceProvider sp = new ServiceProvider();
        sp.setId(payroll.getSpid());
        sp.setEnabled(true);
        sp.setDescription("nanopay payroll");

        getLocalServiceProviderDAO().put(sp);
      `
    },
    {
      name: 'findOrCreateUser',
      type: 'void',
      args: [
        { type: 'long', name: 'id' },
        { type: 'String', name: 'group' },
        { type: 'String', name: 'firstName' },
        { type: 'String', name: 'lastName' },
        { type: 'String', name: 'spid' },
        { type: 'String', name: 'bankAccountNo' }
      ],
      javaCode: `
        User user = (User) getUserDAO().find(id);
        if ( user == null ) {
          user = new User();
          user.setId(id);
          user.setGroup(group);
          user.setFirstName(firstName);
          user.setLastName(lastName);
          user.setEmailVerified(true);
          user.setSpid(spid);
          user.setDesiredPassword("secret" + bankAccountNo);
          getLogger().log(CREATING_USER_MSG, id);
          getUserDAO().put(user);
        }
      `
    },
    {
      name: 'createTransaction',
      type: 'Transaction',
      args: [
        { type: 'String', name: 'sourceAccount' },
        { type: 'long', name: 'payeeId' },
        { type: 'long', name: 'amount' },
        { type: 'String', name: 'note' },
      ],
      javaCode: `
        Transaction transaction = new Transaction();
        transaction.setSourceAccount(sourceAccount);
        transaction.setPayeeId(payeeId);
        transaction.setAmount(amount);
        transaction.setSummary(note);
        Transaction addedTransaction = (Transaction) getTransactionDAO().put(transaction);
        getLogger().log("Created transaction: ", addedTransaction.getId(), ", to: ", addedTransaction.getDestinationAmount(), ", for: ", amount);
        return addedTransaction;
      `
    },
    {
      name: 'findOrCreateBankAccount',
      type: 'void',
      args: [
        { type: 'long', name: 'id' },
        { type: 'String', name: 'institutionNo' },
        { type: 'String', name: 'branchId' },
        { type: 'String', name: 'bankAccountNo' },
        { type: 'String', name: 'destinationAccount' },
      ],
      javaCode: `
        CABankAccount account = (CABankAccount) getAccountDAO()
          .find(
            AND(
              INSTANCE_OF(CABankAccount.class),
              EQ(BankAccount.OWNER, id),
              EQ(BankAccount.ACCOUNT_NUMBER, bankAccountNo),
              EQ(BankAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE)
            )
          );
        if ( account == null ) {
          getLogger().log(CREATING_ACCOUNT_FOR_MSG, id);
          account = new CABankAccount();
          account.setName("Payroll account");
          account.setOwner(id);
          account.setInstitutionNumber(institutionNo);
          account.setBranchId(branchId);
          account.setAccountNumber(bankAccountNo);
          account.setStatus(BankAccountStatus.VERIFIED);
          CABankAccount addedAccount = (CABankAccount) getAccountDAO().put(account);
          getLogger().log("Created bank account for ", id, " : ", addedAccount.getId());
          setupLiquidity(addedAccount, destinationAccount);
        } else {
          getLogger().log("Found bank account for ", id, " : ", account.getId());
        }
      `
    },
    {
      name: 'setupLiquidity',
      type: 'void',
      args: [
        { type: 'CABankAccount', name: 'bankAccount' },
        { type: 'String', name: 'destinationAccount' }
      ],
      javaCode: `
        DigitalAccount digitalAccount = (DigitalAccount) getAccountDAO().find(destinationAccount);
        LiquiditySettings liquiditySettings = new LiquiditySettings();
        Liquidity highLiquidity = new Liquidity();
        highLiquidity.setRebalancingEnabled(true);
        highLiquidity.setEnabled(true);
        highLiquidity.setThreshold(1L);
        highLiquidity.setResetBalance(0L);
        highLiquidity.setPushPullAccount(bankAccount.getId());
        liquiditySettings.setName("Cash out for payroll");
        liquiditySettings.setCashOutFrequency(Frequency.DAILY);
        liquiditySettings.setHighLiquidity(highLiquidity);
        liquiditySettings.setUserToEmail(bankAccount.getOwner());
        LiquiditySettings addedLiquiditySettings = (LiquiditySettings) liquiditySettingsDAO_.put(liquiditySettings);
        digitalAccount.setLiquiditySetting(addedLiquiditySettings.getId());
        getAccountDAO().put(digitalAccount);
        getLogger().log("Setting liquidity from ", destinationAccount, " to ", bankAccount.getId());
      `
    }
  ]
});

