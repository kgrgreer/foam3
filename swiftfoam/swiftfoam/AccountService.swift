//
//  AccountService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class AccountService: Service {
  public static let instance: AccountService = AccountService()

  init() {
    super.init(withURL: ServiceURL.Account)
  }

  // Helps determine type of error to handle on frontend
  public enum AccountError: ServiceErrorProtocol {
    case AccountNotFound
    public func description() -> String {
      switch(self) {
      case .AccountNotFound:
        return "Account cannot be found for that id."
      }
    }
  }

  public func getAccountFor(userId id: Int, callback: @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard UserService.instance.isUserLoggedIn() else {
        DispatchQueue.main.async {
          callback(UserService.UserError.UserNotLoggedIn)
        }
        return
      }
      do {
        let pred = self.X.create(Eq.self, args: [
          "arg1": Account.classInfo().axiom(byName: "owner"),
          "arg2": id,
          ])

        guard let accountSink = (try self.dao.`where`(pred).skip(0).limit(1).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard accountSink.array.count > 0 else {
          // User Not Found.
          DispatchQueue.main.async {
            callback(AccountError.AccountNotFound)
          }
          return
        }

        guard let account = accountSink.array[0] as? Account else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        DispatchQueue.main.async {
          callback(account)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }
}
