import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";

export function createTestCircuitContext(
  contract: any,
  budget: bigint = 1000000000n,
  authority: string = "00".repeat(32)
): CircuitContext<void> {
  const {
    currentPrivateState,
    currentContractState,
    currentZswapLocalState,
  } = contract.initialState(
    createConstructorContext({} as any, "0".repeat(64)),
    budget,
    authority
  );

  return {
    currentPrivateState,
    currentZswapLocalState,
    costModel: CostModel.initialCostModel(),
    currentQueryContext: new QueryContext(
      currentContractState.data,
      sampleContractAddress()
    ),
  };
}
