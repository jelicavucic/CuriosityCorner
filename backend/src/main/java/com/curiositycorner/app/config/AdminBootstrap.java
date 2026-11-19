package com.curiositycorner.app.config;

import com.curiositycorner.app.entity.Administrator;
import com.curiositycorner.app.repository.AdministratorRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final Environment environment;
    private final AdministratorRepository administratori;
    private final PasswordEncoder encoder;

    public AdminBootstrap(Environment environment, AdministratorRepository administratori, PasswordEncoder encoder) {
        this.environment = environment;
        this.administratori = administratori;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String korisnickoIme = environment.getProperty("ADMIN_BOOTSTRAP_USERNAME");
        String lozinka = environment.getProperty("ADMIN_BOOTSTRAP_PASSWORD");
        if (korisnickoIme == null && lozinka == null) {
            return;
        }

        String ime = environment.getProperty("ADMIN_BOOTSTRAP_NAME", "").strip();
        String email = environment.getProperty("ADMIN_BOOTSTRAP_EMAIL", "").strip();
        if (korisnickoIme == null || korisnickoIme.isBlank() || korisnickoIme.strip().length() > 100
                || ime.isEmpty() || ime.length() > 150 || email.isEmpty() || email.length() > 254
                || lozinka == null || lozinka.isBlank() || lozinka.length() < 12
                || lozinka.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Provjerite ADMIN_BOOTSTRAP_* podatke za prvog administratora.");
        }

        korisnickoIme = korisnickoIme.strip();
        if (!administratori.existsByKorisnickoIme(korisnickoIme)) {
            administratori.save(new Administrator(korisnickoIme, ime, email, encoder.encode(lozinka)));
        }
    }
}
