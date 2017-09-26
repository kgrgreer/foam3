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
    t.date = "2017-09-26T14:49:20.548Z"
    t.rate = 15
    t.fees = 20
    t.notes = "Mike's test!"

    let t2 = (try? dao.put(t)) as? Transaction
    XCTAssertNotNil(t2)
  }

}
