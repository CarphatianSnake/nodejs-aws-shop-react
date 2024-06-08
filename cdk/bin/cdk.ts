import * as cdk from "aws-cdk-lib";
import { CloudFrontStack } from "../lib/cloudfront-stack";

const app = new cdk.App();

new CloudFrontStack(app, "ShopBucket", {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION,
  },
});
