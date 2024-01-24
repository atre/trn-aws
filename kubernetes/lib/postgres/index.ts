import { Construct } from "constructs";
import {
  KubeDeployment,
  KubeService,
  IntOrString,
  // KubePersistentVolumeClaim,
  // Quantity,
} from "../../imports/k8s";

export class PostgresDatabase extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const dbLabel = { app: "db", test: 'test' };
    const postgresPort = 5432;
    const exporterPort = 9187;

    // Persistent Volume Claim for the Database
    // new KubePersistentVolumeClaim(this, "db-pvc", {
    //   spec: {
    //     accessModes: ["ReadWriteOnce"],
    //     resources: {
    //       requests: {
    //         storage: Quantity.fromString('10Gi'),
    //       },
    //     },
    //   },
    // });

    // Deployment for the PostgreSQL Database
    new KubeDeployment(this, "db-deployment", {
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
                // volumeMounts: [
                //   {
                //     name: "postgres-storage",
                //     mountPath: "/var/lib/postgresql/data",
                //   },
                // ],
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
            // volumes: [
            //   {
            //     name: "postgres-storage",
            //     persistentVolumeClaim: { claimName: "db-pvc" },
            //   },
            // ],
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
