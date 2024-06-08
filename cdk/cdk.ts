import * as cdk from "aws-cdk-lib";
import { CloudFrontStack } from "./cloudfront-stack";

const app = new cdk.App();

new CloudFrontStack(app, "CloudFrontStack", {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION,
  },
});
