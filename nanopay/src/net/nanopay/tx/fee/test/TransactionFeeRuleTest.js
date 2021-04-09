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
  package: 'net.nanopay.tx.fee.test',
  name: 'TransactionFeeRuleTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.CompoundException',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.ruler.Rule',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.fee.*',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.test.TransactionTestUtil',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        TransactionFeeRuleTest_fixed_fee(x);
        TransactionFeeRuleTest_percentage_fee(x);
        TransactionFeeRuleTest_multiple_fees(x);
        TransactionFeeRuleTest_fee_with_formula(x);
        TransactionFeeRuleTest_fee_formula_with_fee_expressions(x);
        TransactionFeeRuleTest_fee_formula_with_invalid_fee(x);
        TransactionFeeRuleTest_ignore_inapplicable_fee(x);
        TransactionFeeRuleTest_select_fee_based_on_predicate(x);
        TransactionFeeRuleTest_prevent_self_recursion_fee_formula(x);
        TransactionFeeRuleTest_fee_none_self_recursion(x);
        TransactionFeeRuleTest_allow_negative_fee_aka_promotion(x);
        TransactionFeeRuleTest_fee_formula_with_min_max_functions(x);
        TransactionFeeRuleTest_handle_divide_by_zero_in_fee_formula(x);
        TransactionFeeRuleTest_handle_zero_divide_by_zero_in_fee_formula(x);
        TransactionFeeRuleTest_handle_zero_divide_by_non_zero_in_fee_formula(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_fixed_fee',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee75 = new FixedFee.Builder(x).setName("fee75").setFixedFee(75).build();
        setupTestTxFeeRuleAndFee(x, fee75, "CAD");

        test(true, "TransactionFeeRuleTest_fixed_fee:");
        testTransactionFees(x, new long[] { 75 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_percentage_fee',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee2p = new PercentageFee.Builder(x).setName("fee2p").setPercentage(2.0F).build();
        setupTestTxFeeRuleAndFee(x, fee2p, "CAD");

        test(true, "TransactionFeeRuleTest_percentage_fee:");
        testTransactionFees(x, new long[] { 20 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_multiple_fees',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee2p = new PercentageFee.Builder(x).setName("fee2p").setPercentage(2.0F).build();
        var fee75 = new FixedFee.Builder(x).setName("fee75").setFixedFee(75).build();
        setupTestTxFeeRuleAndFee(x, fee2p, "CAD");
        setupTestTxFeeRuleAndFee(x, fee75, "CAD");

        test(true, "TransactionFeeRuleTest_multiple_fees:");
        testTransactionFees(x, new long[] { 20, 75 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_fee_with_formula',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("fee")
          .setFormula(
            // fee = (10 + 20) * 30 - 100
            SUB(MUL(ADD(10, 20), 30), 100)
          ).build();
        setupTestTxFeeRuleAndFee(x, fee, "CAD");

        test(true, "TransactionFeeRuleTest_fee_with_formula:");
        testTransactionFees(x, new long[] { (10 + 20) * 30 - 100 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_fee_formula_with_fee_expressions',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("fee")
          .setFormula(
            // fee = percentageFeePart * transaction.amount + fixedFeePart
            ADD(
              MUL(new FeeExpr("percentageFeePart"), Transaction.AMOUNT),
              new FeeExpr("fixedFeePart")
            )
          ).build();
        var feeRule = setupTestTxFeeRuleAndFee(x, fee, "CAD");
        setupTestFee(x, new PercentageFee.Builder(x).setName("percentageFeePart").setPercentage(2.9F).build(), feeRule);
        setupTestFee(x, new FixedFee.Builder(x).setName("fixedFeePart").setFixedFee(30).build(), feeRule);

        test(true, "TransactionFeeRuleTest_fee_formula_with_fee_expressions:");
        testTransactionFees(x, new long[] { 29 + 30 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_fee_formula_with_invalid_fee',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("fee")
          // fee = invalid_fee (nonexistent fee reference)
          .setFormula(new FeeExpr("invalid_fee"))
          .build();
        setupTestTxFeeRuleAndFee(x, fee, "CAD");

        var passed = false;
        try {
          testTransactionFees(x, new long[0]);
        } catch ( net.nanopay.tx.planner.UnableToPlanException e ) {
          passed = true;
        } catch ( RuntimeException e ) {
          passed = e.getMessage().contains("Fee not found. feeName: invalid_fee");
        }
        test(passed, "TransactionFeeRuleTest_fee_formula_with_invalid_fee throws runtime exception");

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_ignore_inapplicable_fee',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee75 = new FixedFee.Builder(x).setName("fee75").setFixedFee(75)
          .setPredicate(FALSE).build();
        setupTestTxFeeRuleAndFee(x, fee75, "CAD");

        test(true, "TransactionFeeRuleTest_ignore_inapplicable_fee:");
        testTransactionFees(x, new long[0]);

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_select_fee_based_on_predicate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee2p = new PercentageFee.Builder(x).setName("fee2p").setPercentage(2.0F).build();
        var fee75 = new FixedFee.Builder(x).setName("fee75").setFixedFee(75).build();
        fee2p.setPredicate(GTE(Transaction.AMOUNT, 4000));
        fee75.setPredicate(LT(Transaction.AMOUNT, 4000));
        setupTestTxFeeRuleAndFee(x, fee2p, "CAD");
        setupTestTxFeeRuleAndFee(x, fee75, "CAD");

        test(true, "TransactionFeeRuleTest_select_fee_based_on_predicate:");
        testTransactionFees(x, new long[] { 75 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_prevent_self_recursion_fee_formula',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var aFee = new Fee.Builder(x)
          .setName("a")
          // a = b + 1
          .setFormula( ADD(new FeeExpr("b"), 1) )
          .build();
        var feeRule = setupTestTxFeeRuleAndFee(x, aFee, "CAD");
        setupTestFee(x,
          new Fee.Builder(x)
            .setName("b")
            // b = a + 1
            .setFormula( ADD(new FeeExpr("a"), 1) )
            .build(),
          feeRule
        );

        var passed = false;
        try {
          testTransactionFees(x, new long[0]);
        } catch ( net.nanopay.tx.planner.UnableToPlanException e ) {
          passed = true;
        } catch ( RuntimeException e ) {
          passed = e.getMessage().contains("Found self recursion in fee");
        }
        test(passed, "TransactionFeeRuleTest_prevent_self_recursion_fee_formula throws runtime exception");

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_fee_none_self_recursion',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var aFee = new Fee.Builder(x)
          .setName("a")
          // a = b + c
          .setFormula( ADD(new FeeExpr("b"), new FeeExpr("c")) )
          .build();
        var feeRule = setupTestTxFeeRuleAndFee(x, aFee, "CAD");
        setupTestFee(x,
          new Fee.Builder(x)
            .setName("b")
            // b = c
            .setFormula( new FeeExpr("c") )
            .build(),
          feeRule
        );
        setupTestFee(x,
          // c = 10
          new FixedFee.Builder(x).setName("c").setFixedFee(10).build(), feeRule);

        test(true, "TransactionFeeRuleTest_fee_none_self_recursion:");
        testTransactionFees(x, new long[] { 10 + 10 });

        tearDownTestFeesAndTxFeeRules(x);
       `
    },
    {
      name: 'TransactionFeeRuleTest_allow_negative_fee_aka_promotion',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee75 = new FixedFee.Builder(x).setName("fee75").setFixedFee(75).build();
        var promo = new FixedFee.Builder(x).setName("promo").setFixedFee(-75).build();
        setupTestTxFeeRuleAndFee(x, fee75, "CAD");
        setupTestTxFeeRuleAndFee(x, promo, "CAD");

        test(true, "TransactionFeeRuleTest_allow_negative_fee_aka_promotion:");
        testTransactionFees(x, new long[] { -75, 75 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_fee_formula_with_min_max_functions',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("min_max")
          // min_max = min(100, max(transaction.amount * 0.02, 75))
          .setFormula(
            MIN_FUNC(
              100,
              MAX_FUNC( MUL(Transaction.AMOUNT, 0.02), 75 )
            )
          ).build();
        setupTestTxFeeRuleAndFee(x, fee, "CAD");

        test(true, "TransactionFeeRuleTest_fee_formula_with_min_max_functions:");
        testTransactionFees(x, new long[] { 75 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_handle_divide_by_zero_in_fee_formula',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("divide_by_zero")
          // divide_by_zero = 1 / 0
          .setFormula(DIV(1, 0)).build();
        setupTestTxFeeRuleAndFee(x, fee, "CAD");

        var passed = false;
        try {
          testTransactionFees(x, new long[0]);
        } catch ( net.nanopay.tx.planner.UnableToPlanException e ) {
          passed = true;
        } catch ( RuntimeException e ) {
          passed = e.getMessage().contains("Failed to evaluate formula:Divide(1.0, 0.0), result:Infinity");
        }
        test(passed, "TransactionFeeRuleTest_handle_divide_by_zero_in_fee_formula throws runtime exception");

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_handle_zero_divide_by_zero_in_fee_formula',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("zero_divide_by_zero")
          // zero_divide_by_zero = 0 / 0
          .setFormula(DIV(0, 0)).build();
        setupTestTxFeeRuleAndFee(x, fee, "CAD");

        var passed = false;
        try {
          testTransactionFees(x, new long[0]);
        } catch ( net.nanopay.tx.planner.UnableToPlanException e ) {
          passed = true;
        } catch ( RuntimeException e ) {
          passed = e.getMessage().contains("Failed to evaluate formula:Divide(0.0, 0.0), result:NaN");
        }
        test(passed, "TransactionFeeRuleTest_handle_zero_divide_by_zero_in_fee_formula throws runtime exception");

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'TransactionFeeRuleTest_handle_zero_divide_by_non_zero_in_fee_formula',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var fee = new Fee.Builder(x)
          .setName("zero_divide_by_one")
          // zero_divide_by_one = 0 / 1
          .setFormula(DIV(0, 1)).build();
        setupTestTxFeeRuleAndFee(x, fee, "CAD");

        test(true, "TransactionFeeRuleTest_handle_zero_divide_by_non_zero_in_fee_formula:");
        testTransactionFees(x, new long[] { 0 });

        tearDownTestFeesAndTxFeeRules(x);
      `
    },
    {
      name: 'testTransactionFees',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'expectedFees', type: 'long[]' }
      ],
      javaCode: `
        var transactionDAO = (DAO) x.get("localTransactionDAO");

        // create source and destination users
        var sourceUser = TransactionTestUtil.setupTestUser(x, "source_user@nanopay.net");
        var destinationUser = TransactionTestUtil.setupTestUser(x, "destination_user@nanopay.net");

        // create context with the source user for the transaction put
        var subject = new Subject.Builder(x).setUser(sourceUser).build();
        var sourceX = x.put("subject", subject);

        // fetch source account
        var sourceAccount = TransactionTestUtil.RetrieveDigitalAccount(x, sourceUser,"CAD","7ee216ae-9371-4684-9e99-ba42a5759444");
        var destinationAccount = TransactionTestUtil.RetrieveDigitalAccount(x, destinationUser,"CAD","7ee216ae-9371-4684-9e99-ba42a5759444");

        // create transaction
        var transaction = new Transaction();
        transaction.setSourceAccount(sourceAccount.getId());
        transaction.setDestinationAccount(destinationAccount.getId());
        transaction.setSourceCurrency("CAD");
        transaction.setAmount(1000);
        transaction = (Transaction) transactionDAO.inX(sourceX).put(transaction);

        // test fees
        var feeLineItems = getFeeLineItems(transaction);
        var expectedCost = 0;
        test(feeLineItems.length == expectedFees.length,
          "  Transaction has " + expectedFees.length + " fee line items, actual: " + feeLineItems.length);
        if ( feeLineItems.length == expectedFees.length ) {
          Arrays.sort(expectedFees);
          Arrays.sort(feeLineItems, FeeLineItem.AMOUNT);
          for ( var i = 0; i < expectedFees.length; i++ ) {
            expectedCost += expectedFees[i];
            test(feeLineItems[i].getAmount() == expectedFees[i],
              "    - Fee lineItems[" + i + "] amount: " + expectedFees[i] + ", actual: " + feeLineItems[i].getAmount());
          }
          test(transaction.getCost() == expectedCost,
            "  Transaction cost: " + expectedCost + ", actual: " + transaction.getCost());
        }
      `
    },
    {
      name: 'setupTestFee',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'fee', type: 'Fee' },
        { name: 'feeRule', type: 'net.nanopay.tx.fee.TransactionFeeRule' }
      ],
      javaCode: `
        fee = (Fee) feeRule.getFees(x).put(fee);
        testFeeIds.add(fee.getId());
      `
    },
    {
      name: 'setupTestTxFeeRuleAndFee',
      type: 'net.nanopay.tx.fee.TransactionFeeRule',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'fee', type: 'net.nanopay.tx.fee.Fee' },
        { name: 'currency', type: 'String' }
      ],
      javaCode: `
        // create transaction fee rule
        var ruleDAO = (DAO) x.get("localRuleDAO");
        var txFeeRule = new TransactionFeeRule();
        txFeeRule.setEnabled(true);
        txFeeRule.setName("Test Tx Fee Rule");
        txFeeRule.setLifecycleState(LifecycleState.ACTIVE);
        txFeeRule.setFeeGroup("Test");
        txFeeRule.setFeeName(fee.getName());
        txFeeRule.setFeeDenomination(currency);
        txFeeRule.setPredicate(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(DigitalTransaction.class)), true));
        txFeeRule = (TransactionFeeRule) ruleDAO.put(txFeeRule);

        assert txFeeRule.getEnabled() && txFeeRule.getLifecycleState() == LifecycleState.ACTIVE
          : "Tx fee rule is enabled: " + txFeeRule.getEnabled() + ", and active: " + txFeeRule.getLifecycleState();

        // set fee class
        fee.setFeeClass(FeeLineItem.getOwnClassInfo());

        // create fee
        setupTestFee(x, fee, txFeeRule);

        testFeeRuleIds.add(txFeeRule.getId());
        return txFeeRule;
      `
    },
    {
      name: 'tearDownTestFeesAndTxFeeRules',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var feeDAO = (DAO) x.get("feeDAO");
        feeDAO.where(
          IN(Fee.ID, testFeeIds.toArray())
        ).removeAll();
        testFeeIds.clear();

        var ruleDAO = (DAO) x.get("localRuleDAO");
        ruleDAO.where(AND(
          IN(Rule.ID, testFeeRuleIds.toArray()),
          EQ(Rule.LIFECYCLE_STATE, LifecycleState.ACTIVE)
        )).removeAll();
        testFeeRuleIds.clear();
      `
    },
    {
      name: 'getFeeLineItems',
      type: 'net.nanopay.tx.FeeLineItem[]',
      args: [
        { name: 'transaction', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        List<FeeLineItem> list = new ArrayList<>();
        for ( var li : transaction.getLineItems() ) {
        System.out.println(transaction.getClass().getSimpleName());
          if ( li instanceof FeeLineItem ) list.add((FeeLineItem) li);
        }
        return list.toArray(new FeeLineItem[0]);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private List<String> testFeeIds = new ArrayList<>();
          private List<String> testFeeRuleIds = new ArrayList<>();
        `);
      }
    }
  ]
});
