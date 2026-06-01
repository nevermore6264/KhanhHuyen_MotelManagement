package com.motelmanagement.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

public final class GiupGuiEmail {

    private static final String CHARSET = "UTF-8";

    private GiupGuiEmail() {}

    public static void guiHtml(
            JavaMailSender sender,
            String from,
            String to,
            String subject,
            String plainText,
            String htmlText)
            throws MessagingException {
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setText(plainText, htmlText);
        message.setSubject(subject, CHARSET);
        sender.send(message);
    }
}
