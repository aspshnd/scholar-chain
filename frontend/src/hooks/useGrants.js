import { useEffect, useState } from "react";
import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  Account,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID } from "../utils/soroban";

const RPC_URL     = "https://soroban-testnet.stellar.org";
// const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;
const server      = new rpc.Server(RPC_URL);

async function callView(fnName, args = [], publicKey) {
  const contract = new Contract(CONTRACT_ID);
  const account  = new Account(publicKey, "0");

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(fnName, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }

  return scValToNative(sim.result.retval);
}

export function useGrants(publicKey) {
  const [grants, setGrants]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!publicKey) return; // tunggu wallet connect dulu

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const count = await callView("grant_count", [], publicKey);
        const total = Number(count);

        if (total === 0) {
          setGrants([]);
          return;
        }

        const results = await Promise.all(
          Array.from({ length: total }, (_, i) =>
            callView("get_grant", [nativeToScVal(i + 1, { type: "u64" })], publicKey)
              .catch(() => null)
          )
        );

        setGrants(results.filter(Boolean));
      } catch (err) {
        console.error("useGrants error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [publicKey]); // re-fetch saat publicKey berubah

  return { grants, loading, error };
}
