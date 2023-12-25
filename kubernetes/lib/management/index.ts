import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class Management extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: "trn-app" };

    new KubeService(this, "service", {
      spec: {
        type: "LoadBalancer",
        ports: [{ port: 80, targetPort: IntOrString.fromNumber(8079) }],
        selector: label,
      },
    });

    new KubeDeployment(this, "deployment", {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: "dice-management",
                image:
                  "894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-ecr:latest",
                ports: [{ containerPort: 8079 }],
                env: [
                  { name: "SERVER_PORT", value: "8079"},
                  { name: "DB_USER", value: "postgres" },
                  { name: "DB_PORT", value: "5432" },
                  { name: "DB_HOST", value: "trn-postgres" },
                  { name: "DB_PASSWORD", value: "postgres" },
                  { name: "DB_NAME", value: "postgres" },
                  { name: "AUTH_SECRET", value: "secret" },
                ]
              },
            ],
            // imagePullSecrets: [{name: "ecr-secret"}]
          },
        },
      },
    });
  }
}
