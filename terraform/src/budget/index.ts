import { BudgetsBudget, BudgetsBudgetConfig } from '@cdktf/provider-aws/lib/budgets-budget';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { TRN_PERIOD_START } from './constant';
import { BudgetConfig } from './interface';
import { config } from '../../config';

export class Budget extends TerraformStack {
  constructor(scope: Construct, id: string, opts: BudgetsBudgetConfig & BudgetConfig) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: 'dev/stacks/budget/terraform.tfstate',
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    new BudgetsBudget(this, 'budget', {
      name: 'TRN Budget',
      budgetType: opts.budgetType,
      limitAmount: opts.limitAmount,
      limitUnit: 'USD',
      timePeriodStart: TRN_PERIOD_START,
      timeUnit: opts.timeUnit,
      notification: [
        {
          comparisonOperator: 'GREATER_THAN',
          notificationType: 'FORECASTED',
          threshold: opts.threshold,
          thresholdType: 'PERCENTAGE',
          subscriberEmailAddresses: opts.subscriberEmailAddresses,
        },
      ],
    });
  }
}