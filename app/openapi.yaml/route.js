import { NextResponse } from 'next/server';

export const YAML_SPEC = `openapi: 3.0.3
info:
  title: Alpay Gateway API
  description: API Gateway Pembayaran Dinamis ShopeePay QRIS & Webhook Callback
  version: 1.0.0
servers:
  - url: https://pay.ghifari.biz.id
    description: Production Server

paths:
  /payments:
    post:
      summary: Create payment
      description: Membuat tagihan pembayaran dynamic QRIS berlaku 5 menit
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - amount
              properties:
                amount:
                  type: integer
                  description: Nominal pembayaran (min 100)
                  example: 25000
                fee:
                  type: integer
                  description: Biaya admin tambahan (opsional)
                  example: 0
                customer_name:
                  type: string
                  description: Nama pelanggan atau donatur
                  example: Budi Santoso
                note:
                  type: string
                  description: Catatan transaksi
                  example: Pembelian Paket VIP
                valid_minutes:
                  type: integer
                  description: Masa berlaku invoice dalam menit
                  example: 5
      responses:
        '200':
          description: Payment created — returns id, payment_url, qr_image, expires_at
        '400':
          description: Invalid request parameters
        '401':
          description: Invalid or missing API key

  /payments/{trxid}/status:
    get:
      summary: Check payment status
      description: Memeriksa status real-time pembayaran dari ID transaksi
      parameters:
        - name: trxid
          in: path
          required: true
          description: Transaction ID
          schema:
            type: string
            example: 26114d00
      responses:
        '200':
          description: Payment status retrieved
        '404':
          description: Transaction not found

  /payments/{trxid}/cancel:
    post:
      summary: Cancel transaction
      description: Cancels a pending transaction. Cannot cancel transactions that are already paid or expired.
      security:
        - ApiKeyAuth: []
      parameters:
        - name: trxid
          in: path
          required: true
          description: Transaction ID to cancel
          schema:
            type: string
            example: trhczp
      responses:
        '200':
          description: Transaction canceled — { id, status, canceled_at }
        '401':
          description: Invalid API key
        '403':
          description: Email not verified
        '404':
          description: Transaction not found
        '409':
          description: Already paid / already expired, cannot cancel

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
`;

export async function GET() {
  return new NextResponse(YAML_SPEC, {
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Content-Disposition': 'inline; filename="openapi.yaml"'
    }
  });
}
