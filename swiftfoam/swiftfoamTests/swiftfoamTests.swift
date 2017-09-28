import XCTest
@testable import swiftfoam

class swiftfoamTests: XCTestCase {
  override func setUp() {
    super.setUp()
    FOAM_utils.registerClasses()
  }

  override func tearDown() {
    super.tearDown()
  }

  func testSelectTransactionDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = "http://localhost:8080/transactionDAO"

    let dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox

    let sink = (try? dao.skip(0).limit(1).select(ArraySink())) as? ArraySink
    let transaction = sink?.array[0] as? Transaction
    XCTAssertNotNil(transaction)
  }

  func testSelectUserDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = "http://localhost:8080/userDAO"

    let dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox

    let sink = (try? dao.skip(0).limit(1).select(ArraySink())) as? ArraySink
    let transaction = sink?.array[0] as? User
    XCTAssertNotNil(transaction)
  }

  func testPutTransactionDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = "http://localhost:8080/transactionDAO"

    let dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox

    let t = X.create(Transaction.self)!
    t.payerId = 1
    t.payeeId = 2
    t.amount = 5000
    t.rate = 15
    t.fees = 20
    t.notes = "Mike's test!"

    do {
      let t2 = (try dao.put(t)) as? Transaction
      XCTAssertNotNil(t2)
      XCTAssertEqual(t2?.payerId, 1)
      XCTAssertEqual(t2?.payeeId, 2)
      XCTAssertEqual(t2?.amount, 5000)
      XCTAssertEqual(t2?.rate, 15)
      XCTAssertEqual(t2?.fees, 20)
      XCTAssertEqual(t2?.notes, "Mike's test!")

      XCTAssertNotEqual(t.compareTo(t2), 0)
      t.id = t2!.id
      t.date = t2!.date
      XCTAssertEqual(t.compareTo(t2), 0)
    } catch let e {
      NSLog(((e as? FoamError)?.toString()) ?? "Error!")
    }
  }

}
