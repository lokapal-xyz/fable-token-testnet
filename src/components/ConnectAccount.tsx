import React from "react";
import { stellarNetwork } from "../contracts/util";
import FundAccountButton from "./FundAccountButton";
import { WalletButton } from "./WalletButton";
import NetworkPill from "./NetworkPill";
import styles from "./ConnectAccount.module.css";

const ConnectAccount: React.FC = () => {
  return (
    <div className={styles.container}>
      <WalletButton />
      {stellarNetwork !== "PUBLIC" && <FundAccountButton />}
      <NetworkPill />
    </div>
  );
};

export default ConnectAccount;
