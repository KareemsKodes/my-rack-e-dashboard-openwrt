#!/bin/sh
set -eu

DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT="$(CDPATH= cd -- "$DIR/.." && pwd)"
HOST="${1:-${MX65_HOST:-${MX65_DEFAULT_HOST:-10.10.10.1}}}"
USER="${MX65_USER:-root}"
SSH_KEY="${MX65_SSH_KEY:-$ROOT/data/mx65_gui_ed25519}"
CERT_DIR="$ROOT/data/certs"
CA_KEY="$CERT_DIR/mx65-local-ca.key"
CA_CERT="$CERT_DIR/mx65-local-ca.crt"
SERVER_KEY="$CERT_DIR/mx65-uhttpd.key"
SERVER_CSR="$CERT_DIR/mx65-uhttpd.csr"
SERVER_CERT="$CERT_DIR/mx65-uhttpd.crt"
CA_CFG="$CERT_DIR/mx65-ca.openssl.cnf"
SERVER_CFG="$CERT_DIR/mx65-server.openssl.cnf"
KEYCHAIN="${MX65_KEYCHAIN:-$HOME/Library/Keychains/login.keychain-db}"

case "$HOST" in
  *[!0-9.]*|"") echo "Use the MX IP address, for example: $0 10.10.10.1" >&2; exit 1 ;;
esac

mkdir -p "$CERT_DIR"
chmod 700 "$CERT_DIR" 2>/dev/null || true

cat > "$CA_CFG" <<'CFG'
[ req ]
distinguished_name = dn
x509_extensions = v3_ca
prompt = no

[ dn ]
C = US
ST = Home
L = Lab
O = My-Rack-E Local Lab
CN = My-Rack-E Local CA

[ v3_ca ]
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, keyCertSign, cRLSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
nameConstraints = critical, @name_constraints

[ name_constraints ]
permitted;DNS.1 = mx65.local
permitted;DNS.2 = openwrt.lan
permitted;IP.1 = 10.10.10.1/255.255.255.255
permitted;IP.2 = 192.168.1.1/255.255.255.255
CFG

if [ ! -s "$CA_KEY" ] || [ ! -s "$CA_CERT" ]; then
  openssl req -x509 -newkey rsa:3072 -nodes \
    -keyout "$CA_KEY" \
    -out "$CA_CERT" \
    -days 3650 \
    -sha256 \
    -config "$CA_CFG"
  chmod 600 "$CA_KEY"
  chmod 644 "$CA_CERT"
fi

cat > "$SERVER_CFG" <<CFG
[ req ]
distinguished_name = dn
req_extensions = v3_req
prompt = no

[ dn ]
C = US
ST = Home
L = Lab
O = My-Rack-E Local Lab
CN = mx65.local

[ v3_req ]
basicConstraints = critical, CA:false
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = mx65.local
DNS.2 = openwrt.lan
IP.1 = $HOST
IP.2 = 192.168.1.1
IP.3 = 10.10.10.1
CFG

openssl genrsa -out "$SERVER_KEY" 2048 >/dev/null 2>&1
openssl req -new -key "$SERVER_KEY" -out "$SERVER_CSR" -config "$SERVER_CFG"
openssl x509 -req \
  -in "$SERVER_CSR" \
  -CA "$CA_CERT" \
  -CAkey "$CA_KEY" \
  -CAcreateserial \
  -out "$SERVER_CERT" \
  -days 825 \
  -sha256 \
  -extfile "$SERVER_CFG" \
  -extensions v3_req
chmod 600 "$SERVER_KEY"
chmod 644 "$SERVER_CERT"

echo "== trust constrained MX local CA =="
if security find-certificate -c "My-Rack-E Local CA" "$KEYCHAIN" >/dev/null 2>&1; then
  echo "CA certificate already exists in login keychain."
else
  security add-trusted-cert -r trustRoot -p ssl -k "$KEYCHAIN" "$CA_CERT"
fi

echo
echo "== install MX HTTPS certificate =="
ssh -i "$SSH_KEY" \
  -o ConnectTimeout=8 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$USER@$HOST" "cat > /tmp/mx65-uhttpd.crt" < "$SERVER_CERT"

ssh -i "$SSH_KEY" \
  -o ConnectTimeout=8 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$USER@$HOST" "cat > /tmp/mx65-uhttpd.key" < "$SERVER_KEY"

ssh -i "$SSH_KEY" \
  -o BatchMode=yes \
  -o ConnectTimeout=8 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$USER@$HOST" '
set -eu
mkdir -p /etc/mx65-manager
cp /tmp/mx65-uhttpd.crt /etc/mx65-manager/mx65-uhttpd.crt
cp /tmp/mx65-uhttpd.key /etc/mx65-manager/mx65-uhttpd.key
chmod 644 /etc/mx65-manager/mx65-uhttpd.crt
chmod 600 /etc/mx65-manager/mx65-uhttpd.key
uci -q set uhttpd.main.cert="/etc/mx65-manager/mx65-uhttpd.crt"
uci -q set uhttpd.main.key="/etc/mx65-manager/mx65-uhttpd.key"
uci -q set uhttpd.main.redirect_https="1"
uci -q commit uhttpd
/etc/init.d/uhttpd restart >/dev/null 2>&1 || /etc/init.d/uhttpd start >/dev/null 2>&1
'

echo
echo "== verify certificate =="
openssl x509 -in "$SERVER_CERT" -noout -subject -issuer -dates -ext subjectAltName -fingerprint -sha256

echo
echo "Trusted HTTPS is installed for https://$HOST/mx65/"
echo "If your browser already had the warning page open, close that tab and open it again."
