import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone" as const,
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https" as const,
        hostname: "storage.beersval.com",
      },
      {
        protocol: "https" as const,
        hostname: "api.dicebear.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://ui-avatars.com https://storage.beersval.com https://api.dicebear.com data:; font-src 'self' data:; connect-src 'self';",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
