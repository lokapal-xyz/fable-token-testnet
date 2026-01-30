import * as Client from "fable_token";
import { rpcUrl } from "./util";

export default new Client.Client({
  networkPassphrase: "Test SDF Network ; September 2015",
  contractId: "CCEY3T3OOOQW7ZVOBRZ7OPORGW3HPA6L2FWXVI3TFXN2WTGNIOEMXG66",
  rpcUrl,
  allowHttp: true,
  publicKey: undefined,
});
