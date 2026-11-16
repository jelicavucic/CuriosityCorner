package com.curiositycorner.app.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String poruka) {
        super(poruka);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
