import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { EksConstruct } from 'trn-components/lib/aws/eks';

import { config } from '../../config';

export class Eks extends TerraformStack {
  // TODO declare an interface for options
  constructor(scope: Construct, id: string, opts: any & { vpcId: string; privateSubnetIds: string[] }) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new EksConstruct(this, 'eks', { ...opts, subnets: opts.privateSubnetIds } );
  }
}