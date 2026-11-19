import { NextResponse } from 'next/server';

export const YAML_SPEC = `openapi: 3.0.3
info:
  title: Alpay Gateway API
  description: API Gateway Pembayaran Dinamis QRIS & Webhook Callback
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
                callback_url:
                  type: string
                  format: uri
                  description: >-
                    URL https tujuan notifikasi untuk transaksi ini. Harus sama
                    persis dengan salah satu URL di daftar Webhook URL
                    (Pengaturan). Kalau dikosongkan, transaksi tidak mengirim
                    webhook ke mana pun.
                  example: https://merchant.example.com/api/payment/webhook
      callbacks:
        paymentPaid:
          '{$request.body#/callback_url}':
            post:
              summary: payment.paid
              parameters:
                - $ref: '#/components/parameters/WebhookSignature'
              description: >-
                Dikirim sekali saat pembayaran terkonfirmasi. Hanya dikirim
                kalau transaksi punya callback_url.
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      $ref: '#/components/schemas/WebhookPaid'
              responses:
                '2XX':
                  description: Diterima merchant. Respons non-2XX dicoba ulang maksimal 3 kali.
        paymentExpired:
          '{$request.body#/callback_url}':
            post:
              summary: payment.expired
              parameters:
                - $ref: '#/components/parameters/WebhookSignature'
              description: >-
                Dikirim sekali saat transaksi melewati expires_at tanpa dibayar.
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      $ref: '#/components/schemas/WebhookExpired'
              responses:
                '2XX':
                  description: Diterima merchant. Respons non-2XX dicoba ulang maksimal 3 kali.
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

  parameters:
    WebhookSignature:
      name: X-Webhook-Signature
      in: header
      required: true
      description: >-
        HMAC-SHA256 hex dari raw body webhook, key = API key Alpay. Hitung ulang
        dan bandingkan sebelum memproses payload.
      schema:
        type: string
        example: 9f2c4e1a7b3d8e6f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f

  schemas:
    WebhookPaid:
      type: object
      required: [event, timestamp, data]
      properties:
        event:
          type: string
          enum: [payment.paid]
        timestamp:
          type: string
          format: date-time
        data:
          type: object
          properties:
            id:
              type: string
              description: ID transaksi
            amount:
              type: integer
              description: Nominal yang dibayar (termasuk fee & kode unik)
            base_amount:
              type: integer
            fee:
              type: integer
            unique_code:
              type: integer
            customer_name:
              type: string
            message:
              type: string
            issuer:
              type: string
              description: Penerbit pembayaran, mis. Seabank
            transaction_id:
              type: string
            paid_at:
              type: integer
              description: Epoch detik

    WebhookExpired:
      type: object
      required: [event, timestamp, data]
      properties:
        event:
          type: string
          enum: [payment.expired]
        timestamp:
          type: string
          format: date-time
        data:
          type: object
          properties:
            id:
              type: string
            amount:
              type: integer
            customer_name:
              type: string
`;

export async function GET() {
  return new NextResponse(YAML_SPEC, {
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Content-Disposition': 'inline; filename="openapi.yaml"'
    }
  });
}
