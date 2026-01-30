import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCEY3T3OOOQW7ZVOBRZ7OPORGW3HPA6L2FWXVI3TFXN2WTGNIOEMXG66",
  },
} as const;

export type DataKey =
  | { tag: "Deposit"; values: readonly [string] }
  | { tag: "NftContract"; values: void }
  | { tag: "AssetAddress"; values: void };

export const RoleTransferError = {
  1200: { message: "NoPendingTransfer" },
  1201: { message: "InvalidLiveUntilLedger" },
  1202: { message: "InvalidPendingAccount" },
};

export const AccessControlError = {
  1210: { message: "Unauthorized" },
  1211: { message: "AdminNotSet" },
  1212: { message: "IndexOutOfBounds" },
  1213: { message: "AdminRoleNotFound" },
  1214: { message: "RoleCountIsNotZero" },
  1215: { message: "RoleNotFound" },
  1216: { message: "AdminAlreadySet" },
  1217: { message: "RoleNotHeld" },
  1218: { message: "RoleIsEmpty" },
};

/**
 * Storage key for enumeration of accounts per role.
 */
export interface RoleAccountKey {
  index: u32;
  role: string;
}

/**
 * Storage keys for the data associated with the access control
 */
export type AccessControlStorageKey =
  | { tag: "RoleAccounts"; values: readonly [RoleAccountKey] }
  | { tag: "HasRole"; values: readonly [string, string] }
  | { tag: "RoleAccountsCount"; values: readonly [string] }
  | { tag: "RoleAdmin"; values: readonly [string] }
  | { tag: "Admin"; values: void }
  | { tag: "PendingAdmin"; values: void };

export const OwnableError = {
  1220: { message: "OwnerNotSet" },
  1221: { message: "TransferInProgress" },
  1222: { message: "OwnerAlreadySet" },
};

/**
 * Storage keys for `Ownable` utility.
 */
export type OwnableStorageKey =
  | { tag: "Owner"; values: void }
  | { tag: "PendingOwner"; values: void };

export interface OwnerTokensKey {
  index: u32;
  owner: string;
}

/**
 * Storage keys for the data associated with the enumerable extension of
 * `NonFungibleToken`
 */
export type NFTEnumerableStorageKey =
  | { tag: "TotalSupply"; values: void }
  | { tag: "OwnerTokens"; values: readonly [OwnerTokensKey] }
  | { tag: "OwnerTokensIndex"; values: readonly [u32] }
  | { tag: "GlobalTokens"; values: readonly [u32] }
  | { tag: "GlobalTokensIndex"; values: readonly [u32] };

/**
 * Storage keys for the data associated with the consecutive extension of
 * `NonFungibleToken`
 */
export type NFTConsecutiveStorageKey =
  | { tag: "Approval"; values: readonly [u32] }
  | { tag: "Owner"; values: readonly [u32] }
  | { tag: "OwnershipBucket"; values: readonly [u32] }
  | { tag: "BurnedToken"; values: readonly [u32] };

/**
 * Storage container for royalty information
 */
export interface RoyaltyInfo {
  basis_points: u32;
  receiver: string;
}

/**
 * Storage keys for royalty data
 */
export type NFTRoyaltiesStorageKey =
  | { tag: "DefaultRoyalty"; values: void }
  | { tag: "TokenRoyalty"; values: readonly [u32] };

export const NonFungibleTokenError = {
  /**
   * Indicates a non-existent `token_id`.
   */
  200: { message: "NonExistentToken" },
  /**
   * Indicates an error related to the ownership over a particular token.
   * Used in transfers.
   */
  201: { message: "IncorrectOwner" },
  /**
   * Indicates a failure with the `operator`s approval. Used in transfers.
   */
  202: { message: "InsufficientApproval" },
  /**
   * Indicates a failure with the `approver` of a token to be approved. Used
   * in approvals.
   */
  203: { message: "InvalidApprover" },
  /**
   * Indicates an invalid value for `live_until_ledger` when setting
   * approvals.
   */
  204: { message: "InvalidLiveUntilLedger" },
  /**
   * Indicates overflow when adding two values
   */
  205: { message: "MathOverflow" },
  /**
   * Indicates all possible `token_id`s are already in use.
   */
  206: { message: "TokenIDsAreDepleted" },
  /**
   * Indicates an invalid amount to batch mint in `consecutive` extension.
   */
  207: { message: "InvalidAmount" },
  /**
   * Indicates the token does not exist in owner's list.
   */
  208: { message: "TokenNotFoundInOwnerList" },
  /**
   * Indicates the token does not exist in global list.
   */
  209: { message: "TokenNotFoundInGlobalList" },
  /**
   * Indicates access to unset metadata.
   */
  210: { message: "UnsetMetadata" },
  /**
   * Indicates the length of the base URI exceeds the maximum allowed.
   */
  211: { message: "BaseUriMaxLenExceeded" },
  /**
   * Indicates the royalty amount is higher than 10_000 (100%) basis points.
   */
  212: { message: "InvalidRoyaltyAmount" },
};

