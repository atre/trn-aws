import { Construct } from 'constructs/lib/construct';
import { Prometheus, PrometheusSpecResourcesRequests, ServiceMonitor } from '../../../imports/monitoring.coreos.com';
import { KubeClusterRole, KubeClusterRoleBinding, KubeServiceAccount } from '../../../imports/k8s';
import { ServiceInfo } from './types';

export class PrometheusConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new KubeServiceAccount(this, 'prometheus-service-account', {
      metadata: {
        name: 'prometheus',
      }
    });

    new KubeClusterRole(this, 'PrometheusClusterRole', {
      metadata: {
        name: 'prometheus'
      },
      rules: [
        {
          apiGroups: [''],
          resources: ['nodes', 'nodes/metrics', 'services', 'endpoints', 'pods'],
          verbs: ['get', 'list', 'watch'],
        },
        {
          apiGroups: [''],
          resources: ['configmaps'],
          verbs: ['get'],
        },
        {
          apiGroups: ['networking.k8s.io'],
          resources: ['ingresses'],
          verbs: ['get', 'list', 'watch'],
        },
        {
          nonResourceUrLs: ['/metrics'],
          verbs: ['get'],
        },
      ],
    });

    new KubeClusterRoleBinding(this, 'PrometheusClusterRoleBinding', {
      metadata: {
        name: 'prometheus'
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'prometheus',
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'prometheus',
          namespace: 'default'
        }
      ],
    });

    const services: ServiceInfo[] = [
      { name: 'management', label: { app: 'trn-management' }},
      { name: 'entry', label: { app: 'entry' }}, 
      { name: 'logic', label: { app: 'logic' }},
      { name: 'storage', label: {app: 'storage'} },
      { name: 'ui', label: { app: 'ui' }},
      { name: 'db', label: { app: 'db'}},
      { name: 'redis', label: { app: 'redis' }},
      { name: 'rabbitmq', label: { app: 'rabbitmq'}},
      { name: 'traefik', label: { 'app.kubernetes.io/name': 'traefik' }}
    ];

    services.forEach(service => {
      this.createServiceMonitor(service.name, service.label, service.port);
    })

    new Prometheus(this, 'prometheus', {
      metadata: {
        name: 'prometheus',
      },
      spec: {
        serviceAccountName: 'prometheus',
        serviceMonitorSelector: {
          matchLabels: {
            team: 'backend',
          }
        },
        resources: {
          requests: {
            memory: PrometheusSpecResourcesRequests.fromString('400Mi'),
          }
        },
        enableAdminApi: false,
      }
    });
  }

  private createServiceMonitor(name: string, label?: { [key: string]: string; }, port?: string) {
    return new ServiceMonitor(this, `service-monitor-${name}`, {
      metadata: {
        name: `service-monitor-${name}`,
        labels: {
          team: 'backend'
        }
      },
      spec: {
        selector: {
          matchLabels: label ?? { app: name },  
        },
        endpoints: [
          {
            port: port ?? 'metrics',
            interval: '30s',
          }
        ]
      }
    });
  }
}