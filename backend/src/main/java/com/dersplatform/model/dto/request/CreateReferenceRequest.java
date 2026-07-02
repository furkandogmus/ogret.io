package com.dersplatform.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReferenceRequest {
    @NotBlank(message = "İsim alanı boş bırakılamaz")
    private String recommenderName;

    @NotBlank(message = "E-posta alanı boş bırakılamaz")
    @Email(message = "Geçersiz e-posta adresi")
    private String recommenderEmail;

    @NotBlank(message = "Ünvan/Yakınlık alanı boş bırakılamaz")
    private String recommenderTitle;

    @NotBlank(message = "Yorum/Tavsiye alanı boş bırakılamaz")
    private String comment;
}