export type NFTSequentialStorageKey = { tag: "TokenIdCounter"; values: void };

/**
 * Storage container for token metadata
 */
export interface Metadata {
  base_uri: string;
  name: string;
  symbol: string;
}

/**
 * Storage container for the token for which an approval is granted
 * and the ledger number at which this approval expires.
 */
export interface ApprovalData {
  approved: string;
  live_until_ledger: u32;
}

/**
 * Storage keys for the data associated with `NonFungibleToken`
 */
export type NFTStorageKey =
  | { tag: "Owner"; values: readonly [u32] }
  | { tag: "Balance"; values: readonly [string] }
  | { tag: "Approval"; values: readonly [u32] }
  | { tag: "ApprovalForAll"; values: readonly [string, string] }
  | { tag: "Metadata"; values: void };

/**
 * Storage keys for the data associated with the allowlist extension
 */
export type AllowListStorageKey = { tag: "Allowed"; values: readonly [string] };

/**
 * Storage keys for the data associated with the blocklist extension
 */
export type BlockListStorageKey = { tag: "Blocked"; values: readonly [string] };

export const FungibleTokenError = {
  /**
   * Indicates an error related to the current balance of account from which
   * tokens are expected to be transferred.
   */
  100: { message: "InsufficientBalance" },
  /**
   * Indicates a failure with the allowance mechanism when a given spender
   * doesn't have enough allowance.
   */
  101: { message: "InsufficientAllowance" },
  /**
   * Indicates an invalid value for `live_until_ledger` when setting an
   * allowance.
   */
  102: { message: "InvalidLiveUntilLedger" },
  /**
   * Indicates an error when an input that must be >= 0
   */
  103: { message: "LessThanZero" },
  /**
   * Indicates overflow when adding two values
   */
  104: { message: "MathOverflow" },
  /**
   * Indicates access to uninitialized metadata
   */
  105: { message: "UnsetMetadata" },
  /**
   * Indicates that the operation would have caused `total_supply` to exceed
   * the `cap`.
   */
  106: { message: "ExceededCap" },
  /**
   * Indicates the supplied `cap` is not a valid cap value.
   */
  107: { message: "InvalidCap" },
  /**
   * Indicates the Cap was not set.
   */
  108: { message: "CapNotSet" },
  /**
   * Indicates the SAC address was not set.
   */
  109: { message: "SACNotSet" },
  /**
   * Indicates a SAC address different than expected.
   */
  110: { message: "SACAddressMismatch" },
  /**
   * Indicates a missing function parameter in the SAC contract context.
   */
  111: { message: "SACMissingFnParam" },
  /**
   * Indicates an invalid function parameter in the SAC contract context.
   */
  112: { message: "SACInvalidFnParam" },
  /**
   * The user is not allowed to perform this operation
   */
  113: { message: "UserNotAllowed" },
  /**
   * The user is blocked and cannot perform this operation
   */
  114: { message: "UserBlocked" },
};

/**
 * Storage key for accessing the SAC address
 */
export type SACAdminGenericDataKey = { tag: "Sac"; values: void };

/**
 * Storage key for accessing the SAC address
 */
export type SACAdminWrapperDataKey = { tag: "Sac"; values: void };

/**
 * Storage container for token metadata
 */
export interface Metadata {
  decimals: u32;
  name: string;
  symbol: string;
}

/**
 * Storage keys for the data associated with `FungibleToken`
 */
export type StorageKey =
  | { tag: "TotalSupply"; values: void }
  | { tag: "Balance"; values: readonly [string] }
  | { tag: "Allowance"; values: readonly [AllowanceKey] };

/**
 * Storage key that maps to [`AllowanceData`]
 */
export interface AllowanceKey {
  owner: string;
  spender: string;
}

/**
 * Storage container for the amount of tokens for which an allowance is granted
 * and the ledger number at which this allowance expires.
 */
