package com.dersplatform.controller;

import com.dersplatform.service.FileStorageService;
import com.dersplatform.model.enums.UploadPurpose;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("purpose") UploadPurpose purpose) {
        
        String fileUrl = fileStorageService.uploadFile(file, purpose);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }
}
