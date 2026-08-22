import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../contracts/managed/vendor/contract/index";

export class VendorSimulator {
  readonly contract: Contract<void>;
  circuitContext: CircuitContext<void>;

  constructor(budget: bigint) {
    this.contract = new Contract<void>({} as any);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({} as any, "0".repeat(64)),
      budget,
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public settleInvoice(amount: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.spend(
      this.circuitContext,
      amount,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }
}
