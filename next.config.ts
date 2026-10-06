import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // Marketing: referrers carry the origin only, from the first request on (the layout's meta tag can arrive late),
  // so a ?ref= / ?utm_ landing URL or a dashboard URL with record ids never travels as a referrer.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Referrer-Policy", value: "strict-origin" }] }];
  },
  turbopack: { root: __dirname },
};

export default withNextIntl(nextConfig);
