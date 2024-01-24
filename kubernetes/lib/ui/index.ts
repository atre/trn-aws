import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class UI extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: "ui" };
    const nginxPort = 80;
    const exporterPort = 9113;

    new KubeService(this, "ui-service", {
      metadata: {
        name: "trn-ui-service",
        labels: label,
      },
      spec: {
        type: "ClusterIP",
        ports: [
          { name: 'web', port: nginxPort, targetPort: IntOrString.fromNumber(nginxPort) },
          { name: 'metrics', port: exporterPort, targetPort: IntOrString.fromNumber(exporterPort) }
        ],
        selector: label,
      },
    });

    new KubeDeployment(this, "ui-deployment", {
      metadata: {
        name: "trn-ui-deployment",
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: {
            labels: label,
          },
          spec: {
            containers: [
              {
                name: "ui",
                image: "894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-ui-ecr:0.2.0",
                ports: [{ containerPort: nginxPort }],
                env: [
                  {
                    name: "MY_APP_MANAGEMENT_URL",
                    value: "http://trn-management-service:8079",
                  },
                  // {
                  //   name: "MY_APP_ENTRY_URL",
                  //   value: "http://entry:8080", // Adjust if necessary
                  // },
                  {
                    name: "MY_APP_HOSTNAME",
                    valueFrom: { fieldRef: { fieldPath: "metadata.name" } }, // Adjust if necessary
                  },
                  {
                    name: "MY_APP_POD_NAME",
                    valueFrom: { fieldRef: { fieldPath: "spec.nodeName" } }, // Adjust if necessary
                  },
                ],
              },
              {
                name: 'nginx-exporter',
                image: 'nginx/nginx-prometheus-exporter:1.1.0',
                args: ['-nginx.scrape-uri', 'http://localhost/basic_status'],
                ports: [{ containerPort: exporterPort }],
              },
            ],
          },
        },
      },
    });
  }
}
