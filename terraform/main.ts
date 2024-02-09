import { App } from 'cdktf';
import { config } from './config';
import { Budget } from './src/budget';
import { ElasticContainerRegistry } from './src/ecr';
import { Eks } from './src/eks';
import { CertManagerIAMUserStack, MentorIAMUserStack } from './src/iam';
import { NodeGroupStack } from './src/node-group';
import { RemoteBackend } from './src/remote-backend';
import { Vpc } from './src/vpc';
import { Route53HostedZone } from './src/route53/hosted-zone';
import { Route53RecordStack } from './src/route53/record';

const app = new App();

new RemoteBackend(app, 'remote-backend', {
  bucket: config.REMOTE_BACKEND_NAME,
  name: config.REMOTE_BACKEND_LOCK_NAME,
});

new Budget(app, 'budget', {
  timeUnit: 'MONTHLY',
  budgetType: 'COST',
  limitAmount: '50',
  threshold: 80,
  subscriberEmailAddresses: config.SUBSCRIBER_EMAIL_ADDRESSES.split(','),
});

new Vpc(app, 'vpc', {
  clusterName: 'eks-cluster',
});

new Eks(app, 'eks', {
  name: 'eks-cluster',
  tags: {
    'kubernetes.io/cluster/eks-cluster': 'shared',
  },
});

new NodeGroupStack(app, 'node-group', {
  name: 'eks-node-group',
  clusterName: 'eks-cluster',
});

new MentorIAMUserStack(app, 'mentor-iam-user');

// ECR Repositories
// TODO find a way to manage this in a loop
new ElasticContainerRegistry(app, 'ecr-management', {
  name: 'trn-management-ecr',
});
new ElasticContainerRegistry(app, 'ecr-ui', {
  name: 'trn-ui-ecr',
});
new ElasticContainerRegistry(app, 'ecr-entry', {
  name: 'trn-entry-ecr',
});
new ElasticContainerRegistry(app, 'ecr-logic', {
  name: 'trn-logic-ecr',
});
new ElasticContainerRegistry(app, 'ecr-storage', {
  name: 'trn-storage-ecr',
});

new Route53HostedZone(app, 'public-hosted-zone', {
  name: 'aws.catops.space'
});

new CertManagerIAMUserStack(app, 'cert-manager-iam-user', {
  hostedZoneName: 'aws.catops.space',
  clusterName: 'eks-cluster'
});

new Route53RecordStack(app, 'route53-record', {
  clusterName: 'eks-cluster',
  hostedZoneName: 'aws.catops.space'
});

app.synth();
