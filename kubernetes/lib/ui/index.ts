import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";
import { IngressRoute, IngressRouteSpecRoutesKind, IngressRouteSpecRoutesServicesPort } from "../../imports/traefik.io";

export class UI extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: "trn-ui" };

    new KubeService(this, "ui-service", {
      metadata: {
        name: "trn-ui-service",
      },
      spec: {
        type: "ClusterIP",
        ports: [{ port: 80, targetPort: IntOrString.fromNumber(80) }],
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
                ports: [{ containerPort: 80 }],
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
            ],
          },
        },
      },
    });

    new IngressRoute(this, 'ui-ingress-route', {
      metadata: {
        name: 'ui-ingress-route',
      },
      spec: {
        entryPoints: ['web'],
        routes: [
          {
            match: 'PathPrefix(`/`)',
            kind: IngressRouteSpecRoutesKind.RULE,
            services: [
              {
                name: 'trn-ui-service',
                port: IngressRouteSpecRoutesServicesPort.fromNumber(80),
              },
            ],
          },
        ],
      },
    });
  }
}
