import { DynamodbTableConfig } from '@cdktf/provider-aws/lib/dynamodb-table';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3BucketConfig } from '@cdktf/provider-aws/lib/s3-bucket';
import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { RemoteBackendConstruct } from 'trn-components';

import { config } from '../../config';

export class RemoteBackend extends TerraformStack {
  constructor(scope: Construct, id: string, opts: S3BucketConfig & DynamodbTableConfig ) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new RemoteBackendConstruct(this, 'remote-backend', opts);
  }
}