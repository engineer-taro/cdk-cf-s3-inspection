import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CdkCfS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const redirectBucket = new s3.Bucket(this, "RedirectBucket", {
      bucketName: "redirect-test-20221030",
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      eventBridgeEnabled: true,
      websiteRedirect: {
        hostName: "example.com",
        protocol: s3.RedirectProtocol.HTTPS,
      },
    });

    // CloudFront
    const RedirectDistribution = new cloudfront.Distribution(this, "RedirectDistribution", {
      enabled: true,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2,
      enableIpv6: true,
      defaultBehavior: {
        origin: new origins.HttpOrigin(redirectBucket.bucketWebsiteDomainName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        compress: true,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      },
    });
  }
}
