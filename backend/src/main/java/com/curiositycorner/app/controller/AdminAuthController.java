package com.curiositycorner.app.controller;

import com.curiositycorner.app.entity.Administrator;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AdministratorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
    private final AuthenticationManager authentication;
    private final SecurityContextRepository contexts;
    private final AdministratorRepository administratori;

    public AdminAuthController(AuthenticationManager authentication, SecurityContextRepository contexts,
                               AdministratorRepository administratori) {
        this.authentication = authentication;
        this.contexts = contexts;
        this.administratori = administratori;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }

    @PostMapping("/login")
    public AdminResponse login(@Valid @RequestBody LoginRequest unos, HttpServletRequest request,
                               HttpServletResponse response) {
        if (unos.lozinka().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw pogresnaPrijava();
        }
        Authentication prijava;
        try {
            prijava = authentication.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                    unos.korisnickoIme().strip(), unos.lozinka()));
        } catch (BadCredentialsException e) {
            throw pogresnaPrijava();
        }
        AdminResponse admin = pronadji(prijava);
        request.getSession();
        request.changeSessionId();
        new HttpSessionCsrfTokenRepository().saveToken(null, request, response);
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(prijava);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context, request, response);
        return admin;
    }

    @GetMapping("/me")
    public AdminResponse me(Authentication prijava) {
        return pronadji(prijava);
    }

    private AdminResponse pronadji(Authentication prijava) {
        Administrator admin = administratori.findByKorisnickoIme(prijava.getName())
                .orElseThrow(this::pogresnaPrijava);
        return new AdminResponse(admin.getId(), admin.getKorisnickoIme(), admin.getIme(), admin.getEmail());
    }

    private ApiException pogresnaPrijava() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Pogresno korisnicko ime ili lozinka.");
    }

    public record LoginRequest(@NotBlank @Size(max = 100) String korisnickoIme,
                               @NotBlank @Size(max = 72) String lozinka) { }

    public record AdminResponse(Long id, String korisnickoIme, String ime, String email) { }
}
