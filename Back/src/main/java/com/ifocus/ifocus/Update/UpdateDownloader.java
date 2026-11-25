package com.ifocus.ifocus.Update;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;

public class UpdateDownloader {

    private final HttpClient httpClient;

    public UpdateDownloader() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public Path download(String url, Path destination) throws IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMinutes(5))
                .GET()
                .build();

        HttpResponse<InputStream> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofInputStream()
        );

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            response.body().close();

            throw new IOException(
                    "Falha ao baixar atualização. HTTP "
                            + response.statusCode()
            );
        }

        Path parent = destination.getParent();

        if (parent != null) {
            Files.createDirectories(parent);
        }

        try (InputStream inputStream = response.body()) {

            Files.copy(
                    inputStream,
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        return destination;
    }
}