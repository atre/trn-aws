import { App } from 'cdktf';
import { config } from './config';
import { Budget } from './src/budget';
import { Vpc } from './src/vpc';

const app = new App();

new Vpc(app, 'vpc');

new Budget(app, 'budget', {
  timeUnit: 'MONTHLY',
  budgetType: 'COST',
  limitAmount: '50',
  threshold: 80,
  subscriberEmailAddresses: config.SUBSCRIBER_EMAIL_ADDRESSES.split(','),
});

app.synth();
