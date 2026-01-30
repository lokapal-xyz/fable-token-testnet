import { useState, useEffect } from "react";
import { Button, Card, Heading, Text } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { useNotification } from "../hooks/useNotification";
import fableTokenContract from "../contracts/fable_token";
import styles from "./Home.module.css";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc as StellarRpc } from "@stellar/stellar-sdk";

// Split the fable into three parts with proper line breaks
const STORY_PARTS = [
  `A silly young cricket, accustomed to sing
Through the warm, sunny months of bright summer and spring,
Began to complain when he found that, at home,
His cupboard was empty, and winter was come.
Not a crumb to be found
On the snow-covered ground;
Not a flower could he see,
Not a leaf on a tree.
"Oh! what will become," says the cricket, "of me?"`,

  `At last by starvation and famine made bold,
All dripping with wet, and all trembling with cold,
Away he set off to a miserly ant,
To keep him alive, he would grant
Him shelter from rain,
And a mouthful of grain.
He wished only to borrow;
He'd repay it tomorrow;
If not, he must die of starvation and sorrow.`,

  `Says the ant to the cricket, "I'm your servant and friend,
But we ants never borrow; we ants never lend.
But tell me, dear cricket, did you lay nothing by
When the weather was warm?" Quoth the cricket, "Not I!
My heart was so light
That I sang day and night,
For all nature gave way."
"You sang, sir, you say?
Go then," says the ant, "and dance winter away."`,
];

type StoryState =
  | "locked"
  | "part1"
  | "part2"
  | "part3"
  | "complete"
  | "claimed";

