import { createCofheConfig, createCofheClient } from "@cofhe/sdk/web";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { arbSepolia } from "@cofhe/sdk/chains";
import { createPublicClient, createWalletClient, custom } from "viem";
import { PRIVY_HIRE_ADDRESS } from "./contracts";

declare global {
    interface Window {
        ethereum: any;
    }
}

// Global client instance
let cachedClient: any = null;

export async function getCofheClient() {
    if (cachedClient) return cachedClient;

    if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Ethereum provider not available");
    }

    const config = createCofheConfig({
        supportedChains: [arbSepolia],
        useWorkers: false,
    });
    cachedClient = createCofheClient(config);

    return cachedClient;
}

/**
 * Connects the FHE client using raw Viem clients built directly from window.ethereum.
 * Always reconnects (no stale-connection guard) so the permit is always scoped to the
 * current active wallet account and chainId.
 */
export async function connectCofhe() {
    console.log("[FHE DEBUG] connectCofhe starting...");
    const c = await getCofheClient();
    const ethereum = window.ethereum;
    if (!ethereum) throw new Error("No Ethereum provider available");

    const transport = custom({
        request: ({ method, params }: { method: string; params?: any[] }) =>
            ethereum.request({ method, params: params ?? [] }),
    });

    const { arbitrumSepolia } = await import("viem/chains");
    const rawPublicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport,
    });

    const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
    const currentAccount = accounts[0] as `0x${string}`;
    console.log(`[FHE DEBUG] Current Wallet Account: ${currentAccount}`);

    const rawWalletClient = createWalletClient({
        transport,
        account: currentAccount,
    });

    // Check chain ID match
    const providerChainId = await ethereum.request({ method: "eth_chainId" });
    console.log(`[FHE DEBUG] Provider ChainID: ${providerChainId} (Expected: 0x${arbitrumSepolia.id.toString(16)})`);

    console.log("[FHE DEBUG] Calling c.connect()...");
    await (c as any).connect(rawPublicClient, rawWalletClient);
    console.log("[FHE DEBUG] c.connect() complete.");

    return c;
}

// --- HELPER FUNCTIONS --- //

export async function decryptUint32(handle: string | bigint) {
    let permit: any = null;
    try {
        console.log(`[FHE DEBUG] decryptUint32 for handle: ${handle}`);
        const c = await connectCofhe();
        
        console.log(`[FHE DEBUG] Requesting permit...`);
        // Reverting to default permit generation (no validatorContract)
        // per user logs/docs, the SDK handles the CoFHE ACL verifier automatically.
        permit = await c.permits.getOrCreateSelfPermit();
        
        console.log("[FHE DEBUG] Permit generated:", {
            account: permit.account,
            chainId: permit.chainId,
            domain: (permit as any).domain,
            types: (permit as any).types,
            signature: (permit as any).signature ? "exists" : "MISSING"
        });

        console.log("[FHE DEBUG] Executing decryptForView...");
        // Guard against zero handles which have no ACL entry and cause 403
        if (BigInt(handle) === 0n) {
            console.warn("[FHE DEBUG] Handle is zero, skipping decryption.");
            return 0n;
        }
        
        const result = await c.decryptForView(handle, FheTypes.Uint32)
            .withPermit(permit)
            .execute();
            
        console.log(`[FHE DEBUG] Decryption Success: ${result}`);
        return result;
    } catch (error: any) {
        console.error("[FHE DEBUG] Decryption Failed!", error);
        if (error.message?.includes("403")) {
            console.error("[FHE DEBUG] HTTP 403 detected. This usually means the permit account/chainId/verifyingContract doesn't have ACL permission for this handle on the CoFHE node.");
            console.error("[FHE DEBUG] Permit Account:", permit?.account || "unknown");
            console.error("[FHE DEBUG] Permit VerifyingContract:", permit?.domain?.verifyingContract || "unknown");
        }
        throw error;
    }
}

export { Encryptable, FheTypes };
