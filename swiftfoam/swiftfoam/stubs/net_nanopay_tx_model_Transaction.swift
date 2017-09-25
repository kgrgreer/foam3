// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Transaction: AbstractFObject {

  public var userDAO: Any? {
    get {
      
return __context__["userDAO"]
      
    }
set(value) {
      
self.userDAO$?.swiftSet(value)
      
    }
  }

  public var userDAO$: Slot? {
    get {
      
return __context__["userDAO$"] as? Slot ?? nil
      
    }
  }

  public var id: Int {
    get {
      
if _id_inited_ {
  return _id_!
}

return 0

      
    }
set(value) {
      
self.set(key: "id", value: value)
      
    }
  }

  var _id_: Int! = nil

  var _id_inited_: Bool = false

  public static let ID: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "id"
  let classInfo: ClassInfo
  let transient = false
  let label = "Id" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var id_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "id",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var id_Value_Sub_: Subscription?

  public var id$: Slot {
    get {
      return self.id_Value_
    }
set(value) {
      
self.id_Value_Sub_?.detach()
self.id_Value_Sub_ = self.id$.linkFrom(value)
self.onDetach(self.id_Value_Sub_!)
      
    }
  }

  public var status: String {
    get {
      
if _status_inited_ {
  return _status_!
}

return ""

      
    }
set(value) {
      
self.set(key: "status", value: value)
      
    }
  }

  var _status_: String! = nil

  var _status_inited_: Bool = false

  public static let STATUS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "status"
  let classInfo: ClassInfo
  let transient = false
  let label = "Status" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var status_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "status",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var status_Value_Sub_: Subscription?

  public var status$: Slot {
    get {
      return self.status_Value_
    }
set(value) {
      
self.status_Value_Sub_?.detach()
self.status_Value_Sub_ = self.status$.linkFrom(value)
self.onDetach(self.status_Value_Sub_!)
      
    }
  }

  public var referenceNumber: String {
    get {
      
if _referenceNumber_inited_ {
  return _referenceNumber_!
}

return ""

      
    }
set(value) {
      
self.set(key: "referenceNumber", value: value)
      
    }
  }

  var _referenceNumber_: String! = nil

  var _referenceNumber_inited_: Bool = false

  public static let REFERENCE_NUMBER: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "referenceNumber"
  let classInfo: ClassInfo
  let transient = false
  let label = "Reference Number" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var referenceNumber_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "referenceNumber",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var referenceNumber_Value_Sub_: Subscription?

  public var referenceNumber$: Slot {
    get {
      return self.referenceNumber_Value_
    }
set(value) {
      
self.referenceNumber_Value_Sub_?.detach()
self.referenceNumber_Value_Sub_ = self.referenceNumber$.linkFrom(value)
self.onDetach(self.referenceNumber_Value_Sub_!)
      
    }
  }

  public var impsReferenceNumber: Int {
    get {
      
if _impsReferenceNumber_inited_ {
  return _impsReferenceNumber_!
}

return 0

      
    }
set(value) {
      
self.set(key: "impsReferenceNumber", value: value)
      
    }
  }

  var _impsReferenceNumber_: Int! = nil

  var _impsReferenceNumber_inited_: Bool = false

  public static let IMPS_REFERENCE_NUMBER: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "impsReferenceNumber"
  let classInfo: ClassInfo
  let transient = false
  let label = "IMPS Reference Number" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var impsReferenceNumber_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "impsReferenceNumber",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var impsReferenceNumber_Value_Sub_: Subscription?

  public var impsReferenceNumber$: Slot {
    get {
      return self.impsReferenceNumber_Value_
    }
set(value) {
      
self.impsReferenceNumber_Value_Sub_?.detach()
self.impsReferenceNumber_Value_Sub_ = self.impsReferenceNumber$.linkFrom(value)
self.onDetach(self.impsReferenceNumber_Value_Sub_!)
      
    }
  }

  public var payerId: Int {
    get {
      
if _payerId_inited_ {
  return _payerId_!
}

return 0

      
    }
set(value) {
      
self.set(key: "payerId", value: value)
      
    }
  }

  var _payerId_: Int! = nil

  var _payerId_inited_: Bool = false

  public static let PAYER_ID: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "payerId"
  let classInfo: ClassInfo
  let transient = false
  let label = "Payer" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var payerId_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "payerId",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var payerId_Value_Sub_: Subscription?

  public var payerId$: Slot {
    get {
      return self.payerId_Value_
    }
set(value) {
      
self.payerId_Value_Sub_?.detach()
self.payerId_Value_Sub_ = self.payerId$.linkFrom(value)
self.onDetach(self.payerId_Value_Sub_!)
      
    }
  }

  public var payeeId: Int {
    get {
      
if _payeeId_inited_ {
  return _payeeId_!
}

return 0

      
    }
set(value) {
      
self.set(key: "payeeId", value: value)
      
    }
  }

  var _payeeId_: Int! = nil

  var _payeeId_inited_: Bool = false

  public static let PAYEE_ID: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "payeeId"
  let classInfo: ClassInfo
  let transient = false
  let label = "Payee" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var payeeId_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "payeeId",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var payeeId_Value_Sub_: Subscription?

  public var payeeId$: Slot {
    get {
      return self.payeeId_Value_
    }
set(value) {
      
self.payeeId_Value_Sub_?.detach()
self.payeeId_Value_Sub_ = self.payeeId$.linkFrom(value)
self.onDetach(self.payeeId_Value_Sub_!)
      
    }
  }

  public var amount: Int {
    get {
      
if _amount_inited_ {
  return _amount_!
}

return 0

      
    }
set(value) {
      
self.set(key: "amount", value: value)
      
    }
  }

  var _amount_: Int! = nil

  var _amount_inited_: Bool = false

  public static let AMOUNT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "amount"
  let classInfo: ClassInfo
  let transient = false
  let label = "Sending Amount" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var amount_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "amount",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var amount_Value_Sub_: Subscription?

  public var amount$: Slot {
    get {
      return self.amount_Value_
    }
set(value) {
      
self.amount_Value_Sub_?.detach()
self.amount_Value_Sub_ = self.amount$.linkFrom(value)
self.onDetach(self.amount_Value_Sub_!)
      
    }
  }

  public var receivingAmount: Int {
    get {
      
if _receivingAmount_inited_ {
  return _receivingAmount_!
}

return 0

      
    }
set(value) {
      
self.set(key: "receivingAmount", value: value)
      
    }
  }

  var _receivingAmount_: Int! = nil

  var _receivingAmount_inited_: Bool = false

  public static let RECEIVING_AMOUNT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "receivingAmount"
  let classInfo: ClassInfo
  let transient = true
  let label = "Receiving Amount" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var receivingAmount_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "receivingAmount",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var receivingAmount_Value_Sub_: Subscription?

  public var receivingAmount$: Slot {
    get {
      return self.receivingAmount_Value_
    }
set(value) {
      
self.receivingAmount_Value_Sub_?.detach()
self.receivingAmount_Value_Sub_ = self.receivingAmount$.linkFrom(value)
self.onDetach(self.receivingAmount_Value_Sub_!)
      
    }
  }

  public var date: Any? {
    get {
      
if _date_inited_ {
  return _date_
}

return nil

      
    }
set(value) {
      
self.set(key: "date", value: value)
      
    }
  }

  var _date_: Any? = nil

  var _date_inited_: Bool = false

  public static let DATE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "date"
  let classInfo: ClassInfo
  let transient = false
  let label = "Date & Time" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var date_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "date",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var date_Value_Sub_: Subscription?

  public var date$: Slot {
    get {
      return self.date_Value_
    }
set(value) {
      
self.date_Value_Sub_?.detach()
self.date_Value_Sub_ = self.date$.linkFrom(value)
self.onDetach(self.date_Value_Sub_!)
      
    }
  }

  public var tip: Int {
    get {
      
if _tip_inited_ {
  return _tip_!
}

return 0

      
    }
set(value) {
      
self.set(key: "tip", value: value)
      
    }
  }

  var _tip_: Int! = nil

  var _tip_inited_: Bool = false

  public static let TIP: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "tip"
  let classInfo: ClassInfo
  let transient = false
  let label = "Tip" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var tip_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "tip",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var tip_Value_Sub_: Subscription?

  public var tip$: Slot {
    get {
      return self.tip_Value_
    }
set(value) {
      
self.tip_Value_Sub_?.detach()
self.tip_Value_Sub_ = self.tip$.linkFrom(value)
self.onDetach(self.tip_Value_Sub_!)
      
    }
  }

  public var rate: Float {
    get {
      
if _rate_inited_ {
  return _rate_!
}

return 0

      
    }
set(value) {
      
self.set(key: "rate", value: value)
      
    }
  }

  var _rate_: Float! = nil

  var _rate_inited_: Bool = false

  public static let RATE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "rate"
  let classInfo: ClassInfo
  let transient = false
  let label = "Rate" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var rate_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "rate",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var rate_Value_Sub_: Subscription?

  public var rate$: Slot {
    get {
      return self.rate_Value_
    }
set(value) {
      
self.rate_Value_Sub_?.detach()
self.rate_Value_Sub_ = self.rate$.linkFrom(value)
self.onDetach(self.rate_Value_Sub_!)
      
    }
  }

  public var fees: Int {
    get {
      
if _fees_inited_ {
  return _fees_!
}

return 0

      
    }
set(value) {
      
self.set(key: "fees", value: value)
      
    }
  }

  var _fees_: Int! = nil

  var _fees_inited_: Bool = false

  public static let FEES: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "fees"
  let classInfo: ClassInfo
  let transient = false
  let label = "Fees" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var fees_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "fees",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var fees_Value_Sub_: Subscription?

  public var fees$: Slot {
    get {
      return self.fees_Value_
    }
set(value) {
      
self.fees_Value_Sub_?.detach()
self.fees_Value_Sub_ = self.fees$.linkFrom(value)
self.onDetach(self.fees_Value_Sub_!)
      
    }
  }

  public var total: Int {
    get {
      
if _total_inited_ {
  return _total_!
}

return 0

      
    }
set(value) {
      
self.set(key: "total", value: value)
      
    }
  }

  var _total_: Int! = nil

  var _total_inited_: Bool = false

  public static let TOTAL: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "total"
  let classInfo: ClassInfo
  let transient = false
  let label = "Total" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var total_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "total",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var total_Value_Sub_: Subscription?

  public var total$: Slot {
    get {
      return self.total_Value_
    }
set(value) {
      
self.total_Value_Sub_?.detach()
self.total_Value_Sub_ = self.total$.linkFrom(value)
self.onDetach(self.total_Value_Sub_!)
      
    }
  }

  public var purpose: TransactionPurpose? {
    get {
      
if _purpose_inited_ {
  return _purpose_
}

return nil

      
    }
set(value) {
      
self.set(key: "purpose", value: value)
      
    }
  }

  var _purpose_: TransactionPurpose? = nil

  var _purpose_inited_: Bool = false

  public static let PURPOSE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "purpose"
  let classInfo: ClassInfo
  let transient = false
  let label = "Purpose" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var purpose_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "purpose",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var purpose_Value_Sub_: Subscription?

  public var purpose$: Slot {
    get {
      return self.purpose_Value_
    }
set(value) {
      
self.purpose_Value_Sub_?.detach()
self.purpose_Value_Sub_ = self.purpose$.linkFrom(value)
self.onDetach(self.purpose_Value_Sub_!)
      
    }
  }

  public var notes: String {
    get {
      
if _notes_inited_ {
  return _notes_!
}

return ""

      
    }
set(value) {
      
self.set(key: "notes", value: value)
      
    }
  }

  var _notes_: String! = nil

  var _notes_inited_: Bool = false

  public static let NOTES: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "notes"
  let classInfo: ClassInfo
  let transient = false
  let label = "Notes" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var notes_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "notes",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var notes_Value_Sub_: Subscription?

  public var notes$: Slot {
    get {
      return self.notes_Value_
    }
set(value) {
      
self.notes_Value_Sub_?.detach()
self.notes_Value_Sub_ = self.notes$.linkFrom(value)
self.onDetach(self.notes_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_id_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_id_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_id_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_status_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_status_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_status_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_referenceNumber_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_referenceNumber_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_referenceNumber_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_impsReferenceNumber_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_impsReferenceNumber_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_impsReferenceNumber_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_payerId_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_payerId_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_payerId_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_payeeId_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_payeeId_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_payeeId_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_amount_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_amount_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_amount_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_receivingAmount_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_receivingAmount_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_receivingAmount_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_date_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_date_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_date_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_tip_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_tip_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_tip_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_rate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Float {
    
var newValue = newValue
if let str = newValue as? String { newValue = Float(str) }
if let i = newValue as? Float { return i }
return 0
        
  }

  private func `_rate_preSet_`(_ oldValue: Any?, _ newValue: Float) -> Float {
    return newValue
  }

  private func `_rate_postSet_`(_ oldValue: Any?, _ newValue: Float) {
    
  }

  private func `_fees_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_fees_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_fees_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_total_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        
  }

  private func `_total_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_total_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_purpose_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> TransactionPurpose? {
    return newValue as! TransactionPurpose?
  }

  private func `_purpose_preSet_`(_ oldValue: Any?, _ newValue: TransactionPurpose?) -> TransactionPurpose? {
    return newValue
  }

  private func `_purpose_postSet_`(_ oldValue: Any?, _ newValue: TransactionPurpose?) {
    
  }

  private func `_notes_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_notes_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_notes_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Transaction.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Transaction.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "id":
    _id_inited_ = false
    _id_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "id"]) {
      _ = pub(["propertyChange", "id", id$])
    }
    break

  case "status":
    _status_inited_ = false
    _status_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "status"]) {
      _ = pub(["propertyChange", "status", status$])
    }
    break

  case "referenceNumber":
    _referenceNumber_inited_ = false
    _referenceNumber_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "referenceNumber"]) {
      _ = pub(["propertyChange", "referenceNumber", referenceNumber$])
    }
    break

  case "impsReferenceNumber":
    _impsReferenceNumber_inited_ = false
    _impsReferenceNumber_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "impsReferenceNumber"]) {
      _ = pub(["propertyChange", "impsReferenceNumber", impsReferenceNumber$])
    }
    break

  case "payerId":
    _payerId_inited_ = false
    _payerId_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "payerId"]) {
      _ = pub(["propertyChange", "payerId", payerId$])
    }
    break

  case "payeeId":
    _payeeId_inited_ = false
    _payeeId_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "payeeId"]) {
      _ = pub(["propertyChange", "payeeId", payeeId$])
    }
    break

  case "amount":
    _amount_inited_ = false
    _amount_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "amount"]) {
      _ = pub(["propertyChange", "amount", amount$])
    }
    break

  case "receivingAmount":
    _receivingAmount_inited_ = false
    _receivingAmount_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "receivingAmount"]) {
      _ = pub(["propertyChange", "receivingAmount", receivingAmount$])
    }
    break

  case "date":
    _date_inited_ = false
    _date_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "date"]) {
      _ = pub(["propertyChange", "date", date$])
    }
    break

  case "tip":
    _tip_inited_ = false
    _tip_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "tip"]) {
      _ = pub(["propertyChange", "tip", tip$])
    }
    break

  case "rate":
    _rate_inited_ = false
    _rate_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "rate"]) {
      _ = pub(["propertyChange", "rate", rate$])
    }
    break

  case "fees":
    _fees_inited_ = false
    _fees_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "fees"]) {
      _ = pub(["propertyChange", "fees", fees$])
    }
    break

  case "total":
    _total_inited_ = false
    _total_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "total"]) {
      _ = pub(["propertyChange", "total", total$])
    }
    break

  case "purpose":
    _purpose_inited_ = false
    _purpose_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "purpose"]) {
      _ = pub(["propertyChange", "purpose", purpose$])
    }
    break

  case "notes":
    _notes_inited_ = false
    _notes_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "notes"]) {
      _ = pub(["propertyChange", "notes", notes$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "id": return `_id_inited_`

  case "status": return `_status_inited_`

  case "referenceNumber": return `_referenceNumber_inited_`

  case "impsReferenceNumber": return `_impsReferenceNumber_inited_`

  case "payerId": return `_payerId_inited_`

  case "payeeId": return `_payeeId_inited_`

  case "amount": return `_amount_inited_`

  case "receivingAmount": return `_receivingAmount_inited_`

  case "date": return `_date_inited_`

  case "tip": return `_tip_inited_`

  case "rate": return `_rate_inited_`

  case "fees": return `_fees_inited_`

  case "total": return `_total_inited_`

  case "purpose": return `_purpose_inited_`

  case "notes": return `_notes_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "id": return `id`

  case "status": return `status`

  case "referenceNumber": return `referenceNumber`

  case "impsReferenceNumber": return `impsReferenceNumber`

  case "payerId": return `payerId`

  case "payeeId": return `payeeId`

  case "amount": return `amount`

  case "receivingAmount": return `receivingAmount`

  case "date": return `date`

  case "tip": return `tip`

  case "rate": return `rate`

  case "fees": return `fees`

  case "total": return `total`

  case "purpose": return `purpose`

  case "notes": return `notes`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "id": return `id$`

  case "status": return `status$`

  case "referenceNumber": return `referenceNumber$`

  case "impsReferenceNumber": return `impsReferenceNumber$`

  case "payerId": return `payerId$`

  case "payeeId": return `payeeId$`

  case "amount": return `amount$`

  case "receivingAmount": return `receivingAmount$`

  case "date": return `date$`

  case "tip": return `tip$`

  case "rate": return `rate$`

  case "fees": return `fees$`

  case "total": return `total$`

  case "purpose": return `purpose$`

  case "notes": return `notes$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "id$":
    id$ = value as! Slot
    return
  case "id":
  
    let oldValue: Any? = _id_inited_ ? self.`id` : nil
    _id_ = _id_preSet_(oldValue, _id_adapt_(oldValue, value))
    _id_inited_ = true
    _id_postSet_(oldValue, _id_)
    if hasListeners(["propertyChange", "id"]) && !FOAM_utils.equals(oldValue, _id_) {
      _ = pub(["propertyChange", "id", id$])
    }
    return

  case "status$":
    status$ = value as! Slot
    return
  case "status":
  
    let oldValue: Any? = _status_inited_ ? self.`status` : nil
    _status_ = _status_preSet_(oldValue, _status_adapt_(oldValue, value))
    _status_inited_ = true
    _status_postSet_(oldValue, _status_)
    if hasListeners(["propertyChange", "status"]) && !FOAM_utils.equals(oldValue, _status_) {
      _ = pub(["propertyChange", "status", status$])
    }
    return

  case "referenceNumber$":
    referenceNumber$ = value as! Slot
    return
  case "referenceNumber":
  
    let oldValue: Any? = _referenceNumber_inited_ ? self.`referenceNumber` : nil
    _referenceNumber_ = _referenceNumber_preSet_(oldValue, _referenceNumber_adapt_(oldValue, value))
    _referenceNumber_inited_ = true
    _referenceNumber_postSet_(oldValue, _referenceNumber_)
    if hasListeners(["propertyChange", "referenceNumber"]) && !FOAM_utils.equals(oldValue, _referenceNumber_) {
      _ = pub(["propertyChange", "referenceNumber", referenceNumber$])
    }
    return

  case "impsReferenceNumber$":
    impsReferenceNumber$ = value as! Slot
    return
  case "impsReferenceNumber":
  
    let oldValue: Any? = _impsReferenceNumber_inited_ ? self.`impsReferenceNumber` : nil
    _impsReferenceNumber_ = _impsReferenceNumber_preSet_(oldValue, _impsReferenceNumber_adapt_(oldValue, value))
    _impsReferenceNumber_inited_ = true
    _impsReferenceNumber_postSet_(oldValue, _impsReferenceNumber_)
    if hasListeners(["propertyChange", "impsReferenceNumber"]) && !FOAM_utils.equals(oldValue, _impsReferenceNumber_) {
      _ = pub(["propertyChange", "impsReferenceNumber", impsReferenceNumber$])
    }
    return

  case "payerId$":
    payerId$ = value as! Slot
    return
  case "payerId":
  
    let oldValue: Any? = _payerId_inited_ ? self.`payerId` : nil
    _payerId_ = _payerId_preSet_(oldValue, _payerId_adapt_(oldValue, value))
    _payerId_inited_ = true
    _payerId_postSet_(oldValue, _payerId_)
    if hasListeners(["propertyChange", "payerId"]) && !FOAM_utils.equals(oldValue, _payerId_) {
      _ = pub(["propertyChange", "payerId", payerId$])
    }
    return

  case "payeeId$":
    payeeId$ = value as! Slot
    return
  case "payeeId":
  
    let oldValue: Any? = _payeeId_inited_ ? self.`payeeId` : nil
    _payeeId_ = _payeeId_preSet_(oldValue, _payeeId_adapt_(oldValue, value))
    _payeeId_inited_ = true
    _payeeId_postSet_(oldValue, _payeeId_)
    if hasListeners(["propertyChange", "payeeId"]) && !FOAM_utils.equals(oldValue, _payeeId_) {
      _ = pub(["propertyChange", "payeeId", payeeId$])
    }
    return

  case "amount$":
    amount$ = value as! Slot
    return
  case "amount":
  
    let oldValue: Any? = _amount_inited_ ? self.`amount` : nil
    _amount_ = _amount_preSet_(oldValue, _amount_adapt_(oldValue, value))
    _amount_inited_ = true
    _amount_postSet_(oldValue, _amount_)
    if hasListeners(["propertyChange", "amount"]) && !FOAM_utils.equals(oldValue, _amount_) {
      _ = pub(["propertyChange", "amount", amount$])
    }
    return

  case "receivingAmount$":
    receivingAmount$ = value as! Slot
    return
  case "receivingAmount":
  
    let oldValue: Any? = _receivingAmount_inited_ ? self.`receivingAmount` : nil
    _receivingAmount_ = _receivingAmount_preSet_(oldValue, _receivingAmount_adapt_(oldValue, value))
    _receivingAmount_inited_ = true
    _receivingAmount_postSet_(oldValue, _receivingAmount_)
    if hasListeners(["propertyChange", "receivingAmount"]) && !FOAM_utils.equals(oldValue, _receivingAmount_) {
      _ = pub(["propertyChange", "receivingAmount", receivingAmount$])
    }
    return

  case "date$":
    date$ = value as! Slot
    return
  case "date":
  
    let oldValue: Any? = _date_inited_ ? self.`date` : nil
    _date_ = _date_preSet_(oldValue, _date_adapt_(oldValue, value))
    _date_inited_ = true
    _date_postSet_(oldValue, _date_)
    if hasListeners(["propertyChange", "date"]) && !FOAM_utils.equals(oldValue, _date_) {
      _ = pub(["propertyChange", "date", date$])
    }
    return

  case "tip$":
    tip$ = value as! Slot
    return
  case "tip":
  
    let oldValue: Any? = _tip_inited_ ? self.`tip` : nil
    _tip_ = _tip_preSet_(oldValue, _tip_adapt_(oldValue, value))
    _tip_inited_ = true
    _tip_postSet_(oldValue, _tip_)
    if hasListeners(["propertyChange", "tip"]) && !FOAM_utils.equals(oldValue, _tip_) {
      _ = pub(["propertyChange", "tip", tip$])
    }
    return

  case "rate$":
    rate$ = value as! Slot
    return
  case "rate":
  
    let oldValue: Any? = _rate_inited_ ? self.`rate` : nil
    _rate_ = _rate_preSet_(oldValue, _rate_adapt_(oldValue, value))
    _rate_inited_ = true
    _rate_postSet_(oldValue, _rate_)
    if hasListeners(["propertyChange", "rate"]) && !FOAM_utils.equals(oldValue, _rate_) {
      _ = pub(["propertyChange", "rate", rate$])
    }
    return

  case "fees$":
    fees$ = value as! Slot
    return
  case "fees":
  
    let oldValue: Any? = _fees_inited_ ? self.`fees` : nil
    _fees_ = _fees_preSet_(oldValue, _fees_adapt_(oldValue, value))
    _fees_inited_ = true
    _fees_postSet_(oldValue, _fees_)
    if hasListeners(["propertyChange", "fees"]) && !FOAM_utils.equals(oldValue, _fees_) {
      _ = pub(["propertyChange", "fees", fees$])
    }
    return

  case "total$":
    total$ = value as! Slot
    return
  case "total":
  
    let oldValue: Any? = _total_inited_ ? self.`total` : nil
    _total_ = _total_preSet_(oldValue, _total_adapt_(oldValue, value))
    _total_inited_ = true
    _total_postSet_(oldValue, _total_)
    if hasListeners(["propertyChange", "total"]) && !FOAM_utils.equals(oldValue, _total_) {
      _ = pub(["propertyChange", "total", total$])
    }
    return

  case "purpose$":
    purpose$ = value as! Slot
    return
  case "purpose":
  
    let oldValue: Any? = _purpose_inited_ ? self.`purpose` : nil
    _purpose_ = _purpose_preSet_(oldValue, _purpose_adapt_(oldValue, value))
    _purpose_inited_ = true
    _purpose_postSet_(oldValue, _purpose_)
    if hasListeners(["propertyChange", "purpose"]) && !FOAM_utils.equals(oldValue, _purpose_) {
      _ = pub(["propertyChange", "purpose", purpose$])
    }
    return

  case "notes$":
    notes$ = value as! Slot
    return
  case "notes":
  
    let oldValue: Any? = _notes_inited_ ? self.`notes` : nil
    _notes_ = _notes_preSet_(oldValue, _notes_adapt_(oldValue, value))
    _notes_inited_ = true
    _notes_postSet_(oldValue, _notes_)
    if hasListeners(["propertyChange", "notes"]) && !FOAM_utils.equals(oldValue, _notes_) {
      _ = pub(["propertyChange", "notes", notes$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "net.nanopay.tx.model.Transaction"

    lazy var label: String = "Transaction"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [ID,STATUS,REFERENCE_NUMBER,IMPS_REFERENCE_NUMBER,PAYER_ID,PAYEE_ID,AMOUNT,RECEIVING_AMOUNT,DATE,TIP,RATE,FEES,TOTAL,PURPOSE,NOTES]

    lazy var cls: AnyClass = Transaction.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Transaction(args, x)
    }

  }

}