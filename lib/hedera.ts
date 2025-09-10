import {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey,
  AccountId,
} from "@hashgraph/sdk";

const OP_ID = process.env.HEDERA_OPERATOR_ID || "";
const OP_KEY = process.env.HEDERA_OPERATOR_KEY || "";
const TOPIC_ID = process.env.HEDERA_TOPIC_ID || "";

function getClient() {
  if (!OP_ID || !OP_KEY) throw new Error("Hedera env not set");
  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(OP_ID),
    PrivateKey.fromString(OP_KEY)
  );
  return client;
}

export async function logToHedera(payload: any) {
  try {
    if (!TOPIC_ID) return { status: "no-topic", payload };
    const client = getClient();
    const tx = new TopicMessageSubmitTransaction({
      topicId: TOPIC_ID,
      message: JSON.stringify(payload),
    });
    const resp = await tx.execute(client);
    const receipt = await resp.getReceipt(client);
    return {
      status: receipt.status.toString(),
      txId: resp.transactionId.toString(),
    };
  } catch (err: any) {
    return { status: "error", error: err.message };
  }
}
