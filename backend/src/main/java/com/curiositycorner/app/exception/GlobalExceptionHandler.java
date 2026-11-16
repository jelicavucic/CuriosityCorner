package com.curiositycorner.app.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ProblemDetail obradiApiGresku(ApiException exception) {
        return ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail obradiValidaciju(MethodArgumentNotValidException exception) {
        Map<String, String> greske = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(greska ->
                greske.putIfAbsent(greska.getField(), greska.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Provjerite unesene podatke.");
        problem.setProperty("greske", greske);
        return problem;
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ProblemDetail obradiNeispravanZahtjev(Exception exception) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Neispravan JSON ili tip podatka u zahtjevu.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail obradiOgranicenjeBaze(DataIntegrityViolationException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "Podaci krse ogranicenje baze: zapis se koristi ili vec postoji.");
    }
}