export default function Home() {
  const { address, signTransaction, networkPassphrase } = useWallet();
  const { addNotification } = useNotification();
  const [storyState, setStoryState] = useState<StoryState>("locked");
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [nftTokenId, setNftTokenId] = useState<string>("");
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(false);

  // Check if user has already deposited when wallet connects
  useEffect(() => {
    const checkDepositStatus = () => {
      if (!address) return;

      // You could check if deposit exists and unlock story automatically
      // For now, we'll keep it simple and require manual unlock
    };

    if (address) {
      checkDepositStatus();
    }
  }, [address]);

  const copyToClipboard = async (text: string, type: "contract" | "token") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "contract") {
        setCopiedContract(true);
        setTimeout(() => setCopiedContract(false), 2000);
      } else {
        setCopiedTokenId(true);
        setTimeout(() => setCopiedTokenId(false), 2000);
      }
      addNotification("Copied to clipboard!", "success");
    } catch {
      addNotification("Failed to copy", "error");
    }
  };

  const makeDeposit = async () => {
    if (!address || !networkPassphrase) {
      addNotification("Please connect your wallet first", "error");
      return;
    }

    setIsDepositing(true);

    try {
      const server = new StellarRpc.Server(fableTokenContract.options.rpcUrl);

      // Get account
      const account = await server.getAccount(address);

      // Create contract instance
      const contract = new StellarSdk.Contract(
        fableTokenContract.options.contractId,
      );

      // Build transaction manually with longer timeout
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(
          contract.call(
            "deposit",
            StellarSdk.Address.fromString(address).toScVal(),
            StellarSdk.nativeToScVal(10_000_000, { type: "i128" }),
          ),
        )
        .setTimeout(300) // 5 minutes
        .build();

      // Prepare transaction (simulate and add fees)
      const preparedTx = await server.prepareTransaction(tx);

      // Sign with Freighter
      const signedXdr = await signTransaction(
        preparedTx.toEnvelope().toXDR("base64"),
        {
          networkPassphrase,
        },
      );

      if (!signedXdr || !signedXdr.signedTxXdr) {
        throw new Error("Transaction was not signed");
      }

      // Reconstruct signed transaction
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr,
        networkPassphrase,
      ) as StellarSdk.Transaction;

      // Send transaction
      const txResponse = await server.sendTransaction(signedTx);

      console.log("Transaction response:", txResponse);

      // sendTransaction only returns PENDING, DUPLICATE, TRY_AGAIN_LATER, or ERROR
      if (txResponse.status === "ERROR") {
        throw new Error("Transaction submission failed");
      }

      if (txResponse.status === "DUPLICATE") {
        throw new Error("Transaction already submitted");
      }

      if (txResponse.status === "TRY_AGAIN_LATER") {
        throw new Error("Network busy, please try again");
      }

      // Status is PENDING
      addNotification("Waiting for confirmation...", "success");

      // Poll for confirmation
      const hash = txResponse.hash;
      let getResponse = await server.getTransaction(hash);

      // Poll until status is not "NOT_FOUND"
      while (getResponse.status === "NOT_FOUND") {
        console.log("Waiting for transaction confirmation...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getResponse = await server.getTransaction(hash);
      }

      console.log("Final transaction status:", getResponse.status);

      if (getResponse.status === "SUCCESS") {
        addNotification("Deposit successful! Story unlocked 📖", "success");
        setStoryState("part1");
        setCurrentPart(0);
      } else {
        // Status is FAILED
        console.error("Transaction failed:", getResponse);
        throw new Error("Transaction failed on-chain");
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addNotification(`Deposit failed: ${errorMessage}`, "error");
      // Error recovery: allow user to try again
      setIsDepositing(false);
    } finally {
      setIsDepositing(false);
    }
  };

  const nextPart = () => {
    if (currentPart === 0) {
      setStoryState("part2");
      setCurrentPart(1);
    } else if (currentPart === 1) {
      setStoryState("part3");
      setCurrentPart(2);
    } else if (currentPart === 2) {
      setStoryState("complete");
    }
  };

  const withdrawAndMint = async () => {
    if (!address || !networkPassphrase) {
      addNotification("Please connect your wallet", "error");
      return;
    }

    setIsWithdrawing(true);

    try {
      const server = new StellarRpc.Server(fableTokenContract.options.rpcUrl);
      const account = await server.getAccount(address);

      const contract = new StellarSdk.Contract(
        fableTokenContract.options.contractId,
      );

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(
          contract.call(
            "finish_and_redeem",
            StellarSdk.Address.fromString(address).toScVal(),
          ),
        )
        .setTimeout(300) // 5 minutes
        .build();

      const preparedTx = await server.prepareTransaction(tx);

      const signedXdr = await signTransaction(
        preparedTx.toEnvelope().toXDR("base64"),
        {
          networkPassphrase,
        },
      );

      if (!signedXdr || !signedXdr.signedTxXdr) {
        throw new Error("Transaction was not signed");
      }

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr,
        networkPassphrase,
      ) as StellarSdk.Transaction;

      const txResponse = await server.sendTransaction(signedTx);

      if (txResponse.status === "ERROR") {
        throw new Error("Transaction submission failed");
      }

      if (txResponse.status === "DUPLICATE") {
        throw new Error("Transaction already submitted");
      }

      if (txResponse.status === "TRY_AGAIN_LATER") {
        throw new Error("Network busy, please try again");
      }

      addNotification("Claiming your NFT...", "success");

      const hash = txResponse.hash;
      let getResponse = await server.getTransaction(hash);

      while (getResponse.status === "NOT_FOUND") {
        console.log("Waiting for transaction confirmation...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getResponse = await server.getTransaction(hash);
      }

      if (getResponse.status === "SUCCESS") {
        addNotification("Success! XLM returned and NFT minted 🎉", "success");

        // Extract token ID from transaction events
        try {
          console.log("Full transaction response:", getResponse);

          // The events are in getResponse.events.contractEventsXdr
          let foundTokenId = false;

          if (getResponse.events && getResponse.events.contractEventsXdr) {
            const contractEvents = getResponse.events.contractEventsXdr;
            console.log("Contract events:", contractEvents);

            // Iterate through each event array
            for (let i = 0; i < contractEvents.length; i++) {
              const eventArray = contractEvents[i];
              console.log(`Event array ${i}:`, eventArray);

              // Each eventArray contains multiple events
              for (let j = 0; j < eventArray.length; j++) {
                const event = eventArray[j];
                console.log(`Processing event ${i}-${j}:`, event);

                try {
                  const body = event.body();
                  if (body && body.value) {
                    const contractEvent = body.value();
                    const topics = contractEvent.topics();
                    const data = contractEvent.data();

                    console.log("Event topics:", topics);
                    console.log("Event data:", data);

                    // Look for mint event
                    let isMintEvent = false;
                    for (let k = 0; k < topics.length; k++) {
                      try {
                        const sym = topics[k].sym();
                        if (sym) {
                          const symStr = sym.toString();
                          console.log(`Topic ${k} symbol:`, symStr);
                          if (symStr === "mint") {
                            isMintEvent = true;
                            break;
                          }
                        }
                      } catch {
                        // Not a symbol, might be an address or other type
                        console.log(`Topic ${k} is not a symbol`);
                      }
                    }

                    if (isMintEvent) {
                      console.log("Found mint event!");
                      // Try to extract token ID from data
                      try {
                        const tokenId = data.u32();
                        console.log("Token ID from data.u32():", tokenId);
                        setNftTokenId(tokenId.toString());
                        foundTokenId = true;
                        break;
                      } catch {
                        console.log("Data is not u32, trying topics...");
                        // Maybe the token ID is in the last topic
                        try {
                          const lastTopic = topics[topics.length - 1];
                          const tokenId = lastTopic.u32();
                          console.log(
                            "Token ID from last topic.u32():",
                            tokenId,
                          );
                          setNftTokenId(tokenId.toString());
                          foundTokenId = true;
                          break;
                        } catch {
                          console.log(
                            "Could not extract token ID from topics either",
                          );
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.log("Error processing event:", e);
                }
              }

              if (foundTokenId) break;
            }
          } else {
            console.log("No contract events found in response");
          }

          if (!foundTokenId) {
            console.log("Could not find token ID in events, using fallback");
            setNftTokenId("Check your wallet");
          }
        } catch (error) {
          console.error("Error extracting token ID:", error);
          setNftTokenId("Check your wallet");
        }

        setStoryState("claimed");
      } else {
        // Status is FAILED
        throw new Error("Withdrawal failed on-chain");
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addNotification(`Withdrawal failed: ${errorMessage}`, "error");
      // Error recovery: allow user to try again
      setIsWithdrawing(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDone = () => {
    setStoryState("locked");
    setCurrentPart(0);
    setNftTokenId("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.grainOverlay} />

      <div className={styles.content}>
        <header className={styles.header}>
          <Heading as="h1" size="xl" className={styles.title}>
            <span className={styles.titleWord}>The</span>
            <span className={styles.titleWord}>Ant</span>
            <span className={styles.titleWord}>&</span>
            <span className={styles.titleWord}>the</span>
            <span className={styles.titleWord}>Cricket</span>
          </Heading>
          <Text as="p" size="lg" className={styles.subtitle}>
            An Interactive Fable • Learn Web3 Through Literature
          </Text>
        </header>

        {!address && (
          <div className={`${styles.card} ${styles.fadeIn}`}>
            <Card>
              <div className={styles.cardContent}>
                <div className={styles.iconContainer}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <Heading as="h2" size="md">
                  Connect Your Wallet
                </Heading>
                <Text as="p" size="md">
                  Connect Freighter to begin your journey through this timeless
                  fable.
                </Text>
                <Text as="p" size="sm" className={styles.note}>
                  Use the "Connect Account" button in the header above.
                </Text>
              </div>
            </Card>
          </div>
        )}

        {address && storyState === "locked" && (
          <div className={`${styles.card} ${styles.fadeIn}`}>
            <Card>
              <div className={styles.cardContent}>
                <div className={`${styles.iconContainer} ${styles.pulse}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <Heading as="h2" size="md">
                  Unlock the Story
                </Heading>
                <Text as="p" size="md">
                  Deposit <strong>1 XLM</strong> to unlock the fable.
                </Text>
                <Text as="p" size="sm" className={styles.note}>
                  Don't worry - you'll get it back when you finish reading!
                </Text>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => void makeDeposit()}
                  disabled={isDepositing}
                  isLoading={isDepositing}
                  className={styles.primaryButton}
                >
                  {isDepositing ? "Processing..." : "Deposit 1 XLM"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {(storyState === "part1" ||
          storyState === "part2" ||
          storyState === "part3") && (
          <div className={`${styles.storyCard} ${styles.slideIn}`}>
            <Card>
              <div className={styles.storyContent}>
                <Text as="div" size="xs" className={styles.partIndicator}>
                  Part {currentPart + 1} of 3
                </Text>
                <div className={styles.storyText}>
                  {STORY_PARTS[currentPart]}
                </div>
                <div className={styles.storyNav}>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => void nextPart()}
                    className={styles.nextButton}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {storyState === "complete" && (
          <div className={`${styles.card} ${styles.fadeIn}`}>
            <Card>
              <div className={styles.cardContent}>
                <div
                  className={`${styles.iconContainer} ${styles.completeIcon} ${styles.bounce}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <Heading as="h2" size="md">
                  Story Complete!
                </Heading>
                <Text as="p" size="md">
                  You've finished reading the fable.
                </Text>
                <Text as="p" size="sm" className={styles.note}>
                  Withdraw your <strong>1 XLM</strong> and receive an exclusive
                  NFT commemorating your journey through this timeless tale.
                </Text>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => void withdrawAndMint()}
                  disabled={isWithdrawing}
                  isLoading={isWithdrawing}
                  className={styles.primaryButton}
                >
                  {isWithdrawing ? "Processing..." : "Withdraw & Claim NFT"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {storyState === "claimed" && (
          <div className={`${styles.card} ${styles.fadeIn}`}>
            <Card>
              <div className={styles.cardContent}>
                <div
                  className={`${styles.iconContainer} ${styles.successIcon} ${styles.scale}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <Heading as="h2" size="md">
                  NFT Successfully Minted!
                </Heading>
                <Text as="p" size="md">
                  Your exclusive "Ant & the Cricket" NFT has been minted and
                  sent to your wallet.
                </Text>

                {/* NFT Image Display */}
                <div className={styles.nftImageContainer}>
                  <img
                    src="/fable-token.png"
                    alt="Ant and Cricket NFT"
                    className={styles.nftImage}
                  />
                </div>

                <div className={styles.nftDetails}>
                  <div className={styles.detailRow}>
                    <Text as="span" size="sm" className={styles.detailLabel}>
                      Contract Address:
                    </Text>
                    <div className={styles.detailValue}>
                      <code className={styles.addressCode}>
                        {fableTokenContract.options.contractId.substring(0, 8)}
                        ...
                        {fableTokenContract.options.contractId.substring(
                          fableTokenContract.options.contractId.length - 6,
                        )}
                      </code>
                      <button
                        className={styles.copyButton}
                        onClick={() =>
                          copyToClipboard(
                            fableTokenContract.options.contractId,
                            "contract",
                          )
                        }
                        title="Copy full address"
                      >
                        {copiedContract ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <Text as="span" size="sm" className={styles.detailLabel}>
                      Token ID:
                    </Text>
                    <div className={styles.detailValue}>
                      <code className={styles.addressCode}>{nftTokenId}</code>
                      <button
                        className={styles.copyButton}
                        onClick={() => copyToClipboard(nftTokenId, "token")}
                        title="Copy token ID"
                      >
                        {copiedTokenId ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Text as="p" size="sm" className={styles.note}>
                  You can view your NFT in your Freighter wallet under the
                  Collectibles tab.
                </Text>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => void handleDone()}
                  className={styles.primaryButton}
                >
                  Done ✓
                </Button>
              </div>
            </Card>
          </div>
        )}

        <footer className={styles.footer}>
          <div className={styles.decorativeLine} />
          <div className={styles.footerContent}>
            <Text as="p" size="sm" className={styles.footerTitle}>
              <strong>About This Project</strong>
            </Text>
            <Text as="p" size="sm" className={styles.footerDescription}>
              An educational DApp introducing students (ages 8-11) to Web3
              concepts through classic literature. By reading Aesop's fable,
              students learn about blockchain wallets, transactions, and digital
              tokens in a safe, engaging way.
            </Text>
          </div>
          <div className={styles.decorativeLine} />
          <Text as="p" size="sm">
            Built on Stellar • Powered by Scaffold
          </Text>
        </footer>
      </div>
    </div>
  );
}
