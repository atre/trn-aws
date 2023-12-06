import { App } from 'cdktf';
import { config } from './config';
import { Budget } from './src/budget';
import { Eks } from './src/eks';
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

const vpc = new Vpc(app, 'vpc');

new Eks(app, 'eks', {
  tags: {
    Name: 'eks-cluster',
  },
}).dependsOn(vpc);

app.synth();
