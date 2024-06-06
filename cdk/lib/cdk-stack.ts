import { Stack, RemovalPolicy } from "aws-cdk-lib";
import { aws_s3_deployment as s3Deploy } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
import { Construct } from "constructs";

export class ShopStack extends Construct {
  constructor(parent: Stack, id: string) {
    super(parent, id);

    const shopBucket = new s3.Bucket(this, "ShopBucket", {
      bucketName: "nodejs-aws-shop-react-carp-cdk",
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY,
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

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "ShopDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: shopBucket,
              originAccessIdentity: shopOai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );

    new s3Deploy.BucketDeployment(this, "ShopDeployment", {
      sources: [s3Deploy.Source.asset("../dist")],
      destinationBucket: shopBucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
