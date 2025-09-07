import { Contract as EscrowContract } from './managed/escrow/contract/index.cjs';
export declare function deployEscrow(): Promise<EscrowContract<unknown, {}>>;
export { EscrowContract };
