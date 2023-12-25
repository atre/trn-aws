import { App } from 'cdktf';
import { config } from './config';
import { Budget } from './src/budget';
import { ElasticContainerRegistry } from './src/ecr';
import { Eks } from './src/eks';
import { MentorIAMUserStack } from './src/iam';
import { NodeGroupStack } from './src/node-group';
import { RemoteBackend } from './src/remote-backend';
import { Vpc } from './src/vpc';

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

new Vpc(app, 'vpc');

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

new ElasticContainerRegistry(app, 'ecr', {
  name: 'trn-ecr',
  tags: {
    'kubernetes.io/cluster/eks-cluster': 'shared',
  },
});

app.synth();
