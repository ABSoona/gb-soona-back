import { DemandeWhereInput } from "./DemandeWhereInput";
import { DemandeOrderByInput } from "./DemandeOrderByInput";

export type DemandeFindManyArgs = {
  where?: DemandeWhereInput;
  orderBy?: Array<DemandeOrderByInput>;
  skip?: number;
  take?: number;
};
