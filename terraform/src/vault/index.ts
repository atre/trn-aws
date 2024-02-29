import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { AuthBackend } from '@cdktf/provider-vault/lib/auth-backend';
import { KubernetesAuthBackendConfig } from '@cdktf/provider-vault/lib/kubernetes-auth-backend-config';
import { KubernetesAuthBackendRole } from '@cdktf/provider-vault/lib/kubernetes-auth-backend-role';
import { Mount } from '@cdktf/provider-vault/lib/mount';
import { PkiSecretBackendConfigUrls } from '@cdktf/provider-vault/lib/pki-secret-backend-config-urls';
import { PkiSecretBackendRole } from '@cdktf/provider-vault/lib/pki-secret-backend-role';
import { PkiSecretBackendRootCert } from '@cdktf/provider-vault/lib/pki-secret-backend-root-cert';
import { Policy } from '@cdktf/provider-vault/lib/policy';
import { VaultProvider } from '@cdktf/provider-vault/lib/provider';
import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { config } from '../../config';
import { GenericSecret } from '@cdktf/provider-vault/lib/generic-secret';

export class VaultConfigStack extends TerraformStack {
  constructor(scope: Construct, name: string, props?: any) {
    super(scope, name);

    new VaultProvider(this, 'vault', {
      address: 'http://localhost:8200',
      token: config.VAULT_TOKEN
    });

    new AwsProvider(this, 'Aws', {
      region: config.REGION ?? props.region,
    });

    // const eksCluster = new DataAwsEksCluster(this, 'eks-cluster', {
    //   name: props.clusterName,
    // });

    // Pki (certificate)
    const pkiMount = new Mount(this, 'pkiBackend', {
      path: 'pki',
      type: 'pki',
      description: 'PKI backend to issue certificates',
    });

    new PkiSecretBackendConfigUrls(this, 'pkiConfigUrls', {
      backend: pkiMount.path,
      issuingCertificates: ['http://vault.default.svc.cluster.local:8200/v1/pki/ca'],
      crlDistributionPoints: ['http://vault.default.svc.cluster.local:8200/v1/pki/crl'],
    });

    new PkiSecretBackendRootCert(this, 'pkiRootCa', {
      backend: pkiMount.path,
      commonName: 'clickops.life',
      ttl: '8760h',
      dependsOn: [pkiMount],
      type: 'internal'
    });

    new PkiSecretBackendRole(this, 'pkiRole', {
      backend: pkiMount.path,
      name: 'clickops',
      allowedDomains: ['clickops.life'],
      allowSubdomains: true,
      maxTtl: '72h',
      dependsOn: [pkiMount],
    });

    new Policy(this, 'pkiPolicyClickopsLife', {
      name: 'pki-clickops-life',
      policy: `path "pki/*" {
                capabilities = ["read", "list"]
              }
              path "pki/sign/clickops" {
                capabilities = ["create", "update"]
              }
              path "pki/issue/clickops" {
                capabilities = ["create"]
              }`,
    });


    // KV-2 key value secrets

    new Mount(this, "kv-v2", {
      path: "trn",
      type: "kv-v2",
      description: "KV V2 Secrets Engine for internal use"
    });

    new GenericSecret(this, 'posgres-config', {
      path: "trn/postgres/config",
      dataJson: JSON.stringify({
        DB_USER: "postgres",
        DB_PASSWORD: "postgres"
      })
    })

    new Policy(this, 'secretsPolicy', {
      name: 'trn-secrets-policy',
      policy: `path "trn/data/postgres/config" {
        capabilities = ["read"]
      }
      path "trn/metadata/postgres/config" {
        capabilities = ["list"]
      }`,
    });

    // Auth 
    const k8sAuth = new AuthBackend(this, 'k8sAuth', {
      type: 'kubernetes',
      path: 'kubernetes',
      description: 'kubernetes token auth through service account and secret'
    });

    new KubernetesAuthBackendConfig(this, 'k8sAuthConfig', {
      backend: k8sAuth.path,
      kubernetesHost: 'https://kubernetes.default.svc'
    });

   new KubernetesAuthBackendRole(this, 'issuerRole', {
      backend: k8sAuth.path,
      roleName: 'vault-issuer',
      boundServiceAccountNames: ['vault-issuer'],
      boundServiceAccountNamespaces: ['default'],
      tokenPolicies: ['pki-clickops-life'],
      tokenTtl: 20 * 60,
    });

    new KubernetesAuthBackendRole(this, 'secretsRole', {
      backend: k8sAuth.path,
      roleName: 'secret-manager',
      boundServiceAccountNames: ['secret-manager'],
      boundServiceAccountNamespaces: ['default'],
      tokenPolicies: ['trn-secrets-policy'],
      tokenTtl: 24 * 60 * 60 // 24h,
    });
  }
}