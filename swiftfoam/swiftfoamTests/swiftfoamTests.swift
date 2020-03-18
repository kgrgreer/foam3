import XCTest
@testable import swiftfoam

class swiftfoamTests: XCTestCase {
  var client: MintChipClient = Context.GLOBAL.create(MintChipClient.self)!
  let username = "kenny@nanopay.net"
  let password = "Nanopay123"

  override func setUp() {
    client.httpBoxUrlRoot = .Localhost
    super.setUp()
  }

  override func tearDown() {
    super.tearDown()
  }

  func testLogin() {
    do {
      let user = try client.clientAuthService.login(client.__context__, username, password)
      XCTAssert(user.email == username, "Email must match")
      XCTAssert(user.password != password, "Password MUST NOT match as it should be encrypted")
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testAutoLogin() {
    // Note: If test is ran before a login has happened it will fail.
    //       Also note that it would fail if called after a logout.
    do {
      guard let prevLoggedInUser = try client.clientAuthService.getCurrentUser(client.__context__) else {
        XCTFail("User not found. Please log in or make sure a previous test did not log out.")
        return
      }
      XCTAssert(prevLoggedInUser.email == username, "Email must match")
      XCTAssert(prevLoggedInUser.password != password, "Password MUST NOT match as it should be encrypted")
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testChangePassword() {
    do {
      if let _ = try client.clientAuthService.getCurrentUser(client.__context__) {}
      else { let _ = try client.clientAuthService.login(client.__context__, username, password) }

      try client.clientAuthService.updatePassword(client.__context__, password, "A_new_p4ss")
      let _ = try client.clientAuthService.login(client.__context__, username, "A_new_p4ss")

      //reset user back to correct password
      try client.clientAuthService.updatePassword(client.__context__, "A_new_p4ss", password)
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testFailedChangePassword() {
    do {
      if let _ = try client.clientAuthService.getCurrentUser(client.__context__) { }
      else { let _ = try client.clientAuthService.login(client.__context__, username, password) }

      try client.clientAuthService.updatePassword(client.__context__, "SomeIncorrectPassword", "Mintchip123")
      XCTFail("Old password was incorrect and should have failed.")
    } catch let e {
      print(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testLogoutPart1() {
    do {
      try client.clientAuthService.logout(client.__context__)
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
    do {
      _ = try client.clientAuthService.getCurrentUser(client.__context__)
      XCTFail("getCurrentUser should fail after logout.")
    } catch let e {
      XCTAssertEqual((((e as! FoamError).obj as! foam_box_RPCErrorMessage).data as! foam_box_RemoteException).message, "Not logged in")
    }
  }

  func testLogoutPart2() {
    // Note: Should be called separately after a logout has been done to check if data still persists between app lifecycles
    do {
      guard let _ = try client.clientAuthService.getCurrentUser(client.__context__) else {
        return
      }
      XCTFail("Previous User still exists.")
    } catch let e {
      XCTAssertEqual((((e as! FoamError).obj as! foam_box_RPCErrorMessage).data as! foam_box_RemoteException).message, "Not logged in")
    }
  }

  func testPullAccount() {
    do {
      var user: foam_nanos_auth_User!
      if let prevLoggedInUser = try client.clientAuthService.getCurrentUser(client.__context__) {
        user = prevLoggedInUser
      } else {
        user = try client.clientAuthService.login(client.__context__, username, password)
      }

      let pred = client.__context__.create(foam_mlang_predicate_Eq.self, args: [
        "arg1": net_nanopay_model_Account.ID(),
        "arg2": user.id,
        ])

      let accounts = try (client.accountDAO!.`where`(pred).select() as! foam_dao_ArraySink).array as! [net_nanopay_model_Account]
      for account in accounts {
        XCTAssert(account.id == user.id, "Owner must match User")
      }
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testPullTransactions() {
    do {
      var user: foam_nanos_auth_User!
      if let prevLoggedInUser = try client.clientAuthService.getCurrentUser(client.__context__) {
        user = prevLoggedInUser
      } else {
        user = try client.clientAuthService.login(client.__context__, username, password)
      }

      let pred = client.__context__.create(foam_mlang_predicate_Or.self, args: [
        "args": [
          client.__context__.create(foam_mlang_predicate_Eq.self, args: [
            "arg1": net_nanopay_tx_model_Transaction.PAYER_ID(),
            "arg2": user.id
          ]),
          client.__context__.create(foam_mlang_predicate_Eq.self, args: [
            "arg1": net_nanopay_tx_model_Transaction.PAYEE_ID(),
            "arg2": user.id
          ])]
        ])

      let transactions = try (client.transactionDAO!.`where`(pred).select() as! foam_dao_ArraySink).array as! [net_nanopay_tx_model_Transaction]
      for transaction in transactions {
        XCTAssert(transaction.payerId == user.id || transaction.payeeId == user.id, "User must have participated in the transaction")
      }
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testPutTransactions() {
    do {
      var user: foam_nanos_auth_User!
      if let prevLoggedInUser = try client.clientAuthService.getCurrentUser(client.__context__) {
        user = prevLoggedInUser
      } else {
        user = try client.clientAuthService.login(client.__context__, username, password)
      }

      let newTransaction = client.__context__.create(net_nanopay_tx_model_Transaction.self)!
      newTransaction.payerId = user.id
      newTransaction.payeeId = 1
      newTransaction.amount = 1 // cent
      newTransaction.tip = 0 // no tip

      guard let madeTransaction = try client.transactionDAO!.put(newTransaction) as? net_nanopay_tx_model_Transaction else {
        XCTFail("Could not convert returned value from put()")
        return
      }

      XCTAssert(madeTransaction.payerId == newTransaction.payerId, "Created Transaction.payerId must match returned transaction from put()")
      XCTAssert(madeTransaction.payeeId == newTransaction.payeeId, "Created Transaction.payeeId must match returned transaction from put()")
      XCTAssert(madeTransaction.amount == newTransaction.amount, "Created Transaction.amount must match returned transaction from put()")
      XCTAssert(madeTransaction.tip == newTransaction.tip, "Created Transaction.tip must match returned transaction from put()")
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testTransactionLimits() {
    do {
      var user: foam_nanos_auth_User!
      if let prevLoggedInUser = try client.clientAuthService.getCurrentUser(client.__context__) {
        user = prevLoggedInUser
      } else {
        user = try client.clientAuthService.login(client.__context__, username, password)
      }

      let service = client.userTransactionLimitService!
      let _ = try service.getLimit(user.id, .DAY, .SEND)
      let _ = try service.getRemainingLimit(client.__context__, user.id, .DAY, .SEND)
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testGetBusinessLocations() {
    do {
      let pred = client.__context__.create(foam_mlang_predicate_Eq.self, args: [
        "arg1": foam_nanos_auth_User.TYPE(),
        "arg2": "Merchant"
        ])
      guard let merchants = try (client.userDAO!.`where`(pred).select() as? foam_dao_ArraySink)?.array as? [foam_nanos_auth_User] else {
        XCTFail("Could not convert returned value from select()")
        return
      }
      guard merchants.count > 0 else { return }
      for merchant in merchants {
        guard merchant.type == "Merchant" else {
          XCTFail("User is not type Merchant")
          return
        }
        guard let address = merchant.address else {
          XCTFail("Merchant address cannot be nil")
          return
        }
        for operatingHours in address.hours {
          XCTAssertNotNil(operatingHours.day)
          if operatingHours.open {
            XCTAssertNotNil(operatingHours.startTime, "Start time cannot be nil")
            XCTAssertNotNil(operatingHours.endTime, "End time cannot be nil")
          }
        }
      }
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testGetRegion() {
    do {
      let pred = client.__context__.create(foam_mlang_predicate_Eq.self, args: [
        "arg1": foam_nanos_auth_Region.COUNTRY_ID(),
        "arg2": "CA"
        ])
      guard let regions = try (client.regionDAO!.`where`(pred).select() as? foam_dao_ArraySink)?.array as? [foam_nanos_auth_Region] else {
        XCTFail("Could not convert returned value from select()")
        return
      }
      XCTAssert(regions.count > 0, "Region array should not be empty.")
    } catch let e {
       XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testGetCountry() {
    do {
      guard let countries = try (client.countryDAO!.select() as? foam_dao_ArraySink)?.array as? [foam_nanos_auth_Country] else {
        XCTFail("Could not convert returned value from select()")
        return
      }
      XCTAssert(countries.count > 0, "Country array should not be empty.")
    } catch let e {
      XCTFail(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

  func testTransactionEntity() {
    let x = Context.GLOBAL
    let u = x.create(foam_nanos_auth_User.self)!
    u.firstName = "Mike"
    u.lastName = "C"
    u.email = "mike@c.com"

    let t = net_nanopay_tx_model_TransactionEntity.fromUser(u)
    XCTAssertEqual(t.firstName, u.firstName)
    XCTAssertEqual(t.lastName, u.lastName)
    XCTAssertEqual(t.email, u.email)
  }
}
