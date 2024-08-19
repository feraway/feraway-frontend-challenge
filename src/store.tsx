import { type Address } from "viem";
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";

const storeInitialValue = {
  contract: undefined,
  targetAddress: null,
  setTargetAddress: () => undefined,
  setContract: () => undefined,
};

const StoreContext = createContext<StoreType>(storeInitialValue);

type StoreType = {
  contract?: Address;
  targetAddress: Address | null;
  setTargetAddress: Dispatch<Address | null>;
  setContract: Dispatch<Address>;
};

enum ACTIONS {
  SET_CONTRACT = "SET_CONTRACT",
  SET_TARGET_ADDRESS = "SET_TARGET_ADDRESS",
}

function storeReducer(
  store: StoreType,
  action: { type: string; payload: any }
) {
  switch (action.type) {
    case ACTIONS.SET_CONTRACT: {
      return {
        ...store,
        contract: action.payload.contract,
      };
    }
    case ACTIONS.SET_TARGET_ADDRESS: {
      return {
        ...store,
        targetAddress: action.payload.targetAddress,
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(storeReducer, storeInitialValue);

  const setTargetAddress = (targetAddress: Address | null) => {
    dispatch({
      type: ACTIONS.SET_TARGET_ADDRESS,
      payload: {
        targetAddress,
      },
    });
  };

  const setContract = (contract: Address) => {
    dispatch({
      type: ACTIONS.SET_CONTRACT,
      payload: {
        contract,
      },
    });
  };

  const storeWithActions = {
    ...store,
    setTargetAddress,
    setContract,
  };

  return (
    <StoreContext.Provider value={storeWithActions}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext<StoreType>(StoreContext);
}
