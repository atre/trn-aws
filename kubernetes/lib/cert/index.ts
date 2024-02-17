import { Construct } from 'constructs';
import { config } from 'dotenv';
import { Certificate, ClusterIssuer } from '../../imports/cert-manager.io';
import { Helm } from 'cdk8s';

config();

export class Cert extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Helm(this, 'helm-cert-manager', {
      chart: 'cert-manager',
      repo: 'https://charts.jetstack.io',
      // namespace: ns.name,
      version: 'v1.13.3',
      values: {
        installCRDs: true,
        ingressShim: {
          defaultIssuerGroup: 'cert-manager.io',
          defaultIssuerKind: 'ClusterIssuer',
          defaultIssuerName: 'cert-manager-acme-issuer'
        },
        serviceAccount: {
          name: 'cert-manager',
          annotations: {
            'eks.amazonaws.com/role-arn': 'arn:aws:iam::894208094359:role/CertManagerIAMRole',
          }
        }
      }
    });

    new ClusterIssuer(this, 'cluster-issuer', {
      metadata: {
        name: 'cert-manager-acme-issuer',
      },
      spec: {
        acme: {
          email: 'kalyuzhni.sergei@gmail.com',
          server: 'https://acme-v02.api.letsencrypt.org/directory',
          // For test purposes to not be banned
          // server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
          privateKeySecretRef: {
            name: 'cert-manager-acme-private-key'
          },
          solvers: [
            {
              dns01: {
                route53: {
                  region: 'eu-central-1',
                  // role: 'arn:aws:iam::894208094359:role/CertManagerIAMRole'
                }
              }
            }
          ]
        }
      }
    });

    new Certificate(this, 'certificate', {
      metadata: {
        name: 'le-crt',
      },
      spec: {
        secretName: 'tls-secret',
        dnsNames: ['clickops.life', '*.clickops.life'],
        issuerRef: {
          name: 'cert-manager-acme-issuer',
          kind: 'ClusterIssuer'
        },
      }
    });
  }
}