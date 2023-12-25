import { IamAccessKey } from '@cdktf/provider-aws/lib/iam-access-key';
import { IamUser } from '@cdktf/provider-aws/lib/iam-user';
import { IamUserPolicyAttachment } from '@cdktf/provider-aws/lib/iam-user-policy-attachment';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { config } from '../../config';

export class MentorIAMUserStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    // Create an IAM user
    const user = new IamUser(this, 'Mykyta', {
      name: 'Mykyta',
    });

    // Attach AdministratorAccess policy to the user
    new IamUserPolicyAttachment(this, 'MykytaAdminPolicy', {
      user: user.name,
      policyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
    });

    // Create access keys
    const accessKey = new IamAccessKey(this, 'MykytaAccessKey', {
      user: user.name,
    });

    // Output access keys
    new TerraformOutput(this, 'AccessKeyId', {
      value: accessKey.id,
    });

    new TerraformOutput(this, 'SecretAccessKey', {
      value: accessKey.secret,
      sensitive: true,
    });
  }
}