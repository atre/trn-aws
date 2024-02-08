import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeNamespace, KubeService } from "../../../imports/k8s";

export class Management extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: "trn-management", test: 'test' };
    const serviceName = "trn-management-service";
    const servicePort = 8079;

    const appNamespace = new KubeNamespace(this, 'management-namespace', {
      metadata: {
        name: 'application',
      },
    });

    new KubeService(this, "trn-management-service", {
      metadata: {
        name: serviceName,
        labels: label,
        namespace: appNamespace.name,
      },
      spec: {
        type: "ClusterIP",
        ports: [
          { name: 'web', port: 8079, targetPort: IntOrString.fromNumber(8079) },
          { name: 'metrics', port: 9100, targetPort:  IntOrString.fromNumber(9100) },
        ],
        selector: label,
      },
    });

    new KubeDeployment(this, "deployment", {
      metadata: {
        namespace: appNamespace.name,
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label, namespace: appNamespace.name },
          spec: {
            initContainers: [
              {
                name: "migration",
                image: "894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-management-ecr:0.1.0",
                command: ["sh", "-c"],
                args: ["yarn migrate && yarn seed"],
                env: [
                  // TODO move to secret
                  { name: "SERVER_PORT", value: "8079"},
                  { name: "DB_USER", value: "postgres" },
                  { name: "DB_PORT", value: "5432" },
                  { name: "DB_HOST", value: "trn-postgres.db.svc.cluster.local" },
                  { name: "DB_PASSWORD", value: "postgres" },
                  { name: "DB_NAME", value: "postgres" },
                  { name: "AUTH_SECRET", value: "secret" },
                  // Other necessary environment variables
                ]
              },
            ],
            containers: [
              {
                name: "dice-management",
                image:
                  "894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-management-ecr:0.1.0",
                ports: [{ containerPort: servicePort }],
                env: [
                  { name: "SERVER_PORT", value: "8079"},
                  { name: "DB_USER", value: "postgres" },
                  { name: "DB_PORT", value: "5432" },
                  { name: "DB_HOST", value: "trn-postgres.db.svc.cluster.local" },
                  { name: "DB_PASSWORD", value: "postgres" },
                  { name: "DB_NAME", value: "postgres" },
                  { name: "AUTH_SECRET", value: "secret" },
                  { name: "MY_POD_NAME", valueFrom: { fieldRef: { fieldPath: "metadata.name" } } },
                  { name: "MY_NODE_NAME", valueFrom: { fieldRef: { fieldPath: "spec.nodeName" } } },
                ]
              },
              {
                name: 'node-exporter',
                image: 'prom/node-exporter:v1.1.2',
                ports: [{ containerPort: 9100 }],
              },
            ],
          },
        },
      },
    });
  }
}
