#!/bin/bash
# Generate self-signed SSL certificate with SAN for localhost
# Run this script from the nginx/ssl directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Generating self-signed SSL certificate with SAN..."

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout server.key \
    -out server.crt \
    -config openssl.cnf

# Set proper permissions
chmod 600 server.key
chmod 644 server.crt

echo ""
echo "✅ SSL Certificate generated successfully!"
echo ""
echo "Files created:"
echo "  - server.key (private key)"
echo "  - server.crt (certificate)"
echo ""
echo "Certificate details:"
openssl x509 -in server.crt -noout -subject -dates

echo ""
echo "SAN (Subject Alternative Names):"
openssl x509 -in server.crt -noout -ext subjectAltName
