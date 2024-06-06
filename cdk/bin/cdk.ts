import { Stack, StackProps, App } from "aws-cdk-lib";
import { ShopStack } from "../lib/cdk-stack";

class StaticShopStack extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props);

    new ShopStack(this, "ShopStack");
  }
}

const app = new App();

new StaticShopStack(app, "Shop");

app.synth();
