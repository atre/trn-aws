import { Construct } from "constructs";
import {
  KubeDeployment,
  KubeService,
  IntOrString,
} from "../../../imports/k8s";
import { sharedDBNamespace } from "../namespace";

export class PostgresDatabase extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const dbNamespace = sharedDBNamespace(this)

    const dbLabel = { app: "db" };
    const postgresPort = 5432;
    const exporterPort = 9187;

    // Deployment for the PostgreSQL Database
    new KubeDeployment(this, "db-deployment", {
      metadata: {
        namespace: dbNamespace.name
      },
      spec: {
        replicas: 1,
        selector: { matchLabels: dbLabel },
        template: {
          metadata: { labels: dbLabel },
          spec: {
            containers: [
              {
                name: "postgres",
                image: "postgres:14.4-alpine",
                ports: [{ containerPort: postgresPort }],
                env: [
                  { name: "POSTGRES_DB", value: "postgres" },
                  { name: "POSTGRES_USER", value: "postgres" },
                  { name: "POSTGRES_PASSWORD", value: "postgres" },
                ],
              },
              {
                name: 'postgres-exporter',
                image: 'quay.io/prometheuscommunity/postgres-exporter:v0.15.0',
                env: [
                  {
                    name: 'DATA_SOURCE_NAME',
                    value: 'postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable'
                  }
                ],
                ports: [{ containerPort: exporterPort }],
              },
            ],
          },
        },
      },
    });

    // Service for the PostgreSQL Database
    new KubeService(this, "db-service", {
      metadata: {
        name: "trn-postgres",
        labels: dbLabel,
      },
      spec: {
        ports: [
          { name: 'db', port: postgresPort, targetPort: IntOrString.fromNumber(postgresPort) },
          { name: 'metrics', port: exporterPort, targetPort: IntOrString.fromNumber(exporterPort) }
        ],
        selector: dbLabel,
      },
    });
  }
}
