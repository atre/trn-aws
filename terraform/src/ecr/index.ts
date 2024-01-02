import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { ECRConstruct } from 'trn-components';
import { IECRConfig } from 'trn-components/build/aws/ecr/interface';
import { config } from '../../config';

export class ElasticContainerRegistry extends TerraformStack {
  constructor(scope: Construct, id: string, opts: IECRConfig) {
    super(scope, id);

    const { name, tags } = opts;

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: `dev/stacks/${id}/terraform.tfstate`,
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    new ECRConstruct(this, 'ecr', {
      name,
      tags,
    });
  }
}