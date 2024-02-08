import { Construct } from "constructs";
import { KubeNamespace } from "../../imports/k8s";

export const sharedDBNamespace = (context: Construct) => {
  return new KubeNamespace(context, `db-${context.constructor.name}`, {
    metadata: {
      name: 'db'
    }
  });
}
