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

    const dbLabel = { app: "trn-db" };

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
                ports: [{ containerPort: 5432 }],
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
      },
      spec: {
        ports: [{ port: 5432, targetPort: IntOrString.fromNumber(5432) }],
        selector: dbLabel,
      },
    });
  }
}
