import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from 'constructs';

export class CloudFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const shopBucket = new s3.Bucket(this, "ShopBucket", {
      bucketName: "nodejs-aws-shop-react-carp-cdk",
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const shopOai = new cloudfront.OriginAccessIdentity(this, "ShopOAI");

    shopBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [shopBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            shopOai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        conditions: {
          StringEquals: {
            "aws:SourceArn": shopBucket.bucketArn,
          },
        },
      })
    );
  }
}