export interface AllowanceData {
  amount: i128;
  live_until_ledger: u32;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * STORY LOGIC: Initialize the asset used for deposits
   */
  init: (
    { owner, asset_address }: { owner: string; asset_address: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mint: (
    { to }: { to: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a name transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  name: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>;

  /**
   * Construct and simulate a symbol transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  symbol: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>;

  /**
   * Construct and simulate a approve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve: (
    {
      approver,
      approved,
      token_id,
      live_until_ledger,
    }: {
      approver: string;
      approved: string;
      token_id: u32;
      live_until_ledger: u32;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  balance: (
    { account }: { account: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<u32>>;

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * STORY LOGIC: User deposits to unlock story
   */
  deposit: (
    { user, amount }: { user: string; amount: i128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a owner_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner_of: (
    { token_id }: { token_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<string>>;

  /**
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer: (
    { from, to, token_id }: { from: string; to: string; token_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a get_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_owner: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<string>>>;

  /**
   * Construct and simulate a token_uri transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  token_uri: (
    { token_id }: { token_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<string>>;

  /**
   * Construct and simulate a get_approved transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_approved: (
    { token_id }: { token_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Option<string>>>;

  /**
   * Construct and simulate a transfer_from transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer_from: (
    {
      spender,
      from,
      to,
      token_id,
    }: { spender: string; from: string; to: string; token_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a approve_for_all transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_for_all: (
    {
      owner,
      operator,
      live_until_ledger,
    }: { owner: string; operator: string; live_until_ledger: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a accept_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  accept_ownership: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a finish_and_redeem transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * STORY LOGIC: Finish story, get money back, and mint NFT
   */
  finish_and_redeem: (
    { user }: { user: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a renounce_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  renounce_ownership: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a transfer_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer_ownership: (
    {
      new_owner,
      live_until_ledger,
    }: { new_owner: string; live_until_ledger: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a is_approved_for_all transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_approved_for_all: (
    { owner, operator }: { owner: string; operator: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<boolean>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { owner }: { owner: string },
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ owner }, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAAAAADNTVE9SWSBMT0dJQzogSW5pdGlhbGl6ZSB0aGUgYXNzZXQgdXNlZCBmb3IgZGVwb3NpdHMAAAAABGluaXQAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADWFzc2V0X2FkZHJlc3MAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAEbWludAAAAAEAAAAAAAAAAnRvAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAEbmFtZQAAAAAAAAABAAAAEA==",
        "AAAAAAAAAAAAAAAGc3ltYm9sAAAAAAAAAAAAAQAAABA=",
        "AAAAAAAAAAAAAAAHYXBwcm92ZQAAAAAEAAAAAAAAAAhhcHByb3ZlcgAAABMAAAAAAAAACGFwcHJvdmVkAAAAEwAAAAAAAAAIdG9rZW5faWQAAAAEAAAAAAAAABFsaXZlX3VudGlsX2xlZGdlcgAAAAAAAAQAAAAA",
        "AAAAAAAAAAAAAAAHYmFsYW5jZQAAAAABAAAAAAAAAAdhY2NvdW50AAAAABMAAAABAAAABA==",
        "AAAAAAAAACpTVE9SWSBMT0dJQzogVXNlciBkZXBvc2l0cyB0byB1bmxvY2sgc3RvcnkAAAAAAAdkZXBvc2l0AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAAAAAAAAIb3duZXJfb2YAAAABAAAAAAAAAAh0b2tlbl9pZAAAAAQAAAABAAAAEw==",
        "AAAAAAAAAAAAAAAIdHJhbnNmZXIAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAACHRva2VuX2lkAAAABAAAAAA=",
        "AAAAAAAAAAAAAAAJZ2V0X293bmVyAAAAAAAAAAAAAAEAAAPoAAAAEw==",
        "AAAAAAAAAAAAAAAJdG9rZW5fdXJpAAAAAAAAAQAAAAAAAAAIdG9rZW5faWQAAAAEAAAAAQAAABA=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAAB0RlcG9zaXQAAAAAAQAAABMAAAAAAAAAAAAAAAtOZnRDb250cmFjdAAAAAAAAAAAAAAAAAxBc3NldEFkZHJlc3M=",
        "AAAAAAAAAAAAAAAMZ2V0X2FwcHJvdmVkAAAAAQAAAAAAAAAIdG9rZW5faWQAAAAEAAAAAQAAA+gAAAAT",
        "AAAAAAAAAAAAAAANdHJhbnNmZXJfZnJvbQAAAAAAAAQAAAAAAAAAB3NwZW5kZXIAAAAAEwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAh0b2tlbl9pZAAAAAQAAAAA",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAPYXBwcm92ZV9mb3JfYWxsAAAAAAMAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAIb3BlcmF0b3IAAAATAAAAAAAAABFsaXZlX3VudGlsX2xlZGdlcgAAAAAAAAQAAAAA",
        "AAAAAAAAAAAAAAAQYWNjZXB0X293bmVyc2hpcAAAAAAAAAAA",
        "AAAAAAAAADdTVE9SWSBMT0dJQzogRmluaXNoIHN0b3J5LCBnZXQgbW9uZXkgYmFjaywgYW5kIG1pbnQgTkZUAAAAABFmaW5pc2hfYW5kX3JlZGVlbQAAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAScmVub3VuY2Vfb3duZXJzaGlwAAAAAAAAAAAAAA==",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAACAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAAAAABFsaXZlX3VudGlsX2xlZGdlcgAAAAAAAAQAAAAA",
        "AAAAAAAAAAAAAAATaXNfYXBwcm92ZWRfZm9yX2FsbAAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACG9wZXJhdG9yAAAAEwAAAAEAAAAB",
        "AAAABAAAAAAAAAAAAAAAEVJvbGVUcmFuc2ZlckVycm9yAAAAAAAAAwAAAAAAAAARTm9QZW5kaW5nVHJhbnNmZXIAAAAAAASwAAAAAAAAABZJbnZhbGlkTGl2ZVVudGlsTGVkZ2VyAAAAAASxAAAAAAAAABVJbnZhbGlkUGVuZGluZ0FjY291bnQAAAAAAASy",
        "AAAABAAAAAAAAAAAAAAAEkFjY2Vzc0NvbnRyb2xFcnJvcgAAAAAACQAAAAAAAAAMVW5hdXRob3JpemVkAAAEugAAAAAAAAALQWRtaW5Ob3RTZXQAAAAEuwAAAAAAAAAQSW5kZXhPdXRPZkJvdW5kcwAABLwAAAAAAAAAEUFkbWluUm9sZU5vdEZvdW5kAAAAAAAEvQAAAAAAAAASUm9sZUNvdW50SXNOb3RaZXJvAAAAAAS+AAAAAAAAAAxSb2xlTm90Rm91bmQAAAS/AAAAAAAAAA9BZG1pbkFscmVhZHlTZXQAAAAEwAAAAAAAAAALUm9sZU5vdEhlbGQAAAAEwQAAAAAAAAALUm9sZUlzRW1wdHkAAAAEwg==",
        "AAAAAQAAADFTdG9yYWdlIGtleSBmb3IgZW51bWVyYXRpb24gb2YgYWNjb3VudHMgcGVyIHJvbGUuAAAAAAAAAAAAAA5Sb2xlQWNjb3VudEtleQAAAAAAAgAAAAAAAAAFaW5kZXgAAAAAAAAEAAAAAAAAAARyb2xlAAAAEQ==",
        "AAAAAgAAADxTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgYWNjZXNzIGNvbnRyb2wAAAAAAAAAF0FjY2Vzc0NvbnRyb2xTdG9yYWdlS2V5AAAAAAYAAAABAAAAAAAAAAxSb2xlQWNjb3VudHMAAAABAAAH0AAAAA5Sb2xlQWNjb3VudEtleQAAAAAAAQAAAAAAAAAHSGFzUm9sZQAAAAACAAAAEwAAABEAAAABAAAAAAAAABFSb2xlQWNjb3VudHNDb3VudAAAAAAAAAEAAAARAAAAAQAAAAAAAAAJUm9sZUFkbWluAAAAAAAAAQAAABEAAAAAAAAAAAAAAAVBZG1pbgAAAAAAAAAAAAAAAAAADFBlbmRpbmdBZG1pbg==",
        "AAAABAAAAAAAAAAAAAAADE93bmFibGVFcnJvcgAAAAMAAAAAAAAAC093bmVyTm90U2V0AAAABMQAAAAAAAAAElRyYW5zZmVySW5Qcm9ncmVzcwAAAAAExQAAAAAAAAAPT3duZXJBbHJlYWR5U2V0AAAABMY=",
        "AAAAAgAAACNTdG9yYWdlIGtleXMgZm9yIGBPd25hYmxlYCB1dGlsaXR5LgAAAAAAAAAAEU93bmFibGVTdG9yYWdlS2V5AAAAAAAAAgAAAAAAAAAAAAAABU93bmVyAAAAAAAAAAAAAAAAAAAMUGVuZGluZ093bmVy",
        "AAAAAQAAAAAAAAAAAAAADk93bmVyVG9rZW5zS2V5AAAAAAACAAAAAAAAAAVpbmRleAAAAAAAAAQAAAAAAAAABW93bmVyAAAAAAAAEw==",
        "AAAAAgAAAFhTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgZW51bWVyYWJsZSBleHRlbnNpb24gb2YKYE5vbkZ1bmdpYmxlVG9rZW5gAAAAAAAAABdORlRFbnVtZXJhYmxlU3RvcmFnZUtleQAAAAAFAAAAAAAAAAAAAAALVG90YWxTdXBwbHkAAAAAAQAAAAAAAAALT3duZXJUb2tlbnMAAAAAAQAAB9AAAAAOT3duZXJUb2tlbnNLZXkAAAAAAAEAAAAAAAAAEE93bmVyVG9rZW5zSW5kZXgAAAABAAAABAAAAAEAAAAAAAAADEdsb2JhbFRva2VucwAAAAEAAAAEAAAAAQAAAAAAAAARR2xvYmFsVG9rZW5zSW5kZXgAAAAAAAABAAAABA==",
        "AAAAAgAAAFlTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgY29uc2VjdXRpdmUgZXh0ZW5zaW9uIG9mCmBOb25GdW5naWJsZVRva2VuYAAAAAAAAAAAAAAYTkZUQ29uc2VjdXRpdmVTdG9yYWdlS2V5AAAABAAAAAEAAAAAAAAACEFwcHJvdmFsAAAAAQAAAAQAAAABAAAAAAAAAAVPd25lcgAAAAAAAAEAAAAEAAAAAQAAAAAAAAAPT3duZXJzaGlwQnVja2V0AAAAAAEAAAAEAAAAAQAAAAAAAAALQnVybmVkVG9rZW4AAAAAAQAAAAQ=",
        "AAAAAQAAAClTdG9yYWdlIGNvbnRhaW5lciBmb3Igcm95YWx0eSBpbmZvcm1hdGlvbgAAAAAAAAAAAAALUm95YWx0eUluZm8AAAAAAgAAAAAAAAAMYmFzaXNfcG9pbnRzAAAABAAAAAAAAAAIcmVjZWl2ZXIAAAAT",
        "AAAAAgAAAB1TdG9yYWdlIGtleXMgZm9yIHJveWFsdHkgZGF0YQAAAAAAAAAAAAAWTkZUUm95YWx0aWVzU3RvcmFnZUtleQAAAAAAAgAAAAAAAAAAAAAADkRlZmF1bHRSb3lhbHR5AAAAAAABAAAAAAAAAAxUb2tlblJveWFsdHkAAAABAAAABA==",
        "AAAABAAAAAAAAAAAAAAAFU5vbkZ1bmdpYmxlVG9rZW5FcnJvcgAAAAAAAA0AAAAkSW5kaWNhdGVzIGEgbm9uLWV4aXN0ZW50IGB0b2tlbl9pZGAuAAAAEE5vbkV4aXN0ZW50VG9rZW4AAADIAAAAV0luZGljYXRlcyBhbiBlcnJvciByZWxhdGVkIHRvIHRoZSBvd25lcnNoaXAgb3ZlciBhIHBhcnRpY3VsYXIgdG9rZW4uClVzZWQgaW4gdHJhbnNmZXJzLgAAAAAOSW5jb3JyZWN0T3duZXIAAAAAAMkAAABFSW5kaWNhdGVzIGEgZmFpbHVyZSB3aXRoIHRoZSBgb3BlcmF0b3JgcyBhcHByb3ZhbC4gVXNlZCBpbiB0cmFuc2ZlcnMuAAAAAAAAFEluc3VmZmljaWVudEFwcHJvdmFsAAAAygAAAFVJbmRpY2F0ZXMgYSBmYWlsdXJlIHdpdGggdGhlIGBhcHByb3ZlcmAgb2YgYSB0b2tlbiB0byBiZSBhcHByb3ZlZC4gVXNlZAppbiBhcHByb3ZhbHMuAAAAAAAAD0ludmFsaWRBcHByb3ZlcgAAAADLAAAASkluZGljYXRlcyBhbiBpbnZhbGlkIHZhbHVlIGZvciBgbGl2ZV91bnRpbF9sZWRnZXJgIHdoZW4gc2V0dGluZwphcHByb3ZhbHMuAAAAAAAWSW52YWxpZExpdmVVbnRpbExlZGdlcgAAAAAAzAAAAClJbmRpY2F0ZXMgb3ZlcmZsb3cgd2hlbiBhZGRpbmcgdHdvIHZhbHVlcwAAAAAAAAxNYXRoT3ZlcmZsb3cAAADNAAAANkluZGljYXRlcyBhbGwgcG9zc2libGUgYHRva2VuX2lkYHMgYXJlIGFscmVhZHkgaW4gdXNlLgAAAAAAE1Rva2VuSURzQXJlRGVwbGV0ZWQAAAAAzgAAAEVJbmRpY2F0ZXMgYW4gaW52YWxpZCBhbW91bnQgdG8gYmF0Y2ggbWludCBpbiBgY29uc2VjdXRpdmVgIGV4dGVuc2lvbi4AAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAM8AAAAzSW5kaWNhdGVzIHRoZSB0b2tlbiBkb2VzIG5vdCBleGlzdCBpbiBvd25lcidzIGxpc3QuAAAAABhUb2tlbk5vdEZvdW5kSW5Pd25lckxpc3QAAADQAAAAMkluZGljYXRlcyB0aGUgdG9rZW4gZG9lcyBub3QgZXhpc3QgaW4gZ2xvYmFsIGxpc3QuAAAAAAAZVG9rZW5Ob3RGb3VuZEluR2xvYmFsTGlzdAAAAAAAANEAAAAjSW5kaWNhdGVzIGFjY2VzcyB0byB1bnNldCBtZXRhZGF0YS4AAAAADVVuc2V0TWV0YWRhdGEAAAAAAADSAAAAQUluZGljYXRlcyB0aGUgbGVuZ3RoIG9mIHRoZSBiYXNlIFVSSSBleGNlZWRzIHRoZSBtYXhpbXVtIGFsbG93ZWQuAAAAAAAAFUJhc2VVcmlNYXhMZW5FeGNlZWRlZAAAAAAAANMAAABHSW5kaWNhdGVzIHRoZSByb3lhbHR5IGFtb3VudCBpcyBoaWdoZXIgdGhhbiAxMF8wMDAgKDEwMCUpIGJhc2lzIHBvaW50cy4AAAAAFEludmFsaWRSb3lhbHR5QW1vdW50AAAA1A==",
        "AAAAAgAAAAAAAAAAAAAAF05GVFNlcXVlbnRpYWxTdG9yYWdlS2V5AAAAAAEAAAAAAAAAAAAAAA5Ub2tlbklkQ291bnRlcgAA",
        "AAAAAQAAACRTdG9yYWdlIGNvbnRhaW5lciBmb3IgdG9rZW4gbWV0YWRhdGEAAAAAAAAACE1ldGFkYXRhAAAAAwAAAAAAAAAIYmFzZV91cmkAAAAQAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAGc3ltYm9sAAAAAAAQ",
        "AAAAAQAAAHZTdG9yYWdlIGNvbnRhaW5lciBmb3IgdGhlIHRva2VuIGZvciB3aGljaCBhbiBhcHByb3ZhbCBpcyBncmFudGVkCmFuZCB0aGUgbGVkZ2VyIG51bWJlciBhdCB3aGljaCB0aGlzIGFwcHJvdmFsIGV4cGlyZXMuAAAAAAAAAAAADEFwcHJvdmFsRGF0YQAAAAIAAAAAAAAACGFwcHJvdmVkAAAAEwAAAAAAAAARbGl2ZV91bnRpbF9sZWRnZXIAAAAAAAAE",
        "AAAAAgAAADxTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBgTm9uRnVuZ2libGVUb2tlbmAAAAAAAAAADU5GVFN0b3JhZ2VLZXkAAAAAAAAFAAAAAQAAAAAAAAAFT3duZXIAAAAAAAABAAAABAAAAAEAAAAAAAAAB0JhbGFuY2UAAAAAAQAAABMAAAABAAAAAAAAAAhBcHByb3ZhbAAAAAEAAAAEAAAAAQAAAAAAAAAOQXBwcm92YWxGb3JBbGwAAAAAAAIAAAATAAAAEwAAAAAAAAAAAAAACE1ldGFkYXRh",
        "AAAAAgAAAEFTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgYWxsb3dsaXN0IGV4dGVuc2lvbgAAAAAAAAAAAAATQWxsb3dMaXN0U3RvcmFnZUtleQAAAAABAAAAAQAAACdTdG9yZXMgdGhlIGFsbG93ZWQgc3RhdHVzIG9mIGFuIGFjY291bnQAAAAAB0FsbG93ZWQAAAAAAQAAABM=",
        "AAAAAgAAAEFTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgYmxvY2tsaXN0IGV4dGVuc2lvbgAAAAAAAAAAAAATQmxvY2tMaXN0U3RvcmFnZUtleQAAAAABAAAAAQAAACdTdG9yZXMgdGhlIGJsb2NrZWQgc3RhdHVzIG9mIGFuIGFjY291bnQAAAAAB0Jsb2NrZWQAAAAAAQAAABM=",
        "AAAABAAAAAAAAAAAAAAAEkZ1bmdpYmxlVG9rZW5FcnJvcgAAAAAADwAAAG5JbmRpY2F0ZXMgYW4gZXJyb3IgcmVsYXRlZCB0byB0aGUgY3VycmVudCBiYWxhbmNlIG9mIGFjY291bnQgZnJvbSB3aGljaAp0b2tlbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHRyYW5zZmVycmVkLgAAAAAAE0luc3VmZmljaWVudEJhbGFuY2UAAAAAZAAAAGRJbmRpY2F0ZXMgYSBmYWlsdXJlIHdpdGggdGhlIGFsbG93YW5jZSBtZWNoYW5pc20gd2hlbiBhIGdpdmVuIHNwZW5kZXIKZG9lc24ndCBoYXZlIGVub3VnaCBhbGxvd2FuY2UuAAAAFUluc3VmZmljaWVudEFsbG93YW5jZQAAAAAAAGUAAABNSW5kaWNhdGVzIGFuIGludmFsaWQgdmFsdWUgZm9yIGBsaXZlX3VudGlsX2xlZGdlcmAgd2hlbiBzZXR0aW5nIGFuCmFsbG93YW5jZS4AAAAAAAAWSW52YWxpZExpdmVVbnRpbExlZGdlcgAAAAAAZgAAADJJbmRpY2F0ZXMgYW4gZXJyb3Igd2hlbiBhbiBpbnB1dCB0aGF0IG11c3QgYmUgPj0gMAAAAAAADExlc3NUaGFuWmVybwAAAGcAAAApSW5kaWNhdGVzIG92ZXJmbG93IHdoZW4gYWRkaW5nIHR3byB2YWx1ZXMAAAAAAAAMTWF0aE92ZXJmbG93AAAAaAAAACpJbmRpY2F0ZXMgYWNjZXNzIHRvIHVuaW5pdGlhbGl6ZWQgbWV0YWRhdGEAAAAAAA1VbnNldE1ldGFkYXRhAAAAAAAAaQAAAFJJbmRpY2F0ZXMgdGhhdCB0aGUgb3BlcmF0aW9uIHdvdWxkIGhhdmUgY2F1c2VkIGB0b3RhbF9zdXBwbHlgIHRvIGV4Y2VlZAp0aGUgYGNhcGAuAAAAAAALRXhjZWVkZWRDYXAAAAAAagAAADZJbmRpY2F0ZXMgdGhlIHN1cHBsaWVkIGBjYXBgIGlzIG5vdCBhIHZhbGlkIGNhcCB2YWx1ZS4AAAAAAApJbnZhbGlkQ2FwAAAAAABrAAAAHkluZGljYXRlcyB0aGUgQ2FwIHdhcyBub3Qgc2V0LgAAAAAACUNhcE5vdFNldAAAAAAAAGwAAAAmSW5kaWNhdGVzIHRoZSBTQUMgYWRkcmVzcyB3YXMgbm90IHNldC4AAAAAAAlTQUNOb3RTZXQAAAAAAABtAAAAMEluZGljYXRlcyBhIFNBQyBhZGRyZXNzIGRpZmZlcmVudCB0aGFuIGV4cGVjdGVkLgAAABJTQUNBZGRyZXNzTWlzbWF0Y2gAAAAAAG4AAABDSW5kaWNhdGVzIGEgbWlzc2luZyBmdW5jdGlvbiBwYXJhbWV0ZXIgaW4gdGhlIFNBQyBjb250cmFjdCBjb250ZXh0LgAAAAARU0FDTWlzc2luZ0ZuUGFyYW0AAAAAAABvAAAAREluZGljYXRlcyBhbiBpbnZhbGlkIGZ1bmN0aW9uIHBhcmFtZXRlciBpbiB0aGUgU0FDIGNvbnRyYWN0IGNvbnRleHQuAAAAEVNBQ0ludmFsaWRGblBhcmFtAAAAAAAAcAAAADFUaGUgdXNlciBpcyBub3QgYWxsb3dlZCB0byBwZXJmb3JtIHRoaXMgb3BlcmF0aW9uAAAAAAAADlVzZXJOb3RBbGxvd2VkAAAAAABxAAAANVRoZSB1c2VyIGlzIGJsb2NrZWQgYW5kIGNhbm5vdCBwZXJmb3JtIHRoaXMgb3BlcmF0aW9uAAAAAAAAC1VzZXJCbG9ja2VkAAAAAHI=",
        "AAAAAgAAAClTdG9yYWdlIGtleSBmb3IgYWNjZXNzaW5nIHRoZSBTQUMgYWRkcmVzcwAAAAAAAAAAAAAWU0FDQWRtaW5HZW5lcmljRGF0YUtleQAAAAAAAQAAAAAAAAAAAAAAA1NhYwA=",
        "AAAAAgAAAClTdG9yYWdlIGtleSBmb3IgYWNjZXNzaW5nIHRoZSBTQUMgYWRkcmVzcwAAAAAAAAAAAAAWU0FDQWRtaW5XcmFwcGVyRGF0YUtleQAAAAAAAQAAAAAAAAAAAAAAA1NhYwA=",
        "AAAAAQAAACRTdG9yYWdlIGNvbnRhaW5lciBmb3IgdG9rZW4gbWV0YWRhdGEAAAAAAAAACE1ldGFkYXRhAAAAAwAAAAAAAAAIZGVjaW1hbHMAAAAEAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAGc3ltYm9sAAAAAAAQ",
        "AAAAAgAAADlTdG9yYWdlIGtleXMgZm9yIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBgRnVuZ2libGVUb2tlbmAAAAAAAAAAAAAAClN0b3JhZ2VLZXkAAAAAAAMAAAAAAAAAAAAAAAtUb3RhbFN1cHBseQAAAAABAAAAAAAAAAdCYWxhbmNlAAAAAAEAAAATAAAAAQAAAAAAAAAJQWxsb3dhbmNlAAAAAAAAAQAAB9AAAAAMQWxsb3dhbmNlS2V5",
        "AAAAAQAAACpTdG9yYWdlIGtleSB0aGF0IG1hcHMgdG8gW2BBbGxvd2FuY2VEYXRhYF0AAAAAAAAAAAAMQWxsb3dhbmNlS2V5AAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdzcGVuZGVyAAAAABM=",
        "AAAAAQAAAINTdG9yYWdlIGNvbnRhaW5lciBmb3IgdGhlIGFtb3VudCBvZiB0b2tlbnMgZm9yIHdoaWNoIGFuIGFsbG93YW5jZSBpcyBncmFudGVkCmFuZCB0aGUgbGVkZ2VyIG51bWJlciBhdCB3aGljaCB0aGlzIGFsbG93YW5jZSBleHBpcmVzLgAAAAAAAAAADUFsbG93YW5jZURhdGEAAAAAAAACAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAEWxpdmVfdW50aWxfbGVkZ2VyAAAAAAAABA==",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
    mint: this.txFromJSON<null>,
    name: this.txFromJSON<string>,
    symbol: this.txFromJSON<string>,
    approve: this.txFromJSON<null>,
    balance: this.txFromJSON<u32>,
    deposit: this.txFromJSON<null>,
    owner_of: this.txFromJSON<string>,
    transfer: this.txFromJSON<null>,
    get_owner: this.txFromJSON<Option<string>>,
    token_uri: this.txFromJSON<string>,
    get_approved: this.txFromJSON<Option<string>>,
    transfer_from: this.txFromJSON<null>,
    approve_for_all: this.txFromJSON<null>,
    accept_ownership: this.txFromJSON<null>,
    finish_and_redeem: this.txFromJSON<null>,
    renounce_ownership: this.txFromJSON<null>,
    transfer_ownership: this.txFromJSON<null>,
    is_approved_for_all: this.txFromJSON<boolean>,
  };
}
