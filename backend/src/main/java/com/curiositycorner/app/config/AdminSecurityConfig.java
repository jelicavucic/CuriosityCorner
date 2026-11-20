package com.curiositycorner.app.config;

import com.curiositycorner.app.repository.AdministratorRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import static org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.withDefaults;

@Configuration(proxyBeanMethods = false)
public class AdminSecurityConfig {
    @Bean
    PasswordEncoder adminPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager adminAuthenticationManager(AdministratorRepository administratori, PasswordEncoder encoder) {
        var provider = new DaoAuthenticationProvider(korisnickoIme -> administratori.findByKorisnickoIme(korisnickoIme)
                .map(admin -> User.withUsername(admin.getKorisnickoIme()).password(admin.getLozinkaHash())
                        .roles("ADMIN").build())
                .orElseThrow(() -> new UsernameNotFoundException("Administrator ne postoji.")));
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }

    @Bean
    SecurityContextRepository adminSecurityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository contexts) throws Exception {
        RequestMatcher zasticeneRute = zasticeneRute();
        var putanje = withDefaults();
        return http
                .securityContext(context -> context.securityContextRepository(contexts))
                .requestCache(cache -> cache.disable())
                .exceptionHandling(errors -> errors.authenticationEntryPoint(
                        (request, response, failure) -> response.setStatus(HttpServletResponse.SC_UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/admin/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/auth/login").permitAll()
                        .requestMatchers(zasticeneRute).hasRole("ADMIN")
                        .anyRequest().permitAll())
                .csrf(csrf -> csrf.requireCsrfProtectionMatcher(new OrRequestMatcher(
                        putanje.matcher(HttpMethod.POST, "/api/admin/auth/login"),
                        request -> zasticeneRute.matches(request)
                                && !HttpMethod.GET.matches(request.getMethod())
                                && !HttpMethod.HEAD.matches(request.getMethod())
                                && !HttpMethod.OPTIONS.matches(request.getMethod()))))
                .logout(logout -> logout.logoutRequestMatcher(
                                putanje.matcher(HttpMethod.POST, "/api/admin/auth/logout"))
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(authentication == null
                                        ? HttpServletResponse.SC_UNAUTHORIZED : HttpServletResponse.SC_NO_CONTENT)))
                .build();
    }

    private RequestMatcher zasticeneRute() {
        var putanje = withDefaults();
        var rute = new java.util.ArrayList<RequestMatcher>();
        rute.add(putanje.matcher("/api/admin/**"));
        for (String resurs : new String[]{"kategorije", "igrice", "nivoi", "aktivnosti", "sadrzaji", "avatari"}) {
            String putanja = "/api/" + resurs;
            rute.add(putanje.matcher(HttpMethod.POST, putanja));
            rute.add(putanje.matcher(HttpMethod.PUT, putanja + "/{id}"));
            rute.add(putanje.matcher(HttpMethod.DELETE, putanja + "/{id}"));
        }
        return new OrRequestMatcher(rute);
    }
}
