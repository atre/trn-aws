import { Helm, Include } from 'cdk8s';
import { Construct } from 'constructs/lib/construct';
import { IngressRoute, IngressRouteSpecRoutesKind, IngressRouteSpecRoutesServicesPort } from '../../imports/traefik.io';

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
      values: {
        service: {
          annotations: {
            'service.beta.kubernetes.io/aws-load-balancer-type': 'nlb',
          },
        },
        ports: {
          web: {
            redirectTo: {
              port: 'websecure'
            }
          },
          metrics: {
            expose: true
          }
        }
      }
    
    });

    new IngressRoute(this, 'management-ingress-route', {
      metadata: {
        name: 'management-ingress-route',
      },
      spec: {
        tls: {
          domains: [
            {
              main: 'clickops.life',
            },
            {
              main: '*.clickops.life',
            }
          ],
          secretName: 'tls-secret'
        },
        entryPoints: ['web', 'websecure'],
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