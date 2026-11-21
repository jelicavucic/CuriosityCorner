package com.curiositycorner.app.controller;

import com.curiositycorner.app.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
public class FajloviController {
    private static final Map<String, MediaType> TIPOVI = Map.of(
            "png", MediaType.IMAGE_PNG, "jpg", MediaType.IMAGE_JPEG, "gif", MediaType.IMAGE_GIF);
    private static final long MAKSIMALNA_VELICINA = 5 * 1024 * 1024;
    private static final int CILJNA_DIMENZIJA = 1600;
    private static final long MAKSIMALNO_PIKSELA = 12_000_000;
    private final Path direktorijum;

    public FajloviController(@Value("${curiositycorner.fajlovi.direktorijum:${user.home}/.curiositycorner/fajlovi}")
                            String direktorijum) {
        this.direktorijum = Path.of(direktorijum).toAbsolutePath().normalize();
    }

    @PostMapping(value = "/api/admin/fajlovi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> dodaj(@RequestParam("slika") MultipartFile slika) throws IOException {
        if (slika.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Odaberi sliku.");
        }
        if (slika.getSize() > MAKSIMALNA_VELICINA) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Slika smije imati najviše 5 MiB.");
        }

        Slika optimizovana = pripremiSliku(slika.getBytes());
        String naziv = UUID.randomUUID() + "." + optimizovana.format();
        Files.createDirectories(direktorijum);
        Path privremeni = Files.createTempFile(direktorijum, "slika-", ".tmp");
        try {
            Files.write(privremeni, optimizovana.podaci());
            Files.move(privremeni, direktorijum.resolve(naziv));
        } finally {
            Files.deleteIfExists(privremeni);
        }

        String putanja = "/api/fajlovi/" + naziv;
        return ResponseEntity.created(URI.create(putanja)).body(Map.of("putanjaSlike", putanja));
    }

    @GetMapping("/api/fajlovi/{naziv}")
    public ResponseEntity<Resource> preuzmi(@PathVariable String naziv) throws IOException {
        if (!naziv.matches("[A-Za-z0-9][A-Za-z0-9._-]*\\.(png|jpg|jpeg|gif)") || naziv.contains("..")) {
            return ResponseEntity.notFound().build();
        }
        Path fajl = direktorijum.resolve(naziv);
        if (!Files.isRegularFile(fajl, java.nio.file.LinkOption.NOFOLLOW_LINKS)) {
            return ResponseEntity.notFound().build();
        }
        String format = naziv.substring(naziv.lastIndexOf('.') + 1);
        return ResponseEntity.ok().contentType(TIPOVI.get(format.equals("jpeg") ? "jpg" : format))
                .contentLength(Files.size(fajl)).body(new UrlResource(fajl.toUri()));
    }

    private Slika pripremiSliku(byte[] podaci) {
        try (var ulaz = ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(podaci))) {
            var citaci = ImageIO.getImageReaders(ulaz);
            if (citaci.hasNext()) {
                var citac = citaci.next();
                try {
                    String format = citac.getFormatName().toLowerCase(Locale.ROOT);
                    if (format.equals("jpeg")) format = "jpg";
                    if (TIPOVI.containsKey(format)) {
                        citac.setInput(ulaz, true, !format.equals("jpg"));
                        if ((long) citac.getWidth(0) * citac.getHeight(0) > MAKSIMALNO_PIKSELA) {
                            throw new ApiException(HttpStatus.BAD_REQUEST, "Slika smije imati najviše 12 megapiksela.");
                        }
                        BufferedImage procitana = citac.read(0);
                        // Zadrži animaciju GIF-a i JPEG zapise čija orijentacija može zavisiti od EXIF-a.
                        if (format.equals("gif") || (format.equals("jpg") && imaApp1(citac.getImageMetadata(0)))) {
                            return new Slika(format, podaci);
                        }
                        return optimizuj(format, podaci, procitana);
                    }
                } finally {
                    citac.dispose();
                }
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sliku nije moguće pročitati.");
        }
        throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Odaberi PNG, JPEG ili GIF sliku.");
    }

    private boolean imaApp1(javax.imageio.metadata.IIOMetadata metadata) {
        if (metadata == null) return false;
        var korijen = (javax.imageio.metadata.IIOMetadataNode) metadata.getAsTree("javax_imageio_jpeg_image_1.0");
        var markeri = korijen.getElementsByTagName("unknown");
        for (int i = 0; i < markeri.getLength(); i++) {
            var marker = (javax.imageio.metadata.IIOMetadataNode) markeri.item(i);
            if ("225".equals(marker.getAttribute("MarkerTag"))) return true;
        }
        return false;
    }

    private Slika optimizuj(String format, byte[] original, BufferedImage slika) throws IOException {
        int najduzaStrana = Math.max(slika.getWidth(), slika.getHeight());
        int cilj = Math.min(CILJNA_DIMENZIJA, najduzaStrana);
        while (true) {
            double skala = (double) cilj / najduzaStrana;
            BufferedImage kandidat = skala < 1 || format.equals("jpg") ? skaliraj(slika, skala) : slika;
            var izlaz = new ByteArrayOutputStream();
            ImageIO.write(kandidat, format, izlaz);
            if (izlaz.size() > 0 && izlaz.size() < original.length) {
                return new Slika(format, izlaz.toByteArray());
            }
            if (najduzaStrana <= CILJNA_DIMENZIJA || cilj <= 900) {
                return new Slika(format, original);
            }
            cilj = Math.max(900, cilj * 3 / 4);
        }
    }

    private BufferedImage skaliraj(BufferedImage slika, double skala) {
        int tip = slika.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
        var rezultat = new BufferedImage(Math.max(1, (int) Math.round(slika.getWidth() * skala)),
                Math.max(1, (int) Math.round(slika.getHeight() * skala)), tip);
        var grafika = rezultat.createGraphics();
        try {
            grafika.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            grafika.drawImage(slika, 0, 0, rezultat.getWidth(), rezultat.getHeight(), null);
        } finally {
            grafika.dispose();
        }
        return rezultat;
    }

    private record Slika(String format, byte[] podaci) {}
}
