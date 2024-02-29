import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../../imports/k8s";

export class Management extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: "trn-management", test: 'test' };
    const serviceName = "trn-management-service";
    const servicePort = 8079;

    new KubeService(this, "trn-management-service", {
      metadata: {
        name: serviceName,
        labels: label,
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
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label, 
            annotations: {
              'reloader.stakater.com/auto': "true",
              'reloader.stakater.com/reload': "postgres-secret",
              'vault.hashicorp.com/agent-inject': 'true',
              'vault.hashicorp.com/role': 'secret-manager',
              'vault.hashicorp.com/agent-inject-secret-envvars': 'trn/data/postgres/config',
              'vault.hashicorp.com/agent-inject-template-db-config': `
              {{- with secret "trn/data/postgres/config" -}}
              {{- range $k, $v := .Data.data }}
              {{ $k }}="{{ $v }}"
              {{- end }}
              {{- end }}
            `
            }
          },
          spec: {
            serviceAccountName: 'secret-manager',
            initContainers: [
              {
                name: "migration",
                image: "894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-management-ecr:0.1.0",
                command: ["sh", "-c"],
                args: ["yarn migrate && yarn seed"],
                env: [
                  // TODO move to secret
                  { name: "SERVER_PORT", value: "8079"},
                  {
                    name: "DB_USER",
                    valueFrom: { secretKeyRef: { name: "postgres-secret", key: "DB_USER" } },
                  },                  
                  { name: "DB_PORT", value: "5432" },
                  { name: "DB_HOST", value: "trn-postgres.db.svc.cluster.local" },
                  {
                    name: "DB_PASSWORD",
                    valueFrom: { secretKeyRef: { name: "postgres-secret", key: "DB_PASSWORD" } },
                  },                  
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
                  {
                    name: "DB_USER",
                    valueFrom: { secretKeyRef: { name: "postgres-secret", key: "DB_USER" } },
                  },                   
                  { name: "DB_PORT", value: "5432" },
                  { name: "DB_HOST", value: "trn-postgres.db.svc.cluster.local" },
                  {
                    name: "DB_PASSWORD",
                    valueFrom: { secretKeyRef: { name: "postgres-secret", key: "DB_PASSWORD" } },
                  },                    
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
