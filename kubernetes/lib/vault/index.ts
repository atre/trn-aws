import { Construct } from 'constructs';
import { Helm } from 'cdk8s';
import { config } from 'dotenv';
import { KubeSecret, KubeServiceAccount } from '../../imports/k8s';
import { ExternalSecret, ExternalSecretSpecTargetCreationPolicy, SecretStore, SecretStoreSpecProviderVaultVersion } from '../../imports/external-secrets.io';

config();

export class Vault extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Helm(this, 'helm-vault', {
      chart: 'vault',
      repo: 'https://helm.releases.hashicorp.com',
      version: '0.27.0',
      values: {
        global: {
          tlsDisable: true,
        },
        server: {
          standalone: {
            enabled: true,
            config: `
              ui = true
              
              listener "tcp" {
                tls_disable = 1
                address = "[::]:8200"
                cluster_address = "[::]:8201"
              }
              
              storage "file" {
                path = "/vault/data"
              }
            `
          }
        },
        service: {
          nameOverride: 'vault'
        },
        serviceAccount: {
          create: true,
          name: 'vault-sa',
          annotations: {},
        },
      }
    });

    new KubeServiceAccount(this, 'secret-manager-sa', {
      metadata: {
        name: 'secret-manager'
      }
    });

    new KubeSecret(this, 'secret-manager-secret', {
      metadata: {
        name: 'secret-manager-token',
        annotations: {
          'kubernetes.io/service-account.name': 'secret-manager',
        },
      },
      type: 'kubernetes.io/service-account-token'
    })
  }
}

export class Reloader extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Helm(this, 'helm-reloader', {
      chart: 'reloader',
      repo: 'https://stakater.github.io/stakater-charts',
      version: 'v1.0.69',
    });
  }
}

export class ExternalSecrets extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Helm(this, 'install-external-secrets', {
      chart: 'external-secrets',
      repo: 'https://charts.external-secrets.io',
      version: 'v0.9.13',
      values: {
        installCRDs: true,
      },
    });

    new SecretStore(this, 'vault-secret-store', {
      metadata: { name: 'vault-secret-store' },
      spec: {
        provider: {
          vault: {
            // server: process.env.vaultHost ?? '',
          server: 'http://vault-helm-vault-c821b46d.default.svc.cluster.local:8200',
            path: 'trn',
            version: SecretStoreSpecProviderVaultVersion.V2,
            auth: {
              kubernetes: {
                mountPath: 'kubernetes',
                role: 'secret-manager',
                secretRef: {
                  name: 'secret-manager-token',
                  key: 'token',
                },
              },
            },
          },
        },
      },
    });

    new ExternalSecret(this, 'postgres-external-secret', {
      metadata: { name: 'postgres-external-secret' },
      spec: {
        refreshInterval: '10s',
        secretStoreRef: {
          name: 'vault-secret-store',
          kind: 'SecretStore',
        },
        target: {
          name: 'postgres-secret',
          creationPolicy: ExternalSecretSpecTargetCreationPolicy.OWNER,
        },
        data: [
          {
            secretKey: 'DB_USER',
            remoteRef: {
              key: 'trn/data/postgres/config',
              property: 'DB_USER',
            },
          },
          {
            secretKey: 'DB_PASSWORD',
            remoteRef: {
              key: 'trn/data/postgres/config',
              property: 'DB_PASSWORD',
            },
          },
        ],
      },
    });
  }
}