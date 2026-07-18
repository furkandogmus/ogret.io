package com.dersplatform.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

@Service
@Slf4j
public class EmailService {

    private final SesV2Client sesClient;
    private final String fromEmail;
    private final boolean enabled;

    public EmailService(
            SesV2Client sesClient,
            @Value("${aws.ses.from-email:}") String fromEmail,
            @Value("${app.email.enabled:false}") boolean enabled) {
        this.sesClient = sesClient;
        this.fromEmail = fromEmail;
        this.enabled = enabled;
    }

    public void send(String recipient, String subject, String body) {
        if (!enabled) {
            log.info("Transactional email is disabled; skipped message to {}", recipient);
            return;
        }

        if (fromEmail.isBlank()) {
            throw new IllegalStateException("MAIL_FROM_EMAIL is not configured");
        }

        sesClient.sendEmail(SendEmailRequest.builder()
                .fromEmailAddress(fromEmail)
                .destination(Destination.builder().toAddresses(recipient).build())
                .content(EmailContent.builder()
                        .simple(Message.builder()
                                .subject(Content.builder().data(subject).charset("UTF-8").build())
                                .body(software.amazon.awssdk.services.sesv2.model.Body.builder()
                                        .text(Content.builder().data(body).charset("UTF-8").build())
                                        .build())
                                .build())
                        .build())
                .build());
    }

    public boolean isEnabled() {
        return enabled;
    }
}
