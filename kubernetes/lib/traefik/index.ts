import { Helm, Include } from 'cdk8s';
import { Construct } from 'constructs/lib/construct';
import { IngressRoute, IngressRouteSpecRoutesKind, IngressRouteSpecRoutesServicesPort } from '../../imports/traefik.io';
import { IntOrString, KubeService } from '../../imports/k8s';

export class Traefik extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Include(this, 'traefik_crd_def', {
      url: 'https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml',
    });

    new Include(this, 'traefik_crd_rbac', {
      url: 'https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml',
    });

    new Helm(this, 'traefik', {
      chart: 'traefik',
      repo: 'https://traefik.github.io/charts',
    });

    new KubeService(this, 'traefik-service', {
      metadata: {
        name: 'traefik',
        annotations: {
          'service.beta.kubernetes.io/aws-load-balancer-type': 'nlb',
        },
      },
      spec: {
        type: 'LoadBalancer',
        ports: [
          { name: 'web', port: 80, targetPort: IntOrString.fromNumber(80) },
          { name: 'websecure', port: 443, targetPort: IntOrString.fromNumber(443) },
        ],
        selector: {
          'app.kubernetes.io/name': 'traefik',
        },
      },
    });

    new IngressRoute(this, 'management-ingress-route', {
      metadata: {
        name: 'management-ingress-route',
      },
      spec: {
        entryPoints: ['web'],
        routes: [
          {
            match: 'PathPrefix(`/api/v1/auth`)',
            kind: IngressRouteSpecRoutesKind.RULE,
            services: [
              {
                name: 'trn-management-service',
                port: IngressRouteSpecRoutesServicesPort.fromNumber(8079),
              },
            ],
          },
          {
            match: 'PathPrefix(`/api/system-info`)',
            kind: IngressRouteSpecRoutesKind.RULE,
            services: [
              {
                name: 'trn-management-service',
                port: IngressRouteSpecRoutesServicesPort.fromNumber(8079),
              },
            ],
          },
          {
            match: 'PathPrefix(`/api/v1/entry`)',
            kind: IngressRouteSpecRoutesKind.RULE,
            services: [
              {
                name: 'entry',
                port: IngressRouteSpecRoutesServicesPort.fromNumber(8080),
              },
            ],
          },
        ],
      },
    });
  }
}