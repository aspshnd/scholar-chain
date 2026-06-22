// useRecipients.js
import { useEffect, useState } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { CONTRACT_ID } from "../utils/soroban";

const server = new rpc.Server("https://soroban-testnet.stellar.org");

export function useRecipients() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await server.getEvents({
          filters: [
            {
              type:        "contract",
              contractIds: [CONTRACT_ID],
            },
          ],
          limit: 100,
        });

        // Filter hanya event register, parse topic
        const parsed = res.events
          .filter(e => e.topic?.[0]?.toString?.().includes("reg"))
          .map(e => {
            const topics = e.topic.map(t => t.toString());
            return {
              student_id:    topics[1] || "",
              wallet:        topics[2] || "",
              grant_id:      topics[3] || "",
              status:        "Pending",
              registered_at: new Date(e.ledgerClosedAt).getTime() / 1000,
            };
          });

        setRecipients(parsed);
      } catch (err) {
        console.error("useRecipients error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { recipients, loading };
}