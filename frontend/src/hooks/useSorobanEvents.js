import { useEffect, useState } from "react";
import { rpc } from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);

export function useSorobanEvents(contractId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contractId) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Ambil ledger terkini dulu
        const latestLedger = await server.getLatestLedger();
        const startLedger = Math.max(1, latestLedger.sequence - 1000);

        const res = await server.getEvents({
          startLedger,
          filters: [{ type: "contract", contractIds: [contractId] }],
          limit: 50,
        });

        const parsed = res.events.map((e) => {
          const topic = e.topic?.[0]?.toString?.() || "unknown";

          let type = "unknown";
          if (topic.includes("reg"))    type = "register";
          if (topic.includes("reject")) type = "reject";
          if (topic.includes("disb"))   type = "disburse";

          return {
            id:     e.id,
            type,
            txHash: e.ledger,
            ts:     new Date(e.ledgerClosedAt).getTime() / 1000,
            raw:    e,
          };
        });

        setEvents(parsed);
      } catch (err) {
        console.error("Event fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 8000);
    return () => clearInterval(interval);
  }, [contractId]);

  return { events, loading };
}