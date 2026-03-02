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
import com.motelmanagement.config.ThuocTinhPayOS;
import com.motelmanagement.domain.DonHangPayOS;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.PhuongThucThanhToan;
import com.motelmanagement.domain.ThanhToan;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.KhoHoaDon;
import com.motelmanagement.repository.KhoDonHangPayOS;
import com.motelmanagement.repository.KhoThanhToan;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
/** Dịch vụ tích hợp PayOS: tạo link thanh toán, xử lý webhook. */
@RequiredArgsConstructor
@Slf4j
public class PayOSService {
    private static final String CREATE_PAYMENT_URL = "https://api-merchant.payos.vn/v2/payment-requests";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ThuocTinhPayOS thuocTinhPayOS;
    private final KhoDonHangPayOS khoDonHangPayOS;
    private final KhoHoaDon khoHoaDon;
    private final KhoThanhToan khoThanhToan;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tạo link thanh toán PayOS cho hóa đơn. Lưu orderCode -> invoiceId để xử lý webhook.
     */
    public String taoLinkThanhToan(HoaDon hoaDon) {
        if (hoaDon == null || hoaDon.getTotal() == null
                || laRong(thuocTinhPayOS.getClientId()) || laRong(thuocTinhPayOS.getApiKey()) || laRong(thuocTinhPayOS.getChecksumKey())) {
            return null;
        }
        long soTien = hoaDon.getTotal().longValue();
        if (soTien <= 0) return null;

        int maDonHang = (int) (System.currentTimeMillis() % 2_000_000_000);
        if (maDonHang <= 0) maDonHang = 1;

        String urlQuayLai = thuocTinhPayOS.getReturnUrl() != null ? thuocTinhPayOS.getReturnUrl() : "http://localhost:4002/my-invoices?payment=success";
        String urlHuy = thuocTinhPayOS.getCancelUrl() != null ? thuocTinhPayOS.getCancelUrl() : "http://localhost:4002/my-invoices?payment=cancel";
        String moTa = "HD" + hoaDon.getId() + " " + hoaDon.getMonth() + "/" + hoaDon.getYear();
        if (moTa.length() > 250) moTa = moTa.substring(0, 250);

        String duLieuKy = "amount=" + soTien + "&cancelUrl=" + urlHuy + "&description=" + moTa
                + "&orderCode=" + maDonHang + "&returnUrl=" + urlQuayLai;
        String chuKy = hmacSha256(thuocTinhPayOS.getChecksumKey(), duLieuKy);

        ObjectNode bodyNode = OBJECT_MAPPER.createObjectNode();
        bodyNode.put("orderCode", maDonHang);
        bodyNode.put("amount", soTien);
        bodyNode.put("description", moTa);
        bodyNode.put("cancelUrl", urlHuy);
        bodyNode.put("returnUrl", urlQuayLai);
        bodyNode.put("signature", chuKy);
        String body = bodyNode.toString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", thuocTinhPayOS.getClientId());
        headers.set("x-api-key", thuocTinhPayOS.getApiKey());

        try {
            ResponseEntity<String> phanHoi = restTemplate.exchange(
                    CREATE_PAYMENT_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class);
            if (phanHoi.getStatusCode().is2xxSuccessful() && phanHoi.getBody() != null) {
                JsonNode root = OBJECT_MAPPER.readTree(phanHoi.getBody());
                if ("00".equals(root.path("code").asText(null))) {
                    String linkThanhToan = root.path("data").path("checkoutUrl").asText(null);
                    if (linkThanhToan != null) {
                        DonHangPayOS donHang = new DonHangPayOS();
                        donHang.setOrderCode(maDonHang);
                        donHang.setInvoiceId(hoaDon.getId());
                        khoDonHangPayOS.save(donHang);
                        return linkThanhToan;
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
    public boolean xacThucVaXuLyWebhook(String noiDungYeuCau) {
        if (laRong(thuocTinhPayOS.getChecksumKey()) || noiDungYeuCau == null) return false;
        try {
            JsonNode root = OBJECT_MAPPER.readTree(noiDungYeuCau);
            JsonNode data = root.get("data");
            String chuKyNhan = root.path("signature").asText(null);
            if (data == null || chuKyNhan == null) return false;

            String chuKyTinh = xayChuKyTuData(data);
            if (!chuKyNhan.equalsIgnoreCase(chuKyTinh)) return false;

            boolean thanhCong = root.path("success").asBoolean(false);
            String maLoi = root.path("code").asText("");
            if (!thanhCong || !"00".equals(maLoi)) return true;

            long maDonHang = data.path("orderCode").asLong(0);
            int soTien = data.path("amount").asInt(0);
            if (maDonHang == 0 || soTien <= 0) return true;

            return khoDonHangPayOS.findByOrderCode(maDonHang)
                    .map(donHang -> {
                        HoaDon hoaDon = khoHoaDon.findById(donHang.getInvoiceId()).orElse(null);
                        if (hoaDon == null) return false;
                        ThanhToan thanhToan = new ThanhToan();
                        thanhToan.setHoaDon(hoaDon);
                        thanhToan.setAmount(java.math.BigDecimal.valueOf(soTien));
                        thanhToan.setMethod(PhuongThucThanhToan.TRANSFER);
                        khoThanhToan.save(thanhToan);
                        java.math.BigDecimal tongDaThanhToan = khoThanhToan.findByHoaDonId(hoaDon.getId()).stream()
                                .map(ThanhToan::getAmount)
                                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                        if (tongDaThanhToan.compareTo(hoaDon.getTotal()) >= 0) {
                            hoaDon.setStatus(TrangThaiHoaDon.PAID);
                        } else {
                            hoaDon.setStatus(TrangThaiHoaDon.PARTIAL);
                        }
                        khoHoaDon.save(hoaDon);
                        khoDonHangPayOS.delete(donHang);
                        return true;
                    })
                    .orElse(false);
        } catch (Exception e) {
            log.warn("PayOS webhook parse/verify failed", e);
            return false;
        }
    }

    private String xayChuKyTuData(JsonNode data) {
        TreeMap<String, String> sapXep = new TreeMap<>();
        data.fields().forEachRemaining(e -> {
            JsonNode v = e.getValue();
            String val;
            if (v == null || v.isNull()) val = "";
            else if (v.isNumber() || v.isBoolean()) val = v.toString();
            else if (v.isObject() || v.isArray()) val = v.toString();
            else val = v.asText("");
            if ("null".equals(val) || "undefined".equals(val)) val = "";
            sapXep.put(e.getKey(), val);
        });
        StringBuilder sb = new StringBuilder();
        sapXep.forEach((k, v) -> sb.append(k).append("=").append(v).append("&"));
        if (sb.length() > 0) sb.setLength(sb.length() - 1);
        return hmacSha256(thuocTinhPayOS.getChecksumKey(), sb.toString());
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

    private static boolean laRong(String s) {
        return s == null || s.isBlank();
    }
}
