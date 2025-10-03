import { SimulatedWalletService, WalletId } from './wallet.service';

export interface SweepingService {
  /**
   * Sweep all funds from the user wallet to a specified address.
   * @param fromWalletId - Wallet to sweep from
   * @param toAddress - Target address for sweeping funds
   * @returns {Promise<void>}
   */
  sweepAll(walletIds: WalletId[], toAddress: WalletId): Promise<void>;
}

export class TaskSweepingService implements SweepingService {
  constructor(
    private walletService: SimulatedWalletService,
    private mainWalletId: string,
  ) {}

  async sweepAll(walletIds: WalletId[], toWalletId: WalletId): Promise<void> {
    // Iterate over provided wallet IDs and sweep their USDT to the target wallet
    for (const fromId of walletIds) {
      // Skip if the source is the same as the destination (defensive)
      if (fromId === toWalletId) continue;

      const usdtBalance = this.walletService.getBalance(fromId, 'USDT');

      // Only attempt to sweep when there is something to send; gas sufficiency will be
      // validated by the wallet service itself.
      if (usdtBalance > 0) {
        try {
          this.walletService.send(fromId, toWalletId, 'USDT', usdtBalance);
        } catch {
          // If sending fails (e.g., insufficient gas), move on to the next wallet.
          continue;
        }
      }
    }
  }
}
