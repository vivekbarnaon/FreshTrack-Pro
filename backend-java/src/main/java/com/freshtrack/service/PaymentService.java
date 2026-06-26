package com.freshtrack.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;

public class PaymentService {
    private final String keyId;
    private final String keySecret;

    public PaymentService() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        this.keyId = System.getenv("RAZORPAY_KEY_ID") != null ? System.getenv("RAZORPAY_KEY_ID") : dotenv.get("RAZORPAY_KEY_ID");
        this.keySecret = System.getenv("RAZORPAY_KEY_SECRET") != null ? System.getenv("RAZORPAY_KEY_SECRET") : dotenv.get("RAZORPAY_KEY_SECRET");

        if (isMockMode()) {
            System.out.println(">>> PaymentService: Running in MOCK Mode (Razorpay credentials absent or set to placeholders).");
        } else {
            System.out.println(">>> PaymentService: Running in LIVE Mode (Razorpay credentials loaded successfully). Key ID: " + keyId);
        }
    }

    public boolean isMockMode() {
        return this.keyId == null || this.keyId.trim().isEmpty() || this.keyId.equals("YOUR_RAZORPAY_KEY_ID") ||
               this.keySecret == null || this.keySecret.trim().isEmpty() || this.keySecret.equals("YOUR_RAZORPAY_KEY_SECRET");
    }

    public String getKeyId() {
        return isMockMode() ? "rzp_test_dummykeyid123" : this.keyId;
    }

    public String createRazorpayOrder(double amount) throws RazorpayException {
        if (isMockMode()) {
            return "order_mock_" + System.currentTimeMillis();
        }

        // Amount in paise
        int amountInPaise = (int) Math.round(amount * 100);

        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "rcpt_" + System.currentTimeMillis());

        com.razorpay.Order order = client.orders.create(options);
        return order.get("id");
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (isMockMode()) {
            System.out.println(">>> PaymentService [MOCK]: Bypassing signature verification.");
            return true;
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (Exception e) {
            System.err.println(">>> PaymentService: Signature verification failed: " + e.getMessage());
            return false;
        }
    }
}
