import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput, S3Backend } from 'cdktf';
import { Route53Zone } from '@cdktf/provider-aws/lib/route53-zone';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { config } from '../../../config';
import { IRoute53ZoneProps } from './interface';

export class Route53HostedZone extends TerraformStack {
  constructor(scope: Construct, id: string, props: IRoute53ZoneProps ) {
    super(scope, id);

    const { name } = props;

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: `dev/stacks/route53/${id}/terraform.tfstate`,
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    const hostedZone = new Route53Zone(this, 'route53-hosted-zone', {
      name,
    });

    // Output the NS records
    new TerraformOutput(this, 'nsRecords', {
      value: hostedZone.nameServers,
    });
  }
}

