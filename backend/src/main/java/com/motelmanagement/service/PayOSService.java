package com.motelmanagement.service;

import java.nio.charset.StandardCharsets;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.motelmanagement.config.PayOSProperties;
import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.PayOSOrder;
import com.motelmanagement.domain.Payment;
import com.motelmanagement.domain.PaymentMethod;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.PayOSOrderRepository;
import com.motelmanagement.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSService {
    private static final String CREATE_PAYMENT_URL = "https://api-merchant.payos.vn/v2/payment-requests";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final PayOSProperties payOS;
    private final PayOSOrderRepository payOSOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tạo link thanh toán PayOS cho hóa đơn. Lưu orderCode -> invoiceId để xử lý webhook.
     */
    public String createPaymentLink(Invoice invoice) {
        if (invoice == null || invoice.getTotal() == null
                || isBlank(payOS.getClientId()) || isBlank(payOS.getApiKey()) || isBlank(payOS.getChecksumKey())) {
            return null;
        }
        long amount = invoice.getTotal().longValue();
        if (amount <= 0) return null;

        int orderCode = (int) (System.currentTimeMillis() % 2_000_000_000);
        if (orderCode <= 0) orderCode = 1;

        String returnUrl = payOS.getReturnUrl() != null ? payOS.getReturnUrl() : "http://localhost:4002/my-invoices?payment=success";
        String cancelUrl = payOS.getCancelUrl() != null ? payOS.getCancelUrl() : "http://localhost:4002/my-invoices?payment=cancel";
        String description = "HD" + invoice.getId() + " " + invoice.getMonth() + "/" + invoice.getYear();
        if (description.length() > 250) description = description.substring(0, 250);

        String signData = "amount=" + amount + "&cancelUrl=" + cancelUrl + "&description=" + description
                + "&orderCode=" + orderCode + "&returnUrl=" + returnUrl;
        String signature = hmacSha256(payOS.getChecksumKey(), signData);

        ObjectNode bodyNode = OBJECT_MAPPER.createObjectNode();
        bodyNode.put("orderCode", orderCode);
        bodyNode.put("amount", amount);
        bodyNode.put("description", description);
        bodyNode.put("cancelUrl", cancelUrl);
        bodyNode.put("returnUrl", returnUrl);
        bodyNode.put("signature", signature);
        String body = bodyNode.toString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", payOS.getClientId());
        headers.set("x-api-key", payOS.getApiKey());

        try {
            ResponseEntity<String> res = restTemplate.exchange(
                    CREATE_PAYMENT_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                JsonNode root = OBJECT_MAPPER.readTree(res.getBody());
                if ("00".equals(root.path("code").asText(null))) {
                    String checkoutUrl = root.path("data").path("checkoutUrl").asText(null);
                    if (checkoutUrl != null) {
                        PayOSOrder order = new PayOSOrder();
                        order.setOrderCode(orderCode);
                        order.setInvoiceId(invoice.getId());
                        payOSOrderRepository.save(order);
                        return checkoutUrl;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("PayOS create payment link failed", e);
        }
        return null;
    }

    /**
     * Xác thực chữ ký webhook và trả về data nếu hợp lệ. Format webhook: { "code", "desc", "success", "data": { ... }, "signature" }.
     */
    public boolean verifyAndHandleWebhook(String requestBody) {
        if (isBlank(payOS.getChecksumKey()) || requestBody == null) return false;
        try {
            JsonNode root = OBJECT_MAPPER.readTree(requestBody);
            JsonNode data = root.get("data");
            String receivedSig = root.path("signature").asText(null);
            if (data == null || receivedSig == null) return false;

            String dataSignature = buildSignatureFromData(data);
            if (!receivedSig.equalsIgnoreCase(dataSignature)) return false;

            boolean success = root.path("success").asBoolean(false);
            String code = root.path("code").asText("");
            if (!success || !"00".equals(code)) return true;

            long orderCode = data.path("orderCode").asLong(0);
            int amount = data.path("amount").asInt(0);
            if (orderCode == 0 || amount <= 0) return true;

            return payOSOrderRepository.findByOrderCode(orderCode)
                    .map(order -> {
                        Invoice invoice = invoiceRepository.findById(order.getInvoiceId()).orElse(null);
                        if (invoice == null) return false;
                        Payment payment = new Payment();
                        payment.setInvoice(invoice);
                        payment.setAmount(java.math.BigDecimal.valueOf(amount));
                        payment.setMethod(PaymentMethod.TRANSFER);
                        paymentRepository.save(payment);
                        java.math.BigDecimal totalPaid = paymentRepository.findByInvoiceId(invoice.getId()).stream()
                                .map(Payment::getAmount)
                                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                        if (totalPaid.compareTo(invoice.getTotal()) >= 0) {
                            invoice.setStatus(InvoiceStatus.PAID);
                        } else {
                            invoice.setStatus(InvoiceStatus.PARTIAL);
                        }
                        invoiceRepository.save(invoice);
                        payOSOrderRepository.delete(order);
                        return true;
                    })
                    .orElse(false);
        } catch (Exception e) {
            log.warn("PayOS webhook parse/verify failed", e);
            return false;
        }
    }

    private String buildSignatureFromData(JsonNode data) {
        TreeMap<String, String> sorted = new TreeMap<>();
        data.fields().forEachRemaining(e -> {
            JsonNode v = e.getValue();
            String val;
            if (v == null || v.isNull()) val = "";
            else if (v.isNumber() || v.isBoolean()) val = v.toString();
            else if (v.isObject() || v.isArray()) val = v.toString();
            else val = v.asText("");
            if ("null".equals(val) || "undefined".equals(val)) val = "";
            sorted.put(e.getKey(), val);
        });
        StringBuilder sb = new StringBuilder();
        sorted.forEach((k, v) -> sb.append(k).append("=").append(v).append("&"));
        if (sb.length() > 0) sb.setLength(sb.length() - 1);
        return hmacSha256(payOS.getChecksumKey(), sb.toString());
    }

    private static String hmacSha256(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] h = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : h) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC SHA256 error", e);
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
