import { Construct } from 'constructs';
import { Certificate, ClusterIssuer } from '../../imports/cert-manager.io';
import { KubeNamespace, KubeSecret } from '../../imports/k8s';
import { Helm, Include } from 'cdk8s';

export class Cert extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const namespace = new KubeNamespace(this, 'cert-manager-namespace', {
      metadata: {
        name: 'cert-manager'
      }
    });

    new Include(this, 'cert-manager-crd', {
      url: 'https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml'
    });

    new Helm(this, 'helm-cert-manager', {
      chart: 'cert-manager',
      repo: 'https://charts.jetstack.io',
      version: 'v1.13.3',
      namespace: namespace.name,
      values: {
        installCRDs: true,
        ingressShim: {
          defaultIssuerGroup: 'cert-manager.io',
          defaultIssuerKind: 'ClusterIssuer',
          defaultIssuerName: 'cert-manager-acme-issuer'
        }
      }
    });

    new KubeSecret(this, 'cert-user-secret', {
      type: 'Opaque',
      metadata: {
        name: 'cert-manager-aws-secret',
        namespace: namespace.name
      },
      stringData: {
        secretAccessKey: '',
      }
    })

    new ClusterIssuer(this, 'cluster-issuer', {
      metadata: {
        name: 'cert-manager-acme-issuer',
        namespace: namespace.name
      },
      spec: {
        acme: {
          email: 'kalyuzhni.sergei@gmail.com',
          server: 'https://acme-v02.api.letsencrypt.org/directory',
          privateKeySecretRef: {
            name: 'cert-manager-acme-private-key'
          },
          solvers: [
            {
              dns01: {
                route53: {
                  region: 'eu-central-1',
                  accessKeyId: 'AKIA5AMXUWCLVOY6KZZY',
                  secretAccessKeySecretRef: {
                    key: 'secretAccessKey',
                    name: 'cert-manager-aws-secret'
                  }
                }
              }
            }
          ]
        }
      }
    });

    new Certificate(this, 'certificate', {
      metadata: {
        name: 'le-crt'
      },
      spec: {
        secretName: 'tls-secret',
        dnsNames: ['aws.catops.space', '*.aws.catops.space'],
        issuerRef: {
          name: 'cert-manager-acme-issuer',
          kind: 'ClusterIssuer'
        },
      }
    });
  }
}