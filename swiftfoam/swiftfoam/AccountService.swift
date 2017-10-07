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

  public func verify(account: Account,
                     withPassword pass: String,
                     callback: @escaping (Any?) -> Void)
  {
    
  }

  public func update(account: Account,
                     forUserId id: Int,
                     callback: @escaping (Any?) -> Void)
  {
    // TODO: Add User Authenticity
  }

  public func getAccounts(startingAt skip:  Int? = 0,
                          withLimit  limit: Int? = 100,
                          callback:  @escaping ([Any?]?) -> Void)
  {
    // TODO: Add User Authenticity
  }
}
