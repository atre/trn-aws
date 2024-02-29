import { Construct } from 'constructs';
// import { Helm } from 'cdk8s';

export class ExternalDns extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    // Fix IRSA
    // new Helm(this, 'externaldns', {
    //   chart: 'bitnami/external-dns',
    //   repo: 'https://charts.bitnami.com/bitnami',
    //   version: '6.34.2',
    //   namespace: 'kube-system',
    //   values: {
    //     provider: 'aws',
    //     aws: {
    //       region: 'eu-central-1',
    //       zoneType: 'public',
    //       assumeRoleArn: 'arn:aws:iam::894208094359:role/ExternalDnsRole'
    //     },
    //     policy: 'upsert-only',
    //     txtOwnerId: 'Z0807079F0FU5XCKLU6Z',
    //     domainFilters: ['clickops.life'],
    //     logLevel: 'info',
    //     serviceAccount: {
    //       name: 'external-dns',
    //       annotations: {
    //         'eks.amazonaws.com/role-arn': 'arn:aws:iam::894208094359:role/ExternalDnsRole',
    //       }
    //     }
    //   },
    // });
  }
}


