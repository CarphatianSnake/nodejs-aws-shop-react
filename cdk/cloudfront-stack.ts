import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_s3_deployment as s3Deploy } from "aws-cdk-lib";
import { Construct } from 'constructs';

export class CloudFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myStoreBucket = new s3.Bucket(this, "MyStoreBucket", {
      bucketName: "nodejs-aws-shop-react-carp-cdk",
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const myStoreOai = new cloudfront.OriginAccessIdentity(this, "MyStoreOAI");

    myStoreBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [myStoreBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            myStoreOai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        conditions: {
          StringEquals: {
            "aws:SourceArn": myStoreBucket.bucketArn,
          },
        },
      })
    );

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "ShopDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: myStoreBucket,
              originAccessIdentity: myStoreOai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: '/index.html',
          }
        ],
      }
    );

    new s3Deploy.BucketDeployment(this, "ShopDeployment", {
      sources: [s3Deploy.Source.asset("../dist")],
      destinationBucket: myStoreBucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
