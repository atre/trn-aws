import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { config } from "../../../config";
import { IamUser } from "@cdktf/provider-aws/lib/iam-user";
import { IamUserPolicyAttachment } from "@cdktf/provider-aws/lib/iam-user-policy-attachment";
import { DataAwsRoute53Zone } from "@cdktf/provider-aws/lib/data-aws-route53-zone";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";

export class CertManagerIAMUserStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: { hostedZoneName: string}) {
    super(scope, id);

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    // Create an IAM user
    const user = new IamUser(this, 'cert-manager-user', {
      name: 'CertManagerIAMUser',
    });

    const hostedZone = new DataAwsRoute53Zone(this, 'route53-hosted-zone', {
      name: props.hostedZoneName
    })

    const policy = new IamPolicy(this, 'cert-manager-policy', {
      name: 'CertManagerPolicy',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'route53:GetChange',
            Resource: 'arn:aws:route53:::change/*',
          },
          {
            Effect: 'Allow',
            Action: [
              'route53:ChangeResourceRecordSets',
              'route53:ListResourceRecordSets',
            ],
            Resource: `arn:aws:route53:::hostedzone/${hostedZone.id}`,
          },
          {
            Effect: 'Allow',
            Action: 'route53:ListHostedZonesByName',
            Resource: '*',
          },
        ],
      }),
    });

    new IamUserPolicyAttachment(this, 'cert-manager-policy-attachment', {
      user: user.name,
      policyArn: policy.arn,
    });

    // Create access keys
    // TODO find a way to create secret
    // const accessKey = new IamAccessKey(this, 'CertManagerAccessKey', {
    //   user: user.name,
    // });

    // // Output access keys
    // new TerraformOutput(this, 'AccessKeyId', {
    //   value: accessKey.id,
    // });

    // new TerraformOutput(this, 'SecretAccessKey', {
    //   value: accessKey.encryptedSecret,
    //   sensitive: false,
    // });
  }
}