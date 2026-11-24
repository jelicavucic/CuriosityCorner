package com.curiositycorner.app;

import com.curiositycorner.app.entity.Administrator;
import com.curiositycorner.app.repository.AdministratorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false"
})
class AdminAuthTests {
    @LocalServerPort
    private int port;

    @Autowired
    private PasswordEncoder encoder;

    @MockitoBean
    private AdministratorRepository administratori;

    private final CookieManager cookies = new CookieManager();
    private final HttpClient client = HttpClient.newBuilder().cookieHandler(cookies).build();
    private final JsonMapper json = JsonMapper.builder().build();

    @Test
    void zahtijevaAdminSesijuITokenZaIzmjene() throws Exception {
        String lozinka = "test-lozinka-123";
        when(administratori.findByKorisnickoIme("admin")).thenReturn(Optional.of(
                new Administrator("admin", "Administrator", "admin@example.com", encoder.encode(lozinka))));

        assertEquals(400, posalji("GET", "/api/kategorije/neispravan-id", null, null).statusCode());
        assertEquals(401, posalji("GET", "/api/admin/auth/me", null, null).statusCode());
        assertEquals(401, posalji("GET", "/api/admin/aktivnosti/1/pitanje", null, null).statusCode());
        assertEquals(403, posalji("POST", "/api/kategorije", "{}", null).statusCode());

        JsonNode tokenPrijePrijave = token();
        String sesijaPrijePrijave = idSesije();
        assertEquals(401, posalji("POST", "/api/kategorije", "{}", tokenPrijePrijave).statusCode());
        assertEquals(401, posalji("POST", "/api/admin/aktivnosti/pitanja", "{}", tokenPrijePrijave).statusCode());
        assertEquals(401, posalji("POST", "/api/admin/auth/login",
                """
                {"korisnickoIme":"admin","lozinka":"pogresna"}
                """, tokenPrijePrijave).statusCode());
        var prijava = posalji("POST", "/api/admin/auth/login",
                """
                {"korisnickoIme":"admin","lozinka":"%s"}
                """.formatted(lozinka), tokenPrijePrijave);
        assertEquals(200, prijava.statusCode(), prijava.body());
        assertNotEquals(sesijaPrijePrijave, idSesije());
        assertFalse(json.readTree(prijava.body()).has("lozinkaHash"));
        assertEquals(200, posalji("GET", "/api/admin/auth/me", null, null).statusCode());
        assertEquals(403, posalji("POST", "/api/kategorije", "{}", tokenPrijePrijave).statusCode());

        JsonNode tokenAdmina = token();
        assertEquals(400, posalji("POST", "/api/kategorije", "{}", tokenAdmina).statusCode());
        assertEquals(400, posalji("POST", "/api/admin/aktivnosti/pitanja", "{}", tokenAdmina).statusCode());
        assertEquals(400, posalji("PUT", "/api/admin/aktivnosti/pitanja/1", "{}", tokenAdmina).statusCode());
        assertEquals(204, posalji("POST", "/api/admin/auth/logout", null, tokenAdmina).statusCode());
        assertEquals(401, posalji("GET", "/api/admin/auth/me", null, null).statusCode());
    }

    private JsonNode token() throws Exception {
        var response = posalji("GET", "/api/admin/auth/csrf", null, null);
        assertEquals(200, response.statusCode(), response.body());
        return json.readTree(response.body());
    }

    private String idSesije() {
        return cookies.getCookieStore().getCookies().stream()
                .filter(cookie -> cookie.getName().equals("JSESSIONID"))
                .findFirst().orElseThrow().getValue();
    }

    private HttpResponse<String> posalji(String method, String path, String body, JsonNode token) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (token != null) {
            request.header(token.get("headerName").asString(), token.get("token").asString());
        }
        if (body != null) {
            request.header("Content-Type", "application/json");
        }
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body));
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}
