import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../../imports/k8s";

export class Entry extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'entry' };
    const servicePort = 8080;

    new KubeDeployment(this, 'entry-deployment', {
      metadata: {
        name: 'entry',
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
                name: 'entry',
                image: '894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-entry-ecr:0.1.0',
                ports: [
                  { containerPort: servicePort },
                ],
                env: [
                  { name: 'SERVER_PORT', value: '8080' },
                  { name: 'AUTH_SECRET', value: 'secret' },
                  { name: 'RABBIT_USER', value: 'user' },
                  { name: 'RABBIT_PASSWORD', value: 'password' },
                  { name: 'RABBIT_HOST', value: 'rabbitmq.message-broker.svc.cluster.local' },
                  { name: 'RABBIT_PORT', value: '5672' },
                ],
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

    new KubeService(this, 'entry-service', {
      metadata: {
        name: 'entry',
        labels: label,
      },
      spec: {
        selector: label,
        ports: [
          { name: 'web', port: 8080, targetPort: IntOrString.fromNumber(servicePort)},
          { name: 'metrics', port: 9100, targetPort:  IntOrString.fromNumber(9100) },
        ],
      },
    });
  }
}